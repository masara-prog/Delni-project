<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideOperatingRegion extends Model
{
    protected $table = 'guide_operating_regions';
    // Composite key (no single primary key column): rows are replaced per parent through the relation
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'license_number',
        'region',
    ];

    public function guide()
    {
        return $this->belongsTo(TourGuide::class, 'license_number', 'license_number');
    }
}
