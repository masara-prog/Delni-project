<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyTripStation extends Model
{
    protected $table = 'weekly_trip_stations';
    protected $primaryKey = 'station_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'station_id',
        'weekly_trip_id',
        'station_order',
        'day_number',
        'station_title',
        'station_desc',
    ];

    public function weeklyTrip()
    {
        return $this->belongsTo(WeeklyTrip::class, 'weekly_trip_id', 'weekly_trip_id');
    }
}
