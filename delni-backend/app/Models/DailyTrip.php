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
        'photo',
        'max_capacity',
        'available_seats',
        'guide_license_number',
        'departure_city',
        'destination_city',
        'recurring_days',
        'activities',
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

    public function bookings()
    {
        return $this->hasMany(BookingDaily::class, 'daily_trip_id', 'daily_trip_id');
    }

    public function vehicleAllocations()
    {
        return $this->hasMany(DailyTripVehicle::class, 'daily_trip_id', 'daily_trip_id');
    }

    public function vehicles()
    {
        return $this->belongsToMany(Vehicle::class, 'daily_trip_vehicles', 'daily_trip_id', 'plate_number');
    }

    public function offers()
    {
        return $this->hasMany(OfferDailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }

    public function reviews()
    {
        return $this->hasMany(ReviewDailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }
}
