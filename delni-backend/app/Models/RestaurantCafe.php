<?php

namespace App\Models;

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
        'contract_date',
        'verification_status',
        'working_hours',
        'features',
    ];

    protected $casts = [
        'contract_date' => 'date',
    ];

    public function offers()
    {
        return $this->hasMany(OfferFacility::class, 'facility_id', 'facility_id');
    }

    public function reviews()
    {
        return $this->hasMany(ReviewFacility::class, 'facility_id', 'facility_id');
    }
}
