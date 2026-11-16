<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// When a guide registered (newest applications first in the admin's verification table);
// same change as delniDatabase/upgrade_2026-11-17.sql
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('tour_guides', 'created_at')) {
            DB::statement('ALTER TABLE tour_guides ADD created_at DATETIME NULL CONSTRAINT DF_tour_guides_created_at DEFAULT (GETDATE())');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tour_guides', 'created_at')) {
            DB::statement('ALTER TABLE tour_guides DROP CONSTRAINT DF_tour_guides_created_at');
            DB::statement('ALTER TABLE tour_guides DROP COLUMN created_at');
        }
    }
};
