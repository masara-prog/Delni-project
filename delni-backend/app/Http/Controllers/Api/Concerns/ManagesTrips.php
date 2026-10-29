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
        return $prefix . '-' . now('Africa/Tripoli')->format('ymdHis') . '-' . random_int(10, 99);
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
                return 'المرشد السياحي المحدد غير موجود في قاعدة البيانات';
            }
            if ($status !== 'موثق') {
                return 'لا يمكن إسناد الرحلة لمرشد غير معتمد من الإدارة';
            }
        }
        if ($plate !== null && !DB::table('vehicles')->where('plate_number', $plate)->exists()) {
            return 'المركبة المحددة غير موجودة في قاعدة البيانات';
        }
        if ($restaurant !== null && !DB::table('restaurants_cafes')->where('facility_id', $restaurant)->exists()) {
            return 'المطعم/المقهى المحدد غير موجود في قاعدة البيانات';
        }
        return null;
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
