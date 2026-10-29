<?php

namespace App\Models;

use App\Support\ListInput;
use Illuminate\Database\Eloquent\Model;

class RestaurantCafe extends Model
{
    protected $table = 'restaurants_cafes';
    protected $primaryKey = 'facility_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'facility_id',
        'facility_name',
        'facility_type',
        'city',
        'address_details',
        'phone_number',
        'description',
        'facility_image_1',
        'facility_image_2',
        'facility_image_3',
        'facility_image_4',
        'facility_image_5',
        'working_hours',
        'google_maps_url',
        'discount_percentage',
        'contract_start_date',
        'contract_end_date',
        'partnership_status',
    ];

    protected $casts = [
        'discount_percentage' => 'integer',
        'contract_start_date' => 'date:Y-m-d',
        'contract_end_date' => 'date:Y-m-d',
    ];

    public function offers()
    {
        return $this->hasMany(OfferFacility::class, 'facility_id', 'facility_id');
    }

    public function reviews()
    {
        return $this->hasMany(ReviewFacility::class, 'facility_id', 'facility_id');
    }

    public function features()
    {
        return $this->hasMany(RestaurantFeature::class, 'facility_id', 'facility_id');
    }

    public function dailyTrips()
    {
        return $this->hasMany(DailyTrip::class, 'restaurant_id', 'facility_id');
    }

    public function weeklyTrips()
    {
        return $this->belongsToMany(WeeklyTrip::class, 'restaurants_trip_weekly', 'facility_id', 'weekly_trip_id');
    }

    // Replaces the facility's rows in restaurant_features
    public function replaceFeatures($value): void
    {
        $this->features()->delete();
        foreach (ListInput::parse($value) as $feature) {
            $this->features()->create(['feature' => $feature]);
        }
    }
}
