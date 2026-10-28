<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyTrip extends Model
{
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
    ];

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

    // On a day the trip runs (no stored days = every day), booking for that day closes at 07:00 Libya time
    public function bookingClosedReason(): ?string
    {
        $now = now('Africa/Tripoli');
        $normalize = fn ($d) => str_replace('إ', 'ا', trim((string) $d));
        $dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        $runDays = $this->days()->pluck('day_of_week')->map($normalize)->all();
        $runsToday = empty($runDays) || in_array($normalize($dayNames[$now->dayOfWeek]), $runDays, true);

        return $runsToday && $now->hour >= 7
            ? 'عذراً، تم إغلاق الحجز على رحلة اليوم. يُقفل الحجز على الرحلات اليومية الساعة 7 صباحاً من يوم الرحلة.'
            : null;
    }
}
