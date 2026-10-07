<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfferWeeklyTrip extends Model
{
    protected $table = 'offers_weekly_trips';
    protected $primaryKey = 'offer_weekly_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'offer_weekly_id',
        'weekly_trip_id',
        'offer_title',
        'description',
        'discount_percentage',
        'offer_image_url',
        'start_date',
        'end_date',
        'badge',
    ];

    protected $casts = [
        'discount_percentage' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function weeklyTrip()
    {
        return $this->belongsTo(WeeklyTrip::class, 'weekly_trip_id', 'weekly_trip_id');
    }
}
