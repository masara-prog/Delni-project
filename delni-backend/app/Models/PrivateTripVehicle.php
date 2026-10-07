<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrivateTripVehicle extends Model
{
    protected $table = 'private_trip_vehicles';
    protected $primaryKey = 'private_alloc_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'private_alloc_id',
        'private_trip_id',
        'plate_number',
        'start_date',
        'end_date',
        'allocation_status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function privateTrip()
    {
        return $this->belongsTo(PrivateTrip::class, 'private_trip_id', 'private_trip_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'plate_number', 'plate_number');
    }
}
