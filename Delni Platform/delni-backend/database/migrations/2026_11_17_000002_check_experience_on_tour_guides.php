<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// A guide has 2 to 40 years of experience (the API rule, now also in the database);
// same change as delniDatabase/upgrade_2026-11-17c.sql
return new class extends Migration
{
    private function exists(): bool
    {
        return DB::table('sys.check_constraints')
            ->whereRaw("parent_object_id = OBJECT_ID('dbo.tour_guides')")
            ->where('name', 'chk_experience')
            ->exists();
    }

    public function up(): void
    {
        if (!$this->exists()) {
            DB::statement('ALTER TABLE dbo.tour_guides WITH CHECK ADD CONSTRAINT chk_experience CHECK (years_of_experience >= 2 AND years_of_experience <= 40)');
        }
    }

    public function down(): void
    {
        if ($this->exists()) {
            DB::statement('ALTER TABLE dbo.tour_guides DROP CONSTRAINT chk_experience');
        }
    }
};
