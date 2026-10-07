<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrivateTrip extends Model
{
    protected $table = 'private_trips';
    protected $primaryKey = 'private_trip_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'private_trip_id',
        'status_order',
        'customer_description',
        'preferred_start_date',
        'duration_days',
        'number_of_companions',
        'quoted_price',
        'admin_itinerary_plan',
        'guide_license_number',
        'tourist_id',
        'customer_name',
        'customer_phone',
        'customer_requirements',
    ];

    protected $casts = [
        'preferred_start_date' => 'date',
        'duration_days' => 'integer',
        'number_of_companions' => 'integer',
        'quoted_price' => 'decimal:2',
    ];

    public function tourist()
    {
        return $this->belongsTo(Tourist::class, 'tourist_id', 'tourist_id');
    }

    public function guide()
    {
        return $this->belongsTo(TourGuide::class, 'guide_license_number', 'license_number');
    }

    public function vehicleAllocations()
    {
        return $this->hasMany(PrivateTripVehicle::class, 'private_trip_id', 'private_trip_id');
    }

    public function vehicles()
    {
        return $this->belongsToMany(Vehicle::class, 'private_trip_vehicles', 'private_trip_id', 'plate_number');
    }
}
