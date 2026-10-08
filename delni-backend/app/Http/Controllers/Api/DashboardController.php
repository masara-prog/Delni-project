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
     * Data for Tour Guide Dashboard
     */
    public function guideDashboard($licenseNumber)
    {
        $guide = TourGuide::findOrFail($licenseNumber);
        $dailyTrips = DailyTrip::with('bookings')->where('guide_license_number', $licenseNumber)->get();
        $weeklyTrips = WeeklyTrip::with('bookings')->where('guide_license_number', $licenseNumber)->get();
        $privateTrips = PrivateTrip::where('guide_license_number', $licenseNumber)->get();

        return response()->json([
            'guide' => $guide,
            'daily_trips' => $dailyTrips,
            'weekly_trips' => $weeklyTrips,
            'private_trips' => $privateTrips,
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
