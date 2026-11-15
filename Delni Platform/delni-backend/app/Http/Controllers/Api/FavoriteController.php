<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * A tourist's favourites. Each kind of item has its own table (favorite_hotels, favorite_daily_trips, ...) whose
 * primary key is (tourist_id, item) and whose two columns are foreign keys, so a favourite always points to a real
 * tourist and a real item. The API still speaks in {item_type, item_id}, as the website and the app expect.
 */
class FavoriteController extends Controller
{
    use JsonApiResponses;

    // item_type => [favourites table, its item column, the item's own table, that table's key]
    public const TABLES = [
        'daily_trip' => ['favorite_daily_trips', 'daily_trip_id', 'daily_trips', 'daily_trip_id'],
        'weekly_trip' => ['favorite_weekly_trips', 'weekly_trip_id', 'weekly_trips', 'weekly_trip_id'],
        'hotel' => ['favorite_hotels', 'hotel_id', 'hotels', 'hotel_id'],
        'restaurant' => ['favorite_restaurants', 'facility_id', 'restaurants_cafes', 'facility_id'],
        'vehicle' => ['favorite_vehicles', 'plate_number', 'vehicles', 'plate_number'],
        'landmark' => ['favorite_places', 'place_id', 'places_tourist', 'place_id'],
    ];

    public function index(Request $request): JsonResponse
    {
        if (!$request->filled('tourist_id')) {
            return $this->error('معرف السائح مطلوب', 422);
        }
        $tourist = (string) $request->input('tourist_id');
        $rows = collect();
        foreach (self::TABLES as $type => [$table, $column]) {
            $rows = $rows->concat(DB::table($table)->where('tourist_id', $tourist)->get()->map(fn ($r) => [
                'favorite_id' => "{$type}:{$r->{$column}}",
                'tourist_id' => $r->tourist_id,
                'item_type' => $type,
                'item_id' => $r->{$column},
                'created_at' => $r->created_at,
            ]));
        }
        return response()->json(['success' => true, 'data' => $rows->sortByDesc('created_at')->values()]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $data = $this->validateArabic($request, [
            'tourist_id' => 'required|string|max:50',
            'item_type' => 'required|string|in:' . implode(',', array_keys(self::TABLES)),
            'item_id' => 'required|string|max:50',
        ], ['tourist_id' => 'حساب السائح', 'item_type' => 'نوع العنصر', 'item_id' => 'معرف العنصر']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        if (!DB::table('tourists')->where('tourist_id', $data['tourist_id'])->exists()) {
            return $this->error('المفضلة متاحة فقط للسياح المسجلين', 401);
        }
        [$table, $column, $itemTable, $itemKey] = self::TABLES[$data['item_type']];
        if (!DB::table($itemTable)->where($itemKey, $data['item_id'])->exists()) {
            return $this->error('العنصر المطلوب غير موجود', 404);
        }

        $match = ['tourist_id' => $data['tourist_id'], $column => $data['item_id']];
        $isFavorite = DB::transaction(function () use ($table, $match) {
            if (DB::table($table)->where($match)->lockForUpdate()->exists()) {
                DB::table($table)->where($match)->delete();
                return false;
            }
            DB::table($table)->insert($match + ['created_at' => now('Africa/Tripoli')]);
            return true;
        });

        return response()->json([
            'success' => true,
            'is_favorite' => $isFavorite,
            'message' => $isFavorite ? 'تمت إضافة العنصر إلى المفضلة بنجاح ❤️' : 'تمت إزالة العنصر من المفضلة بنجاح',
        ]);
    }
}
