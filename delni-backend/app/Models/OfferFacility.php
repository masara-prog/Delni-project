<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfferFacility extends Model
{
    protected $table = 'offers_facilities';
    protected $primaryKey = 'facility_offer_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'facility_offer_id',
        'facility_id',
        'description',
        'offer_title',
        'offer_image_url',
        'discount_percentage',
        'start_date',
        'end_date',
        'badge',
    ];

    protected $casts = [
        'discount_percentage' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function facility()
    {
        return $this->belongsTo(RestaurantCafe::class, 'facility_id', 'facility_id');
    }
}
