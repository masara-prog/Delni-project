<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Tourist extends Model
{
    use HasApiTokens;

    protected $table = 'tourists';
    protected $primaryKey = 'tourist_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'tourist_id',
        'full_name',
        'email',
        'phone_number',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    public function dailyBookings()
    {
        return $this->hasMany(BookingDaily::class, 'tourist_id', 'tourist_id');
    }

    public function weeklyBookings()
    {
        return $this->hasMany(BookingWeekly::class, 'tourist_id', 'tourist_id');
    }

    public function privateTrips()
    {
        return $this->hasMany(PrivateTrip::class, 'tourist_id', 'tourist_id');
    }

    public function dailyReviews()
    {
        return $this->hasMany(ReviewDailyTrip::class, 'tourist_id', 'tourist_id');
    }

    public function weeklyReviews()
    {
        return $this->hasMany(ReviewWeeklyTrip::class, 'tourist_id', 'tourist_id');
    }

    public function hotelReviews()
    {
        return $this->hasMany(ReviewHotel::class, 'tourist_id', 'tourist_id');
    }

    public function facilityReviews()
    {
        return $this->hasMany(ReviewFacility::class, 'tourist_id', 'tourist_id');
    }
}
