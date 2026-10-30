<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\RestaurantCafe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Hotels and restaurants/cafes directory stored through Laravel (replaces the bridge's /hotels and /restaurants).
 * Saved records are never deleted; a partner is deactivated by setting partnership_status to «موقوف».
 */
class FacilityController extends Controller
{
    use JsonApiResponses;

    private const PHOTO_SLOTS = [1, 2, 3, 4, 5];

    /* ===================== Hotels ===================== */

    public function hotels(): JsonResponse
    {
        $hotels = Hotel::query()
            ->with('amenities')
            ->withCount('reviews as reviews_count')
            ->withAvg('reviews as rating_avg', 'stars_rating')
            ->orderBy('hotel_name')
            ->get()
            ->map(fn (Hotel $h) => $this->withList($h, 'amenities', 'amenity'));

        return response()->json(['success' => true, 'data' => $hotels]);
    }

    public function saveHotel(Request $request): JsonResponse
    {
        $existing = Hotel::find(trim((string) $request->input('hotel_id')));
        $isNew = $request->boolean('isNew');
        if ($existing && $isNew) {
            return $this->error('رقم القيد البلدي مسجل مسبقاً لمكان إقامة آخر في قاعدة البيانات', 409);
        }

        // On update, fields that are not sent keep their stored values
        $required = $existing ? 'sometimes|required' : 'required';
        $data = $this->validateArabic($request, [
            'hotel_id' => 'required|string|max:50',
            'hotel_name' => "{$required}|string|max:200",
            'city' => "{$required}|string|max:100",
            'address_details' => "{$required}|string|max:500",
            'phone_number' => "{$required}|string|max:20",
            'star_rating' => "{$required}|integer|between:1,5",
            'partnership_status' => 'nullable|string|max:100',
            'property_type' => 'nullable|string|max:100',
            'google_maps_url' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'working_hours' => 'nullable|string|max:150',
            'discount_percentage' => 'nullable|integer|between:0,100',
            'contract_start_date' => 'nullable|date',
            'contract_end_date' => "{$required}|date|after_or_equal:" . $this->startDateFor($request, $existing),
            'amenities' => 'nullable',
        ] + $this->photoRules('hotel_photo_'), $this->attributes('مكان الإقامة'));
        if ($data instanceof JsonResponse) {
            return $data;
        }
        if ($error = $this->pastDateError($data['contract_end_date'] ?? null, $existing->contract_end_date ?? null, 'تاريخ نهاية العقد')) {
            return $this->error($error, 422);
        }

        $id = trim($data['hotel_id']);
        $values = $this->changedValues($data, [
            'hotel_name', 'city', 'address_details', 'phone_number', 'star_rating', 'partnership_status',
            'property_type', 'google_maps_url', 'description', 'working_hours', 'discount_percentage', 'contract_end_date',
        ]);
        $values += $this->changedPhotos($data, 'hotel_photo_');
        if (!$existing) {
            $values += [
                'partnership_status' => 'نشط',
                'property_type' => 'hotel',
                'discount_percentage' => 0,
                'contract_start_date' => $data['contract_start_date'] ?? now('Africa/Tripoli')->toDateString(),
            ];
        }

        DB::transaction(function () use ($id, $values, $request) {
            $hotel = Hotel::updateOrCreate(['hotel_id' => $id], $values);
            if ($request->has('amenities')) {
                $hotel->replaceAmenities($request->input('amenities'));
            }
        });

        return response()->json(['success' => true, 'message' => 'تم حفظ مكان الإقامة في قاعدة البيانات بنجاح',
            'data' => $this->withList(Hotel::with('amenities')->find($id), 'amenities', 'amenity')], 201);
    }

    /* ===================== Restaurants & cafes ===================== */

    public function restaurants(): JsonResponse
    {
        $restaurants = RestaurantCafe::query()
            ->with('features')
            ->withCount('reviews as reviews_count')
            ->withAvg('reviews as rating_avg', 'stars_rating')
            ->orderBy('facility_name')
            ->get()
            ->map(fn (RestaurantCafe $r) => $this->withList($r, 'features', 'feature'));

        return response()->json(['success' => true, 'data' => $restaurants]);
    }

    public function saveRestaurant(Request $request): JsonResponse
    {
        $existing = RestaurantCafe::find(trim((string) $request->input('facility_id')));
        $isNew = $request->boolean('isNew');
        if ($existing && $isNew) {
            return $this->error('رقم القيد البلدي مسجل مسبقاً لمطعم أو مقهى آخر في قاعدة البيانات', 409);
        }

        $required = $existing ? 'sometimes|required' : 'required';
        $data = $this->validateArabic($request, [
            'facility_id' => 'required|string|max:50',
            'facility_name' => "{$required}|string|max:200",
            'facility_type' => "{$required}|string|max:100",
            'city' => "{$required}|string|max:100",
            'address_details' => "{$required}|string|max:500",
            'phone_number' => "{$required}|string|max:20",
            'partnership_status' => 'nullable|string|max:50',
            'google_maps_url' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'working_hours' => 'nullable|string|max:100',
            'discount_percentage' => 'nullable|integer|between:0,100',
            'contract_start_date' => 'nullable|date',
            'contract_end_date' => "{$required}|date|after_or_equal:" . $this->startDateFor($request, $existing),
            'features' => 'nullable',
        ] + $this->photoRules('facility_image_'), $this->attributes('المطعم/المقهى'));
        if ($data instanceof JsonResponse) {
            return $data;
        }
        if ($error = $this->pastDateError($data['contract_end_date'] ?? null, $existing->contract_end_date ?? null, 'تاريخ نهاية العقد')) {
            return $this->error($error, 422);
        }

        $id = trim($data['facility_id']);
        $values = $this->changedValues($data, [
            'facility_name', 'facility_type', 'city', 'address_details', 'phone_number', 'partnership_status',
            'google_maps_url', 'description', 'working_hours', 'discount_percentage', 'contract_end_date',
        ]);
        $values += $this->changedPhotos($data, 'facility_image_');
        if (!$existing) {
            $values += [
                'partnership_status' => 'نشط',
                'discount_percentage' => 0,
                'contract_start_date' => $data['contract_start_date'] ?? now('Africa/Tripoli')->toDateString(),
            ];
        }

        DB::transaction(function () use ($id, $values, $request) {
            $facility = RestaurantCafe::updateOrCreate(['facility_id' => $id], $values);
            if ($request->has('features')) {
                $facility->replaceFeatures($request->input('features'));
            }
        });

        return response()->json(['success' => true, 'message' => 'تم حفظ المطعم/المقهى في قاعدة البيانات بنجاح',
            'data' => $this->withList(RestaurantCafe::with('features')->find($id), 'features', 'feature')], 201);
    }

    /* ===================== Helpers ===================== */

    // Child rows (hotel_amenities / restaurant_features) as a plain list of names, as the bridge returned them
    private function withList($model, string $relation, string $column): array
    {
        $row = $model->toArray();
        $row[$relation] = $model->{$relation}->pluck($column)->values()->all();
        if (array_key_exists('rating_avg', $row)) {
            $row['rating_avg'] = round((float) $row['rating_avg'], 1);
        }
        return $row;
    }

    // The end date may not precede the contract start (sent, stored, or today for a new record)
    private function startDateFor(Request $request, $existing): string
    {
        $start = $request->input('contract_start_date') ?: ($existing->contract_start_date ?? null) ?: now('Africa/Tripoli')->toDateString();
        return substr((string) $start, 0, 10);
    }

    private function photoRules(string $prefix): array
    {
        $rules = [];
        foreach (self::PHOTO_SLOTS as $i) {
            $rules[$prefix . $i] = 'nullable|string';
        }
        return $rules;
    }

    // Only the fields present in the request (non-null) are written, so an update never blanks stored data
    private function changedValues(array $data, array $columns): array
    {
        $values = [];
        foreach ($columns as $column) {
            if (isset($data[$column])) {
                $values[$column] = is_string($data[$column]) ? trim($data[$column]) : $data[$column];
            }
        }
        return $values;
    }

    // An empty photo slot keeps the stored image
    private function changedPhotos(array $data, string $prefix): array
    {
        $values = [];
        foreach (self::PHOTO_SLOTS as $i) {
            if (!empty($data[$prefix . $i])) {
                $values[$prefix . $i] = $data[$prefix . $i];
            }
        }
        return $values;
    }

    private function attributes(string $label): array
    {
        return [
            'hotel_id' => 'رقم القيد البلدي', 'facility_id' => 'رقم القيد البلدي',
            'hotel_name' => "اسم {$label}", 'facility_name' => "اسم {$label}", 'facility_type' => 'نوع المنشأة',
            'city' => 'المدينة', 'address_details' => 'العنوان التفصيلي', 'phone_number' => 'رقم الهاتف',
            'star_rating' => 'تصنيف النجوم', 'partnership_status' => 'حالة الشراكة', 'property_type' => 'نوع مكان الإقامة',
            'google_maps_url' => 'رابط خرائط جوجل', 'description' => 'الوصف', 'working_hours' => 'أوقات العمل',
            'discount_percentage' => 'نسبة الخصم', 'contract_start_date' => 'تاريخ بداية العقد', 'contract_end_date' => 'تاريخ نهاية العقد',
        ];
    }
}
