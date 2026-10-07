<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingDaily extends Model
{
    protected $table = 'bookings_daily';
    protected $primaryKey = 'booking_daily_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'booking_daily_id',
        'tourist_id',
        'daily_trip_id',
        'booking_date',
        'number_of_seats',
        'booking_status',
        'total_price',
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

    public function dailyTrip()
    {
        return $this->belongsTo(DailyTrip::class, 'daily_trip_id', 'daily_trip_id');
    }
}
