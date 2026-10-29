<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Reviews of daily/weekly trips, hotels and restaurants/cafes (replaces the bridge's /reviews).
 * One review per tourist per item: submitting again updates it. Trips can be reviewed only by tourists who
 * booked them (not cancelled), and weekly trips only after they end.
 */
class ReviewController extends Controller
{
    use JsonApiResponses;

    // type => [reviews table, review id, item column, item table, item name column, id prefix, item label]
    private const TYPES = [
        'daily' => ['reviews_daily_trips', 'review_daily_id', 'daily_trip_id', 'daily_trips', 'trip_title', 'REV-D', 'الرحلة'],
        'weekly' => ['reviews_weekly_trips', 'review_weekly_id', 'weekly_trip_id', 'weekly_trips', 'trip_title', 'REV-W', 'الرحلة'],
        'hotel' => ['reviews_hotels', 'review_hotel_id', 'hotel_id', 'hotels', 'hotel_name', 'REV-H', 'الفندق'],
        'facility' => ['reviews_facilities', 'review_facility_id', 'facility_id', 'restaurants_cafes', 'facility_name', 'REV-F', 'المطعم/المقهى'],
    ];

    // ?type=daily|weekly|hotel|facility and the item id (trip_id / hotel_id / facility_id); no type = all reviews
    public function index(Request $request): JsonResponse
    {
        $type = $this->normalizeType($request->input('type'), $request);
        $types = $type ? [$type] : array_keys(self::TYPES);
        $itemId = $request->input('trip_id') ?? $request->input('hotel_id') ?? $request->input('facility_id') ?? $request->input('restaurant_id') ?? $request->input('id');

        $rows = collect();
        foreach ($types as $t) {
            [$table, $reviewId, $itemColumn, $itemTable, $nameColumn] = self::TYPES[$t];
            $query = DB::table("{$table} as r")
                ->leftJoin("{$itemTable} as i", "r.{$itemColumn}", '=', "i.{$itemColumn}")
                ->leftJoin('tourists as t', 'r.tourist_id', '=', 't.tourist_id')
                ->select("r.{$reviewId} as review_id", 'r.tourist_id', "r.{$itemColumn} as target_id", 'r.stars_rating', 'r.comment_text',
                    DB::raw('CONVERT(VARCHAR(19), r.created_at, 120) as created_at'), "i.{$nameColumn} as target_name",
                    't.full_name as tourist_name')
                ->selectRaw('? as target_type', [$t]);
            if (in_array($t, ['daily', 'weekly'], true)) {
                $query->addSelect("r.{$itemColumn} as trip_id", 'i.guide_license_number')->selectRaw('? as trip_type', [$t]);
            }
            if ($type && $itemId) {
                $query->where("r.{$itemColumn}", $itemId);
            }
            $rows = $rows->concat($query->get());
        }
        $data = $rows->sortByDesc('created_at')->values()->all();
        return response()->json(['success' => true, 'data' => $this->typed($data)]);
    }

    public function store(Request $request): JsonResponse
    {
        $type = $this->normalizeType($request->input('type', 'daily'), $request);
        if (!$type) {
            return $this->error('نوع التقييم غير معروف', 422);
        }
        [$table, $reviewId, $itemColumn, $itemTable, , $prefix, $label] = self::TYPES[$type];
        $itemId = $request->input($itemColumn) ?? $request->input('trip_id') ?? $request->input('hotel_id') ?? $request->input('facility_id');
        $request->merge(['item_id' => $itemId]);

        $data = $this->validateArabic($request, [
            'tourist_id' => 'required|string|max:50',
            'item_id' => 'required|string|max:50',
            'stars_rating' => 'required|integer|between:1,5',
            'comment_text' => 'nullable|string|max:2000',
        ], ['tourist_id' => 'حساب السائح', 'item_id' => "معرف {$label}", 'stars_rating' => 'عدد النجوم', 'comment_text' => 'التعليق']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        if (!DB::table('tourists')->where('tourist_id', $data['tourist_id'])->exists()) {
            return $this->error('التقييم متاح فقط للسياح المسجلين', 401);
        }
        if (!DB::table($itemTable)->where($itemColumn, $data['item_id'])->exists()) {
            return $this->error("{$label} غير موجود في قاعدة البيانات", 404);
        }
        if ($error = $this->tripReviewError($type, $data['tourist_id'], $data['item_id'])) {
            return $this->error($error, 403);
        }

        $values = ['stars_rating' => (int) $data['stars_rating'], 'comment_text' => trim((string) ($data['comment_text'] ?? '')) ?: null, 'created_at' => now('Africa/Tripoli')];
        $match = ['tourist_id' => $data['tourist_id'], $itemColumn => $data['item_id']];
        DB::table($table)->where($match)->exists()
            ? DB::table($table)->where($match)->update($values)
            : DB::table($table)->insert($match + $values + [$reviewId => $prefix . '-' . now('Africa/Tripoli')->format('ymdHis') . '-' . random_int(100, 999)]);

        return response()->json(['success' => true, 'message' => "شكراً لك! تم تسجيل تقييمك لـ{$label} بنجاح في منصة دلني."], 201);
    }

    // Only tourists with a booking that wasn't cancelled; weekly trips only after their end date
    private function tripReviewError(string $type, string $touristId, string $tripId): ?string
    {
        if (!in_array($type, ['daily', 'weekly'], true)) {
            return null;
        }
        $bookings = $type === 'daily' ? 'bookings_daily' : 'bookings_weekly';
        $tripKey = $type === 'daily' ? 'daily_trip_id' : 'weekly_trip_id';
        $booked = DB::table($bookings)->where('tourist_id', $touristId)->where($tripKey, $tripId)
            ->where('booking_status', 'not like', 'ملغ%')->exists();
        if (!$booked) {
            return 'عذراً، لا يمكنك تقييم هذه الرحلة لأنك لم تحجز أو تشارك فيها بالفعل.';
        }
        if ($type === 'weekly') {
            $end = (string) DB::table('weekly_trips')->where('weekly_trip_id', $tripId)->value('end_date');
            if (substr($end, 0, 10) >= now('Africa/Tripoli')->toDateString()) {
                return 'عذراً، لا يمكنك تقييم الرحلة إلا بعد موعد انتهائها الفعلي.';
            }
        }
        return null;
    }

    private function normalizeType(?string $type, Request $request): ?string
    {
        $type = strtolower(trim((string) $type));
        if (in_array($type, ['restaurant', 'cafe'], true)) {
            return 'facility';
        }
        if ($type === '' && $request->filled('hotel_id')) {
            return 'hotel';
        }
        if ($type === '' && ($request->filled('facility_id') || $request->filled('restaurant_id'))) {
            return 'facility';
        }
        return array_key_exists($type, self::TYPES) ? $type : null;
    }
}
