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
        'preferred_start_date',
        'duration_days',
        'number_of_companions',
        'quoted_price',
        'guide_license_number',
        'tourist_id',
        'customer_requirements',
        'vehicle_plate',
        'created_at',
        'additional_expenses',
    ];

    protected $casts = [
        'preferred_start_date' => 'date:Y-m-d',
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

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_plate', 'plate_number');
    }

    // Kept for existing callers that eager-load 'vehicles'
    public function vehicles()
    {
        return $this->vehicle();
    }

    public function hotels()
    {
        return $this->belongsToMany(Hotel::class, 'hotels_trip_private', 'private_trip_id', 'hotel_id');
    }

    public function stations()
    {
        return $this->hasMany(PrivateTripStation::class, 'private_trip_id', 'private_trip_id')
                    ->orderBy('day_number')->orderBy('station_order');
    }

    public function places()
    {
        return $this->belongsToMany(PlaceTourist::class, 'places_trip_private', 'private_trip_id', 'place_id')
                    ->withPivot('visit_order');
    }

    public function attractions()
    {
        return $this->places();
    }
}
