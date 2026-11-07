<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewWeeklyTrip extends Model
{
    protected $table = 'reviews_weekly_trips';
    protected $primaryKey = 'review_weekly_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'review_weekly_id',
        'tourist_id',
        'weekly_trip_id',
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

    public function weeklyTrip()
    {
        return $this->belongsTo(WeeklyTrip::class, 'weekly_trip_id', 'weekly_trip_id');
    }
}
