<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TouristFavorite extends Model
{
    protected $table = 'tourist_favorites';
    protected $primaryKey = 'favorite_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'favorite_id',
        'tourist_id',
        'item_type',
        'item_id',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function tourist()
    {
        return $this->belongsTo(Tourist::class, 'tourist_id', 'tourist_id');
    }
}
