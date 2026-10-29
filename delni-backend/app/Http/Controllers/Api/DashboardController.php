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
use App\Models\OfferFacility;
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
                'error' => 'لا توجد بيانات مرشد سياحي مسجلة في قاعدة البيانات لهذا الحساب',
            ], 404);
        }

        // Full trip details for the guide's read-only view (itinerary, places, lodging, food, vehicle, passengers)
        $lic = $guide->license_number;
        $dailyTrips = DailyTrip::with(['bookings.tourist', 'days', 'stations', 'places', 'restaurant', 'vehicle', 'offers'])
            ->where('guide_license_number', $lic)->get();
        $weeklyTrips = WeeklyTrip::with(['bookings.tourist', 'stations', 'places', 'hotels', 'restaurants', 'vehicle', 'offers'])
            ->where('guide_license_number', $lic)->get();
        // Private trips reach the guide once the admin sends the schedule (a tourist's preferred guide alone is not an assignment)
        $privateTrips = PrivateTrip::with(['tourist', 'stations', 'places', 'hotels', 'vehicle'])
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
                'years_of_experience' => 'nullable|integer|min:2',
                'bio' => 'nullable|string',
                'price_per_day' => 'nullable|numeric|min:0',
                'operating_regions' => 'nullable',
                'working_days' => 'nullable',
                'place_ids' => 'nullable|array',
                'speaks_english' => 'nullable|boolean',
                'speaks_french' => 'nullable|boolean',
                'speaks_italian' => 'nullable|boolean',
                'digital_certificate_file' => 'nullable|string',
                'gender' => 'nullable|string|max:10',
                'avatar' => 'nullable|string',
            ], [
                'phone_number.unique' => 'رقم الهاتف مسجل مسبقاً لمرشد آخر',
                'email.unique' => 'البريد الإلكتروني مسجل مسبقاً لمرشد آخر',
                'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
                'years_of_experience.min' => 'سنوات الخبرة السياحية للمرشد يجب أن تكون سنتين على الأقل',
                'price_per_day.min' => 'سعر اليوم لا يمكن أن يكون سالباً',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'error', 'message' => collect($e->errors())->flatten()->first()], 422);
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
            'operating_regions' => $validated['operating_regions'] ?? null,
            'place_ids' => $validated['place_ids'] ?? null,
        ];
        unset($validated['working_days'], $validated['operating_regions'], $validated['place_ids']);

        DB::transaction(function () use ($guide, $validated, $children) {
            $guide->update(array_filter($validated, fn($v) => !is_null($v) && $v !== ''));
            if (!is_null($children['working_days'])) {
                $guide->replaceWorkingDays($children['working_days']);
            }
            if (!is_null($children['operating_regions'])) {
                $guide->replaceOperatingRegions($children['operating_regions']);
            }
            if (!is_null($children['place_ids'])) {
                $guide->replacePlaces($children['place_ids']);
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'تم حفظ وتحديث ملف المرشد في قاعدة البيانات بنجاح',
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

        // Only trips the admin actually assigned to the driver's vehicle (no contract details for the driver)
        $trips = [];
        $plate = $driver->assigned_vehicle_plate;
        if ($plate) {
            $today = now('Africa/Tripoli')->toDateString();
            foreach (DailyTrip::with('days')->where('vehicle_plate', $plate)->where('is_active', true)->get() as $t) {
                $trips[] = ['kind' => 'يومية', 'id' => $t->daily_trip_id, 'title' => $t->trip_title,
                    'schedule' => $t->days->pluck('day_of_week')->implode('، ') ?: 'حسب الجدول',
                    'departure_city' => $t->departure_city, 'passengers' => $t->max_capacity - $t->available_seats];
            }
            foreach (WeeklyTrip::where('vehicle_plate', $plate)->where('is_active', true)->where('end_date', '>=', $today)
                ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', WeeklyTrip::GUIDE_APPROVED))->orderBy('start_date')->get() as $t) {
                $trips[] = ['kind' => 'أسبوعية', 'id' => $t->weekly_trip_id, 'title' => $t->trip_title,
                    'schedule' => $t->start_date->format('Y-m-d') . ' إلى ' . $t->end_date->format('Y-m-d'),
                    'departure_city' => $t->departure_city, 'passengers' => $t->max_capacity - $t->available_seats];
            }
            foreach (PrivateTrip::where('vehicle_plate', $plate)->where('status_order', 'مؤكدة')
                ->where('preferred_start_date', '>=', $today)->orderBy('preferred_start_date')->get() as $t) {
                $trips[] = ['kind' => 'خاصة', 'id' => $t->private_trip_id, 'title' => 'رحلة خاصة',
                    'schedule' => $t->preferred_start_date->format('Y-m-d') . " لمدة {$t->duration_days} أيام",
                    'departure_city' => null, 'passengers' => (int) $t->number_of_companions];
            }
        }

        return response()->json([
            'success' => true,
            'driver' => collect($driver->toArray())->except(['contract_number', 'assigned_vehicle'])->all()
                + ['company_name' => $driver->company()->value('company_name')],
            'vehicle' => $driver->assignedVehicle ? collect($driver->assignedVehicle->toArray())->except('contract_number')->all() : null,
            'trips' => $trips,
        ]);
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
        ]);
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
            'facility_offers' => OfferFacility::all(),
            'hotels' => Hotel::all(),
            'restaurants' => RestaurantCafe::all(),
            'places' => PlaceTourist::all(),
        ]);
    }

    // Private trip review moved to PrivateTripController::review; guide verification to GuideController::verify.
    // Nothing is deleted once saved (rule: no delete after add).
}
