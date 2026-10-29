<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * A tourist's favorites list (replaces the bridge's /favorites). Toggling adds or removes the item from the
 * tourist's own list; the tourist_favorites table has a unique key on (tourist_id, item_type, item_id).
 */
class FavoriteController extends Controller
{
    use JsonApiResponses;

    public const ITEM_TYPES = ['hotel', 'restaurant', 'vehicle', 'daily_trip', 'weekly_trip', 'landmark'];

    public function index(Request $request): JsonResponse
    {
        if (!$request->filled('tourist_id')) {
            return $this->error('معرف السائح مطلوب', 422);
        }
        $rows = DB::table('tourist_favorites')->where('tourist_id', $request->input('tourist_id'))->orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $rows]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $data = $this->validateArabic($request, [
            'tourist_id' => 'required|string|max:50',
            'item_type' => 'required|string|in:' . implode(',', self::ITEM_TYPES),
            'item_id' => 'required|string|max:50',
        ], ['tourist_id' => 'حساب السائح', 'item_type' => 'نوع العنصر', 'item_id' => 'معرف العنصر']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        if (!DB::table('tourists')->where('tourist_id', $data['tourist_id'])->exists()) {
            return $this->error('المفضلة متاحة فقط للسياح المسجلين', 401);
        }

        $match = ['tourist_id' => $data['tourist_id'], 'item_type' => $data['item_type'], 'item_id' => $data['item_id']];
        $isFavorite = DB::transaction(function () use ($match) {
            if (DB::table('tourist_favorites')->where($match)->lockForUpdate()->exists()) {
                DB::table('tourist_favorites')->where($match)->delete();
                return false;
            }
            DB::table('tourist_favorites')->insert($match + [
                'favorite_id' => 'FAV-' . now('Africa/Tripoli')->format('ymdHis') . '-' . random_int(100, 999),
                'created_at' => now('Africa/Tripoli'),
            ]);
            return true;
        });

        return response()->json([
            'success' => true,
            'is_favorite' => $isFavorite,
            'message' => $isFavorite ? 'تمت إضافة العنصر إلى المفضلة بنجاح ❤️' : 'تمت إزالة العنصر من المفضلة بنجاح',
        ]);
    }
}
