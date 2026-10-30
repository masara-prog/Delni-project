<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Api\Concerns\ManagesTrips;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Private (VIP) trips (replaces the bridge's /private_trips). Requests are never deleted; they end as
 * «مرفوضة من الأدمن» or «ملغاة من السائح». Each party can only change its own part:
 * the tourist creates the request and confirms/cancels, the admin prices and schedules it,
 * the assigned guide accepts or declines the schedule before it is sent to the tourist:
 * قيد الدراسة → بانتظار رد المرشد → (accepted) بانتظار تأكيد السائح → مؤكدة
 *                                  → (declined) اعتذر المرشد → the admin assigns another guide → بانتظار رد المرشد
 */
class PrivateTripController extends Controller
{
    use JsonApiResponses, ManagesTrips;

    public const NEW = 'قيد الدراسة';
    public const GUIDE_PENDING = 'بانتظار رد المرشد';
    public const GUIDE_DECLINED = 'اعتذر المرشد';
    public const QUOTED = 'بانتظار تأكيد السائح';
    public const CONFIRMED = 'مؤكدة';
    public const REJECTED = 'مرفوضة من الأدمن';
    public const CANCELLED = 'ملغاة من السائح';
    private const CLOSED = [self::REJECTED, self::CANCELLED, 'مرفوضة من السائح', 'ملغية'];
    private const MIN_DAYS_AHEAD = 10;
    private const MIN_CANCEL_DAYS = 3;

    // ?tourist_id=... returns only that tourist's requests (the bridge sent every customer's data to the browser)
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('private_trips as pt')
            ->leftJoin('tourists as t', 'pt.tourist_id', '=', 't.tourist_id')
            ->leftJoin('tour_guides as g', 'pt.guide_license_number', '=', 'g.license_number')
            ->leftJoin('vehicles as v', 'pt.vehicle_plate', '=', 'v.plate_number')
            ->leftJoin('transportation_companies as tc', 'v.contract_number', '=', 'tc.contract_number')
            ->select('pt.private_trip_id', 'pt.status_order', 'pt.duration_days', 'pt.number_of_companions', 'pt.guide_license_number',
                'pt.customer_requirements', 'pt.tourist_id', 'pt.quoted_price', 'pt.vehicle_plate', 'pt.vehicle_plate as assigned_vehicle',
                DB::raw('COALESCE(pt.additional_expenses, 0) as additional_expenses'),
                DB::raw('CONVERT(VARCHAR(10), pt.preferred_start_date, 120) as preferred_start_date'),
                DB::raw('CONVERT(VARCHAR(19), pt.created_at, 120) as created_at'),
                't.full_name as customer_name', 't.phone_number as customer_phone', 't.email as customer_email',
                'g.full_name as guide_name', 'g.phone_number as guide_phone', 'g.price_per_day as guide_daily_rate',
                'v.vehicle_type as vehicle_model', 'v.seating_capacity as vehicle_capacity', 'v.daily_rate as vehicle_daily_rate',
                'v.vehicle_image', 'v.vehicle_status', 'tc.company_name as transport_company_name', 'tc.phone_number as transport_company_phone')
            ->orderByDesc('pt.created_at');
        if ($request->filled('tourist_id')) {
            $query->where('pt.tourist_id', $request->input('tourist_id'));
        }
        $trips = $query->get();
        if ($request->filled('tourist_id')) {
            foreach ($trips as $trip) {
                if (in_array($trip->status_order, [self::GUIDE_PENDING, self::GUIDE_DECLINED], true)) {
                    $trip->status_order = self::NEW;
                    $trip->quoted_price = null;
                }
            }
        }
        $ids = $trips->pluck('private_trip_id')->all();

        $places = DB::table('places_trip_private as j')->join('places_tourist as p', 'j.place_id', '=', 'p.place_id')
            ->whereIn('j.private_trip_id', $ids)->orderBy('j.visit_order')
            ->get(['j.private_trip_id', 'p.place_id', 'p.city as place_name', 'p.city', 'p.region', 'p.category', 'p.place_image', 'j.visit_order'])
            ->groupBy('private_trip_id');
        $hotels = DB::table('hotels_trip_private as j')->join('hotels as h', 'j.hotel_id', '=', 'h.hotel_id')
            ->whereIn('j.private_trip_id', $ids)
            ->get(['j.private_trip_id', 'h.hotel_id', 'h.hotel_name', 'h.hotel_name as name', 'h.city', 'h.star_rating', 'h.star_rating as stars', 'h.hotel_photo_1 as photo_url'])
            ->groupBy('private_trip_id');
        $stations = DB::table('private_trip_stations')->whereIn('private_trip_id', $ids)
            ->orderBy('day_number')->orderBy('station_order')->get()->groupBy('private_trip_id');

        $data = $trips->map(function ($trip) use ($places, $hotels, $stations) {
            $tripPlaces = ($places[$trip->private_trip_id] ?? collect())->map(fn ($p) => (array) $p)->values()->all();
            $tripHotels = ($hotels[$trip->private_trip_id] ?? collect())->map(fn ($h) => (array) $h)->values()->all();
            return (array) $trip + [
                'places' => $tripPlaces,
                'place_ids' => array_column($tripPlaces, 'place_id'),
                'hotels' => $tripHotels,
                'hotel_ids' => array_column($tripHotels, 'hotel_id'),
                'stations' => ($stations[$trip->private_trip_id] ?? collect())->values()->all(),
                'customer_description' => $tripPlaces
                    ? implode('، ', array_column($tripPlaces, 'city'))
                    : ($trip->customer_requirements ?: 'رحلة خاصة مخصصة'),
            ];
        })->values()->all();

        return response()->json(['success' => true, 'data' => $this->typed($data)]);
    }

    // Tourist request: a registered, unrestricted tourist, a start date at least 10 days ahead, and registered landmarks
    public function store(Request $request): JsonResponse
    {
        $data = $this->validateArabic($request, [
            'tourist_id' => 'required|string|max:50',
            'preferred_start_date' => 'required|date',
            'duration_days' => 'required|integer|between:1,30',
            'number_of_companions' => 'required|integer|between:1,50',
            'place_ids' => 'required|array|min:1',
            'place_ids.*' => 'string|max:50',
            'guide_license_number' => 'nullable|string|max:50',
            'customer_requirements' => 'nullable|string|max:4000',
        ], [
            'tourist_id' => 'حساب السائح', 'preferred_start_date' => 'تاريخ بدء الرحلة', 'duration_days' => 'مدة الرحلة بالأيام',
            'number_of_companions' => 'عدد المرافقين', 'place_ids' => 'المعالم السياحية المطلوبة', 'guide_license_number' => 'المرشد المفضل',
            'customer_requirements' => 'المتطلبات والملاحظات',
        ]);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $tourist = DB::table('tourists')->where('tourist_id', $data['tourist_id'])->first();
        if (!$tourist) {
            return $this->error('حجز الرحلات الخاصة متاح فقط للمستخدمين المسجلين بحساب سائح. يرجى تسجيل الدخول كسائح أولاً.', 401);
        }
        if ($tourist->account_status === 'مقيّد') {
            return $this->error('حسابك مقيّد من قبل إدارة المنصة ولا يمكنه إرسال طلبات رحلات جديدة. يرجى التواصل مع الإدارة.', 403);
        }
        $minDate = now('Africa/Tripoli')->startOfDay()->addDays(self::MIN_DAYS_AHEAD)->toDateString();
        if (substr($data['preferred_start_date'], 0, 10) < $minDate) {
            return $this->error('يجب اختيار تاريخ بدء الرحلة بحيث يكون بعد 10 أيام على الأقل من اليوم لإتاحة الوقت لدراسة المسار واعتماده وتجهيز الحافلة والمرشد.', 422);
        }
        $placeIds = DB::table('places_tourist')->whereIn('place_id', $data['place_ids'])->pluck('place_id')->all();
        $placeIds = array_values(array_filter($data['place_ids'], fn ($p) => in_array($p, $placeIds, true)));
        if (!$placeIds) {
            return $this->error('يرجى اختيار معلم سياحي واحد على الأقل من المعالم المسجلة في المنصة', 422);
        }
        $guide = $data['guide_license_number'] ?? null;
        $preferred = $guide ? DB::table('tour_guides')->where('license_number', $guide)->first(['verification_status', 'availability_status']) : null;
        if ($guide && $preferred?->verification_status !== 'موثق') {
            return $this->error('المرشد المختار غير معتمد من إدارة المنصة', 422);
        }
        if ($preferred?->availability_status === 'إجازة') {
            return $this->error('المرشد المختار في إجازة حالياً، يرجى اختيار مرشد آخر أو ترك الاختيار للإدارة', 422);
        }

        $id = 'PRV-' . now('Africa/Tripoli')->format('ymdHis') . '-' . random_int(1000, 9999);
        DB::transaction(function () use ($id, $data, $tourist, $placeIds, $guide) {
            DB::table('private_trips')->insert([
                'private_trip_id' => $id,
                'status_order' => self::NEW,
                'preferred_start_date' => substr($data['preferred_start_date'], 0, 10),
                'duration_days' => $data['duration_days'],
                'number_of_companions' => $data['number_of_companions'],
                'guide_license_number' => $guide,
                'tourist_id' => $tourist->tourist_id,
                'customer_requirements' => trim((string) ($data['customer_requirements'] ?? '')) ?: null,
                'additional_expenses' => 0,
                'created_at' => now('Africa/Tripoli'),
            ]);
            foreach ($placeIds as $i => $placeId) {
                DB::table('places_trip_private')->insert(['private_trip_id' => $id, 'place_id' => $placeId, 'visit_order' => $i + 1]);
            }
            $this->notify("priv-new-{$id}", 'tourist', $tourist->tourist_id, 'private_trip',
                "👑 تم استلام طلب رحلتك الخاصة ({$id})",
                "تم استلام وتسجيل طلب رحلتك الخاصة بنجاح (#{$id}). تقوم إدارة المنصة بدراسة المسار وإعداد البرنامج المقترح.",
                '/dashboard/tourist');
            $this->notify("admin-priv-new-{$id}", 'admin', null, 'private_trip',
                "👑 طلب رحلة خاصة VIP جديد (#{$id})",
                "طلب السائح ({$tourist->full_name}) رحلة خاصة (#{$id}) لمدة ({$data['duration_days']}) أيام. بانتظار إعداد البرنامج والتسعير.",
                '/dashboard/admin');
        });

        return response()->json(['success' => true, 'message' => 'تم إرسال طلب الرحلة الخاصة بنجاح للإدارة لدراسته وتسعيره',
            'trip_id' => $id, 'data' => $this->find($id)], 201);
    }

    // Admin: price, schedule (guide, vehicle, hotels, stations) and send to the tourist, or reject
    public function review(Request $request, string $tripId): JsonResponse
    {
        $trip = DB::table('private_trips')->where('private_trip_id', $tripId)->first();
        if (!$trip) {
            return $this->error('طلب الرحلة الخاصة غير موجود', 404);
        }
        if (in_array($trip->status_order, self::CLOSED, true)) {
            return $this->error('هذه الرحلة الخاصة ملغاة أو مرفوضة نهائياً ولا يمكن جدولتها أو تسعيرها مرة أخرى.', 409);
        }
        if ($trip->status_order === self::CONFIRMED) {
            return $this->error('هذه الرحلة الخاصة مؤكدة من السائح، ولا يمكن تعديل تسعيرتها بعد التأكيد.', 409);
        }
        if ($trip->status_order === self::QUOTED) {
            return $this->error('وافق المرشد على هذه الرحلة وأُرسل العرض للسائح، ولا يمكن تعديلها قبل رد السائح.', 409);
        }
        $this->mergeAliases($request, ['vehicle_plate' => ['vehicle_plate', 'assigned_vehicle', 'assigned_vehicle_plate']]);
        $data = $this->validateArabic($request, [
            'status_order' => 'required|string|in:' . implode(',', [self::NEW, self::QUOTED, self::REJECTED]),
            'quoted_price' => 'nullable|numeric|min:1|required_if:status_order,' . self::QUOTED,
            'additional_expenses' => 'nullable|numeric|min:0',
            'guide_license_number' => 'nullable|string|max:50',
            'vehicle_plate' => 'nullable|string|max:30',
            'hotel_ids' => 'nullable|array',
            'stations' => 'nullable|array',
            'stations.*.station_title' => 'required|string|max:200',
            'stations.*.day_number' => 'nullable|integer|min:1',
            'admin_notes' => 'nullable|string|max:2000',
        ], [
            'status_order' => 'حالة الطلب', 'quoted_price' => 'السعر المقترح', 'additional_expenses' => 'المصاريف الإضافية',
            'guide_license_number' => 'المرشد', 'vehicle_plate' => 'المركبة', 'stations.*.station_title' => 'عنوان المحطة',
            'stations.*.day_number' => 'رقم اليوم', 'admin_notes' => 'ملاحظات الإدارة',
        ]);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        $guide = $data['guide_license_number'] ?? null;
        if ($guide && DB::table('tour_guides')->where('license_number', $guide)->value('verification_status') !== 'موثق') {
            return $this->error('لا يمكن إسناد الرحلة لمرشد غير معتمد من الإدارة', 422);
        }
        // The schedule goes to the guide before the tourist
        if ($data['status_order'] === self::QUOTED) {
            if (!$guide) {
                return $this->error('يرجى تعيين مرشد سياحي للرحلة؛ تُرسل الرحلة للمرشد للموافقة عليها قبل إرسالها للسائح', 422);
            }
            if ($trip->status_order === self::GUIDE_DECLINED && $guide === $trip->guide_license_number) {
                return $this->error('اعتذر هذا المرشد عن الرحلة، يرجى تعيين مرشد آخر', 422);
            }
            $data['status_order'] = self::GUIDE_PENDING;
        }
        $plate = $data['vehicle_plate'] ?? null;
        if ($plate && !DB::table('vehicles')->where('plate_number', $plate)->exists()) {
            return $this->error('المركبة المحددة غير موجودة في قاعدة البيانات', 422);
        }
        if ($data['status_order'] === self::GUIDE_PENDING) {
            $start = substr((string) $trip->preferred_start_date, 0, 10);
            $end = date('Y-m-d', strtotime($start . ' +' . max(0, (int) $trip->duration_days - 1) . ' days'));
            if ($start <= now('Africa/Tripoli')->toDateString()) {
                return $this->error('تاريخ بدء هذه الرحلة قد حلّ أو مضى، فلا يمكن جدولتها. يمكنك رفض الطلب ليرسل السائح طلباً بتاريخ جديد.', 422);
            }
            foreach ((array) ($data['stations'] ?? []) as $s) {
                if ((int) ($s['day_number'] ?? 1) > (int) $trip->duration_days) {
                    return $this->error("رقم اليوم في المحطة ({$s['station_title']}) أكبر من مدة الرحلة ({$trip->duration_days} أيام)", 422);
                }
            }
            $tripPlate = $plate ?? $trip->vehicle_plate;
            if ($error = $this->capacityError($tripPlate, (int) $trip->number_of_companions)
                ?? $this->scheduleConflict($guide, $tripPlate, $start, $end, null, ['private', $tripId])) {
                return $this->error($error, 422);
            }
            [$error, $warning] = $this->guideFitness($guide, $start, $end, null,
                DB::table('places_trip_private')->where('private_trip_id', $tripId)->pluck('place_id')->all());
            if ($error) {
                return $this->error($error, 422);
            }
        }

        $status = $data['status_order'];
        $values = ['status_order' => $status];
        foreach (['quoted_price', 'additional_expenses'] as $column) {
            if (isset($data[$column])) {
                $values[$column] = $data[$column];
            }
        }
        if ($guide) {
            $values['guide_license_number'] = $guide;
        }
        if ($plate) {
            $values['vehicle_plate'] = $plate;
        }
        $notes = trim((string) ($data['admin_notes'] ?? ''));
        if ($notes !== '' && !str_contains((string) $trip->customer_requirements, $notes)) {
            $values['customer_requirements'] = trim(($trip->customer_requirements ? $trip->customer_requirements . ' - ' : '') . "ملاحظات الإدارة: {$notes}");
        }

        DB::transaction(function () use ($tripId, $trip, $values, $data, $request, $status) {
            DB::table('private_trips')->where('private_trip_id', $tripId)->update($values);
            if ($request->has('hotel_ids')) {
                DB::table('hotels_trip_private')->where('private_trip_id', $tripId)->delete();
                $hotels = DB::table('hotels')->whereIn('hotel_id', (array) $data['hotel_ids'])->pluck('hotel_id')->all();
                DB::table('hotels_trip_private')->insert(array_map(fn ($h) => ['private_trip_id' => $tripId, 'hotel_id' => $h], $hotels));
            }
            if ($request->has('stations')) {
                DB::table('private_trip_stations')->where('private_trip_id', $tripId)->delete();
                foreach (array_values((array) $data['stations']) as $i => $s) {
                    DB::table('private_trip_stations')->insert([
                        'station_id' => "PTS-{$tripId}-" . ($i + 1),
                        'private_trip_id' => $tripId,
                        'day_number' => (int) ($s['day_number'] ?? 1) ?: 1,
                        'station_order' => (int) ($s['station_order'] ?? $i + 1) ?: $i + 1,
                        'station_title' => trim($s['station_title']),
                        'station_time' => mb_substr(trim((string) ($s['station_time'] ?? '')), 0, 30) ?: null,
                        'station_desc' => trim((string) ($s['station_desc'] ?? '')) ?: null,
                    ]);
                }
            }
            // The guide who was waiting on this request is told when it moves to another guide or is rejected
            $previousGuide = $trip->status_order === self::GUIDE_PENDING ? $trip->guide_license_number : null;
            if ($previousGuide && ($status === self::REJECTED || ($values['guide_license_number'] ?? $previousGuide) !== $previousGuide)) {
                $this->notify("guide-priv-withdrawn-{$tripId}-{$previousGuide}-" . now()->timestamp, 'guide', $previousGuide, 'trip',
                    "ℹ️ سحب طلب الرحلة الخاصة (#{$tripId})",
                    "لم تعد الرحلة الخاصة (#{$tripId}) بانتظار ردك؛ " . ($status === self::REJECTED ? 'رفضت الإدارة الطلب.' : 'أسندتها الإدارة لمرشد آخر.'),
                    '/dashboard/guide');
            }
            if ($status === self::GUIDE_PENDING) {
                $guide = $values['guide_license_number'];
                $this->notify("guide-priv-request-{$tripId}-{$guide}-" . now()->timestamp, 'guide', $guide, 'trip',
                    "🧭 رحلة خاصة بانتظار موافقتك (#{$tripId})",
                    "أسندت إليك الإدارة رحلة خاصة (#{$tripId}) تبدأ بتاريخ ({$trip->preferred_start_date}) لمدة ({$trip->duration_days}) أيام. يرجى مراجعة البرنامج وقبول الرحلة أو الاعتذار عنها من لوحتك.",
                    '/dashboard/guide');
            } elseif ($status === self::REJECTED && $trip->tourist_id) {
                $this->notify("priv-rejected-{$tripId}", 'tourist', $trip->tourist_id, 'private_trip',
                    "❌ تعذر اعتماد طلب رحلتك الخاصة (#{$tripId})",
                    "نأسف، لم تتمكن إدارة المنصة من اعتماد طلب رحلتك الخاصة (#{$tripId}). يمكنك إرسال طلب جديد بتواريخ أو معالم أخرى.",
                    '/dashboard/tourist');
            }
        });

        $message = 'تم حفظ مراجعة الرحلة الخاصة بنجاح';
        return response()->json(['success' => true, 'message' => !empty($warning) ? "{$message}. {$warning}" : $message,
            'warning' => $warning ?? null, 'data' => $this->find($tripId)]);
    }

    // The assigned guide accepts (the offer then goes to the tourist) or declines (the admin assigns another guide)
    public function guideResponse(Request $request, string $tripId): JsonResponse
    {
        $data = $this->validateArabic($request, [
            'license_number' => 'required|string|max:50',
            'decision' => 'required|string|in:accept,decline',
            'reason' => 'nullable|string|max:500',
        ], ['license_number' => 'رقم ترخيص المرشد', 'decision' => 'القرار', 'reason' => 'سبب الاعتذار']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        $trip = DB::table('private_trips as pt')->leftJoin('tour_guides as g', 'pt.guide_license_number', '=', 'g.license_number')
            ->where('pt.private_trip_id', $tripId)->first(['pt.*', 'g.full_name as guide_name', 'g.verification_status']);
        if (!$trip) {
            return $this->error('طلب الرحلة الخاصة غير موجود', 404);
        }
        if ($trip->guide_license_number !== $data['license_number']) {
            return $this->error('هذه الرحلة ليست مسندة إليك', 403);
        }
        if ($trip->verification_status !== 'موثق') {
            return $this->error('حسابك غير معتمد من إدارة المنصة', 403);
        }
        if ($trip->status_order !== self::GUIDE_PENDING) {
            return $this->error('تم الرد على هذه الرحلة مسبقاً', 409);
        }

        $accepted = $data['decision'] === 'accept';
        if ($accepted && substr((string) $trip->preferred_start_date, 0, 10) <= now('Africa/Tripoli')->toDateString()) {
            return $this->error('تاريخ بدء هذه الرحلة قد حلّ أو مضى، ولا يمكن قبولها.', 409);
        }
        DB::transaction(function () use ($tripId, $trip, $accepted, $data) {
            DB::table('private_trips')->where('private_trip_id', $tripId)
                ->update(['status_order' => $accepted ? self::QUOTED : self::GUIDE_DECLINED]);
            $guideName = $trip->guide_name ?: $trip->guide_license_number;
            if ($accepted) {
                $price = $trip->quoted_price;
                $this->notify("priv-quote-{$tripId}-{$price}-{$trip->guide_license_number}", 'tourist', $trip->tourist_id, 'private_trip',
                    "📋 تم إعداد البرنامج المقترح لرحلتك الخاصة ({$tripId})",
                    "أعدت الإدارة برنامجاً مقترحاً وتكلفة تقديرية ({$price} د.ل) لرحلتك الخاصة (#{$tripId}). تنبيه: هذا برنامج مقترح يتطلب مراجعتك واعتمادك ولا يعني تأكيد الحجز بعد.",
                    '/dashboard/tourist');
                $this->notify("admin-priv-guide-ok-{$tripId}-{$trip->guide_license_number}", 'admin', null, 'private_trip',
                    "✅ وافق المرشد على الرحلة الخاصة (#{$tripId})",
                    "وافق المرشد ({$guideName}) على الرحلة الخاصة (#{$tripId})، وأُرسل البرنامج والتسعيرة للسائح.",
                    '/dashboard/admin');
            } else {
                $reason = trim((string) ($data['reason'] ?? ''));
                $this->notify("admin-priv-guide-no-{$tripId}-{$trip->guide_license_number}", 'admin', null, 'private_trip',
                    "⚠️ اعتذر المرشد عن الرحلة الخاصة (#{$tripId})",
                    "اعتذر المرشد ({$guideName}) عن الرحلة الخاصة (#{$tripId})" . ($reason !== '' ? " — السبب: {$reason}" : '') . '. يرجى تعيين مرشد آخر.',
                    '/dashboard/admin');
            }
        });

        return response()->json(['success' => true,
            'message' => $accepted ? 'تم قبول الرحلة وإرسال العرض للسائح' : 'تم تسجيل اعتذارك وإبلاغ الإدارة',
            'data' => $this->find($tripId)]);
    }

    // Tourist: confirm the admin's quote, or cancel the request. Only the owner can decide.
    public function decide(Request $request, string $tripId): JsonResponse
    {
        $trip = DB::table('private_trips as pt')->leftJoin('tourists as t', 'pt.tourist_id', '=', 't.tourist_id')
            ->where('pt.private_trip_id', $tripId)->first(['pt.*', 't.full_name']);
        if (!$trip) {
            return $this->error('طلب الرحلة الخاصة غير موجود', 404);
        }
        $data = $this->validateArabic($request, [
            'tourist_id' => 'required|string',
            'decision' => 'required|string|in:' . self::CONFIRMED . ',' . self::CANCELLED,
        ], ['tourist_id' => 'حساب السائح', 'decision' => 'القرار']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        if ($data['tourist_id'] !== $trip->tourist_id) {
            return $this->error('لا يمكنك تعديل طلب رحلة خاصة لا يخص حسابك', 403);
        }
        if (in_array($trip->status_order, self::CLOSED, true)) {
            return $this->error('هذا الطلب ملغى أو مرفوض مسبقاً', 409);
        }
        $decision = $data['decision'];
        if ($decision === self::CONFIRMED && $trip->status_order !== self::QUOTED) {
            return $this->error('لا يمكن تأكيد الرحلة قبل أن تُرسل الإدارة البرنامج والتسعيرة', 409);
        }
        $start = substr((string) $trip->preferred_start_date, 0, 10);
        $today = now('Africa/Tripoli')->startOfDay();
        if ($decision === self::CONFIRMED && $start <= $today->toDateString()) {
            return $this->error('تاريخ بدء الرحلة قد حلّ أو مضى، ولا يمكن تأكيدها. يرجى إرسال طلب جديد بتاريخ آخر.', 409);
        }
        // A confirmed trip has a guide and a vehicle booked for it: it can be cancelled only up to MIN_CANCEL_DAYS before it starts
        if ($decision === self::CANCELLED && $trip->status_order === self::CONFIRMED
            && $start < $today->copy()->addDays(self::MIN_CANCEL_DAYS)->toDateString()) {
            return $this->error('لا يمكن إلغاء رحلة مؤكدة قبل موعدها بأقل من ' . self::MIN_CANCEL_DAYS . ' أيام. يرجى التواصل مع الإدارة.', 409);
        }

        DB::transaction(function () use ($tripId, $trip, $decision) {
            DB::table('private_trips')->where('private_trip_id', $tripId)->update(['status_order' => $decision]);
            $name = $trip->full_name ?: 'سائح دلني';
            if ($decision === self::CONFIRMED) {
                $this->notify("priv-confirmed-t-{$tripId}", 'tourist', $trip->tourist_id, 'private_trip',
                    "🎉 اعتماد وتأكيد حجز الرحلة الخاصة (#{$tripId})",
                    "تم تأكيد حجز رحلتك الخاصة (#{$tripId}) بنجاح واعتماد جدول المحطات والتسعيرة. نتمنى لكم رحلة VIP ممتعة!", '/dashboard/tourist');
                $this->notify("admin-priv-confirmed-{$tripId}", 'admin', null, 'private_trip',
                    "🎉 موافقة السائح على الرحلة الخاصة (#{$tripId})",
                    "وافق السائح ({$name}) على برنامج وتسعيرة الرحلة الخاصة (#{$tripId}). تم اعتماد الحجز بنجاح.", '/dashboard/admin');
                if ($trip->guide_license_number) {
                    $this->notify("guide-priv-assign-{$tripId}-{$trip->guide_license_number}", 'guide', $trip->guide_license_number, 'trip',
                        '🧭 تكليف بمهمة إرشاد رحلة خاصة VIP',
                        "تم تكليفك كمرشد سياحي للرحلة الخاصة (#{$tripId}) مع السائح ({$name}) لمدة ({$trip->duration_days}) أيام.", '/dashboard/guide');
                }
            } else {
                $this->notify("admin-priv-cancel-{$tripId}", 'admin', null, 'private_trip',
                    "❌ إلغاء طلب الرحلة الخاصة (#{$tripId})",
                    "ألغى السائح ({$name}) طلب الرحلة الخاصة (#{$tripId}).", '/dashboard/admin');
                // The guide already accepted (offer sent) or the trip was confirmed: the guide is freed
                if ($trip->guide_license_number && in_array($trip->status_order, [self::QUOTED, self::CONFIRMED], true)) {
                    $this->notify("guide-priv-cancel-{$tripId}-{$trip->guide_license_number}", 'guide', $trip->guide_license_number, 'trip',
                        "❌ إلغاء الرحلة الخاصة (#{$tripId})",
                        "ألغى السائح الرحلة الخاصة (#{$tripId}) التي كانت مسندة إليك بتاريخ ({$trip->preferred_start_date}).", '/dashboard/guide');
                }
            }
        });

        return response()->json(['success' => true,
            'message' => $decision === self::CONFIRMED ? 'تم تأكيد رحلتك الخاصة بنجاح' : 'تم إلغاء طلب الرحلة الخاصة',
            'data' => $this->find($tripId)]);
    }

    private function find(string $id): ?array
    {
        $all = $this->index(Request::create('/', 'GET'))->getData(true)['data'];
        return collect($all)->firstWhere('private_trip_id', $id);
    }
}
