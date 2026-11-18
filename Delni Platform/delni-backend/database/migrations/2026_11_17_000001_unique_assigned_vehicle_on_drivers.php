<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// One driver per vehicle: assigned_vehicle_plate is unique among drivers that have a vehicle (NULL stays allowed);
// same change as delniDatabase/upgrade_2026-11-17b.sql
return new class extends Migration
{
    private function exists(): bool
    {
        return DB::table('sys.indexes')
            ->whereRaw("object_id = OBJECT_ID('dbo.drivers')")
            ->where('name', 'UQ_drivers_assigned_vehicle_plate')
            ->exists();
    }

    public function up(): void
    {
        if (!$this->exists()) {
            DB::statement('CREATE UNIQUE NONCLUSTERED INDEX UQ_drivers_assigned_vehicle_plate ON dbo.drivers (assigned_vehicle_plate) WHERE assigned_vehicle_plate IS NOT NULL');
        }
    }

    public function down(): void
    {
        if ($this->exists()) {
            DB::statement('DROP INDEX UQ_drivers_assigned_vehicle_plate ON dbo.drivers');
        }
    }
};
