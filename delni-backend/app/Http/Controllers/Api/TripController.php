<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyTrip;
use App\Models\WeeklyTrip;
use App\Models\PrivateTrip;
use App\Models\PlaceTourist;
use App\Models\Hotel;
use App\Models\RestaurantCafe;
use App\Models\TourGuide;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function dailyTrips()
    {
        $trips = DailyTrip::with(['guide', 'offers', 'vehicles'])->get();
        return response()->json($trips);
    }

    public function weeklyTrips()
    {
        $trips = WeeklyTrip::with(['guide', 'hotels', 'places', 'offers', 'vehicles'])->get();
        return response()->json($trips);
    }

    public function places()
    {
        return response()->json(PlaceTourist::all());
    }

    public function hotels()
    {
        return response()->json(Hotel::with('offers')->get());
    }

    public function restaurants()
    {
        return response()->json(RestaurantCafe::with('offers')->get());
    }

    public function guides()
    {
        return response()->json(TourGuide::all());
    }

    public function requestPrivateTrip(Request $request)
    {
        $validated = $request->validate([
            'customer_description' => 'required|string|max:100',
            'preferred_start_date' => 'required|date',
            'duration_days' => 'required|integer|min:1',
            'number_of_companions' => 'required|integer|min:0',
            'customer_name' => 'nullable|string|max:100',
            'customer_phone' => 'nullable|string|max:20',
            'customer_requirements' => 'nullable|string',
            'guide_license_number' => 'nullable|string|exists:tour_guides,license_number',
            'tourist_id' => 'nullable|string|exists:tourists,tourist_id',
        ]);

        $newId = 'PT-' . rand(1000, 9999);

        $privateTrip = PrivateTrip::create([
            'private_trip_id' => $newId,
            'status_order' => 'قيد الدراسة',
            'customer_description' => $validated['customer_description'],
            'preferred_start_date' => $validated['preferred_start_date'],
            'duration_days' => $validated['duration_days'],
            'number_of_companions' => $validated['number_of_companions'],
            'quoted_price' => null,
            'admin_itinerary_plan' => null,
            'guide_license_number' => $validated['guide_license_number'] ?? null,
            'tourist_id' => $validated['tourist_id'] ?? null,
            'customer_name' => $validated['customer_name'] ?? null,
            'customer_phone' => $validated['customer_phone'] ?? null,
            'customer_requirements' => $validated['customer_requirements'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'تم إرسال طلب الرحلة الخاصة بنجاح للإدارة لدراستها واعتماد السعر',
            'trip' => $privateTrip,
        ], 201);
    }
}
