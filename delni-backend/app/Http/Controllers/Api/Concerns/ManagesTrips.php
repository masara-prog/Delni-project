<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Support\Base64Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Input parsing and side effects shared by daily and weekly trips (same rules the Node bridge applied).
 * Uses JsonApiResponses::notify, so the controller must also use that trait.
 */
trait ManagesTrips
{
    // A readable unique id such as DT-261029143015-42 (the bridge used 4 timestamp digits, which could collide)
    private function newTripId(string $prefix): string
    {
        return $prefix . '-' . now('Africa/Tripoli')->format('ymdHis') . '-' . random_int(1000, 9999);
    }

    /**
     * The five photo columns from images[] / photos[] / gallery "a,b" / photo. Base64 images become files.
     * Returns null when the request sent no images (an edit keeps the stored photos).
     */
    private function photoColumns(Request $request, string $tripId, array $defaults): ?array
    {
        $images = $request->input('images') ?: $request->input('photos');
        if (!is_array($images) || !$images) {
            $gallery = $request->input('gallery');
            $images = is_string($gallery) && trim($gallery) !== '' ? explode(',', $gallery) : [];
        }
        if (!$images && $request->filled('photo')) {
            $images = [$request->input('photo')];
        }
        $images = array_values(array_filter(array_map(fn ($i) => is_string($i) ? trim($i) : '', $images)));
        if (!$images) {
            return null;
        }

        $columns = [];
        foreach (range(0, 4) as $i) {
            $value = $images[$i] ?? $defaults[$i];
            $columns['photo_' . ($i + 1)] = Base64Image::store($value, "{$tripId}-img-" . ($i + 1));
        }
        return $columns;
    }

    // Itinerary stations from stations[] or itinerary_steps (array or JSON text), in the order sent
    private function stationRows(Request $request): ?array
    {
        $raw = $request->input('stations');
        if (!is_array($raw) || !$raw) {
            $raw = $request->input('itinerary_steps');
            if (is_string($raw)) {
                $raw = json_decode($raw, true);
            }
        }
        if (!is_array($raw)) {
            return $request->has('stations') || $request->has('itinerary_steps') ? [] : null;
        }
        return array_values(array_filter($raw, 'is_array'));
    }

    /**
     * Registered landmark ids from place_ids[] / places[] / destinations[] (ids or exact landmark names).
     * Unknown values are ignored, as the bridge did; returns null when nothing about places was sent.
     */
    private function placeIds(Request $request): ?array
    {
        $raw = null;
        foreach (['place_ids', 'places', 'destinations'] as $key) {
            if (is_array($request->input($key)) && $request->input($key)) {
                $raw = $request->input($key);
                break;
            }
        }
        if ($raw === null) {
            return $request->has('place_ids') ? [] : null;
        }
        $values = array_filter(array_map(fn ($p) => trim((string) (is_array($p) ? ($p['place_id'] ?? $p['id'] ?? '') : $p)), $raw));
        if (!$values) {
            return [];
        }
        // A landmark can be given by its id or by its name (its tourist city)
        $rows = DB::table('places_tourist')->whereIn('place_id', $values)->orWhereIn('city', $values)->get(['place_id', 'city']);
        $ids = [];
        foreach ($values as $value) {
            $match = $rows->first(fn ($r) => $r->place_id === $value) ?? $rows->first(fn ($r) => $r->city === $value);
            if ($match && !in_array($match->place_id, $ids, true)) {
                $ids[] = $match->place_id;
            }
        }
        return $ids;
    }

    // Arabic error when the guide is not an approved guide, or the vehicle / restaurant does not exist
    private function referenceError(?string $guide, ?string $plate, ?string $restaurant = null): ?string
    {
        if ($guide !== null) {
            $status = DB::table('tour_guides')->where('license_number', $guide)->value('verification_status');
            if ($status === null) {
                return 'المرشد السياحي المحدد غير موجود';
            }
            if ($status !== 'موثق') {
                return 'لا يمكن إسناد الرحلة لمرشد غير معتمد من الإدارة';
            }
        }
        if ($plate !== null && !DB::table('vehicles')->where('plate_number', $plate)->exists()) {
            return 'المركبة المحددة غير موجودة';
        }
        if ($restaurant !== null && !DB::table('restaurants_cafes')->where('facility_id', $restaurant)->exists()) {
            return 'المطعم/المقهى المحدد غير موجود';
        }
        return null;
    }

