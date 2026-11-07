<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Driver extends Model
{
    use HasApiTokens;

    protected $table = 'drivers';
    protected $primaryKey = 'driver_license_number';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'driver_license_number',
        'full_name',
        'phone_number',
        'national_id_or_passport',
        'license_date_valid',
        'contract_number',
        'assigned_vehicle_plate',
        'email',
        'account_status',
        'password',
        'operational_status',
        'current_trip_stage',
    ];

    // Stages the driver reports during a trip (stored in drivers.current_trip_stage)
    public const TRIP_STAGES = ['في الانتظار', 'تم الانطلاق', 'في الطريق - استراحة', 'وصلنا الوجهة', 'مكتملة'];

    // Stage => the stages that may follow it (a rest or a destination can lead back to driving; a completed trip starts over)
    public const STAGE_TRANSITIONS = [
        'في الانتظار' => ['تم الانطلاق'],
        'تم الانطلاق' => ['في الطريق - استراحة', 'وصلنا الوجهة'],
        'في الطريق - استراحة' => ['تم الانطلاق', 'وصلنا الوجهة'],
        'وصلنا الوجهة' => ['تم الانطلاق', 'مكتملة'],
        'مكتملة' => ['في الانتظار'],
    ];

    // Stages during which the driver is on the road with passengers
    public const ON_TRIP_STAGES = ['تم الانطلاق', 'في الطريق - استراحة', 'وصلنا الوجهة'];

    // Operational statuses; the driver chooses the first two, "في رحلة" is set by the trip stages
    public const OPERATIONAL_STATUSES = ['متاح', 'إجازة', 'في رحلة'];
    public const SUSPENDED = 'موقوف';

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'license_date_valid' => 'date:Y-m-d',
    ];

    public function company()
    {
        return $this->belongsTo(TransportationCompany::class, 'contract_number', 'contract_number');
    }

    public function assignedVehicle()
    {
        return $this->belongsTo(Vehicle::class, 'assigned_vehicle_plate', 'plate_number');
    }

    public function isOnTrip(): bool
    {
        return in_array($this->current_trip_stage, self::ON_TRIP_STAGES, true);
    }

    // Why this driver may not work right now (account or company suspended), or null
    public function blockedReason(): ?string
    {
        if ($this->account_status === self::SUSPENDED) {
            return 'حساب السائق موقوف من قبل شركة النقل. يرجى التواصل مع الشركة.';
        }
        if ($this->company()->value('verification_status') === 'موقوفة') {
            return 'شركة النقل التي تتبع لها موقوفة من قبل إدارة المنصة، فلا يمكنك استخدام حسابك حالياً.';
        }
        return null;
    }

    /**
     * The trips the admin assigned to this driver's vehicle that are still ahead or running, once their guide accepted:
     * daily trips (next run date and the passengers booked on it), weekly trips not ended, confirmed private trips.
     */
    public function assignedTrips(): array
    {
        $plate = $this->assigned_vehicle_plate;
        if (!$plate) {
            return [];
        }
        $today = now('Africa/Tripoli')->toDateString();
        $approved = fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', WeeklyTrip::GUIDE_APPROVED);
        $trips = [];
        foreach (DailyTrip::with('days')->where('vehicle_plate', $plate)->where('is_active', true)->where($approved)->get() as $t) {
            $next = $t->openDates(1)[0] ?? null;
            $trips[] = ['kind' => 'يومية', 'id' => $t->daily_trip_id, 'title' => $t->trip_title,
                'schedule' => ($t->days->pluck('day_of_week')->implode('، ') ?: 'يومياً') . ($next ? " — الرحلة القادمة {$next['date']}" : ''),
                'departure_city' => $t->departure_city, 'passengers' => $next ? $t->max_capacity - $next['seats_left'] : 0];
        }
        foreach (WeeklyTrip::where('vehicle_plate', $plate)->where('is_active', true)->where('end_date', '>=', $today)
            ->where($approved)->orderBy('start_date')->get() as $t) {
            $trips[] = ['kind' => 'أسبوعية', 'id' => $t->weekly_trip_id, 'title' => $t->trip_title,
                'schedule' => $t->start_date->format('Y-m-d') . ' إلى ' . $t->end_date->format('Y-m-d'),
                'departure_city' => $t->departure_city, 'passengers' => $t->max_capacity - $t->available_seats];
        }
        // A private trip stays listed until its last day (start date + duration), not only until it starts
        foreach (PrivateTrip::where('vehicle_plate', $plate)->where('status_order', 'مؤكدة')
            ->whereRaw('DATEADD(day, duration_days - 1, preferred_start_date) >= ?', [$today])->orderBy('preferred_start_date')->get() as $t) {
            $trips[] = ['kind' => 'خاصة', 'id' => $t->private_trip_id, 'title' => 'رحلة خاصة',
                'schedule' => $t->preferred_start_date->format('Y-m-d') . " لمدة {$t->duration_days} أيام",
                'departure_city' => null, 'passengers' => (int) $t->number_of_companions];
        }
        return $trips;
    }
}
