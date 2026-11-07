<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $table = 'vehicles';
    protected $primaryKey = 'plate_number';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'plate_number',
        'vehicle_type',
        'seating_capacity',
        'vehicle_status',
        'contract_number',
        'daily_rate',
        'category',
        'insurance_image',
        'vehicle_image',
    ];

    protected $casts = [
        'seating_capacity' => 'integer',
        'daily_rate' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(TransportationCompany::class, 'contract_number', 'contract_number');
    }

    public function driver()
    {
        return $this->hasOne(Driver::class, 'assigned_vehicle_plate', 'plate_number');
    }

    // Trips reference their vehicle directly through vehicle_plate
    public function dailyTrips()
    {
        return $this->hasMany(DailyTrip::class, 'vehicle_plate', 'plate_number');
    }

    public function weeklyTrips()
    {
        return $this->hasMany(WeeklyTrip::class, 'vehicle_plate', 'plate_number');
    }

    public function privateTrips()
    {
        return $this->hasMany(PrivateTrip::class, 'vehicle_plate', 'plate_number');
    }
}
