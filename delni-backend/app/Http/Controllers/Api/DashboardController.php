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
use Illuminate\Http\Request;

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

        $lic = $guide->license_number;
        $dailyTrips = DailyTrip::with(['bookings.tourist'])->where('guide_license_number', $lic)->get();
        $weeklyTrips = WeeklyTrip::with(['bookings.tourist'])->where('guide_license_number', $lic)->get();
        $privateTrips = PrivateTrip::where('guide_license_number', $lic)->get();

        return response()->json([
            'guide' => $guide,
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
        $guide = TourGuide::where('license_number', $licenseNumber)
            ->orWhere('email', $licenseNumber)
            ->firstOrFail();

        $validated = $request->validate([
            'full_name' => 'nullable|string|max:150',
            'phone_number' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
            'price_per_day' => 'nullable|numeric|min:0',
            'operating_regions' => 'nullable|string',
            'working_days' => 'nullable|string',
            'speaks_english' => 'nullable|boolean',
            'speaks_french' => 'nullable|boolean',
            'speaks_italian' => 'nullable|boolean',
            'digital_certificate_file' => 'nullable|string',
            'certificate' => 'nullable|string',
            'certificate_name' => 'nullable|string',
            'title' => 'nullable|string',
            'gender' => 'nullable|string',
        ]);

        // Security: If guide is already verified by admin, lock personal identity fields
        if ($guide->verification_status === 'موثق') {
            unset($validated['full_name'], $validated['gender'], $validated['email']);
        }

        $guide->update(array_filter($validated, fn($v) => !is_null($v)));

        return response()->json([
            'status' => 'success',
            'message' => 'تم حفظ وتحديث ملف المرشد في قاعدة البيانات بنجاح',
            'guide' => $guide,
        ]);
    }

    /**
     * Tour Guide: Accept or Reject an Assigned Trip
     */
    public function guideRespondTrip(Request $request, $licenseNumber)
    {
        $validated = $request->validate([
            'trip_id' => 'required|string',
            'status' => 'required|in:مقبولة,مرفوضة',
            'rejection_reason' => 'nullable|string',
        ]);

        if (str_starts_with($validated['trip_id'], 'PT-')) {
            $trip = PrivateTrip::where('private_trip_id', $validated['trip_id'])->first();
            if ($trip) {
                $trip->status_order = $validated['status'] === 'مقبولة' ? 'مؤكدة' : 'مرفوضة';
                if (!empty($validated['rejection_reason'])) {
                    $trip->customer_requirements = ($trip->customer_requirements ? $trip->customer_requirements . ' | ' : '') . 'سبب اعتذار المرشد: ' . $validated['rejection_reason'];
                }
                $trip->save();
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'تم حفظ حالة الرحلة في قاعدة البيانات بنجاح',
        ]);
    }

    /**
     * Data for Driver Dashboard
     */
    public function driverDashboard($driverLicenseNumber)
    {
        $driver = Driver::with(['company', 'assignedVehicle'])->findOrFail($driverLicenseNumber);

        return response()->json([
            'driver' => $driver,
            'vehicle' => $driver->assignedVehicle,
            'company' => $driver->company,
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

    /**
     * Admin: Evaluate and Quote a Private VIP Trip
     */
    public function adminUpdatePrivateTrip(Request $request, $privateTripId)
    {
        $trip = PrivateTrip::findOrFail($privateTripId);

        $validated = $request->validate([
            'status_order' => 'required|string',
            'quoted_price' => 'nullable|numeric|min:0',
            'admin_itinerary_plan' => 'nullable|string',
            'assigned_guide_license' => 'nullable|string|exists:tour_guides,license_number',
            'assigned_vehicle_plate' => 'nullable|string|exists:vehicles,plate_number',
        ]);

        $trip->update([
            'status_order' => $validated['status_order'],
            'quoted_price' => $validated['quoted_price'] ?? $trip->quoted_price,
            'admin_itinerary_plan' => $validated['admin_itinerary_plan'] ?? $trip->admin_itinerary_plan,
            'guide_license_number' => $validated['assigned_guide_license'] ?? $trip->guide_license_number,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث واعتماد طلب الرحلة الخاصة بنجاح',
            'trip' => $trip,
        ]);
    }

    /**
     * Admin: Verify or Reject a Tour Guide
     */
    public function adminVerifyGuide(Request $request, $licenseNumber)
    {
        $guide = TourGuide::where('license_number', $licenseNumber)->firstOrFail();
        $validated = $request->validate([
            'verification_status' => 'required|string',
        ]);

        $guide->update([
            'verification_status' => $validated['verification_status'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث حالة توثيق المرشد السياحي بنجاح',
            'guide' => $guide,
        ]);
    }
}
