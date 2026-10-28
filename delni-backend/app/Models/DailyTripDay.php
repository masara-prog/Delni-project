<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyTripDay extends Model
{
    protected $table = 'daily_trip_days';
    // Composite key (no single primary key column): rows are replaced per parent through the relation
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'daily_trip_id',
        'day_of_week',
    ];

    public function dailyTrip()
    {
        return $this->belongsTo(DailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }
}
