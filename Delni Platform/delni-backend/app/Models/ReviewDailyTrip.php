<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewDailyTrip extends Model
{
    protected $table = 'reviews_daily_trips';
    protected $primaryKey = 'review_daily_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'review_daily_id',
        'tourist_id',
        'daily_trip_id',
        'stars_rating',
        'comment_text',
        'created_at',
    ];

    protected $casts = [
        'stars_rating' => 'integer',
        'created_at' => 'datetime',
    ];

    public function tourist()
    {
        return $this->belongsTo(Tourist::class, 'tourist_id', 'tourist_id');
    }

    public function dailyTrip()
    {
        return $this->belongsTo(DailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }
}
