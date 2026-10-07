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
        'vehicle_image',
        'vehicle_status',
        'insurance_details',
        'contract_number',
        'daily_rate',
        'category',
        'photos',
        'insurance_image',
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

    public function dailyTripAllocations()
    {
        return $this->hasMany(DailyTripVehicle::class, 'plate_number', 'plate_number');
    }

    public function weeklyTripAllocations()
    {
        return $this->hasMany(WeeklyTripVehicle::class, 'plate_number', 'plate_number');
    }

    public function privateTripAllocations()
    {
        return $this->hasMany(PrivateTripVehicle::class, 'plate_number', 'plate_number');
    }
}
