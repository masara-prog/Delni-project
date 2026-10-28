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
        'google_maps_url',
        'region',
        'highlights',
    ];

    protected $casts = [
        'longitude' => 'decimal:6',
        'latitude' => 'decimal:6',
    ];

    public function weeklyTrips()
    {
        return $this->belongsToMany(WeeklyTrip::class, 'places_trip_weekly', 'place_id', 'weekly_trip_id');
    }

    public function dailyTrips()
    {
        return $this->belongsToMany(DailyTrip::class, 'places_trip_daily', 'place_id', 'daily_trip_id');
    }

    public function privateTrips()
    {
        return $this->belongsToMany(PrivateTrip::class, 'places_trip_private', 'place_id', 'private_trip_id')->withPivot('visit_order');
    }

    public function highlightItems()
    {
        return $this->hasMany(PlaceTouristHighlight::class, 'place_id', 'place_id')->orderBy('display_order');
    }

    public function guides()
    {
        return $this->belongsToMany(TourGuide::class, 'guide_places', 'place_id', 'license_number');
    }
}
