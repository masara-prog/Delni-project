<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyTrip extends Model
{
    // guide_approval_status: like weekly trips, the trip is published only once its guide accepts it (NULL = trips from before this step)
    public const GUIDE_PENDING = WeeklyTrip::GUIDE_PENDING;
    public const GUIDE_APPROVED = WeeklyTrip::GUIDE_APPROVED;
    public const GUIDE_DECLINED = WeeklyTrip::GUIDE_DECLINED;

    protected $table = 'daily_trips';
    protected $primaryKey = 'daily_trip_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'daily_trip_id',
        'trip_title',
        'description',
        'price_per_seat',
        'is_active',
        'max_capacity',
        'available_seats',
        'guide_license_number',
        'departure_city',
        'vehicle_plate',
        'restaurant_id',
        'photo_1',
        'photo_2',
        'photo_3',
        'photo_4',
        'photo_5',
        'guide_approval_status',
    ];
    // available_seats is not used for daily trips: seats are counted per run date (seatsLeft)

    protected $casts = [
        'is_active' => 'boolean',
        'price_per_seat' => 'decimal:2',
        'max_capacity' => 'integer',
        'available_seats' => 'integer',
    ];

    public function guide()
    {
        return $this->belongsTo(TourGuide::class, 'guide_license_number', 'license_number');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_plate', 'plate_number');
    }

    public function vehicles()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_plate', 'plate_number');
    }

    public function restaurant()
    {
        return $this->belongsTo(RestaurantCafe::class, 'restaurant_id', 'facility_id');
    }

    public function bookings()
    {
        return $this->hasMany(BookingDaily::class, 'daily_trip_id', 'daily_trip_id');
    }

    public function offers()
    {
        return $this->hasMany(OfferDailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }

    public function reviews()
    {
        return $this->hasMany(ReviewDailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }

    public function places()
    {
        return $this->belongsToMany(PlaceTourist::class, 'places_trip_daily', 'daily_trip_id', 'place_id');
    }

    public function days()
    {
        return $this->hasMany(DailyTripDay::class, 'daily_trip_id', 'daily_trip_id');
    }

    public function stations()
    {
        return $this->hasMany(DailyTripStation::class, 'daily_trip_id', 'daily_trip_id')->orderBy('station_order');
    }

    // Weekday names in Carbon's dayOfWeek order (0 = Sunday)
    private const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    // A tourist books one run date at most this many days ahead
    public const BOOKING_HORIZON_DAYS = 60;
    // Booking for a date closes at 07:00 Libya time on that date
    private const CLOSING_HOUR = 7;

    private static function normalizeDay(?string $day): string
    {
        return str_replace('إ', 'ا', trim((string) $day));
    }

    // The trip runs every week on its stored days (no stored days = every day)
    public function runsOn(\Carbon\CarbonInterface $date): bool
    {
        $this->runDays ??= $this->days()->pluck('day_of_week')->map(fn ($d) => self::normalizeDay($d))->all();
        return empty($this->runDays) || in_array(self::normalizeDay(self::DAY_NAMES[$date->dayOfWeek]), $this->runDays, true);
    }

    private ?array $runDays = null;

    // Why the trip can't be booked for this date (Y-m-d), or null when it can
    public function bookingClosedReason(string $date): ?string
    {
        if ($this->guide_approval_status !== null && $this->guide_approval_status !== self::GUIDE_APPROVED) {
            return 'هذه الرحلة اليومية غير متاحة للحجز بعد، فهي بانتظار موافقة المرشد السياحي.';
        }
        $now = now('Africa/Tripoli');
        $day = \Carbon\Carbon::parse($date, 'Africa/Tripoli')->startOfDay();
        if ($day->lt($now->copy()->startOfDay())) {
            return 'لا يمكن الحجز في تاريخ مضى.';
        }
        if ($day->gt($now->copy()->startOfDay()->addDays(self::BOOKING_HORIZON_DAYS))) {
            return 'يمكن الحجز قبل موعد الرحلة بـ ' . self::BOOKING_HORIZON_DAYS . ' يوماً كحد أقصى.';
        }
        if (!$this->runsOn($day)) {
            return 'هذه الرحلة لا تنطلق في يوم ' . self::DAY_NAMES[$day->dayOfWeek] . '. يرجى اختيار أحد أيام انطلاقها.';
        }
        if ($day->isSameDay($now) && $now->hour >= self::CLOSING_HOUR) {
            return 'عذراً، تم إغلاق الحجز على رحلة اليوم. يُقفل الحجز على الرحلات اليومية الساعة 7 صباحاً من يوم الرحلة.';
        }
        return null;
    }

    // Seats still free on one run date: the capacity minus the seats of that date's bookings that were not cancelled
    public function seatsLeft(string $date): int
    {
        $taken = (int) \Illuminate\Support\Facades\DB::table('bookings_daily')
            ->where('daily_trip_id', $this->daily_trip_id)->where('trip_date', $date)
            ->where('booking_status', 'not like', 'ملغ%')->sum('number_of_seats');
        return max(0, (int) $this->max_capacity - $taken);
    }

    // The next dates that can still be booked, with their free seats: [['date' => 'Y-m-d', 'day' => 'السبت', 'seats_left' => 12], ...]
    public function openDates(int $limit = 8): array
    {
        $dates = [];
        $day = now('Africa/Tripoli')->startOfDay();
        for ($i = 0; $i <= self::BOOKING_HORIZON_DAYS && count($dates) < $limit; $i++, $day->addDay()) {
            $date = $day->toDateString();
            if ($this->bookingClosedReason($date) === null) {
                $dates[] = ['date' => $date, 'day' => self::DAY_NAMES[$day->dayOfWeek], 'seats_left' => $this->seatsLeft($date)];
            }
        }
        return $dates;
    }
}
