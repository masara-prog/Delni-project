<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Models\TourGuide;
use App\Models\WeeklyTrip;
use App\Support\Actor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Tour guides directory and admin verification (replaces the bridge's /guides and /guides/verify).
 * Guides are never deleted; the admin rejects or re-reviews them through verification_status.
 */
class GuideController extends Controller
{
    use JsonApiResponses;

    public const STATUSES = ['قيد المراجعة', 'موثق', 'مرفوض'];

    // ?status=موثق limits the list (admin). Visitors see verified guides only, without their documents or email.
    public function index(Request $request): JsonResponse
    {
        $query = TourGuide::query()->orderBy('full_name');
        $status = Actor::isAdmin() ? $request->input('status') : 'موثق';
        if ($status) {
            $query->where('verification_status', $status);
        }
        $guides = $query->get();

        return response()->json(['success' => true, 'data' => $this->withDetails($guides)]);
    }

    public function show(string $licenseNumber): JsonResponse
    {
        $guide = TourGuide::find($licenseNumber);
        if (!$guide || (!Actor::isAdmin() && $guide->verification_status !== 'موثق')) {
            return $this->error('المرشد غير موجود', 404);
        }
        return response()->json(['success' => true, 'data' => $this->withDetails(collect([$guide]))[0]]);
    }

    public function verify(Request $request, string $licenseNumber): JsonResponse
    {
        $guide = TourGuide::find($licenseNumber);
        if (!$guide) {
            return $this->error('المرشد غير موجود', 404);
        }
        $data = $this->validateArabic($request, [
            'verification_status' => 'required|string|in:' . implode(',', self::STATUSES),
            'rejection_reason' => 'nullable|string|max:1000',
        ], ['verification_status' => 'حالة التوثيق', 'rejection_reason' => 'سبب الرفض']);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $status = $data['verification_status'];
        // A guide leaving the verified list must not keep upcoming trips nobody would lead
        if ($status !== 'موثق' && $guide->verification_status === 'موثق' && ($trips = $this->upcomingTrips($guide->license_number))) {
            return $this->error('لا يمكن سحب اعتماد هذا المرشد لأنه مسند لرحلات قادمة: ' . implode('، ', $trips) . '. يرجى تعيين مرشد آخر لها أولاً.', 409);
        }
        DB::transaction(function () use ($guide, $status, $data) {
            // The reason is kept on the account: a rejected guide can't sign in to read notifications, so login shows it
            $reason = $status === 'مرفوض' ? (trim((string) ($data['rejection_reason'] ?? '')) ?: null) : null;
            $guide->update(['verification_status' => $status, 'rejection_reason' => $reason]);
            $stamp = now('Africa/Tripoli')->format('YmdHis');
            if ($status === 'موثق') {
                $this->notify("guide_approved_{$guide->license_number}_{$stamp}", 'guide', $guide->license_number, 'system',
                    '🎉 تهانينا! تم توثيق واعتماد حسابك كمرشد سياحي',
                    "أهلاً بك يا ({$guide->full_name})! تمت مراجعة رخصتك ووثائقك واعتماد حسابك رسمياً من قبل إدارة منصة دَلّني. يمكنك الآن تسجيل الدخول وإدارة رحلاتك السياحية.",
                    '/dashboard/guide');
            } elseif ($status === 'مرفوض') {
                $this->notify("guide_rejected_{$guide->license_number}_{$stamp}", 'guide', $guide->license_number, 'system',
                    '❌ إشعار بخصوص طلب اعتماد حساب المرشد',
                    $data['rejection_reason'] ?? "نأسف يا ({$guide->full_name})، تم رفض طلب اعتماد حسابك كمرشد سياحي بعد مراجعة الوثائق المرفوعة. يرجى التأكد من صحة المستندات والتواصل مع إدارة المنصة.",
                    '/auth/login');
            }
        });

        return response()->json([
            'success' => true,
            'message' => $status === 'موثق' ? 'تم اعتماد وتفعيل حساب المرشد السياحي بنجاح' : 'تم تحديث حالة المرشد في قاعدة البيانات بنجاح',
            'data' => $this->withDetails(collect([$guide->fresh()]))[0],
        ]);
    }

    // Titles of the guide's active daily trips, weekly trips not yet ended and private trips still running or ahead
    private function upcomingTrips(string $license): array
    {
        $today = now('Africa/Tripoli')->toDateString();
        $daily = DB::table('daily_trips')->where('guide_license_number', $license)->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', '<>', WeeklyTrip::GUIDE_DECLINED))
            ->pluck('trip_title');
        $weekly = DB::table('weekly_trips')->where('guide_license_number', $license)->where('is_active', true)
            ->where('end_date', '>=', $today)
            ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', '<>', WeeklyTrip::GUIDE_DECLINED))
            ->pluck('trip_title');
        $private = DB::table('private_trips')->where('guide_license_number', $license)
            ->whereIn('status_order', [PrivateTripController::GUIDE_PENDING, PrivateTripController::QUOTED, PrivateTripController::CONFIRMED])
            ->whereRaw('DATEADD(day, duration_days, preferred_start_date) > ?', [$today])
            ->pluck('private_trip_id')->map(fn ($id) => "رحلة خاصة {$id}");
        return $daily->concat($weekly)->concat($private)->all();
    }

    /**
     * Adds landmarks of expertise, working days, regions and ratings (from the guide's daily/weekly trip reviews).
     */
    private function withDetails($guides): array
    {
        $licenses = $guides->pluck('license_number')->all();
        if (!$licenses) {
            return [];
        }

        $places = DB::table('guide_places as gp')
            ->join('places_tourist as pt', 'gp.place_id', '=', 'pt.place_id')
            ->whereIn('gp.license_number', $licenses)
            ->select('gp.license_number', 'pt.place_id', 'pt.city as place_name', 'pt.city', 'pt.category', 'pt.place_image')
            ->get()->groupBy('license_number');
        $days = DB::table('guide_working_days')->whereIn('license_number', $licenses)->get()->groupBy('license_number');
        $regions = DB::table('guide_operating_regions')->whereIn('license_number', $licenses)->get()->groupBy('license_number');

        $ratings = DB::query()->fromSub(
            DB::table('reviews_daily_trips as r')->join('daily_trips as t', 'r.daily_trip_id', '=', 't.daily_trip_id')
                ->select('t.guide_license_number as license_number', 'r.stars_rating')
                ->unionAll(
                    DB::table('reviews_weekly_trips as r')->join('weekly_trips as t', 'r.weekly_trip_id', '=', 't.weekly_trip_id')
                        ->select('t.guide_license_number as license_number', 'r.stars_rating')
                ),
            'all_reviews'
        )->whereIn('license_number', $licenses)
            ->groupBy('license_number')
            ->selectRaw('license_number, AVG(CAST(stars_rating AS FLOAT)) as rating_avg, COUNT(*) as reviews_count')
            ->get()->keyBy('license_number');

        // Tours already run: accepted weekly trips past their end date and confirmed private trips past their last day
        $today = now('Africa/Tripoli')->toDateString();
        $completed = DB::query()->fromSub(
            DB::table('weekly_trips')->whereIn('guide_license_number', $licenses)->where('end_date', '<', $today)
                ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', WeeklyTrip::GUIDE_APPROVED))
                ->select('guide_license_number')
                ->unionAll(DB::table('private_trips')->whereIn('guide_license_number', $licenses)->where('status_order', PrivateTripController::CONFIRMED)
                    ->whereRaw('DATEADD(day, duration_days - 1, preferred_start_date) < ?', [$today])->select('guide_license_number')),
            'done'
        )->groupBy('guide_license_number')->selectRaw('guide_license_number, COUNT(*) as total')->pluck('total', 'guide_license_number');
        $isAdmin = Actor::isAdmin();
        return $guides->map(function (TourGuide $g) use ($places, $days, $regions, $ratings, $isAdmin, $completed) {
            $lic = $g->license_number;
            $myPlaces = ($places[$lic] ?? collect())->map(fn ($p) => (array) $p)->values();
            $rating = $ratings[$lic] ?? null;
            $fields = $isAdmin ? $g->toArray() : collect($g->toArray())->except(['digital_certificate_file', 'email', 'rejection_reason'])->all();
            return $fields + [
                'places' => $myPlaces->all(),
                'place_ids' => $myPlaces->pluck('place_id')->all(),
                'working_days' => ($days[$lic] ?? collect())->pluck('day_of_week')->values()->all(),
                'operating_regions' => ($regions[$lic] ?? collect())->pluck('region')->values()->all(),
                'rating_avg' => $rating ? round((float) $rating->rating_avg, 1) : 0,
                'reviews_count' => $rating ? (int) $rating->reviews_count : 0,
                'total_tours_completed' => (int) ($completed[$lic] ?? 0),
            ];
        })->values()->all();
    }
}
