<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlaceTouristHighlight extends Model
{
    protected $table = 'places_tourist_highlights';
    protected $primaryKey = 'highlight_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'highlight_id',
        'place_id',
        'highlight_name',
        'display_order',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function place()
    {
        return $this->belongsTo(PlaceTourist::class, 'place_id', 'place_id');
    }
}
