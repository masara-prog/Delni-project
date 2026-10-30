<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Models\DailyTrip;
use App\Models\WeeklyTrip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Daily and weekly bookings (replaces the bridge's /bookings_daily and /bookings_weekly).
 * The price is computed here from the trip (minus its best running offer), never taken from the browser.
 * Bookings are never deleted; payment is collected in cash at the office, so a new booking starts «unpaid».
 */
class BookingController extends Controller
{
    use JsonApiResponses;

    public const PAID = 'paid';
    public const UNPAID = 'unpaid';
    public const CONFIRMED = 'مؤكدة';

    // kind => [bookings table, booking id, trip table, trip id, trip model, price column, offers table, offer discount column, id prefix, label]
    private const KINDS = [
        'daily' => ['bookings_daily', 'booking_daily_id', 'daily_trips', 'daily_trip_id', DailyTrip::class, 'price_per_seat', 'offers_daily_trips', 'percent_discount', 'BKD', 'اليومية'],
        'weekly' => ['bookings_weekly', 'booking_weekly_id', 'weekly_trips', 'weekly_trip_id', WeeklyTrip::class, 'seat_per_price', 'offers_weekly_trips', 'discount_percentage', 'BKW', 'الأسبوعية'],
    ];

    public function bookDaily(Request $request): JsonResponse
    {
        return $this->book($request, 'daily');
    }

    public function bookWeekly(Request $request): JsonResponse
    {
        return $this->book($request, 'weekly');
    }

    private function book(Request $request, string $kind): JsonResponse
    {
        [$table, $key, $tripTable, $tripKey, $model, $priceColumn, $offers, $discountColumn, $prefix, $label] = self::KINDS[$kind];
        $data = $this->validateArabic($request, [
            'tourist_id' => 'required|string|max:50',
            $tripKey => 'required|string|max:50',
            'number_of_seats' => 'required|integer|between:1,50',
        ], ['tourist_id' => 'حساب السائح', $tripKey => "الرحلة {$label}", 'number_of_seats' => 'عدد المقاعد']);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $tourist = DB::table('tourists')->where('tourist_id', $data['tourist_id'])->first();
        if (!$tourist) {
            return $this->error('الحجز متاح فقط للسياح المسجلين. يرجى تسجيل الدخول بحساب سائح.', 401);
        }
        if ($tourist->account_status === 'مقيّد') {
            return $this->error('حسابك مقيّد من قبل إدارة المنصة ولا يمكنه إجراء حجوزات جديدة. يرجى التواصل مع الإدارة.', 403);
        }
        // Exact trip id only (the old code fell back to any active trip when the id was not found)
        $trip = $model::find($data[$tripKey]);
        if (!$trip || !$trip->is_active) {
            return $this->error("الرحلة {$label} المطلوبة غير متاحة للحجز", 404);
        }
        if ($reason = $trip->bookingClosedReason()) {
            return $this->error($reason, 422);
        }

        $seats = (int) $data['number_of_seats'];
        $today = now('Africa/Tripoli')->toDateString();
        $discount = (float) DB::table($offers)->where($tripKey, $trip->{$tripKey})
            ->where('start_date', '<=', $today)->where('end_date', '>=', $today)->max($discountColumn);
        $total = round((float) $trip->{$priceColumn} * $seats * (1 - $discount / 100), 2);
        $id = $prefix . '-' . now('Africa/Tripoli')->format('ymdHis') . '-' . random_int(100, 999);

        $result = DB::transaction(function () use ($table, $key, $tripTable, $tripKey, $trip, $seats, $total, $id, $tourist, $label) {
            // Re-read the seats under lock so two bookings can't take the same seats
            $free = (int) DB::table($tripTable)->where($tripKey, $trip->{$tripKey})->lockForUpdate()->value('available_seats');
            if ($free < $seats) {
                return $this->error("عذراً، عدد المقاعد المطلوبة ({$seats}) يتجاوز المقاعد المتبقية في هذه الرحلة ({$free}).", 422);
            }
            DB::table($table)->insert([
                $key => $id,
                'tourist_id' => $tourist->tourist_id,
                $tripKey => $trip->{$tripKey},
                'booking_date' => now('Africa/Tripoli'),
                'number_of_seats' => $seats,
                'booking_status' => self::CONFIRMED,
                'total_price' => $total,
                'payment_status' => self::UNPAID,
                'attended' => false,
            ]);
            DB::table($tripTable)->where($tripKey, $trip->{$tripKey})->decrement('available_seats', $seats);

            $this->notify("booking-created-{$id}", 'tourist', $tourist->tourist_id, 'booking',
                "🎫 تم استلام وتسجيل حجزك بنجاح ({$id})",
                "تم تسجيل حجزك في رحلة ({$trip->trip_title}) لعدد ({$seats}) مقاعد برقم التذكرة ({$id}). يُرجى سداد التكلفة ({$total} د.ل) نقداً بمقر الشركة قبل موعد الرحلة.",
                '/dashboard/tourist');
            $this->notify("admin-booking-{$id}", 'admin', null, 'booking',
                "🎫 حجز مقاعد جديد في رحلة {$label} ({$id})",
                "سجّل السائح ({$tourist->full_name}) حجزاً برقم التذكرة ({$id}) لعدد ({$seats}) مقاعد في رحلة ({$trip->trip_title}).",
                '/dashboard/admin');
            return null;
        });
        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'تم الحجز بنجاح، يُرجى التوجه لمقر الشركة لسداد التكلفة نقداً قبل موعد الرحلة',
            'booking_id' => $id,
            'data' => $this->typed((array) DB::table($table)->where($key, $id)->first()),
        ], 201);
    }

    // Admin list (?tourist_id=... for one tourist), flat rows with the tourist and trip names
    public function index(Request $request, string $kind): JsonResponse
    {
        [$table, $key, $tripTable, $tripKey] = self::KINDS[$kind];
        $query = DB::table("{$table} as b")
            ->leftJoin('tourists as t', 'b.tourist_id', '=', 't.tourist_id')
            ->leftJoin("{$tripTable} as tr", "b.{$tripKey}", '=', "tr.{$tripKey}")
            ->select('b.*', 't.full_name as tourist_name', 't.phone_number as tourist_phone', 't.email as tourist_email',
                'tr.trip_title', 'tr.departure_city', 'tr.guide_license_number')
            ->orderByDesc('b.booking_date');
        if ($request->filled('tourist_id')) {
            $query->where('b.tourist_id', $request->input('tourist_id'));
        }
        return response()->json(['success' => true, 'data' => $this->typed($query->get()->all())]);
    }

    // The tourist's own bookings, each with its trip and guide (shape used by the tourist dashboard)
    public function touristBookings(string $touristId): JsonResponse
    {
        $daily = DB::table('bookings_daily')->where('tourist_id', $touristId)->orderByDesc('booking_date')->get();
        $weekly = DB::table('bookings_weekly')->where('tourist_id', $touristId)->orderByDesc('booking_date')->get();

        $dailyTrips = DailyTrip::with('guide')->whereIn('daily_trip_id', $daily->pluck('daily_trip_id'))->get()->keyBy('daily_trip_id');
        $weeklyTrips = WeeklyTrip::with('guide')->whereIn('weekly_trip_id', $weekly->pluck('weekly_trip_id'))->get()->keyBy('weekly_trip_id');
        $withTrip = function ($rows, $trips, string $tripKey, string $relation) {
            return $rows->map(function ($b) use ($trips, $tripKey, $relation) {
                $trip = $trips[$b->{$tripKey}] ?? null;
                $tripArray = $trip ? $trip->toArray() + ['photo' => $trip->photo_1] : null;
                return $this->typed((array) $b) + [$relation => $tripArray, 'trip_title' => $trip?->trip_title];
            })->values()->all();
        };

        $dailyRows = $withTrip($daily, $dailyTrips, 'daily_trip_id', 'daily_trip');
        $weeklyRows = $withTrip($weekly, $weeklyTrips, 'weekly_trip_id', 'weekly_trip');
        return response()->json([
            'success' => true,
            'daily' => $dailyRows,
            'weekly' => $weeklyRows,
            'daily_bookings' => $dailyRows,
            'weekly_bookings' => $weeklyRows,
        ]);
    }

    // Admin: mark a booking paid / unpaid
    public function setPayment(Request $request, string $kind, string $bookingId): JsonResponse
    {
        $data = $this->validateArabic($request, ['payment_status' => 'required|in:' . self::PAID . ',' . self::UNPAID], ['payment_status' => 'حالة الدفع']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        return $this->updateBooking($kind, $bookingId, ['payment_status' => $data['payment_status']], 'تم تحديث حالة الدفع');
    }

    // Admin: mark attendance
    public function setAttendance(Request $request, string $kind, string $bookingId): JsonResponse
    {
        $data = $this->validateArabic($request, ['attended' => 'required|boolean'], ['attended' => 'الحضور']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        return $this->updateBooking($kind, $bookingId, ['attended' => (bool) $data['attended']], 'تم تحديث حالة الحضور');
    }

    // Admin ticket desk: cash received and tourist checked in, in one step
    public function checkIn(string $kind, string $bookingId): JsonResponse
    {
        $response = $this->updateBooking($kind, $bookingId,
            ['payment_status' => self::PAID, 'attended' => true, 'booking_status' => self::CONFIRMED], 'تم تأكيد الحضور واستلام المبلغ');
        if ($response->getStatusCode() === 200) {
            $booking = $response->getData(true)['data'];
            [, $key, , , , , , , , $label] = self::KINDS[$kind];
            $this->notify("booking-checkin-{$bookingId}", 'tourist', $booking['tourist_id'], 'booking',
                "✅ تم تأكيد حجز تذكرتك رسمياً ({$bookingId})",
                "تم استلام المبلغ وتأكيد حضورك في الرحلة {$label} ({$booking['trip_title']}) برقم التذكرة ({$bookingId}). نتمنى لك رحلة ممتعة وآمنة!",
                '/dashboard/tourist');
        }
        return $response;
    }

    // Exact ticket lookup for the admin ticket desk (the old scanner matched partial codes and invented a ticket when none matched)
    public function findTicket(string $code): JsonResponse
    {
        foreach (array_keys(self::KINDS) as $kind) {
            $row = $this->bookingRow($kind, trim($code));
            if ($row) {
                return response()->json(['success' => true, 'kind' => $kind, 'data' => $row]);
            }
        }
        return $this->error('رمز التذكرة غير موجود', 404);
    }

    private function updateBooking(string $kind, string $bookingId, array $values, string $message): JsonResponse
    {
        [$table, $key] = self::KINDS[$kind];
        if (!DB::table($table)->where($key, $bookingId)->exists()) {
            return $this->error('الحجز غير موجود', 404);
        }
        DB::table($table)->where($key, $bookingId)->update($values);
        return response()->json(['success' => true, 'message' => $message, 'data' => $this->bookingRow($kind, $bookingId)]);
    }

    private function bookingRow(string $kind, string $bookingId): ?array
    {
        [$table, $key, $tripTable, $tripKey] = self::KINDS[$kind];
        $row = DB::table("{$table} as b")
            ->leftJoin('tourists as t', 'b.tourist_id', '=', 't.tourist_id')
            ->leftJoin("{$tripTable} as tr", "b.{$tripKey}", '=', "tr.{$tripKey}")
            ->leftJoin('tour_guides as g', 'tr.guide_license_number', '=', 'g.license_number')
            ->where("b.{$key}", $bookingId)
            ->first(['b.*', 't.full_name as tourist_name', 't.phone_number as tourist_phone', 'tr.trip_title', 'g.full_name as guide_name']);
        return $row ? $this->typed((array) $row) : null;
    }
}
