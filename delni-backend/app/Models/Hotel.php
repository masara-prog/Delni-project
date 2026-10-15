<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    protected $table = 'hotels';
    protected $primaryKey = 'hotel_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'hotel_name',
        'city',
        'address_details',
        'phone_number',
        'star_rating',
        'partnership_status',
        'hotel_photo_1',
        'hotel_photo_2',
        'hotel_photo_3',
        'hotel_photo_4',
        'hotel_photo_5',
        'contract_date',
        'verification_status',
        'property_type',
        'amenities',
    ];

    protected $casts = [
        'star_rating' => 'integer',
        'contract_date' => 'date',
    ];

    public function weeklyTrips()
    {
        return $this->belongsToMany(WeeklyTrip::class, 'hotels_trip_weekly', 'hotel_id', 'weekly_trip_id');
    }

    public function offers()
    {
        return $this->hasMany(OfferHotel::class, 'hotel_id', 'hotel_id');
    }

    public function reviews()
    {
        return $this->hasMany(ReviewHotel::class, 'hotel_id', 'hotel_id');
    }
}
