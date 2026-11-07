<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Support\Actor;
use App\Support\Base64Image;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Offers on daily and weekly trips (replaces the bridge's /daily_offers and /weekly_offers).
 * Offers are never deleted; «إنهاء العرض» sets its end date to today.
 */
class TripOfferController extends Controller
{
    use JsonApiResponses;

    // A trip is never offered for free
    private const MAX_DISCOUNT = 90;

    // kind => [offers table, offer id, trip table, trip id, discount column, trip price column, id prefix, label]
    private const KINDS = [
        'daily' => ['offers_daily_trips', 'offer_daily_id', 'daily_trips', 'daily_trip_id', 'percent_discount', 'price_per_seat', 'DO', 'اليومية'],
        'weekly' => ['offers_weekly_trips', 'offer_weekly_id', 'weekly_trips', 'weekly_trip_id', 'discount_percentage', 'seat_per_price', 'WO', 'الأسبوعية'],
    ];

    // Public pages get offers that have not ended; the admin dashboard asks for ?all=1
    public function index(Request $request, string $kind): JsonResponse
    {
        [$table, $key, $tripTable, $tripKey, $discount, $price] = self::KINDS[$kind];
        $query = DB::table("{$table} as o")
            ->leftJoin("{$tripTable} as t", "o.{$tripKey}", '=', "t.{$tripKey}")
            ->select("o.{$key}", "o.{$tripKey}", 'o.offer_title', 'o.description', "o.{$discount}", 'o.offer_image_url', 'o.badge',
                DB::raw('CONVERT(VARCHAR(10), o.start_date, 120) as start_date'),
                DB::raw('CONVERT(VARCHAR(10), o.end_date, 120) as end_date'),
                't.trip_title', "t.{$price}", 't.departure_city', 't.photo_1 as trip_photo', 't.is_active as trip_is_active')
            ->orderByDesc("o.{$key}");
        if (!($request->boolean('all') && Actor::isAdmin())) {
            $query->where('o.end_date', '>=', now('Africa/Tripoli')->toDateString())->where('t.is_active', true);
        }
        return response()->json(['success' => true, 'data' => $this->typed($query->get()->all())]);
    }

    public function save(Request $request, string $kind): JsonResponse
    {
        [$table, $key, $tripTable, $tripKey, $discount, , $prefix, $label] = self::KINDS[$kind];
        $id = trim((string) ($request->input($key) ?: $request->input('id')));
        $existing = $id !== '' ? DB::table($table)->where($key, $id)->first() : null;

        // The admin forms use several aliases for the same fields
        $this->mergeAliases($request, [
            'offer_title' => ['offer_title', 'title_offer'],
            'discount' => [$discount, 'percent_discount', 'discount_percentage'],
            'start_date' => ['start_date', 'date_start'],
            'end_date' => ['end_date', 'date_end'],
            'offer_image_url' => ['offer_image_url', 'url_image_offer'],
        ]);
        $required = $existing ? 'sometimes|required' : 'required';
        $data = $this->validateArabic($request, [
            $tripKey => "{$required}|string|max:50",
            'offer_title' => "{$required}|string|max:250",
            'description' => 'nullable|string',
            'discount' => "{$required}|numeric|between:1," . self::MAX_DISCOUNT,
            'start_date' => "{$required}|date",
            'end_date' => "{$required}|date",
            'offer_image_url' => 'nullable|string',
            'badge' => 'nullable|string|max:100',
        ], [
            $tripKey => "الرحلة {$label}", 'offer_title' => 'عنوان العرض', 'description' => 'وصف العرض',
            'discount' => 'نسبة الخصم', 'start_date' => 'تاريخ بداية العرض', 'end_date' => 'تاريخ نهاية العرض', 'badge' => 'شارة العرض',
        ]);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $tripId = $data[$tripKey] ?? $existing->{$tripKey};
        $trip = DB::table($tripTable)->where($tripKey, $tripId)->first();
        if (!$trip) {
            return $this->error("الرحلة {$label} المحددة غير موجودة", 404);
        }
        $start = substr((string) ($data['start_date'] ?? $existing->start_date), 0, 10);
        $end = substr((string) ($data['end_date'] ?? $existing->end_date), 0, 10);
        if ($end < $start) {
            return $this->error('تاريخ نهاية العرض لا يمكن أن يكون قبل تاريخ بدايته', 422);
        }
        if (!$existing && $end < now('Africa/Tripoli')->toDateString()) {
            return $this->error('لا يمكن إنشاء عرض انتهت مدته', 422);
        }
        if (!$trip->is_active) {
            return $this->error("لا يمكن إضافة عرض على رحلة {$label} ملغاة", 422);
        }
        // One running offer per trip at a time (the booking price takes a single discount)
        $overlap = DB::table($table)->where($tripKey, $tripId)->where('start_date', '<=', $end)->where('end_date', '>=', $start)
            ->when($existing, fn ($q) => $q->where($key, '<>', $existing->{$key}))->value('offer_title');
        if ($overlap !== null) {
            return $this->error("يوجد عرض آخر ({$overlap}) على نفس الرحلة في نفس الفترة. يرجى إنهاؤه أو اختيار فترة أخرى.", 422);
        }

        $id = $id !== '' ? $id : $prefix . '-' . now('Africa/Tripoli')->format('ymdHis') . '-' . random_int(1000, 9999);
        $values = [$tripKey => $tripId, 'start_date' => $start, 'end_date' => $end];
        foreach (['offer_title', 'description', 'badge'] as $column) {
            if (isset($data[$column])) {
                $values[$column] = trim($data[$column]);
            }
        }
        if (isset($data['discount'])) {
            $values[$discount] = round((float) $data['discount'], 2);
        }
        if (!empty($data['offer_image_url'])) {
            $values['offer_image_url'] = mb_substr(Base64Image::store($data['offer_image_url'], "{$id}-offer"), 0, 255);
        } elseif (!$existing) {
            $values['offer_image_url'] = mb_substr((string) ($trip->photo_1 ?: '/assets/dest-leptis-theater.jpg'), 0, 255);
        }
        if (!$existing && empty($values['badge'])) {
            $values['badge'] = 'خصم ' . rtrim(rtrim(number_format($values[$discount], 2, '.', ''), '0'), '.') . '%';
        }

        $existing
            ? DB::table($table)->where($key, $id)->update($values)
            : DB::table($table)->insert($values + [$key => $id]);

        $offer = collect($this->index(Request::create('/', 'GET', ['all' => 1]), $kind)->getData(true)['data'])->firstWhere($key, $id);
        return response()->json(['success' => true, 'message' => "تم حفظ عرض الرحلة {$label} بنجاح",
            'offer_id' => $id, 'offer' => $offer, 'data' => $offer], 201);
    }

    // Ends the offer instead of deleting it: its end date moves to yesterday, so public pages stop showing it now
    public function end(string $kind, string $offerId): JsonResponse
    {
        [$table, $key, , , , , , $label] = self::KINDS[$kind];
        $offer = DB::table($table)->where($key, $offerId)->first();
        if (!$offer) {
            return $this->error('العرض غير موجود', 404);
        }
        $yesterday = now('Africa/Tripoli')->subDay()->toDateString();
        $values = ['end_date' => $yesterday];
        if (substr((string) $offer->start_date, 0, 10) > $yesterday) {
            $values['start_date'] = $yesterday;
        }
        DB::table($table)->where($key, $offerId)->update($values);
        return response()->json(['success' => true, 'message' => "تم إنهاء عرض الرحلة {$label}، ولن يظهر للسياح بعد الآن"]);
    }
}
