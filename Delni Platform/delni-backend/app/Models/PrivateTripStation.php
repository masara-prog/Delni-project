<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrivateTripStation extends Model
{
    protected $table = 'private_trip_stations';
    protected $primaryKey = 'station_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'station_id',
        'private_trip_id',
        'day_number',
        'station_order',
        'station_title',
        'station_time',
        'station_desc',
    ];

    public function privateTrip()
    {
        return $this->belongsTo(PrivateTrip::class, 'private_trip_id', 'private_trip_id');
    }
}
