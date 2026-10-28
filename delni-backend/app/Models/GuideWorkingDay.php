<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideWorkingDay extends Model
{
    protected $table = 'guide_working_days';
    // Composite key (no single primary key column): rows are replaced per parent through the relation
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'license_number',
        'day_of_week',
    ];

    public function guide()
    {
        return $this->belongsTo(TourGuide::class, 'license_number', 'license_number');
    }
}
