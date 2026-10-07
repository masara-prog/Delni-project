<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfferDailyTrip extends Model
{
    protected $table = 'offers_daily_trips';
    protected $primaryKey = 'offer_daily_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'offer_daily_id',
        'daily_trip_id',
        'offer_title',
        'description',
        'percent_discount',
        'offer_image_url',
        'start_date',
        'end_date',
        'badge',
    ];

    protected $casts = [
        'percent_discount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function dailyTrip()
    {
        return $this->belongsTo(DailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }
}
