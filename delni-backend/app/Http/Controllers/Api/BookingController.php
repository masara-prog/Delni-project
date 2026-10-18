<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyTrip;
use App\Models\WeeklyTrip;
use App\Models\BookingDaily;
use App\Models\BookingWeekly;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Book a Daily Trip
     */
    /**
     * Book a Daily Trip
     */
    public function bookDaily(Request $request)
    {
        $validated = $request->validate([
            'tourist_id' => 'required|string',
            'daily_trip_id' => 'required|string',
            'number_of_seats' => 'required|integer|min:1',
            'trip_title' => 'nullable|string',
            'passengers_names' => 'nullable|string',
            'booking_notes' => 'nullable|string',
            'price_per_seat' => 'nullable|numeric|min:0',
        ]);

        // Ensure tourist exists or create on the fly
        $tourist = \App\Models\Tourist::find($validated['tourist_id']);
        if (!$tourist) {
            $tourist = \App\Models\Tourist::firstOrCreate(
                ['tourist_id' => $validated['tourist_id']],
                [
                    'full_name' => $validated['passengers_names'] ?? 'سائح منصة دلني',
                    'email' => $validated['tourist_id'] . '@dalni.ly',
                    'phone_number' => '091' . rand(1000000, 9999999),
                    'password' => bcrypt('123456'),
                ]
            );
        }

        // 1. Resolve daily trip by exact ID
        $trip = DailyTrip::where('daily_trip_id', $validated['daily_trip_id'])->first();

        // 2. If not found, resolve by trip_title if provided
        if (!$trip && !empty($validated['trip_title'])) {
            $trip = DailyTrip::where('trip_title', $validated['trip_title'])->first();
        }

        // 3. If not found, fuzzy search by title
        if (!$trip && !empty($validated['trip_title'])) {
            $trip = DailyTrip::where('trip_title', 'like', '%' . $validated['trip_title'] . '%')->first();
        }

        // 4. If ID itself was a name/slug, search by title
        if (!$trip) {
            $trip = DailyTrip::where('trip_title', 'like', '%' . $validated['daily_trip_id'] . '%')->first();
        }

        // 5. If trip not in DB, only fallback if active trip exists
        if (!$trip) {
            $trip = DailyTrip::where('is_active', true)->first() ?? DailyTrip::first();
        }

        if (!$trip) {
            return response()->json([
                'status' => 'error',
                'message' => 'عذراً، لم يتم العثور على الرحلة المطلوبة في قاعدة البيانات.',
            ], 404);
        }

        return DB::transaction(function () use ($validated, $trip, $request) {
            $lockedTrip = DailyTrip::lockForUpdate()->find($trip->daily_trip_id);

            if ($lockedTrip->available_seats < $validated['number_of_seats']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'عذراً، عدد المقاعد المطلوبة غير متاح. المقاعد المتبقية: ' . $lockedTrip->available_seats,
                ], 422);
            }

            // Calculate price based on the selected trip's actual price
            $unitPrice = (float) $lockedTrip->price_per_seat;
            if ($unitPrice <= 0 && $request->filled('price_per_seat')) {
                $unitPrice = (float) $request->price_per_seat;
            }
            $totalPrice = $unitPrice * $validated['number_of_seats'];
            $bookingId = 'BKD-' . rand(10000, 99999);

            // Strictly 7 columns
            $booking = BookingDaily::create([
                'booking_daily_id' => $bookingId,
                'tourist_id' => $validated['tourist_id'],
                'daily_trip_id' => $lockedTrip->daily_trip_id,
                'booking_date' => now(),
                'number_of_seats' => $validated['number_of_seats'],
                'booking_status' => 'مؤكدة',
                'total_price' => $totalPrice,
            ]);

            // Deduct available seats
            $lockedTrip->decrement('available_seats', $validated['number_of_seats']);

            return response()->json([
                'status' => 'success',
                'message' => 'تم الحجز بنجاح، يُرجى التوجه لمقر الشركة لسداد التكلفة نقداً قبل موعد الرحلة',
                'booking' => $booking,
            ], 201);
        });
    }

    /**
     * Book a Weekly Trip
     */
    public function bookWeekly(Request $request)
    {
        $validated = $request->validate([
            'tourist_id' => 'required|string',
            'weekly_trip_id' => 'required|string',
            'number_of_seats' => 'required|integer|min:1',
            'trip_title' => 'nullable|string',
            'passengers_names' => 'nullable|string',
            'booking_notes' => 'nullable|string',
            'seat_per_price' => 'nullable|numeric|min:0',
        ]);

        // Ensure tourist exists or create on the fly
        $tourist = \App\Models\Tourist::find($validated['tourist_id']);
        if (!$tourist) {
            $tourist = \App\Models\Tourist::firstOrCreate(
                ['tourist_id' => $validated['tourist_id']],
                [
                    'full_name' => $validated['passengers_names'] ?? 'سائح منصة دلني',
                    'email' => $validated['tourist_id'] . '@dalni.ly',
                    'phone_number' => '091' . rand(1000000, 9999999),
                    'password' => bcrypt('123456'),
                ]
            );
        }

        // 1. Resolve weekly trip by exact ID
        $trip = WeeklyTrip::where('weekly_trip_id', $validated['weekly_trip_id'])->first();

        // 2. If not found, resolve by trip_title if provided
        if (!$trip && !empty($validated['trip_title'])) {
            $trip = WeeklyTrip::where('trip_title', $validated['trip_title'])->first();
        }

        // 3. If not found, fuzzy search by title
        if (!$trip && !empty($validated['trip_title'])) {
            $trip = WeeklyTrip::where('trip_title', 'like', '%' . $validated['trip_title'] . '%')->first();
        }

        // 4. If ID itself was a name/slug, search by title
        if (!$trip) {
            $trip = WeeklyTrip::where('trip_title', 'like', '%' . $validated['weekly_trip_id'] . '%')->first();
        }

        // 5. If trip not in DB, only fallback if active trip exists
        if (!$trip) {
            $trip = WeeklyTrip::where('is_active', true)->first() ?? WeeklyTrip::first();
        }

        if (!$trip) {
            return response()->json([
                 'status' => 'error',
                 'message' => 'عذراً، لم يتم العثور على الرحلة الأسبوعية المطلوبة في قاعدة البيانات.',
            ], 404);
        }

        return DB::transaction(function () use ($validated, $trip, $request) {
            $lockedTrip = WeeklyTrip::lockForUpdate()->find($trip->weekly_trip_id);

            if ($lockedTrip->available_seats < $validated['number_of_seats']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'عذراً، عدد المقاعد المطلوبة غير متاح. المقاعد المتبقية: ' . $lockedTrip->available_seats,
                ], 422);
            }

            // Calculate price based on the selected trip's actual price
            $unitPrice = (float) $lockedTrip->seat_per_price;
            if ($unitPrice <= 0 && $request->filled('seat_per_price')) {
                $unitPrice = (float) $request->seat_per_price;
            }
            $totalPrice = $unitPrice * $validated['number_of_seats'];
            $bookingId = 'BKW-' . rand(10000, 99999);

            // Strictly 7 columns
            $booking = BookingWeekly::create([
                'booking_weekly_id' => $bookingId,
                'tourist_id' => $validated['tourist_id'],
                'weekly_trip_id' => $lockedTrip->weekly_trip_id,
                'booking_date' => now(),
                'number_of_seats' => $validated['number_of_seats'],
                'total_price' => $totalPrice,
                'booking_status' => 'مؤكدة',
            ]);

            $lockedTrip->decrement('available_seats', $validated['number_of_seats']);

            return response()->json([
                'status' => 'success',
                'message' => 'تم تسجيل الحجز بنجاح',
                'booking' => $booking,
            ], 201);
        });
    }

    /**
     * Get all bookings for a tourist
     */
    public function touristBookings($touristId)
    {
        $daily = BookingDaily::with(['dailyTrip.guide'])->where('tourist_id', $touristId)->get();
        $weekly = BookingWeekly::with(['weeklyTrip.guide'])->where('tourist_id', $touristId)->get();
        $privateTrips = \App\Models\PrivateTrip::where('tourist_id', $touristId)->get();

        return response()->json([
            'daily' => $daily,
            'weekly' => $weekly,
            'privateTrips' => $privateTrips,
        ]);
    }

    /**
     * Toggle Payment Status (Admin / Office cashier)
     */
    public function togglePayment(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:daily,weekly',
            'booking_id' => 'required|string',
            'payment_status' => 'required|in:paid,unpaid,cash_at_office',
        ]);

        if ($validated['type'] === 'daily') {
            $booking = BookingDaily::findOrFail($validated['booking_id']);
        } else {
            $booking = BookingWeekly::findOrFail($validated['booking_id']);
        }

        $booking->update(['payment_status' => $validated['payment_status']]);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث حالة السداد بنجاح',
            'booking' => $booking,
        ]);
    }

    /**
     * Toggle Attendance Status (Tour Guide / Driver manifest)
     */
    public function toggleAttendance(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:daily,weekly',
            'booking_id' => 'required|string',
            'attended' => 'required|boolean',
        ]);

        if ($validated['type'] === 'daily') {
            $booking = BookingDaily::findOrFail($validated['booking_id']);
        } else {
            $booking = BookingWeekly::findOrFail($validated['booking_id']);
        }

        $booking->update(['attended' => $validated['attended']]);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث كشف الحضور بنجاح',
            'booking' => $booking,
        ]);
    }
}
