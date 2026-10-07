<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlaceTourist extends Model
{
    protected $table = 'places_tourist';
    protected $primaryKey = 'place_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'place_id',
        'place_name',
        'description',
        'city',
        'longitude',
        'latitude',
        'category',
        'place_image',
        'is_unesco',
        'unesco_year',
        'gallery',
        'entry_fee',
        'google_maps_url',
    ];

    protected $casts = [
        'is_unesco' => 'boolean',
        'unesco_year' => 'integer',
        'longitude' => 'decimal:6',
        'latitude' => 'decimal:6',
    ];

    public function weeklyTrips()
    {
        return $this->belongsToMany(WeeklyTrip::class, 'places_trip_weekly', 'place_id', 'weekly_trip_id');
    }
}
