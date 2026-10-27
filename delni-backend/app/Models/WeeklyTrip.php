<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyTrip extends Model
{
    protected $table = 'weekly_trips';
    protected $primaryKey = 'weekly_trip_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'weekly_trip_id',
        'trip_title',
        'departure_city',
        'seat_per_price',
        'available_seats',
        'is_active',
        'start_date',
        'end_date',
        'max_capacity',
        'vehicle_plate',
        'guide_license_number',
        'photo_1',
        'photo_2',
        'photo_3',
        'photo_4',
        'photo_5',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
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

    public function restaurant()
    {
        return $this->belongsTo(RestaurantCafe::class, 'restaurant_id', 'facility_id');
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
}
