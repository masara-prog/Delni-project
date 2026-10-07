<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyTripVehicle extends Model
{
    protected $table = 'weekly_trip_vehicles';
    protected $primaryKey = 'weekly_alloc_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'weekly_alloc_id',
        'weekly_trip_id',
        'plate_number',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function weeklyTrip()
    {
        return $this->belongsTo(WeeklyTrip::class, 'weekly_trip_id', 'weekly_trip_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'plate_number', 'plate_number');
    }
}
