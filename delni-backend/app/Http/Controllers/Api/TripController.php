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

    public function storeDailyTrip(Request $request)
    {
        $validated = $request->validate([
            'trip_title' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price_per_seat' => 'required|numeric|min:0',
            'departure_city' => 'nullable|string|max:50',
            'destination_city' => 'nullable|string|max:50',
            'max_capacity' => 'nullable|integer',
            'recurring_days' => 'nullable|string',
            'guide_license_number' => 'nullable|string|exists:tour_guides,license_number',
            'photo' => 'nullable|string',
        ]);

        $newId = 'DT-' . rand(100, 999);
        $trip = DailyTrip::create([
            'daily_trip_id' => $newId,
            'trip_title' => $validated['trip_title'],
            'description' => $validated['description'] ?? null,
            'price_per_seat' => $validated['price_per_seat'],
            'departure_city' => $validated['departure_city'] ?? 'طرابلس',
            'destination_city' => $validated['destination_city'] ?? 'المعلم الأثري',
            'max_capacity' => $validated['max_capacity'] ?? 25,
            'available_seats' => $validated['max_capacity'] ?? 25,
            'recurring_days' => $validated['recurring_days'] ?? 'السبت,الثلاثاء',
            'guide_license_number' => $validated['guide_license_number'] ?? null,
            'photo' => $validated['photo'] ?? '/assets/dest-leptis.jpg',
            'is_active' => true,
        ]);

        return response()->json(['status' => 'success', 'trip' => $trip], 201);
    }

    public function deleteDailyTrip($id)
    {
        $trip = DailyTrip::where('daily_trip_id', $id)->first();
        if ($trip) {
            $trip->bookings()->delete();
            $trip->delete();
            return response()->json(['status' => 'success', 'message' => 'تم حذف الرحلة اليومية']);
        }
        return response()->json(['status' => 'error', 'message' => 'الرحلة غير موجودة'], 404);
    }

    public function storeWeeklyTrip(Request $request)
    {
        $validated = $request->validate([
            'trip_title' => 'required|string|max:100',
            'trip_description' => 'nullable|string',
            'seat_per_price' => 'required|numeric|min:0',
            'departure_city' => 'nullable|string|max:50',
            'destination_region' => 'nullable|string|max:50',
            'max_capacity' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'guide_license_number' => 'nullable|string|exists:tour_guides,license_number',
            'photo' => 'nullable|string',
        ]);

        $newId = 'WT-' . rand(100, 999);
        $trip = WeeklyTrip::create([
            'weekly_trip_id' => $newId,
            'trip_title' => $validated['trip_title'],
            'trip_description' => $validated['trip_description'] ?? null,
            'seat_per_price' => $validated['seat_per_price'],
            'departure_city' => $validated['departure_city'] ?? 'طرابلس',
            'destination_region' => $validated['destination_region'] ?? 'الصحراء',
            'max_capacity' => $validated['max_capacity'] ?? 25,
            'available_seats' => $validated['max_capacity'] ?? 25,
            'start_date' => $validated['start_date'] ?? now()->addDays(7),
            'end_date' => $validated['end_date'] ?? now()->addDays(13),
            'guide_license_number' => $validated['guide_license_number'] ?? null,
            'photo' => $validated['photo'] ?? '/assets/dest-ubari.jpg',
            'is_active' => true,
        ]);

        return response()->json(['status' => 'success', 'trip' => $trip], 201);
    }

    public function deleteWeeklyTrip($id)
    {
        $trip = WeeklyTrip::where('weekly_trip_id', $id)->first();
        if ($trip) {
            $trip->bookings()->delete();
            $trip->delete();
            return response()->json(['status' => 'success', 'message' => 'تم حذف الرحلة الأسبوعية']);
        }
        return response()->json(['status' => 'error', 'message' => 'الرحلة غير موجودة'], 404);
    }
}
