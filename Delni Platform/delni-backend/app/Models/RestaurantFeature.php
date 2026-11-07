<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantFeature extends Model
{
    protected $table = 'restaurant_features';
    // Composite key (no single primary key column): rows are replaced per parent through the relation
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'facility_id',
        'feature',
    ];

    public function facility()
    {
        return $this->belongsTo(RestaurantCafe::class, 'facility_id', 'facility_id');
    }
}
