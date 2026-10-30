<?php

namespace App\Models;

use App\Support\ListInput;
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
        'bio',
        'speaks_english',
        'speaks_french',
        'speaks_italian',
        'verification_status',
        'password',
        'email',
        'gender',
        'price_per_day',
        'avatar',
        'digital_certificate_file',
        'license_expiry_date',
        'rejection_reason',
        'availability_status',
    ];

    public const AVAILABLE = 'متاح';
    public const ON_LEAVE = 'إجازة';
    public const AVAILABILITY = [self::AVAILABLE, self::ON_LEAVE];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'speaks_english' => 'boolean',
        'speaks_french' => 'boolean',
        'speaks_italian' => 'boolean',
        'years_of_experience' => 'integer',
        'price_per_day' => 'decimal:2',
        'license_expiry_date' => 'date:Y-m-d',
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

    public function workingDays()
    {
        return $this->hasMany(GuideWorkingDay::class, 'license_number', 'license_number');
    }

    public function operatingRegions()
    {
        return $this->hasMany(GuideOperatingRegion::class, 'license_number', 'license_number');
    }

    public function places()
    {
        return $this->belongsToMany(PlaceTourist::class, 'guide_places', 'license_number', 'place_id');
    }

    // Replaces the guide's rows in guide_working_days / guide_operating_regions
    public function replaceWorkingDays($value): void
    {
        $this->workingDays()->delete();
        foreach (ListInput::dayNames($value) as $day) {
            $this->workingDays()->create(['day_of_week' => $day]);
        }
    }

    // Replaces the guide's landmarks of expertise in guide_places (unknown place ids are ignored, as the bridge did)
    public function replacePlaces($value): void
    {
        $ids = array_map(fn ($p) => is_array($p) ? ($p['place_id'] ?? $p['id'] ?? '') : $p, (array) $value);
        $valid = PlaceTourist::whereIn('place_id', ListInput::parse($ids))->pluck('place_id')->all();
        $this->places()->sync($valid);
    }

    public function replaceOperatingRegions($value): void
    {
        $this->operatingRegions()->delete();
        foreach (ListInput::parse($value) as $region) {
            $this->operatingRegions()->create(['region' => $region]);
        }
    }
}
