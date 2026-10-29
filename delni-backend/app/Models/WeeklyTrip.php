<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyTrip extends Model
{
    // guide_approval_status: the trip is published only once its guide accepts it (NULL = trips from before this step)
    public const GUIDE_PENDING = 'بانتظار رد المرشد';
    public const GUIDE_APPROVED = 'وافق المرشد';
    public const GUIDE_DECLINED = 'اعتذر المرشد';

    protected $table = 'weekly_trips';
    protected $primaryKey = 'weekly_trip_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'weekly_trip_id',
        'trip_title',
        'start_date',
        'end_date',
        'max_capacity',
        'available_seats',
        'seat_per_price',
        'guide_license_number',
        'is_active',
        'departure_city',
        'vehicle_plate',
        'photo_1',
        'photo_2',
        'photo_3',
        'photo_4',
        'photo_5',
        'trip_description',
        'guide_approval_status',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'seat_per_price' => 'decimal:2',
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

    public function restaurants()
    {
        return $this->belongsToMany(RestaurantCafe::class, 'restaurants_trip_weekly', 'weekly_trip_id', 'facility_id');
    }

    public function stations()
    {
        return $this->hasMany(WeeklyTripStation::class, 'weekly_trip_id', 'weekly_trip_id')
                    ->orderBy('day_number')->orderBy('station_order');
    }

    public function bookings()
    {
        return $this->hasMany(BookingWeekly::class, 'weekly_trip_id', 'weekly_trip_id');
    }

    public function hotels()
    {
        return $this->belongsToMany(Hotel::class, 'hotels_trip_weekly', 'weekly_trip_id', 'hotel_id');
    }

    public function places()
    {
        return $this->belongsToMany(PlaceTourist::class, 'places_trip_weekly', 'weekly_trip_id', 'place_id');
    }

    public function offers()
    {
        return $this->hasMany(OfferWeeklyTrip::class, 'weekly_trip_id', 'weekly_trip_id');
    }

    public function reviews()
    {
        return $this->hasMany(ReviewWeeklyTrip::class, 'weekly_trip_id', 'weekly_trip_id');
    }

    // Booking closes 24 hours before departure (start of the start_date day, Libya time)
    public function bookingClosedReason(): ?string
    {
        if ($this->guide_approval_status !== null && $this->guide_approval_status !== self::GUIDE_APPROVED) {
            return 'هذه الرحلة الأسبوعية غير متاحة للحجز بعد، فهي بانتظار موافقة المرشد السياحي.';
        }
        if (empty($this->start_date)) {
            return null;
        }
        $departure = \Carbon\Carbon::parse($this->start_date)->format('Y-m-d');
        $departure = \Carbon\Carbon::parse($departure, 'Africa/Tripoli')->startOfDay();

        return now('Africa/Tripoli')->gte($departure->copy()->subDay())
            ? 'عذراً، تم إغلاق استقبال الحجوزات لهذه الرحلة الأسبوعية! يُقفل الحجز تلقائياً قبل موعد انطلاق الرحلة بـ 24 ساعة.'
            : null;
    }
}
