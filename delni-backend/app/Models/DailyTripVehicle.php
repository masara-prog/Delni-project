<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyTripVehicle extends Model
{
    protected $table = 'daily_trip_vehicles';
    protected $primaryKey = 'daily_alloc_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'daily_alloc_id',
        'daily_trip_id',
        'plate_number',
        'allocation_date',
        'status',
    ];

    protected $casts = [
        'allocation_date' => 'date',
    ];

    public function dailyTrip()
    {
        return $this->belongsTo(DailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'plate_number', 'plate_number');
    }
}
