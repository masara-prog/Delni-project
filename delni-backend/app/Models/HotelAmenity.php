<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HotelAmenity extends Model
{
    protected $table = 'hotel_amenities';
    // Composite key (no single primary key column): rows are replaced per parent through the relation
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'amenity',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id', 'hotel_id');
    }
}