    // Arabic error when the trip carries more people than the vehicle has seats
    private function capacityError(?string $plate, int $people): ?string
    {
        if ($plate === null) {
            return null;
        }
        $seats = (int) DB::table('vehicles')->where('plate_number', $plate)->value('seating_capacity');
        return $seats > 0 && $people > $seats
            ? "عدد ركاب الرحلة ({$people}) أكبر من عدد مقاعد المركبة ({$plate}) وهو ({$seats}) مقعداً. يرجى اختيار مركبة أكبر أو تقليل السعة."
            : null;
    }

    /**
     * Arabic error when the guide or the vehicle is already busy on another trip at the same time, else null.
     * A trip occupies either a date range (weekly / private: $start..$end) or, for a daily trip, its weekdays every week ($weekdays).
     * $exclude = ['daily'|'weekly'|'private', id] leaves out the trip being edited.
     */
    private function scheduleConflict(?string $guide, ?string $plate, ?string $start, ?string $end, ?array $weekdays, array $exclude): ?string
    {
        if ($guide === null && $plate === null) {
            return null;
        }
        $today = now('Africa/Tripoli')->toDateString();
        $who = function (object $row) use ($guide, $plate): string {
            return $guide !== null && $row->guide_license_number === $guide ? 'المرشد المختار' : "المركبة ({$plate})";
        };
        $sameResources = function ($q, string $guideColumn = 'guide_license_number', string $plateColumn = 'vehicle_plate') use ($guide, $plate) {
            $q->where(function ($w) use ($guide, $plate, $guideColumn, $plateColumn) {
                if ($guide !== null) {
                    $w->orWhere($guideColumn, $guide);
                }
                if ($plate !== null) {
                    $w->orWhere($plateColumn, $plate);
                }
            });
        };
        // A range trip occupies the weekdays it covers; a daily trip occupies its own weekdays
        $days = $weekdays !== null ? array_map([$this, 'normalizeDayName'], $weekdays) : $this->weekdaysBetween($start, $end);

        // Weekly trips (not ended, not declined by their guide)
        $weekly = DB::table('weekly_trips')->where('is_active', true)->where('end_date', '>=', $today)
            ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', '<>', 'اعتذر المرشد'))
            ->where(fn ($q) => $sameResources($q));
        if ($exclude[0] === 'weekly') {
            $weekly->where('weekly_trip_id', '<>', $exclude[1]);
        }
        if ($weekdays === null) {
            $weekly->where('start_date', '<=', $end)->where('end_date', '>=', $start);
        }
        foreach ($weekly->get(['weekly_trip_id', 'trip_title', 'guide_license_number', 'vehicle_plate', 'start_date', 'end_date']) as $t) {
            if ($weekdays === null || array_intersect($days, $this->weekdaysBetween((string) $t->start_date, (string) $t->end_date))) {
                return "{$who($t)} مسند لرحلة أسبوعية أخرى ({$t->trip_title}) من " . substr($t->start_date, 0, 10) . ' إلى ' . substr($t->end_date, 0, 10) . ' في نفس الفترة.';
            }
        }

        // Private trips the guide was asked for, quoted or confirmed (still running or ahead)
        $private = DB::table('private_trips')
            ->whereIn('status_order', ['بانتظار رد المرشد', 'بانتظار تأكيد السائح', 'مؤكدة'])
            ->whereRaw('DATEADD(day, duration_days - 1, preferred_start_date) >= ?', [$today])
            ->where(fn ($q) => $sameResources($q));
        if ($exclude[0] === 'private') {
            $private->where('private_trip_id', '<>', $exclude[1]);
        }
        if ($weekdays === null) {
            $private->where('preferred_start_date', '<=', $end)->whereRaw('DATEADD(day, duration_days - 1, preferred_start_date) >= ?', [$start]);
        }
        foreach ($private->get(['private_trip_id', 'guide_license_number', 'vehicle_plate', 'preferred_start_date', 'duration_days']) as $t) {
            $tStart = substr((string) $t->preferred_start_date, 0, 10);
            $tEnd = date('Y-m-d', strtotime($tStart . ' +' . max(0, (int) $t->duration_days - 1) . ' days'));
            if ($weekdays === null || array_intersect($days, $this->weekdaysBetween($tStart, $tEnd))) {
                return "{$who($t)} مسند لرحلة خاصة أخرى (#{$t->private_trip_id}) من {$tStart} إلى {$tEnd} في نفس الفترة.";
            }
        }

        // Active daily trips that run on one of the same weekdays
        $daily = DB::table('daily_trips')->where('is_active', true)->where(fn ($q) => $sameResources($q))
            ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', '<>', 'اعتذر المرشد'));
        if ($exclude[0] === 'daily') {
            $daily->where('daily_trip_id', '<>', $exclude[1]);
        }
        $daily = $daily->get(['daily_trip_id', 'trip_title', 'guide_license_number', 'vehicle_plate']);
        $runDays = DB::table('daily_trip_days')->whereIn('daily_trip_id', $daily->pluck('daily_trip_id'))->get()->groupBy('daily_trip_id');
        foreach ($daily as $t) {
            $tDays = ($runDays[$t->daily_trip_id] ?? collect())->pluck('day_of_week')->map([$this, 'normalizeDayName'])->all();
            $shared = $tDays ? array_intersect($days, $tDays) : $days; // no stored days = every day
            if ($shared) {
                return "{$who($t)} مسند لرحلة يومية أخرى ({$t->trip_title}) تنطلق يوم " . implode(' و', array_values($shared)) . '.';
            }
        }
        return null;
    }

