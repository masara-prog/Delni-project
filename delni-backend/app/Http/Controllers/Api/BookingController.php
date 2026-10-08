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
    public function bookDaily(Request $request)
    {
        $validated = $request->validate([
            'tourist_id' => 'required|string|exists:tourists,tourist_id',
            'daily_trip_id' => 'required|string|exists:daily_trips,daily_trip_id',
            'number_of_seats' => 'required|integer|min:1',
            'passengers_names' => 'nullable|string',
            'booking_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $trip = DailyTrip::lockForUpdate()->find($validated['daily_trip_id']);

            if ($trip->available_seats < $validated['number_of_seats']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'عذراً، عدد المقاعد المطلوبة غير متاح. المقاعد المتبقية: ' . $trip->available_seats,
                ], 422);
            }

            $totalPrice = $trip->price_per_seat * $validated['number_of_seats'];
            $bookingId = 'BKD-' . rand(10000, 99999);

            $booking = BookingDaily::create([
                'booking_daily_id' => $bookingId,
                'tourist_id' => $validated['tourist_id'],
                'daily_trip_id' => $validated['daily_trip_id'],
                'booking_date' => now(),
                'number_of_seats' => $validated['number_of_seats'],
                'booking_status' => 'مؤكدة مبدئياً (بانتظار السداد بمقر الشركة)',
                'total_price' => $totalPrice,
                'booking_notes' => $validated['booking_notes'] ?? null,
                'passengers_names' => $validated['passengers_names'] ?? null,
                'payment_status' => 'unpaid',
                'attended' => false,
            ]);

            // Deduct available seats
            $trip->decrement('available_seats', $validated['number_of_seats']);

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
            'tourist_id' => 'required|string|exists:tourists,tourist_id',
            'weekly_trip_id' => 'required|string|exists:weekly_trips,weekly_trip_id',
            'number_of_seats' => 'required|integer|min:1',
            'passengers_names' => 'nullable|string',
            'booking_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $trip = WeeklyTrip::lockForUpdate()->find($validated['weekly_trip_id']);

            if ($trip->available_seats < $validated['number_of_seats']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'عذراً، عدد المقاعد المطلوبة غير متاح. المقاعد المتبقية: ' . $trip->available_seats,
                ], 422);
            }

            $totalPrice = $trip->seat_per_price * $validated['number_of_seats'];
            $bookingId = 'BKW-' . rand(10000, 99999);

            $booking = BookingWeekly::create([
                'booking_weekly_id' => $bookingId,
                'tourist_id' => $validated['tourist_id'],
                'weekly_trip_id' => $validated['weekly_trip_id'],
                'booking_date' => now(),
                'number_of_seats' => $validated['number_of_seats'],
                'booking_status' => 'مؤكدة مبدئياً (بانتظار السداد بمقر الشركة)',
                'total_price' => $totalPrice,
                'booking_notes' => $validated['booking_notes'] ?? null,
                'passengers_names' => $validated['passengers_names'] ?? null,
                'payment_status' => 'unpaid',
                'attended' => false,
            ]);

            $trip->decrement('available_seats', $validated['number_of_seats']);

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
        $daily = BookingDaily::with('dailyTrip')->where('tourist_id', $touristId)->get();
        $weekly = BookingWeekly::with('weeklyTrip')->where('tourist_id', $touristId)->get();
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
