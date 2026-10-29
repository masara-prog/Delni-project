<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Driver extends Model
{
    use HasApiTokens;

    protected $table = 'drivers';
    protected $primaryKey = 'driver_license_number';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'driver_license_number',
        'full_name',
        'phone_number',
        'national_id_or_passport',
        'license_date_valid',
        'contract_number',
        'assigned_vehicle_plate',
        'email',
        'account_status',
        'password',
        'operational_status',
    ];

    // Stages the driver reports during a trip (stored in drivers.current_trip_stage)
    public const TRIP_STAGES = ['في الانتظار', 'تم الانطلاق', 'في الطريق - استراحة', 'وصلنا الوجهة', 'مكتملة'];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'license_date_valid' => 'date:Y-m-d',
    ];

    public function company()
    {
        return $this->belongsTo(TransportationCompany::class, 'contract_number', 'contract_number');
    }

    public function assignedVehicle()
    {
        return $this->belongsTo(Vehicle::class, 'assigned_vehicle_plate', 'plate_number');
    }
}
