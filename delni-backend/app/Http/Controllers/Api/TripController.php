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

    public function storeHotel(Request $request)
    {
        try {
            // Sanitize empty strings to null for nullable date field
            if ($request->has('contract_date') && empty($request->input('contract_date'))) {
                $request->merge(['contract_date' => null]);
            }

            $validated = $request->validate([
                'hotel_id' => 'required|string|max:50',
                'hotel_name' => 'required|string|max:150',
                'city' => 'nullable|string|max:100',
                'address_details' => 'nullable|string|max:255',
                'phone_number' => 'nullable|string|max:20',
                'star_rating' => 'nullable|integer',
                'partnership_status' => 'nullable|string|max:50',
                'contract_date' => 'nullable|date',
                'verification_status' => 'nullable|string|max:50',
                'property_type' => 'nullable|string|max:100',
                'amenities' => 'nullable|string',
                'hotel_photo_1' => 'nullable|string',
                'hotel_photo_2' => 'nullable|string',
                'hotel_photo_3' => 'nullable|string',
                'hotel_photo_4' => 'nullable|string',
                'hotel_photo_5' => 'nullable|string',
            ]);

            $hotel = \App\Models\Hotel::updateOrCreate(
                ['hotel_id' => $validated['hotel_id']],
                [
                    'hotel_name' => $validated['hotel_name'],
                    'city' => $validated['city'] ?? 'طرابلس',
                    'address_details' => $validated['address_details'] ?? 'العنوان الرئيسي',
                    'phone_number' => $validated['phone_number'] ?? '0910000000',
                    'star_rating' => $validated['star_rating'] ?? 4,
                    'partnership_status' => $validated['partnership_status'] ?? 'نشط',
                    'contract_date' => !empty($validated['contract_date']) ? $validated['contract_date'] : null,
                    'verification_status' => $validated['verification_status'] ?? 'معتمد',
                    'property_type' => $validated['property_type'] ?? 'فندق',
                    'amenities' => $validated['amenities'] ?? null,
                    'hotel_photo_1' => $validated['hotel_photo_1'] ?? '/assets/ai_city.jpg',
                    'hotel_photo_2' => $validated['hotel_photo_2'] ?? null,
                    'hotel_photo_3' => $validated['hotel_photo_3'] ?? null,
                    'hotel_photo_4' => $validated['hotel_photo_4'] ?? null,
                    'hotel_photo_5' => $validated['hotel_photo_5'] ?? null,
                ]
            );

            return response()->json(['status' => 'success', 'hotel' => $hotel], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            $msg = implode('، ', array_map(fn($e) => implode(' ', $e), $ve->errors()));
            return response()->json(['status' => 'error', 'message' => "خطأ في بيانات الفندق: {$msg}"], 422);
        } catch (\Throwable $e) {
            \Log::error('خطأ حفظ الفندق: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'تعذر حفظ الفندق في قاعدة البيانات: ' . $e->getMessage()], 500);
        }
    }

    public function deleteHotel($id)
    {
        $hotel = \App\Models\Hotel::where('hotel_id', $id)->first();
        if ($hotel) {
            $hotel->delete();
            return response()->json(['status' => 'success', 'message' => 'تم حذف الفندق بنجاح']);
        }
        return response()->json(['status' => 'error', 'message' => 'الفندق غير موجود'], 404);
    }

    public function storeRestaurant(Request $request)
    {
        try {
            // Sanitize empty strings to null for nullable date field
            if ($request->has('contract_date') && empty($request->input('contract_date'))) {
                $request->merge(['contract_date' => null]);
            }

            $validated = $request->validate([
                'facility_id' => 'required|string|max:50',
                'facility_name' => 'required|string|max:150',
                'facility_type' => 'nullable|string|max:50',
                'city' => 'nullable|string|max:100',
                'address_details' => 'nullable|string|max:255',
                'phone_number' => 'nullable|string|max:20',
                'description' => 'nullable|string',
                'facility_image_1' => 'nullable|string',
                'facility_image_2' => 'nullable|string',
                'facility_image_3' => 'nullable|string',
                'facility_image_4' => 'nullable|string',
                'facility_image_5' => 'nullable|string',
                'contract_date' => 'nullable|date',
                'verification_status' => 'nullable|string|max:50',
                'working_hours' => 'nullable|string|max:100',
                'features' => 'nullable|string',
            ]);

            $facility = \App\Models\RestaurantCafe::updateOrCreate(
                ['facility_id' => $validated['facility_id']],
                [
                    'facility_name' => $validated['facility_name'],
                    'facility_type' => $validated['facility_type'] ?? 'مطعم وكافيه',
                    'city' => $validated['city'] ?? 'طرابلس',
                    'address_details' => $validated['address_details'] ?? 'العنوان الرئيسي',
                    'phone_number' => $validated['phone_number'] ?? '0910000000',
                    'description' => $validated['description'] ?? null,
                    'facility_image_1' => $validated['facility_image_1'] ?? '/assets/ai_food.jpg',
                    'facility_image_2' => $validated['facility_image_2'] ?? null,
                    'facility_image_3' => $validated['facility_image_3'] ?? null,
                    'facility_image_4' => $validated['facility_image_4'] ?? null,
                    'facility_image_5' => $validated['facility_image_5'] ?? null,
                    'contract_date' => !empty($validated['contract_date']) ? $validated['contract_date'] : null,
                    'verification_status' => $validated['verification_status'] ?? 'معتمد',
                    'working_hours' => $validated['working_hours'] ?? '09:00 ص - 12:00 م',
                    'features' => $validated['features'] ?? null,
                ]
            );

            return response()->json(['status' => 'success', 'facility' => $facility], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            $msg = implode('، ', array_map(fn($e) => implode(' ', $e), $ve->errors()));
            return response()->json(['status' => 'error', 'message' => "خطأ في بيانات المرفق: {$msg}"], 422);
        } catch (\Throwable $e) {
            \Log::error('خطأ حفظ المطعم/المقهى: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'تعذر حفظ المطعم/المقهى في قاعدة البيانات: ' . $e->getMessage()], 500);
        }
    }

    public function deleteRestaurant($id)
    {
        $facility = \App\Models\RestaurantCafe::where('facility_id', $id)->first();
        if ($facility) {
            $facility->delete();
            return response()->json(['status' => 'success', 'message' => 'تم حذف المرفق بنجاح']);
        }
        return response()->json(['status' => 'error', 'message' => 'المرفق غير موجود'], 404);
    }

    public function tripReviews(Request $request, $tripId)
    {
        $type = $request->query('type', 'daily');
        if ($type === 'weekly') {
            $reviews = \App\Models\ReviewWeeklyTrip::with('tourist')
                ->where('weekly_trip_id', $tripId)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $reviews = \App\Models\ReviewDailyTrip::with('tourist')
                ->where('daily_trip_id', $tripId)
                ->orderBy('created_at', 'desc')
                ->get();
        }
        return response()->json(['status' => 'success', 'data' => $reviews]);
    }

    public function storeReview(Request $request)
    {
        $validated = $request->validate([
            'tourist_id' => 'required|string',
            'trip_id' => 'required|string',
            'type' => 'required|string|in:daily,weekly',
            'stars_rating' => 'required|integer|min:1|max:5',
            'comment_text' => 'nullable|string',
        ]);

        $touristId = $validated['tourist_id'];
        $tripId = $validated['trip_id'];
        $type = $validated['type'];

        // 1. Verify Participation
        if ($type === 'weekly') {
            $booking = \App\Models\BookingWeekly::where('tourist_id', $touristId)
                ->where('weekly_trip_id', $tripId)
                ->first();
        } else {
            $booking = \App\Models\BookingDaily::where('tourist_id', $touristId)
                ->where('daily_trip_id', $tripId)
                ->first();
        }

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'عذراً، لا يمكنك تقييم هذه الرحلة لأنك لم تسجل أو تشارك فيها بالفعل.'
            ], 403);
        }

        // 2. Verify Trip Ended
        $tripDate = $booking->trip_date ?? $booking->booking_date;
        if ($tripDate && strtotime($tripDate) > time()) {
            return response()->json([
                'status' => 'error',
                'message' => 'عذراً، لا يمكن تقييم الرحلة إلا بعد موعد انتهائها الفعلي.'
            ], 400);
        }

        // 3. Upsert Review
        if ($type === 'weekly') {
            $revId = 'REV-W-' . substr(uniqid(), -6);
            $review = \App\Models\ReviewWeeklyTrip::updateOrCreate(
                ['tourist_id' => $touristId, 'weekly_trip_id' => $tripId],
                [
                    'review_weekly_id' => $revId,
                    'stars_rating' => $validated['stars_rating'],
                    'comment_text' => $validated['comment_text'] ?? null,
                    'created_at' => now(),
                ]
            );
        } else {
            $revId = 'REV-D-' . substr(uniqid(), -6);
            $review = \App\Models\ReviewDailyTrip::updateOrCreate(
                ['tourist_id' => $touristId, 'daily_trip_id' => $tripId],
                [
                    'review_daily_id' => $revId,
                    'stars_rating' => $validated['stars_rating'],
                    'comment_text' => $validated['comment_text'] ?? null,
                    'created_at' => now(),
                ]
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'تم تسجيل تقييمك للرحلة بنجاح! شكراً لمشاركتك.',
            'review' => $review
        ], 201);
    }

    public function touristFavorites(Request $request, $touristId)
    {
        $favorites = \App\Models\TouristFavorite::where('tourist_id', $touristId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['status' => 'success', 'data' => $favorites]);
    }

    public function toggleFavorite(Request $request)
    {
        $validated = $request->validate([
            'tourist_id' => 'required|string',
            'item_type' => 'required|string',
            'item_id' => 'required|string',
        ]);

        $existing = \App\Models\TouristFavorite::where('tourist_id', $validated['tourist_id'])
            ->where('item_type', $validated['item_type'])
            ->where('item_id', $validated['item_id'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'status' => 'success',
                'is_favorite' => false,
                'message' => 'تمت إزالة العنصر من المفضلة'
            ]);
        } else {
            $fav = \App\Models\TouristFavorite::create([
                'favorite_id' => 'FAV-' . substr(uniqid(), -8),
                'tourist_id' => $validated['tourist_id'],
                'item_type' => $validated['item_type'],
                'item_id' => $validated['item_id'],
                'created_at' => now(),
            ]);
            return response()->json([
                'status' => 'success',
                'is_favorite' => true,
                'message' => 'تمت إضافة العنصر إلى المفضلة ❤️',
                'data' => $fav
            ], 201);
        }
    }
}

