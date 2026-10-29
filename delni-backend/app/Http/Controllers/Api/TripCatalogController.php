<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Api\Concerns\ManagesTrips;
use App\Http\Controllers\Controller;
use App\Models\WeeklyTrip;
use App\Support\ListInput;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Daily and weekly trips (replaces the bridge's /daily_trips and /weekly_trips).
 * Trips are never deleted: «إلغاء الرحلة» sets is_active = 0, stops new bookings and notifies everyone involved.
 * The response keeps the bridge's shape (title, images, gallery, days, stations, itinerary_steps, places, ...).
 */
class TripCatalogController extends Controller
{
    use JsonApiResponses, ManagesTrips;

    public const DAILY_CAPACITIES = [15, 25, 50];
    private const WEEK_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    private const DAILY_PHOTOS = ['/assets/dest-leptis-theater.jpg', '/assets/dest-leptis-arch.jpg', '/assets/dest-leptis-forum.jpg', '/assets/dest-leptis-coast.jpg', '/assets/hero-leptis.jpg'];
    private const WEEKLY_PHOTOS = ['/assets/dest-ubari-gaberoun.jpg', '/assets/dest-ubari-ummalmaa.jpg', '/assets/dest-acacus-arch.jpg', '/assets/dest-sahara-dunes.jpg', '/assets/dest-ubari.jpg'];

    /* ===================== Daily trips ===================== */

    // Public list shows active trips only; the admin dashboard asks for ?all=1
    public function dailyIndex(Request $request): JsonResponse
    {
        $query = DB::table('daily_trips as dt')
            ->leftJoin('tour_guides as g', 'dt.guide_license_number', '=', 'g.license_number')
            ->leftJoin('vehicles as v', 'dt.vehicle_plate', '=', 'v.plate_number')
            ->leftJoin('transportation_companies as tc', 'v.contract_number', '=', 'tc.contract_number')
            ->leftJoin('drivers as d', 'd.assigned_vehicle_plate', '=', 'v.plate_number')
            ->leftJoin('restaurants_cafes as r', 'dt.restaurant_id', '=', 'r.facility_id')
            ->select('dt.*', 'g.full_name as guide_name', 'g.phone_number as guide_phone', 'g.avatar as guide_avatar',
                'v.vehicle_type as vehicle_model', 'v.seating_capacity as vehicle_capacity', 'v.vehicle_image',
                'tc.company_name as transport_company_name', 'd.full_name as driver_name', 'd.phone_number as driver_phone',
                'd.driver_license_number', 'r.facility_name as restaurant_name', 'r.facility_type as restaurant_type',
                'r.city as restaurant_city', 'r.address_details as restaurant_address', 'r.phone_number as restaurant_phone',
                'r.facility_image_1 as restaurant_image')
            ->orderByDesc('dt.daily_trip_id');
        if (!$request->boolean('all')) {
            $query->where('dt.is_active', true);
        }
        $trips = $query->get();
        $ids = $trips->pluck('daily_trip_id')->all();

        $stations = DB::table('daily_trip_stations')->whereIn('daily_trip_id', $ids)->orderBy('station_order')->get()->groupBy('daily_trip_id');
        $days = DB::table('daily_trip_days')->whereIn('daily_trip_id', $ids)->get()->groupBy('daily_trip_id');
        $places = $this->linkedPlaces('places_trip_daily', 'daily_trip_id', $ids);
        $stats = $this->tripStats('reviews_daily_trips', 'bookings_daily', 'daily_trip_id', $ids);

        $data = $trips->map(function ($dt) use ($stations, $days, $places, $stats) {
            $tripStations = ($stations[$dt->daily_trip_id] ?? collect())->values();
            // Saturday-first week order (the database returns the rows in no fixed order)
            $tripDays = ($days[$dt->daily_trip_id] ?? collect())->pluck('day_of_week')
                ->sortBy(fn ($d) => array_search($d, self::WEEK_DAYS, true) === false ? 99 : array_search($d, self::WEEK_DAYS, true))
                ->values()->all();
            $itinerary = $tripStations->map(fn ($s) => [
                'time' => $s->station_time, 'title' => $s->station_title, 'desc' => $s->station_desc ?? '',
                'station_id' => $s->station_id, 'station_order' => $s->station_order,
                'station_title' => $s->station_title, 'station_time' => $s->station_time, 'station_desc' => $s->station_desc,
            ])->all();
            $tripPlaces = $places[$dt->daily_trip_id] ?? [];
            return (array) $dt + $this->photoView($dt, self::DAILY_PHOTOS) + $stats($dt->daily_trip_id) + [
                'title' => $dt->trip_title,
                'bus_capacity' => $dt->max_capacity,
                'days' => $tripDays,
                'recurring_days' => implode(',', $tripDays),
                'stations' => $tripStations->all(),
                'itinerary_steps' => $itinerary,
                'place_ids' => array_column($tripPlaces, 'place_id'),
                'places' => $tripPlaces,
                'destinations' => array_column($tripPlaces, 'place_name'),
            ];
        })->values()->all();

        return response()->json(['success' => true, 'data' => $this->typed($data)]);
    }

    public function saveDaily(Request $request): JsonResponse
    {
        $id = trim((string) ($request->input('daily_trip_id') ?: $request->input('id')));
        $existing = $id !== '' ? DB::table('daily_trips')->where('daily_trip_id', $id)->first() : null;
        if ($id !== '' && !$existing && !$request->boolean('isNew', true)) {
            return $this->error('الرحلة اليومية المحددة غير موجودة في قاعدة البيانات', 404);
        }
        if ($existing && $request->input('isNew') !== null && $request->boolean('isNew')) {
            return $this->error('رقم الرحلة اليومية مسجل مسبقاً لرحلة أخرى', 409);
        }
        $this->mergeAliases($request, [
            'trip_title' => ['trip_title', 'title'],
            'price_per_seat' => ['price_per_seat', 'price'],
            'max_capacity' => ['max_capacity', 'bus_capacity'],
        ]);

        $required = $existing ? 'sometimes|required' : 'required';
        $data = $this->validateArabic($request, [
            'trip_title' => "{$required}|string|max:200",
            'description' => "{$required}|string",
            'price_per_seat' => "{$required}|numeric|min:1",
            'max_capacity' => "{$required}|integer|in:" . implode(',', self::DAILY_CAPACITIES),
            'guide_license_number' => "{$required}|string|max:50",
            'departure_city' => 'nullable|string|max:100',
            'vehicle_plate' => 'nullable|string|max:30',
            'restaurant_id' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'recurring_days' => $existing ? 'nullable' : 'required',
        ], [
            'trip_title' => 'عنوان الرحلة', 'description' => 'وصف الرحلة', 'price_per_seat' => 'سعر المقعد',
            'max_capacity' => 'سعة الحافلة (15 أو 25 أو 50)', 'guide_license_number' => 'المرشد السياحي',
            'departure_city' => 'مدينة الانطلاق', 'recurring_days' => 'أيام الرحلة',
        ]);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $guide = $data['guide_license_number'] ?? $existing?->guide_license_number;
        $plate = $this->firstPlate($request) ?? null;
        $restaurant = $data['restaurant_id'] ?? null;
        if ($error = $this->referenceError(isset($data['guide_license_number']) ? $guide : null, $plate, $restaurant)) {
            return $this->error($error, 422);
        }

        $days = $request->has('recurring_days') ? ListInput::dayNames($request->input('recurring_days')) : null;
        if ($days !== null && (count($days) < 1 || count($days) > 2)) {
            return $this->error('يجب تحديد يوم أو يومين في الأسبوع لانطلاق الرحلة اليومية', 422);
        }

        $id = $id !== '' ? $id : $this->newTripId('DT');
        $values = $this->changed($data, ['trip_title', 'description', 'price_per_seat', 'departure_city']);
        if ($guide) {
            $values['guide_license_number'] = $guide;
        }
        if (isset($data['max_capacity'])) {
            $values['max_capacity'] = (int) $data['max_capacity'];
            $values['available_seats'] = $this->seatsAfterCapacityChange($existing, (int) $data['max_capacity']);
        }
        if (array_key_exists('is_active', $data) && $data['is_active'] !== null) {
            $values['is_active'] = (bool) $data['is_active'];
        }
        if ($plate) {
            $values['vehicle_plate'] = $plate;
        }
        if ($restaurant) {
            $values['restaurant_id'] = $restaurant;
        }
        $photos = $this->photoColumns($request, $id, self::DAILY_PHOTOS);
        if ($photos) {
            $values += $photos;
        } elseif (!$existing) {
            $values += array_combine(['photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5'], self::DAILY_PHOTOS);
        }
        if (!$existing) {
            $values += ['departure_city' => 'طرابلس', 'is_active' => true];
        }

        $stations = $this->stationRows($request);
        $placeIds = $this->placeIds($request);
        DB::transaction(function () use ($id, $values, $existing, $days, $stations, $placeIds, $plate, $guide) {
            $existing
                ? DB::table('daily_trips')->where('daily_trip_id', $id)->update($values)
                : DB::table('daily_trips')->insert($values + ['daily_trip_id' => $id]);

            if ($days !== null) {
                DB::table('daily_trip_days')->where('daily_trip_id', $id)->delete();
                DB::table('daily_trip_days')->insert(array_map(fn ($d) => ['daily_trip_id' => $id, 'day_of_week' => $d], $days));
            }
            if ($stations !== null) {
                DB::table('daily_trip_stations')->where('daily_trip_id', $id)->delete();
                foreach ($stations as $i => $s) {
                    DB::table('daily_trip_stations')->insert([
                        'station_id' => "{$id}-ST-" . ($i + 1),
                        'daily_trip_id' => $id,
                        'station_order' => $i + 1,
                        'station_title' => mb_substr(trim((string) ($s['title'] ?? $s['station_title'] ?? $s['station_name'] ?? '')) ?: 'محطة ' . ($i + 1), 0, 150),
                        'station_time' => mb_substr(trim((string) ($s['time'] ?? $s['station_time'] ?? $s['arrival_time'] ?? '')) ?: '09:00 ص', 0, 30),
                        'station_desc' => trim((string) ($s['desc'] ?? $s['station_desc'] ?? $s['description'] ?? '')) ?: null,
                    ]);
                }
            }
            if ($placeIds !== null) {
                DB::table('places_trip_daily')->where('daily_trip_id', $id)->delete();
                DB::table('places_trip_daily')->insert(array_map(fn ($p) => ['daily_trip_id' => $id, 'place_id' => $p], $placeIds));
            }
            $title = $values['trip_title'] ?? $existing->trip_title;
            $this->notifyAssignment($id, $title, 'رحلة يومية', $guide, $plate, $existing);
        });

        return response()->json(['success' => true, 'message' => 'تم حفظ الرحلة اليومية ومحطاتها في قاعدة البيانات بنجاح',
            'trip_id' => $id, 'data' => $this->findTrip('daily', $id)], 201);
    }

    public function cancelDaily(string $tripId): JsonResponse
    {
        return $this->cancel('daily_trips', 'daily_trip_id', 'bookings_daily', $tripId, 'الرحلة اليومية');
    }

    /* ===================== Weekly trips ===================== */

    public function weeklyIndex(Request $request): JsonResponse
    {
        $query = DB::table('weekly_trips as wt')
            ->leftJoin('tour_guides as g', 'wt.guide_license_number', '=', 'g.license_number')
            ->leftJoin('vehicles as v', 'wt.vehicle_plate', '=', 'v.plate_number')
            ->leftJoin('transportation_companies as tc', 'v.contract_number', '=', 'tc.contract_number')
            ->leftJoin('drivers as d', 'd.assigned_vehicle_plate', '=', 'v.plate_number')
            ->select('wt.*', 'g.full_name as guide_name', 'g.phone_number as guide_phone', 'g.avatar as guide_avatar',
                'v.vehicle_type as vehicle_model', 'v.seating_capacity as vehicle_capacity', 'v.vehicle_image',
                'tc.company_name as transport_company_name', 'd.full_name as driver_name', 'd.phone_number as driver_phone',
                'd.driver_license_number')
            ->orderByDesc('wt.weekly_trip_id');
        if (!$request->boolean('all')) {
            $query->where('wt.is_active', true)
                ->where(fn ($q) => $q->whereNull('wt.guide_approval_status')->orWhere('wt.guide_approval_status', WeeklyTrip::GUIDE_APPROVED));
        }
        $trips = $query->get();
        $ids = $trips->pluck('weekly_trip_id')->all();

        $stations = DB::table('weekly_trip_stations')->whereIn('weekly_trip_id', $ids)
            ->orderBy('day_number')->orderBy('station_order')->get()->groupBy('weekly_trip_id');
        $places = $this->linkedPlaces('places_trip_weekly', 'weekly_trip_id', $ids);
        $hotels = DB::table('hotels_trip_weekly as j')->join('hotels as h', 'j.hotel_id', '=', 'h.hotel_id')
            ->whereIn('j.weekly_trip_id', $ids)
            ->get(['j.weekly_trip_id', 'h.hotel_id', 'h.hotel_name', 'h.city', 'h.star_rating', 'h.hotel_photo_1'])->groupBy('weekly_trip_id');
        $restaurants = DB::table('restaurants_trip_weekly as j')->join('restaurants_cafes as r', 'j.facility_id', '=', 'r.facility_id')
            ->whereIn('j.weekly_trip_id', $ids)
            ->get(['j.weekly_trip_id', 'r.facility_id', 'r.facility_name', 'r.city', 'r.facility_type', 'r.facility_image_1'])->groupBy('weekly_trip_id');
        $stats = $this->tripStats('reviews_weekly_trips', 'bookings_weekly', 'weekly_trip_id', $ids);

        $data = $trips->map(function ($wt) use ($stations, $places, $hotels, $restaurants, $stats) {
            $tripStations = ($stations[$wt->weekly_trip_id] ?? collect())->values();
            $itinerary = $tripStations->map(fn ($s) => [
                'time' => 'اليوم ' . $s->day_number, 'title' => $s->station_title, 'desc' => $s->station_desc ?? '',
                'station_id' => $s->station_id, 'station_order' => $s->station_order, 'day_number' => $s->day_number,
                'station_title' => $s->station_title, 'station_desc' => $s->station_desc,
            ])->all();
            $tripPlaces = $places[$wt->weekly_trip_id] ?? [];
            $tripHotels = ($hotels[$wt->weekly_trip_id] ?? collect())->map(fn ($h) => (array) $h)->values()->all();
            $tripRestaurants = ($restaurants[$wt->weekly_trip_id] ?? collect())->map(fn ($r) => (array) $r)->values()->all();
            return (array) $wt + $this->photoView($wt, self::WEEKLY_PHOTOS) + $stats($wt->weekly_trip_id) + [
                'title' => $wt->trip_title,
                'description' => $wt->trip_description,
                'stations' => $tripStations->all(),
                'itinerary_steps' => $itinerary,
                'place_ids' => array_column($tripPlaces, 'place_id'),
                'places' => $tripPlaces,
                'destinations' => array_column($tripPlaces, 'place_name'),
                'hotel_ids' => array_column($tripHotels, 'hotel_id'),
                'hotels' => $tripHotels,
                'restaurant_ids' => array_column($tripRestaurants, 'facility_id'),
                'restaurants' => $tripRestaurants,
                'restaurant_id' => $tripRestaurants[0]['facility_id'] ?? null,
                'restaurant_name' => $tripRestaurants[0]['facility_name'] ?? null,
            ];
        })->values()->all();

        return response()->json(['success' => true, 'data' => $this->typed($data)]);
    }

    public function saveWeekly(Request $request): JsonResponse
    {
        $id = trim((string) ($request->input('weekly_trip_id') ?: $request->input('id')));
        $existing = $id !== '' ? DB::table('weekly_trips')->where('weekly_trip_id', $id)->first() : null;
        if ($id !== '' && !$existing && !$request->boolean('isNew', true)) {
            return $this->error('الرحلة الأسبوعية المحددة غير موجودة في قاعدة البيانات', 404);
        }
        if ($existing && $request->input('isNew') !== null && $request->boolean('isNew')) {
            return $this->error('رقم الرحلة الأسبوعية مسجل مسبقاً لرحلة أخرى', 409);
        }
        $this->mergeAliases($request, [
            'trip_title' => ['trip_title', 'title'],
            'seat_per_price' => ['seat_per_price', 'price'],
            'trip_description' => ['trip_description', 'description'],
        ]);

        $required = $existing ? 'sometimes|required' : 'required';
        $data = $this->validateArabic($request, [
            'trip_title' => "{$required}|string|max:200",
            'seat_per_price' => "{$required}|numeric|min:1",
            'trip_description' => "{$required}|string",
            'max_capacity' => "{$required}|integer|min:1|max:100",
            'guide_license_number' => "{$required}|string|max:50",
            'start_date' => "{$required}|date" . ($existing ? '' : '|after_or_equal:today'),
            'end_date' => "{$required}|date",
            'departure_city' => 'nullable|string|max:100',
            'vehicle_plate' => 'nullable|string|max:30',
            'is_active' => 'nullable|boolean',
            'hotel_ids' => 'nullable|array',
            'restaurant_ids' => 'nullable|array',
            'restaurant_id' => 'nullable|string|max:50',
        ], [
            'trip_title' => 'عنوان الرحلة', 'seat_per_price' => 'سعر المقعد', 'trip_description' => 'وصف الرحلة', 'max_capacity' => 'سعة الرحلة',
            'guide_license_number' => 'المرشد السياحي', 'start_date' => 'تاريخ البداية', 'end_date' => 'تاريخ النهاية',
            'departure_city' => 'مدينة الانطلاق',
        ]);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        $start = $data['start_date'] ?? (string) $existing?->start_date;
        $end = $data['end_date'] ?? (string) $existing?->end_date;
        if (substr($end, 0, 10) < substr($start, 0, 10)) {
            return $this->error('تاريخ نهاية الرحلة لا يمكن أن يكون قبل تاريخ بدايتها', 422);
        }

        $guide = $data['guide_license_number'] ?? $existing?->guide_license_number;
        $plate = $this->firstPlate($request);
        if ($error = $this->referenceError(isset($data['guide_license_number']) ? $guide : null, $plate)) {
            return $this->error($error, 422);
        }

        $id = $id !== '' ? $id : $this->newTripId('WT');
        $values = $this->changed($data, ['trip_title', 'trip_description', 'seat_per_price', 'start_date', 'end_date', 'departure_city']);
        if ($guide) {
            $values['guide_license_number'] = $guide;
        }
        if (isset($data['max_capacity'])) {
            $values['max_capacity'] = (int) $data['max_capacity'];
            $values['available_seats'] = $this->seatsAfterCapacityChange($existing, (int) $data['max_capacity']);
        }
        if (array_key_exists('is_active', $data) && $data['is_active'] !== null) {
            $values['is_active'] = (bool) $data['is_active'];
        }
        if ($plate) {
            $values['vehicle_plate'] = $plate;
        }
        // A new trip, or a trip given to another guide, waits for that guide's acceptance before it is published
        $sentToGuide = !$existing || ($guide && $guide !== $existing->guide_license_number);
        if ($sentToGuide) {
            $values['guide_approval_status'] = WeeklyTrip::GUIDE_PENDING;
        } elseif ($existing->guide_approval_status === WeeklyTrip::GUIDE_DECLINED) {
            return $this->error('اعتذر المرشد عن هذه الرحلة، يرجى اختيار مرشد آخر لها', 422);
        }
        $photos = $this->photoColumns($request, $id, self::WEEKLY_PHOTOS);
        if ($photos) {
            $values += $photos;
        } elseif (!$existing) {
            $values += array_combine(['photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5'], self::WEEKLY_PHOTOS);
        }
        if (!$existing) {
            $values += ['departure_city' => 'طرابلس', 'is_active' => true];
        }

        $stations = $this->stationRows($request);
        $placeIds = $this->placeIds($request);
        $hotelIds = $request->has('hotel_ids') || $request->has('hotel_id')
            ? DB::table('hotels')->whereIn('hotel_id', (array) ($request->input('hotel_ids') ?? [$request->input('hotel_id')]))->pluck('hotel_id')->all()
            : null;
        $restaurantIds = $request->has('restaurant_ids') || $request->has('restaurant_id')
            ? DB::table('restaurants_cafes')->whereIn('facility_id', array_filter((array) ($request->input('restaurant_ids') ?? [$request->input('restaurant_id')])))->pluck('facility_id')->all()
            : null;

        DB::transaction(function () use ($id, $values, $existing, $stations, $placeIds, $hotelIds, $restaurantIds, $plate, $guide, $sentToGuide) {
            $existing
                ? DB::table('weekly_trips')->where('weekly_trip_id', $id)->update($values)
                : DB::table('weekly_trips')->insert($values + ['weekly_trip_id' => $id]);

            if ($stations !== null) {
                DB::table('weekly_trip_stations')->where('weekly_trip_id', $id)->delete();
                foreach ($stations as $i => $s) {
                    $time = (string) ($s['time'] ?? $s['arrival_time'] ?? '');
                    $day = (int) ($s['day_number'] ?? (preg_match('/\d+/', $time, $m) ? $m[0] : 1)) ?: 1;
                    DB::table('weekly_trip_stations')->insert([
                        'station_id' => "{$id}-WST-" . ($i + 1),
                        'weekly_trip_id' => $id,
                        'station_order' => $i + 1,
                        'day_number' => $day,
                        'station_title' => mb_substr(trim((string) ($s['title'] ?? $s['station_title'] ?? $s['station_name'] ?? '')) ?: 'محطة ' . ($i + 1), 0, 200),
                        'station_desc' => trim((string) ($s['desc'] ?? $s['station_desc'] ?? $s['description'] ?? '')) ?: null,
                    ]);
                }
            }
            foreach ([['places_trip_weekly', 'place_id', $placeIds], ['hotels_trip_weekly', 'hotel_id', $hotelIds], ['restaurants_trip_weekly', 'facility_id', $restaurantIds]] as [$table, $column, $list]) {
                if ($list !== null) {
                    DB::table($table)->where('weekly_trip_id', $id)->delete();
                    DB::table($table)->insert(array_map(fn ($v) => ['weekly_trip_id' => $id, $column => $v], array_values(array_unique($list))));
                }
            }
            $title = $values['trip_title'] ?? $existing->trip_title;
            if ($sentToGuide) {
                // The driver and the company are told once the guide accepts (weeklyGuideResponse)
                $this->notify("guide-weekly-request-{$id}-{$guide}", 'guide', $guide, 'trip',
                    "🧭 رحلة أسبوعية بانتظار موافقتك ({$title})",
                    "أسندت إليك الإدارة الرحلة الأسبوعية ({$title}). يرجى مراجعة تفاصيلها وقبولها أو الاعتذار عنها من لوحتك؛ لن تُنشر للسياح قبل موافقتك.",
                    '/dashboard/guide?tab=assigned_trips');
            } elseif (($existing->guide_approval_status ?? WeeklyTrip::GUIDE_APPROVED) === WeeklyTrip::GUIDE_APPROVED) {
                $this->notifyAssignment($id, $title, 'رحلة أسبوعية', null, $plate, $existing);
            }
        });

        return response()->json(['success' => true,
            'message' => $sentToGuide
                ? 'تم حفظ الرحلة الأسبوعية وإرسالها للمرشد؛ تُنشر للسياح بعد موافقته'
                : 'تم حفظ تعديلات الرحلة الأسبوعية بنجاح',
            'trip_id' => $id, 'data' => $this->findTrip('weekly', $id)], 201);
    }

    // The trip's guide accepts (the trip is published, driver and company notified) or declines (the admin chooses another guide)
    public function weeklyGuideResponse(Request $request, string $tripId): JsonResponse
    {
        $data = $this->validateArabic($request, [
            'license_number' => 'required|string|max:50',
            'decision' => 'required|string|in:accept,decline',
            'reason' => 'nullable|string|max:500',
        ], ['license_number' => 'رقم ترخيص المرشد', 'decision' => 'القرار', 'reason' => 'سبب الاعتذار']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        $trip = DB::table('weekly_trips as wt')->leftJoin('tour_guides as g', 'wt.guide_license_number', '=', 'g.license_number')
            ->where('wt.weekly_trip_id', $tripId)->first(['wt.*', 'g.full_name as guide_name']);
        if (!$trip) {
            return $this->error('الرحلة الأسبوعية غير موجودة', 404);
        }
        if ($trip->guide_license_number !== $data['license_number']) {
            return $this->error('هذه الرحلة ليست مسندة إليك', 403);
        }
        if ($trip->guide_approval_status !== WeeklyTrip::GUIDE_PENDING) {
            return $this->error('تم الرد على هذه الرحلة مسبقاً', 409);
        }

        $accepted = $data['decision'] === 'accept';
        DB::transaction(function () use ($tripId, $trip, $accepted, $data) {
            DB::table('weekly_trips')->where('weekly_trip_id', $tripId)
                ->update(['guide_approval_status' => $accepted ? WeeklyTrip::GUIDE_APPROVED : WeeklyTrip::GUIDE_DECLINED]);
            $guideName = $trip->guide_name ?: $trip->guide_license_number;
            if ($accepted) {
                $this->notify("admin-weekly-guide-ok-{$tripId}-{$trip->guide_license_number}", 'admin', null, 'trip',
                    "✅ وافق المرشد على الرحلة الأسبوعية ({$trip->trip_title})",
                    "وافق المرشد ({$guideName}) على الرحلة الأسبوعية ({$trip->trip_title})، وأصبحت منشورة ومتاحة للحجز.",
                    '/dashboard/admin?tab=trips');
                $this->notifyAssignment($tripId, $trip->trip_title, 'رحلة أسبوعية', null, $trip->vehicle_plate, null);
            } else {
                $reason = trim((string) ($data['reason'] ?? ''));
                $this->notify("admin-weekly-guide-no-{$tripId}-{$trip->guide_license_number}", 'admin', null, 'trip',
                    "⚠️ اعتذر المرشد عن الرحلة الأسبوعية ({$trip->trip_title})",
                    "اعتذر المرشد ({$guideName}) عن الرحلة الأسبوعية ({$trip->trip_title})" . ($reason !== '' ? " — السبب: {$reason}" : '') . '. يرجى تعيين مرشد آخر.',
                    '/dashboard/admin?tab=trips');
            }
        });

        return response()->json(['success' => true,
            'message' => $accepted ? 'تم قبول الرحلة، وأصبحت منشورة للسياح' : 'تم تسجيل اعتذارك وإبلاغ الإدارة',
            'data' => $this->findTrip('weekly', $tripId)]);
    }

    public function cancelWeekly(string $tripId): JsonResponse
    {
        return $this->cancel('weekly_trips', 'weekly_trip_id', 'bookings_weekly', $tripId, 'الرحلة الأسبوعية');
    }

    /* ===================== Helpers ===================== */

    private function cancel(string $table, string $key, string $bookingsTable, string $tripId, string $label): JsonResponse
    {
        $trip = DB::table($table)->where($key, $tripId)->first();
        if (!$trip) {
            return $this->error("{$label} غير موجودة", 404);
        }
        DB::transaction(function () use ($table, $key, $tripId, $trip, $bookingsTable) {
            DB::table($table)->where($key, $tripId)->update(['is_active' => false]);
            $this->notifyCancellation($tripId, $trip, $bookingsTable, $key);
        });
        return response()->json(['success' => true, 'message' => "تم إلغاء {$label} وإيقاف الحجز عليها، وإشعار المرشد والسائق والشركة والسياح المحجوزين."]);
    }

    private function findTrip(string $kind, string $id): ?array
    {
        $request = Request::create('/', 'GET', ['all' => 1]);
        $list = $kind === 'daily' ? $this->dailyIndex($request) : $this->weeklyIndex($request);
        $key = $kind === 'daily' ? 'daily_trip_id' : 'weekly_trip_id';
        return collect($list->getData(true)['data'])->firstWhere($key, $id);
    }

    private function firstPlate(Request $request): ?string
    {
        $plate = $request->input('vehicle_plate');
        if (!$plate && is_array($request->input('vehicle_plates'))) {
            $plate = $request->input('vehicle_plates')[0] ?? null;
        }
        $plate = trim((string) $plate);
        return $plate !== '' ? $plate : null;
    }

    private function changed(array $data, array $columns): array
    {
        $values = [];
        foreach ($columns as $column) {
            if (isset($data[$column])) {
                $values[$column] = is_string($data[$column]) ? trim($data[$column]) : $data[$column];
            }
        }
        return $values;
    }

    // photo_1..5 plus the bridge's derived fields: photo, cover_photo, images[], gallery "a,b"
    private function photoView(object $trip, array $defaults): array
    {
        $images = [];
        foreach (range(1, 5) as $i) {
            $images[] = $trip->{"photo_{$i}"} ?: $defaults[$i - 1];
        }
        return ['photo' => $images[0], 'cover_photo' => $images[0], 'images' => $images, 'gallery' => implode(',', $images)];
    }

    private function linkedPlaces(string $junction, string $key, array $ids): array
    {
        return DB::table("{$junction} as j")->join('places_tourist as p', 'j.place_id', '=', 'p.place_id')
            ->whereIn("j.{$key}", $ids)
            ->get(["j.{$key}", 'p.place_id', 'p.city as place_name', 'p.city', 'p.category', 'p.place_image'])
            ->groupBy($key)->map(fn ($rows) => $rows->map(fn ($r) => (array) $r)->values()->all())->all();
    }

    // rating_avg, reviews_count and bookings_count per trip
    private function tripStats(string $reviews, string $bookings, string $key, array $ids): \Closure
    {
        $ratings = DB::table($reviews)->whereIn($key, $ids)->groupBy($key)
            ->selectRaw("{$key}, AVG(CAST(stars_rating AS FLOAT)) as avg_rating, COUNT(*) as total")->get()->keyBy($key);
        $booked = DB::table($bookings)->whereIn($key, $ids)->groupBy($key)
            ->selectRaw("{$key}, COUNT(*) as total")->get()->keyBy($key);
        return fn (string $id) => [
            'rating_avg' => isset($ratings[$id]) ? round((float) $ratings[$id]->avg_rating, 1) : 0,
            'reviews_count' => isset($ratings[$id]) ? (int) $ratings[$id]->total : 0,
            'bookings_count' => isset($booked[$id]) ? (int) $booked[$id]->total : 0,
        ];
    }
}
