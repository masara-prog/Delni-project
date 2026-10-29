<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Shared helpers for the controllers that replaced the Node bridge:
 * the bridge's response shape ({ success, data | message | error }), Arabic validation messages and deduplicated notifications.
 */
trait JsonApiResponses
{
    private const ARABIC_MESSAGES = [
        'required' => ':attribute مطلوب',
        'string' => ':attribute يجب أن يكون نصاً',
        'max' => ':attribute أطول من المسموح (:max)',
        'min' => ':attribute أقل من الحد الأدنى (:min)',
        'integer' => ':attribute يجب أن يكون رقماً صحيحاً',
        'numeric' => ':attribute يجب أن يكون رقماً',
        'between' => ':attribute يجب أن يكون بين :min و :max',
        'date' => ':attribute ليس تاريخاً صحيحاً',
        'after_or_equal' => ':attribute لا يمكن أن يكون قبل تاريخ بداية العقد',
        'email' => ':attribute غير صحيح',
        'array' => ':attribute يجب أن يكون قائمة',
        'boolean' => ':attribute يجب أن يكون نعم أو لا',
        'in' => 'قيمة :attribute غير مسموح بها',
    ];

    /**
     * Validates with Arabic messages; returns the validated data or a 422 response with the first error.
     */
    private function validateArabic(Request $request, array $rules, array $attributes = []): array|JsonResponse
    {
        try {
            return $request->validate($rules, self::ARABIC_MESSAGES, $attributes);
        } catch (ValidationException $e) {
            return $this->validationError($e);
        }
    }

    // Query-builder rows from SQL Server come back as strings; these columns are sent with their real types
    private const INT_COLUMNS = ['max_capacity', 'available_seats', 'seating_capacity', 'vehicle_capacity', 'station_order', 'day_number',
        'duration_days', 'number_of_companions', 'star_rating', 'visit_order', 'reviews_count', 'bookings_count', 'number_of_seats', 'stars_rating', 'total_vehicles'];
    private const FLOAT_COLUMNS = ['price_per_seat', 'seat_per_price', 'quoted_price', 'additional_expenses', 'percent_discount',
        'discount_percentage', 'daily_rate', 'vehicle_daily_rate', 'guide_daily_rate', 'rating_avg', 'total_price', 'latitude', 'longitude'];
    private const BOOL_COLUMNS = ['is_active', 'trip_is_active', 'attended'];

    private function typed($value, ?string $key = null)
    {
        if (is_array($value)) {
            foreach ($value as $k => $v) {
                $value[$k] = $this->typed($v, is_string($k) ? $k : null);
            }
            return $value;
        }
        if (is_object($value)) {
            return $this->typed((array) $value);
        }
        if ($value === null || $key === null) {
            return $value;
        }
        if (in_array($key, self::INT_COLUMNS, true) && is_numeric($value)) {
            return (int) $value;
        }
        if (in_array($key, self::FLOAT_COLUMNS, true) && is_numeric($value)) {
            return (float) $value;
        }
        if (in_array($key, self::BOOL_COLUMNS, true)) {
            return (bool) (int) $value;
        }
        return $value;
    }

    // Copies the first alias that was actually sent into the canonical field (fields not sent stay absent)
    private function mergeAliases(Request $request, array $aliases): void
    {
        $merge = [];
        foreach ($aliases as $field => $names) {
            foreach ((array) $names as $name) {
                if ($request->input($name) !== null && $request->input($name) !== '') {
                    $merge[$field] = $request->input($name);
                    break;
                }
            }
        }
        $request->merge($merge);
    }

    private function error(string $message, int $status): JsonResponse
    {
        return response()->json(['success' => false, 'error' => $message], $status);
    }

    private function validationError(ValidationException $e): JsonResponse
    {
        return $this->error(collect($e->errors())->flatten()->first() ?? 'البيانات المدخلة غير صحيحة', 422);
    }

    private function notify(string $dedupeKey, string $role, ?string $recipientId, string $type, string $title, string $body, string $link): void
    {
        if (Notification::where('dedupe_key', $dedupeKey)->exists()) {
            return;
        }
        Notification::create([
            'id' => 'notif-' . (int) (microtime(true) * 1000) . '-' . random_int(100, 999),
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'recipient_role' => $role,
            'recipient_id' => $recipientId,
            'link' => $link,
            'is_read' => false,
            'created_at' => now('Africa/Tripoli'),
            'dedupe_key' => $dedupeKey,
        ]);
    }
}