    /**
     * Whether the guide can take a trip: [error, warning]. The error blocks the assignment (on leave, licence expired before the
     * trip ends, a trip day outside the guide's working days); the warning only informs the admin (landmarks outside their expertise).
     * A range trip gives $start..$end; a daily trip gives its weekdays (it runs every week, so its end is open).
     */
    private function guideFitness(string $guide, ?string $start, ?string $end, ?array $weekdays, ?array $placeIds): array
    {
        $g = DB::table('tour_guides')->where('license_number', $guide)
            ->first(['full_name', 'availability_status', DB::raw('CONVERT(VARCHAR(10), license_expiry_date, 23) as license_expiry_date')]);
        if (!$g) {
            return [null, null];
        }
        if ($g->availability_status === 'إجازة') {
            return ["المرشد ({$g->full_name}) في إجازة حالياً ولا يستقبل رحلات جديدة. يرجى اختيار مرشد آخر.", null];
        }
        $today = now('Africa/Tripoli')->toDateString();
        $lastDay = $end ? substr($end, 0, 10) : $today;
        if ($g->license_expiry_date && $g->license_expiry_date < max($lastDay, $today)) {
            return ["ترخيص المرشد ({$g->full_name}) ينتهي بتاريخ {$g->license_expiry_date} قبل انتهاء الرحلة. لا يمكن إسناد الرحلة إليه قبل تجديد الترخيص.", null];
        }

        $workDays = DB::table('guide_working_days')->where('license_number', $guide)->pluck('day_of_week')->map([$this, 'normalizeDayName'])->all();
        $tripDays = $weekdays !== null ? array_map([$this, 'normalizeDayName'], $weekdays) : $this->weekdaysBetween($start, $end);
        $outside = $workDays ? array_values(array_diff($tripDays, $workDays)) : [];
        if ($outside) {
            return ["المرشد ({$g->full_name}) لا يعمل يوم " . implode(' و', $outside) . '، وهو من أيام الرحلة. يرجى اختيار مرشد آخر أو تعديل أيام الرحلة.', null];
        }

        $warning = null;
        if ($placeIds) {
            $known = DB::table('guide_places')->where('license_number', $guide)->pluck('place_id')->all();
            $unknown = array_values(array_diff($placeIds, $known));
            if ($known && $unknown) {
                $names = DB::table('places_tourist')->whereIn('place_id', $unknown)->pluck('city')->all();
                $warning = "تنبيه: المعالم (" . implode('، ', $names) . ") ليست ضمن معالم خبرة المرشد ({$g->full_name}).";
            }
        }
        return [null, $warning];
    }

    private const WEEKDAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    public function normalizeDayName(?string $day): string
    {
        return str_replace('إ', 'ا', trim((string) $day));
    }

    // The weekday names a date range covers (all seven once it lasts a week)
    private function weekdaysBetween(?string $start, ?string $end): array
    {
        $from = strtotime(substr((string) $start, 0, 10));
        $to = strtotime(substr((string) $end, 0, 10));
        if (!$from || !$to || $to < $from) {
            return [];
        }
        $days = [];
        for ($d = $from, $i = 0; $d <= $to && $i < 7; $d = strtotime('+1 day', $d), $i++) {
            $days[] = $this->normalizeDayName(self::WEEKDAY_NAMES[(int) date('w', $d)]);
        }
        return $days;
    }

