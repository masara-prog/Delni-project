<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Models\TourGuide;
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

    // ?status=موثق limits the list to verified guides (public catalog and private-trip picker)
    public function index(Request $request): JsonResponse
    {
        $query = TourGuide::query()->orderBy('full_name');
        if ($request->filled('status')) {
            $query->where('verification_status', $request->input('status'));
        }
        $guides = $query->get();

        return response()->json(['success' => true, 'data' => $this->withDetails($guides)]);
    }

    public function show(string $licenseNumber): JsonResponse
    {
        $guide = TourGuide::find($licenseNumber);
        if (!$guide) {
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
        DB::transaction(function () use ($guide, $status, $data) {
            $guide->update(['verification_status' => $status]);
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

        return $guides->map(function (TourGuide $g) use ($places, $days, $regions, $ratings) {
            $lic = $g->license_number;
            $myPlaces = ($places[$lic] ?? collect())->map(fn ($p) => (array) $p)->values();
            $rating = $ratings[$lic] ?? null;
            return $g->toArray() + [
                'places' => $myPlaces->all(),
                'place_ids' => $myPlaces->pluck('place_id')->all(),
                'working_days' => ($days[$lic] ?? collect())->pluck('day_of_week')->values()->all(),
                'operating_regions' => ($regions[$lic] ?? collect())->pluck('region')->values()->all(),
                'rating_avg' => $rating ? round((float) $rating->rating_avg, 1) : 0,
                'reviews_count' => $rating ? (int) $rating->reviews_count : 0,
                'total_tours_completed' => 0,
            ];
        })->values()->all();
    }
}
