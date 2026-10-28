<?php

namespace App\Models;

use App\Support\ListInput;
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
        'property_type',
        'google_maps_url',
        'description',
        'working_hours',
        'discount_percentage',
        'contract_start_date',
        'contract_end_date',
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

    public function amenities()
    {
        return $this->hasMany(HotelAmenity::class, 'hotel_id', 'hotel_id');
    }

    public function privateTrips()
    {
        return $this->belongsToMany(PrivateTrip::class, 'hotels_trip_private', 'hotel_id', 'private_trip_id');
    }

    // Replaces the hotel's rows in hotel_amenities
    public function replaceAmenities($value): void
    {
        $this->amenities()->delete();
        foreach (ListInput::parse($value) as $amenity) {
            $this->amenities()->create(['amenity' => $amenity]);
        }
    }
}