    // Changing the capacity moves the free seats by the same amount, so seats already booked stay booked
    private function seatsAfterCapacityChange(?object $existing, int $capacity): int
    {
        if (!$existing) {
            return $capacity;
        }
        return max(0, (int) $existing->available_seats + ($capacity - (int) $existing->max_capacity));
    }

    // Notifies the guide, and the vehicle's driver and company, when they are newly assigned to a trip
    private function notifyAssignment(string $tripId, string $title, string $kind, ?string $guide, ?string $plate, ?object $existing): void
    {
        if ($guide && (!$existing || $existing->guide_license_number !== $guide)) {
            $this->notify("guide-assign-{$tripId}-{$guide}", 'guide', $guide, 'assignment',
                "🧭 تكليف بمهمة إرشاد {$kind} جديدة",
                "تم إسنادك كمرشد سياحي معتمد لرحلة ({$title}).",
                '/dashboard/guide');
        }
        if (!$plate || ($existing && $existing->vehicle_plate === $plate)) {
            return;
        }
        $vehicle = DB::table('vehicles as v')
            ->leftJoin('drivers as d', 'd.assigned_vehicle_plate', '=', 'v.plate_number')
            ->where('v.plate_number', $plate)
            ->first(['d.driver_license_number', 'v.contract_number']);
        if ($vehicle?->driver_license_number) {
            $this->notify("driver-assign-{$tripId}-{$vehicle->driver_license_number}", 'driver', $vehicle->driver_license_number, 'assignment',
                "🚍 تكليف بـ{$kind} جديدة للسائق",
                "تم إسناد مهمة قيادة ونقل رحلة ({$title}) على متن المركبة ({$plate}).",
                '/dashboard/driver');
        }
        if ($vehicle?->contract_number) {
            $this->notify("company-assign-{$tripId}-{$vehicle->contract_number}", 'company', $vehicle->contract_number, 'assignment',
                "🚐 إسناد {$kind} لأسطول شركتكم",
                "تم إسناد رحلة ({$title}) للمركبة ({$plate}) التابعة لأسطولكم.",
                '/dashboard/transport');
        }
    }

    // Cancelling a trip stops bookings and tells everyone involved; nothing is deleted
    private function notifyCancellation(string $tripId, object $trip, string $bookingsTable, string $tripKey): void
    {
        $vehicle = $trip->vehicle_plate
            ? DB::table('vehicles as v')->leftJoin('drivers as d', 'd.assigned_vehicle_plate', '=', 'v.plate_number')
                ->where('v.plate_number', $trip->vehicle_plate)->first(['d.driver_license_number', 'v.contract_number'])
            : null;
        $title = $trip->trip_title;
        if ($trip->guide_license_number) {
            $this->notify("trip-cancel-guide-{$tripId}", 'guide', $trip->guide_license_number, 'trip',
                "❌ إلغاء تكليف الإرشاد لرحلة ({$title})",
                "نحيطكم علماً بأنه قد تم إلغاء رحلة ({$title}) وإلغاء مهمة الإرشاد المسندة إليكم.", '/dashboard/guide');
        }
        if ($vehicle?->driver_license_number) {
            $this->notify("trip-cancel-driver-{$tripId}", 'driver', $vehicle->driver_license_number, 'trip',
                "❌ إلغاء رحلة مسندة للسائق ({$title})",
                "تم إلغاء رحلة ({$title}) التي كانت مسندة لمركبتكم ({$trip->vehicle_plate}).", '/dashboard/driver');
        }
        if ($vehicle?->contract_number) {
            $this->notify("trip-cancel-company-{$tripId}", 'company', $vehicle->contract_number, 'trip',
                "❌ إلغاء رحلة تابعة لأسطول شركتكم ({$title})",
                "تم إلغاء رحلة ({$title}) المسندة للمركبة ({$trip->vehicle_plate}).", '/dashboard/transport');
        }
        foreach (DB::table($bookingsTable)->where($tripKey, $tripId)->distinct()->pluck('tourist_id') as $touristId) {
            $this->notify("trip-cancel-{$tripId}-{$touristId}", 'tourist', $touristId, 'trip',
                "❌ تم إلغاء الرحلة ({$title})",
                "نأسف لإعلامكم بإلغاء رحلة ({$title}) من قِبل الإدارة. يُرجى مراجعة الإدارة لاسترجاع التكلفة أو تغيير الموعد.", '/dashboard/tourist');
        }
    }
}
