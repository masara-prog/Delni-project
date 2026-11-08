<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TourGuide;
use App\Models\Driver;
use App\Models\TransportationCompany;
use App\Models\DailyTrip;
use App\Models\WeeklyTrip;
use App\Models\PrivateTrip;
use App\Models\BookingDaily;
use App\Models\BookingWeekly;
use App\Models\Vehicle;
use App\Models\OfferDailyTrip;
use App\Models\OfferWeeklyTrip;
use App\Models\Hotel;
use App\Models\RestaurantCafe;
use App\Models\PlaceTourist;
use App\Support\Base64Image;
use App\Support\ListInput;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class DashboardController extends Controller
{
    /**
     * Data for Tour Guide Dashboard (Live database connection)
     */
    public function guideDashboard($licenseNumber)
    {
        $guide = TourGuide::where('license_number', $licenseNumber)
            ->orWhere('email', $licenseNumber)
            ->first();

        if (!$guide) {
            return response()->json([
                'error' => 'لا توجد بيانات مرشد سياحي مسجلة لهذا الحساب',
            ], 404);
        }

        // Full trip details for the guide's read-only view (itinerary, places, lodging, food, vehicle, passengers)
        $lic = $guide->license_number;
        $dailyTrips = DailyTrip::with(['bookings.tourist', 'days', 'stations', 'places', 'restaurant', 'vehicle.driver', 'offers'])
            ->where('guide_license_number', $lic)->get();
        $weeklyTrips = WeeklyTrip::with(['bookings.tourist', 'stations', 'places', 'hotels', 'restaurants', 'vehicle.driver', 'offers'])
            ->where('guide_license_number', $lic)->get();
        // Private trips reach the guide once the admin sends the schedule (a tourist's preferred guide alone is not an assignment)
        $privateTrips = PrivateTrip::with(['tourist', 'stations', 'places', 'hotels', 'vehicle.driver'])
            ->where('guide_license_number', $lic)
            ->whereIn('status_order', [PrivateTripController::GUIDE_PENDING, PrivateTripController::GUIDE_DECLINED,
                PrivateTripController::QUOTED, PrivateTripController::CONFIRMED])
            ->orderByDesc('created_at')->get();

        return response()->json([
            'guide' => $guide->toArray() + [
                'place_ids' => DB::table('guide_places')->where('license_number', $lic)->pluck('place_id')->all(),
                'working_days' => ListInput::dayCodes(DB::table('guide_working_days')->where('license_number', $lic)->pluck('day_of_week')->all()),
            ],
            'daily_trips' => $dailyTrips,
            'weekly_trips' => $weeklyTrips,
            'private_trips' => $privateTrips,
        ]);
    }

    /**
     * Tour Guide: Update Profile & Credentials in DelniDB
     */
    public function updateGuideProfile(Request $request, $licenseNumber)
    {
        $guide = TourGuide::find($licenseNumber);
        if (!$guide) {
            return response()->json(['status' => 'error', 'message' => 'المرشد غير موجود'], 404);
        }

        try {
            $validated = $request->validate([
                'full_name' => 'nullable|string|max:150',
                'phone_number' => ['nullable', 'string', 'max:20', Rule::unique('tour_guides', 'phone_number')->ignore($guide->license_number, 'license_number')],
                'email' => ['nullable', 'email', 'max:100', Rule::unique('tour_guides', 'email')->ignore($guide->license_number, 'license_number')],
                'password' => 'nullable|string',
                'years_of_experience' => 'nullable|integer|min:2|max:40',
                'bio' => 'nullable|string',
                'price_per_day' => 'nullable|numeric|min:0',
                'working_days' => 'nullable',
                'place_ids' => 'nullable|array',
                'speaks_english' => 'nullable|boolean',
                'speaks_french' => 'nullable|boolean',
                'speaks_italian' => 'nullable|boolean',
                'digital_certificate_file' => 'nullable|string',
                'gender' => 'nullable|string|max:10',
                'avatar' => 'nullable|string',
                'license_expiry_date' => 'nullable|date_format:Y-m-d',
                'availability_status' => 'nullable|string|in:' . implode(',', TourGuide::AVAILABILITY),
            ], [
                'phone_number.unique' => 'رقم الهاتف مسجل مسبقاً لمرشد آخر',
                'email.unique' => 'البريد الإلكتروني مسجل مسبقاً لمرشد آخر',
                'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
                'years_of_experience.min' => 'سنوات الخبرة السياحية للمرشد يجب أن تكون سنتين على الأقل',
                'years_of_experience.max' => 'سنوات الخبرة لا يمكن أن تتجاوز 40 سنة',
                'price_per_day.min' => 'سعر اليوم لا يمكن أن يكون سالباً',
                'availability_status.in' => 'حالة التوافر يجب أن تكون: متاح أو إجازة',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'error', 'message' => collect($e->errors())->flatten()->first()], 422);
        }

        // A new licence expiry date must be in the future (an unchanged one is kept as it is)
        $expiry = $validated['license_expiry_date'] ?? null;
        $oldExpiry = $guide->license_expiry_date?->format('Y-m-d');
        if ($expiry && $expiry !== $oldExpiry && $expiry <= now('Africa/Tripoli')->toDateString()) {
            return response()->json(['status' => 'error', 'message' => 'تاريخ انتهاء الترخيص يجب أن يكون تاريخاً قادماً'], 422);
        }
        // Going on leave is refused while the guide still has trips ahead (the admin must reassign them first)
        if (($validated['availability_status'] ?? null) === TourGuide::ON_LEAVE && $guide->availability_status !== TourGuide::ON_LEAVE) {
            $ahead = DB::table('daily_trips')->where('guide_license_number', $guide->license_number)->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', WeeklyTrip::GUIDE_APPROVED))->count()
                + DB::table('weekly_trips')->where('guide_license_number', $guide->license_number)->where('is_active', true)
                ->where('end_date', '>=', now('Africa/Tripoli')->toDateString())
                ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', WeeklyTrip::GUIDE_APPROVED))->count()
                + DB::table('private_trips')->where('guide_license_number', $guide->license_number)
                    ->whereIn('status_order', [PrivateTripController::QUOTED, PrivateTripController::CONFIRMED])
                    ->where('preferred_start_date', '>=', now('Africa/Tripoli')->toDateString())->count();
            if ($ahead > 0) {
                return response()->json(['status' => 'error', 'message' => "لديك ({$ahead}) رحلات مسندة قادمة أو مستمرة؛ يرجى التواصل مع الإدارة لإسنادها لمرشد آخر قبل تفعيل الإجازة"], 422);
            }
        }

        // A verified guide's identity (name, gender, email) is locked
        if ($guide->verification_status === 'موثق') {
            unset($validated['full_name'], $validated['gender'], $validated['email']);
        }

        // A new password is stored only when actually entered (not the masked placeholder) and long enough
        $password = trim((string) ($validated['password'] ?? ''));
        unset($validated['password']);
        if ($password !== '' && $password !== '••••••••') {
            if (mb_strlen($password) < 6) {
                return response()->json(['status' => 'error', 'message' => 'كلمة المرور يجب أن لا تقل عن 6 أحرف'], 422);
            }
            $validated['password'] = Hash::make($password);
        }
        if (!empty($validated['avatar'])) {
            $validated['avatar'] = Base64Image::store($validated['avatar'], "guide-{$guide->license_number}", 'guides');
        }

        // Working days, regions and landmarks live in their own tables, not as tour_guides columns
        $children = [
            'working_days' => $validated['working_days'] ?? null,
            'place_ids' => $validated['place_ids'] ?? null,
        ];
        unset($validated['working_days'], $validated['place_ids']);

        DB::transaction(function () use ($guide, $validated, $children) {
            $guide->update(array_filter($validated, fn($v) => !is_null($v) && $v !== ''));
            if (!is_null($children['working_days'])) {
                $guide->replaceWorkingDays($children['working_days']);
            }
            if (!is_null($children['place_ids'])) {
                $guide->replacePlaces($children['place_ids']);
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'تم حفظ وتحديث ملف المرشد بنجاح',
            'guide' => $guide->fresh(),
        ]);
    }

    // Guides answer private trips through PrivateTripController::guideResponse

    /**
     * Data for Driver Dashboard
     */
    public function driverDashboard($driverLicenseNumber)
    {
        $driver = Driver::with('assignedVehicle')->find($driverLicenseNumber);
        if (!$driver) {
            return response()->json(['success' => false, 'error' => 'حساب السائق غير موجود'], 404);
        }

        // Only trips the admin assigned to the driver's vehicle and their guide accepted (no contract details for the driver),
        // each with its dates (the app enables the stage buttons on the trip day) and what the driver sees about it
        $trips = array_map(fn (array $t) => $t + $this->driverTripDetails($t), $driver->assignedTrips());

        return response()->json([
            'success' => true,
            'driver' => collect($driver->toArray())->except(['contract_number', 'assigned_vehicle'])->all()
                + ['company_name' => $driver->company()->value('company_name'), 'company_phone' => $driver->company()->value('phone_number')],
            'vehicle' => $driver->assignedVehicle ? collect($driver->assignedVehicle->toArray())->except('contract_number')->all() : null,
            'trips' => $trips,
        ]);
    }

    // Dates and details of one of Driver::assignedTrips() (kind يومية / أسبوعية / خاصة)
    private function driverTripDetails(array $t): array
    {
        $with = ['places', 'stations', 'guide'];
        switch ($t['kind']) {
            case 'يومية':
                $trip = DailyTrip::with([...$with, 'days'])->find($t['id']);
                $day = $trip ? $this->nextRunDay($trip->days->pluck('day_of_week')->all()) : null;
                return $trip ? ['start_date' => $day, 'end_date' => $day] + $this->driverTripExtras($trip) : [];
            case 'أسبوعية':
                $trip = WeeklyTrip::with($with)->find($t['id']);
                return $trip ? ['start_date' => $trip->start_date->format('Y-m-d'), 'end_date' => $trip->end_date->format('Y-m-d')]
                    + $this->driverTripExtras($trip) : [];
            default:
                $trip = PrivateTrip::with($with)->find($t['id']);
                return $trip ? [
                    'start_date' => $trip->preferred_start_date->format('Y-m-d'),
                    'end_date' => $trip->preferred_start_date->copy()->addDays(max(1, (int) $trip->duration_days) - 1)->format('Y-m-d'),
                ] + $this->driverTripExtras($trip) : [];
        }
    }

    // What the driver sees about a trip besides its schedule: photos, landmarks (with their pictures), the program
    // and the guide to coordinate with. Nothing about prices or the tourists' personal data.
    private function driverTripExtras($t): array
    {
        $photos = array_values(array_filter([$t->photo_1 ?? null, $t->photo_2 ?? null, $t->photo_3 ?? null, $t->photo_4 ?? null, $t->photo_5 ?? null]));
        return [
            'photos' => $photos,
            'places' => $t->places->map(fn ($p) => ['place_name' => $p->place_name ?? $p->city, 'city' => $p->city, 'place_image' => $p->place_image])->values(),
            'stations' => $t->stations->values(),
            'guide' => $t->guide ? ['full_name' => $t->guide->full_name, 'phone_number' => $t->guide->phone_number] : null,
        ];
    }

    // Next date (Y-m-d, from today) falling on one of the weekdays (Arabic names); every day when none are stored
    private function nextRunDay(array $weekdays): string
    {
        $norm = fn ($d) => str_replace(['إ', 'أ', 'آ'], 'ا', trim((string) $d));
        $wanted = array_map($norm, $weekdays);
        $names = ['الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعة', 'السبت'];
        $day = now('Africa/Tripoli')->startOfDay();
        for ($i = 0; $i < 7; $i++, $day->addDay()) {
            if (!$wanted || in_array($names[$day->dayOfWeek], $wanted, true)) {
                return $day->toDateString();
            }
        }
        return now('Africa/Tripoli')->toDateString();
    }

    /**
     * Data for Transport Company Dashboard
     */
    public function transportDashboard($contractNumber)
    {
        $company = TransportationCompany::with(['vehicles', 'drivers'])->findOrFail($contractNumber);

        return response()->json([
            'company' => $company,
            'vehicles' => $company->vehicles,
            'drivers' => $company->drivers,
            'trips' => $this->companyTrips($company),
        ]);
    }

    /**
     * The trips the admin assigned to the company's vehicles and that are still running or ahead:
     * daily trips accepted by their guide (next run date and its passengers), weekly trips not ended,
     * private trips quoted or confirmed. Each row names the vehicle, its driver and the guide.
     */
    private function companyTrips(TransportationCompany $company): array
    {
        $plates = $company->vehicles->pluck('plate_number')->all();
        if (!$plates) {
            return [];
        }
        $today = now('Africa/Tripoli')->toDateString();
        $drivers = $company->drivers->keyBy('assigned_vehicle_plate');
        $approved = fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', WeeklyTrip::GUIDE_APPROVED);
        $row = fn ($kind, $id, $title, $plate, $guide, $schedule, $nextDate, $passengers, $city, $status) => [
            'kind' => $kind, 'id' => $id, 'title' => $title, 'vehicle_plate' => $plate,
            'driver_name' => $drivers[$plate]->full_name ?? null, 'guide_name' => $guide,
            'schedule' => $schedule, 'next_date' => $nextDate, 'passengers' => $passengers,
            'departure_city' => $city, 'status' => $status,
        ];

        $trips = [];
        foreach (DailyTrip::with(['days', 'guide'])->whereIn('vehicle_plate', $plates)->where('is_active', true)->where($approved)->get() as $t) {
            $next = $t->openDates(1)[0] ?? null;
            $trips[] = $row('يومية', $t->daily_trip_id, $t->trip_title, $t->vehicle_plate, $t->guide?->full_name,
                'كل ' . ($t->days->pluck('day_of_week')->implode(' و') ?: 'يوم'), $next['date'] ?? null,
                $next ? $t->max_capacity - $next['seats_left'] : 0, $t->departure_city, 'مقبولة');
        }
        foreach (WeeklyTrip::with('guide')->whereIn('vehicle_plate', $plates)->where('is_active', true)
            ->where('end_date', '>=', $today)->where($approved)->orderBy('start_date')->get() as $t) {
            $trips[] = $row('أسبوعية', $t->weekly_trip_id, $t->trip_title, $t->vehicle_plate, $t->guide?->full_name,
                $t->start_date->format('Y-m-d') . ' إلى ' . $t->end_date->format('Y-m-d'), $t->start_date->format('Y-m-d'),
                $t->max_capacity - $t->available_seats, $t->departure_city, 'مقبولة');
        }
        foreach (PrivateTrip::with('guide')->whereIn('vehicle_plate', $plates)
            ->whereIn('status_order', [PrivateTripController::QUOTED, PrivateTripController::CONFIRMED])
            ->whereRaw('DATEADD(day, duration_days - 1, preferred_start_date) >= ?', [$today])->orderBy('preferred_start_date')->get() as $t) {
            $start = $t->preferred_start_date->format('Y-m-d');
            $trips[] = $row('خاصة', $t->private_trip_id, 'رحلة خاصة', $t->vehicle_plate, $t->guide?->full_name,
                "{$start} لمدة {$t->duration_days} أيام", $start, (int) $t->number_of_companions, null,
                $t->status_order === PrivateTripController::CONFIRMED ? 'مؤكدة' : 'بانتظار تأكيد السائح');
        }
        usort($trips, fn ($a, $b) => strcmp((string) $a['next_date'], (string) $b['next_date']));
        return $trips;
    }

    /**
     * Data for Admin Dashboard (Full overview of the 28 tables)
     */
    public function adminDashboard()
    {
        return response()->json([
            'stats' => [
                'total_companies' => TransportationCompany::count(),
                'total_drivers' => Driver::count(),
                'total_guides' => TourGuide::count(),
                'total_daily_trips' => DailyTrip::count(),
                'total_weekly_trips' => WeeklyTrip::count(),
                'total_bookings' => BookingDaily::count() + BookingWeekly::count(),
            ],
            'companies' => TransportationCompany::all(),
            'drivers' => Driver::with('assignedVehicle')->get(),
            'vehicles' => Vehicle::with('company')->get(),
            'guides' => TourGuide::all(),
            'daily_trips' => DailyTrip::with('guide')->get(),
            'weekly_trips' => WeeklyTrip::with('guide')->get(),
            'private_trips' => PrivateTrip::all(),
            'daily_bookings' => BookingDaily::with(['tourist', 'dailyTrip'])->get(),
            'weekly_bookings' => BookingWeekly::with(['tourist', 'weeklyTrip'])->get(),
            'daily_offers' => OfferDailyTrip::all(),
            'weekly_offers' => OfferWeeklyTrip::all(),
            'hotels' => Hotel::all(),
            'restaurants' => RestaurantCafe::all(),
            'places' => PlaceTourist::all(),
        ]);
    }

    // Private trip review moved to PrivateTripController::review; guide verification to GuideController::verify.
    // Nothing is deleted once saved (rule: no delete after add).
}
