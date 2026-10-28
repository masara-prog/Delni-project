<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class TransportationCompany extends Model
{
    use HasApiTokens;

    protected $table = 'transportation_companies';
    protected $primaryKey = 'contract_number';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'contract_number',
        'company_name',
        'phone_number',
        'total_vehicles',
        'verification_status',
        'email',
        'password',
        'city',
        'contract_start_date',
        'contract_end_date',
        'google_maps_url',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'total_vehicles' => 'integer',
        'available_vehicles' => 'integer',
        'contract_date' => 'date',
        'contract_start_date' => 'date',
        'contract_end_date' => 'date',
    ];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'contract_number', 'contract_number');
    }

    public function drivers()
    {
        return $this->hasMany(Driver::class, 'contract_number', 'contract_number');
    }
}
