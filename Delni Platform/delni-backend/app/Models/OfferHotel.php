<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfferHotel extends Model
{
    protected $table = 'offers_hotels';
    protected $primaryKey = 'id_offer';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_offer',
        'title_offer',
        'description',
        'percent_discount',
        'offer_image',
        'hotel_id',
        'date_start',
        'date_end',
        'badge',
    ];

    protected $casts = [
        'percent_discount' => 'integer',
        'date_start' => 'date',
        'date_end' => 'date',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id', 'hotel_id');
    }
}
