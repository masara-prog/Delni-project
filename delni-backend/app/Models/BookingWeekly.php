<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingWeekly extends Model
{
    protected $table = 'bookings_weekly';
    protected $primaryKey = 'booking_weekly_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'booking_weekly_id',
        'tourist_id',
        'weekly_trip_id',
        'booking_date',
        'number_of_seats',
        'total_price',
        'booking_status',
        'booking_notes',
        'passengers_names',
        'payment_status',
        'attended',
    ];

    protected $casts = [
        'booking_date' => 'datetime',
        'number_of_seats' => 'integer',
        'total_price' => 'decimal:2',
        'attended' => 'boolean',
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
