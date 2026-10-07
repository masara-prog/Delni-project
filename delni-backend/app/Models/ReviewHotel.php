<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewHotel extends Model
{
    protected $table = 'reviews_hotels';
    protected $primaryKey = 'review_hotel_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'review_hotel_id',
        'tourist_id',
        'hotel_id',
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

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id', 'hotel_id');
    }
}
