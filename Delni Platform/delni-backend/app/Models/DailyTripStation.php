<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyTripStation extends Model
{
    protected $table = 'daily_trip_stations';
    protected $primaryKey = 'station_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'station_id',
        'daily_trip_id',
        'station_order',
        'station_title',
        'station_time',
        'station_desc',
    ];

    public function dailyTrip()
    {
        return $this->belongsTo(DailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }
}
