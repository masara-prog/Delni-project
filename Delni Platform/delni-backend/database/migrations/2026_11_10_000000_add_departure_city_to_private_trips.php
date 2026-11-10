<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// The city a private trip leaves from (طرابلس or بنغازي); same change as delniDatabase/upgrade_2026-11-10.sql
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('private_trips', 'departure_city')) {
            Schema::table('private_trips', function (Blueprint $table) {
                $table->string('departure_city', 50)->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('private_trips', 'departure_city')) {
            Schema::table('private_trips', function (Blueprint $table) {
                $table->dropColumn('departure_city');
            });
        }
    }
};
