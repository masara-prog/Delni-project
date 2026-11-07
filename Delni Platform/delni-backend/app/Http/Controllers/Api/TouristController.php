<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Models\Tourist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Tourists for the admin dashboard and the booking checks (replaces the bridge's /tourists).
 * Accounts are never deleted; the admin restricts them through account_status («مقيّد» blocks new bookings).
 */
class TouristController extends Controller
{
    use JsonApiResponses;

    public const STATUSES = ['نشط', 'مقيّد'];

    public function index(): JsonResponse
    {
        $tourists = Tourist::query()
            ->withCount(['dailyBookings as daily_bookings_count', 'weeklyBookings as weekly_bookings_count'])
            ->orderBy('full_name')
            ->get();

        return response()->json(['success' => true, 'data' => $tourists]);
    }

    // Exact tourist_id only (the bridge also matched partial phone numbers, which could return someone else's account)
    public function show(string $touristId): JsonResponse
    {
        $tourist = Tourist::find(trim($touristId));
        if (!$tourist) {
            return $this->error('حساب السائح غير موجود', 404);
        }
        $id = $tourist->tourist_id;

        $daily = DB::table('bookings_daily as b')
            ->leftJoin('daily_trips as t', 'b.daily_trip_id', '=', 't.daily_trip_id')
            ->where('b.tourist_id', $id)
            ->select('b.*', 't.trip_title', 't.departure_city', 't.photo_1 as trip_photo')
            ->orderByDesc('b.booking_date')->get();
        $weekly = DB::table('bookings_weekly as b')
            ->leftJoin('weekly_trips as t', 'b.weekly_trip_id', '=', 't.weekly_trip_id')
            ->where('b.tourist_id', $id)
            ->select('b.*', 't.trip_title', 't.departure_city', 't.photo_1 as trip_photo')
            ->orderByDesc('b.booking_date')->get();

        $reviews = collect([
            ['reviews_daily_trips', 'daily_trips', 'daily_trip_id', 'trip_title', 'رحلة يومية'],
            ['reviews_weekly_trips', 'weekly_trips', 'weekly_trip_id', 'trip_title', 'رحلة أسبوعية'],
            ['reviews_hotels', 'hotels', 'hotel_id', 'hotel_name', 'فندق'],
            ['reviews_facilities', 'restaurants_cafes', 'facility_id', 'facility_name', 'مطعم/مقهى'],
        ])->flatMap(fn ($r) => DB::table("{$r[0]} as r")
            ->leftJoin("{$r[1]} as x", "r.{$r[2]}", '=', "x.{$r[2]}")
            ->where('r.tourist_id', $id)
            ->selectRaw('? as target_type, x.' . $r[3] . ' as target_name, r.stars_rating, r.comment_text, CONVERT(VARCHAR(10), r.created_at, 120) as created_at', [$r[4]])
            ->get())
            ->sortByDesc('created_at')->values();

        return response()->json(['success' => true, 'data' => $tourist->toArray() + [
            'daily_bookings' => $daily,
            'weekly_bookings' => $weekly,
            'reviews' => $reviews,
            'total_bookings' => $daily->count() + $weekly->count(),
            'total_reviews' => $reviews->count(),
        ]]);
    }

    public function updateStatus(Request $request, string $touristId): JsonResponse
    {
        $tourist = Tourist::find(trim($touristId));
        if (!$tourist) {
            return $this->error('حساب السائح غير موجود', 404);
        }
        $data = $this->validateArabic($request, [
            'account_status' => 'required|string|in:' . implode(',', self::STATUSES),
        ], ['account_status' => 'حالة الحساب']);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $tourist->update(['account_status' => $data['account_status']]);
        return response()->json([
            'success' => true,
            'message' => "تم تحديث حالة حساب السائح ({$tourist->tourist_id}) إلى: {$data['account_status']}",
            'data' => $tourist->fresh(),
        ]);
    }
}
