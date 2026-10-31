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
    public const CANCELLED_BY_TOURIST = 'ملغاة من السائح';
    public const CANCELLED_BY_ADMIN = 'ملغاة من الإدارة';

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
            // A daily trip runs every week, so the tourist picks which run date the seats are for
            'trip_date' => $kind === 'daily' ? 'required|date_format:Y-m-d' : 'prohibited',
        ], ['tourist_id' => 'حساب السائح', $tripKey => "الرحلة {$label}", 'number_of_seats' => 'عدد المقاعد', 'trip_date' => 'تاريخ الرحلة']);
        if ($data instanceof JsonResponse) {
            return $data;
        }
        $tripDate = $data['trip_date'] ?? null;

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
        if ($reason = $tripDate ? $trip->bookingClosedReason($tripDate) : $trip->bookingClosedReason()) {
            return $this->error($reason, 422);
        }

        $seats = (int) $data['number_of_seats'];
        $today = now('Africa/Tripoli')->toDateString();
        $discount = (float) DB::table($offers)->where($tripKey, $trip->{$tripKey})
            ->where('start_date', '<=', $today)->where('end_date', '>=', $today)->max($discountColumn);
        $total = round((float) $trip->{$priceColumn} * $seats * (1 - $discount / 100), 2);
        $id = $prefix . '-' . now('Africa/Tripoli')->format('ymdHis') . '-' . random_int(1000, 9999);

        $result = DB::transaction(function () use ($table, $key, $tripTable, $tripKey, $trip, $seats, $total, $id, $tourist, $label, $tripDate) {
            // Lock the trip row so two bookings can't take the same seats, then count what is left
            $locked = DB::table($tripTable)->where($tripKey, $trip->{$tripKey})->lockForUpdate()->first();
            $free = $tripDate ? $trip->seatsLeft($tripDate) : (int) $locked->available_seats;
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
            ] + ($tripDate ? ['trip_date' => $tripDate] : []));
            if (!$tripDate) {
                DB::table($tripTable)->where($tripKey, $trip->{$tripKey})->decrement('available_seats', $seats);
            }

            $when = $tripDate ? " بتاريخ ({$tripDate})" : '';
            $this->notify("booking-created-{$id}", 'tourist', $tourist->tourist_id, 'booking',
                "🎫 تم استلام وتسجيل حجزك بنجاح ({$id})",
                "تم تسجيل حجزك في رحلة ({$trip->trip_title}){$when} لعدد ({$seats}) مقاعد برقم التذكرة ({$id}). يُرجى سداد التكلفة ({$total} د.ل) نقداً بمقر الشركة قبل موعد الرحلة.",
                '/dashboard/tourist');
            $this->notify("admin-booking-{$id}", 'admin', null, 'booking',
                "🎫 حجز مقاعد جديد في رحلة {$label} ({$id})",
                "سجّل السائح ({$tourist->full_name}) حجزاً برقم التذكرة ({$id}) لعدد ({$seats}) مقاعد في رحلة ({$trip->trip_title}){$when}.",
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

        $with = ['guide', 'vehicle.company', 'vehicle.driver'];
        $dailyTrips = DailyTrip::with([...$with, 'stations'])->whereIn('daily_trip_id', $daily->pluck('daily_trip_id'))->get()->keyBy('daily_trip_id');
        $weeklyTrips = WeeklyTrip::with($with)->whereIn('weekly_trip_id', $weekly->pluck('weekly_trip_id'))->get()->keyBy('weekly_trip_id');
        $withTrip = function ($rows, $trips, string $tripKey, string $relation) {
            return $rows->map(function ($b) use ($trips, $tripKey, $relation) {
                $trip = $trips[$b->{$tripKey}] ?? null;
                $vehicle = $trip?->vehicle;
                // The ticket shows who drives and in what (no vehicle documents or images)
                $tripArray = $trip ? collect($trip->toArray())->except(['vehicle'])->all() + [
                    'photo' => $trip->photo_1,
                    'first_station_time' => $trip->relationLoaded('stations') ? $trip->stations->first()?->station_time : null,
                    'transport' => $vehicle ? [
                        'vehicle_plate' => $vehicle->plate_number,
                        'vehicle_type' => $vehicle->vehicle_type,
                        'company_name' => $vehicle->company?->company_name,
                        'contract_number' => $vehicle->contract_number,
                        'driver_name' => $vehicle->driver?->full_name,
                        'driver_phone' => $vehicle->driver?->phone_number,
                    ] : null,
                ] : null;
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

    /**
     * The tourist cancels their own booking while the trip is still open for booking. The seats go back on sale.
     * A booking already paid in cash is refunded at the office, so the tourist asks the admin instead.
     */
    public function cancel(Request $request, string $kind, string $bookingId): JsonResponse
    {
        [$table, $key, $tripTable, $tripKey, $model, , , , , $label] = self::KINDS[$kind];
        $booking = DB::table($table)->where($key, $bookingId)->first();
        if (!$booking || $booking->tourist_id !== $request->input('tourist_id')) {
            return $this->error('الحجز غير موجود', 404);
        }
        if (str_starts_with((string) $booking->booking_status, 'ملغ')) {
            return $this->error('هذا الحجز ملغى مسبقاً', 409);
        }
        if ($booking->payment_status === self::PAID) {
            return $this->error('تم سداد قيمة هذا الحجز، لذا يتم إلغاؤه واسترداد المبلغ عن طريق إدارة المنصة. يرجى التواصل مع الإدارة.', 409);
        }
        $trip = $model::find($booking->{$tripKey});
        $closed = $trip && ($kind === 'daily'
            ? ($booking->trip_date && $trip->bookingClosedReason(substr((string) $booking->trip_date, 0, 10)))
            : $trip->bookingClosedReason());
        if ($closed) {
            return $this->error('لا يمكن إلغاء الحجز بعد إغلاق باب الحجز على الرحلة. يرجى التواصل مع الإدارة.', 409);
        }

        DB::transaction(function () use ($table, $key, $tripTable, $tripKey, $booking, $bookingId, $kind, $trip, $label) {
            DB::table($table)->where($key, $bookingId)->update(['booking_status' => self::CANCELLED_BY_TOURIST]);
            if ($kind === 'weekly') {
                DB::table($tripTable)->where($tripKey, $booking->{$tripKey})->increment('available_seats', (int) $booking->number_of_seats);
            }
            $this->notify("admin-booking-cancel-{$bookingId}", 'admin', null, 'booking',
                "↩️ إلغاء حجز في رحلة {$label} ({$bookingId})",
                "ألغى السائح حجزه رقم ({$bookingId}) لعدد ({$booking->number_of_seats}) مقاعد في رحلة (" . ($trip?->trip_title ?? '') . ').',
                '/dashboard/admin');
        });

        return response()->json(['success' => true, 'message' => 'تم إلغاء الحجز وإتاحة المقاعد للحجز من جديد',
            'data' => $this->bookingRow($kind, $bookingId)]);
    }

    // Admin ticket desk: cash received and tourist checked in, in one step
    public function checkIn(string $kind, string $bookingId): JsonResponse
    {
        $booking = $this->bookingRow($kind, $bookingId);
        if ($booking && str_starts_with((string) $booking['booking_status'], 'ملغ')) {
            return $this->error("هذا الحجز ملغى ({$booking['booking_status']}) ولا يمكن تأكيد حضوره", 409);
        }
        $today = now('Africa/Tripoli')->toDateString();
        if ($booking && !empty($booking['trip_date']) && substr($booking['trip_date'], 0, 10) !== $today) {
            return $this->error('هذه التذكرة لرحلة بتاريخ (' . substr($booking['trip_date'], 0, 10) . ') وليست لرحلة اليوم', 409);
        }
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
