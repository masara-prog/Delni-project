<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class TourGuide extends Model
{
    use HasApiTokens;

    protected $table = 'tour_guides';
    protected $primaryKey = 'license_number';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'license_number',
        'full_name',
        'phone_number',
        'years_of_experience',
        'certificate',
        'certificate_name',
        'digital_certificate_file',
        'bio',
        'speaks_english',
        'speaks_french',
        'speaks_italian',
        'verification_status',
        'password',
        'email',
        'gender',
        'working_days',
        'operating_regions',
        'primaryRegion',
        'price_per_day',
        'avatar',
        'title',
        'specialties',
        'total_tours_completed',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'speaks_english' => 'boolean',
        'speaks_french' => 'boolean',
        'speaks_italian' => 'boolean',
        'years_of_experience' => 'integer',
        'price_per_day' => 'decimal:2',
        'total_tours_completed' => 'integer',
    ];

    public function dailyTrips()
    {
        return $this->hasMany(DailyTrip::class, 'guide_license_number', 'license_number');
    }

    public function weeklyTrips()
    {
        return $this->hasMany(WeeklyTrip::class, 'guide_license_number', 'license_number');
    }

    public function privateTrips()
    {
        return $this->hasMany(PrivateTrip::class, 'guide_license_number', 'license_number');
    }
}
