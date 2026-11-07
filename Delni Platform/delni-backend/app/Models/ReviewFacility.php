<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewFacility extends Model
{
    protected $table = 'reviews_facilities';
    protected $primaryKey = 'review_facility_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'review_facility_id',
        'tourist_id',
        'facility_id',
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

    public function facility()
    {
        return $this->belongsTo(RestaurantCafe::class, 'facility_id', 'facility_id');
    }
}
