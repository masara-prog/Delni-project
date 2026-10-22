<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure columns exist on places_tourist
        Schema::table('places_tourist', function (Blueprint $table) {
            if (!Schema::hasColumn('places_tourist', 'region')) {
                $table->string('region', 100)->nullable()->after('city');
            }
            if (!Schema::hasColumn('places_tourist', 'history_snippet')) {
                $table->text('history_snippet')->nullable()->after('google_maps_url');
            }
            if (!Schema::hasColumn('places_tourist', 'best_season')) {
                $table->string('best_season', 100)->nullable()->after('history_snippet');
            }
            if (!Schema::hasColumn('places_tourist', 'highlights')) {
                $table->text('highlights')->nullable()->after('best_season');
            }
        });

        // 2. Create places_trip_daily junction table if it doesn't exist
        if (!Schema::hasTable('places_trip_daily')) {
            Schema::create('places_trip_daily', function (Blueprint $table) {
                $table->string('place_id', 50);
                $table->string('daily_trip_id', 50);

                $table->primary(['place_id', 'daily_trip_id']);

                $table->foreign('place_id')
                    ->references('place_id')
                    ->on('places_tourist')
                    ->onDelete('cascade');

                $table->foreign('daily_trip_id')
                    ->references('daily_trip_id')
                    ->on('daily_trips')
                    ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places_trip_daily');

        Schema::table('places_tourist', function (Blueprint $table) {
            if (Schema::hasColumn('places_tourist', 'region')) {
                $table->dropColumn('region');
            }
            if (Schema::hasColumn('places_tourist', 'history_snippet')) {
                $table->dropColumn('history_snippet');
            }
            if (Schema::hasColumn('places_tourist', 'best_season')) {
                $table->dropColumn('best_season');
            }
            if (Schema::hasColumn('places_tourist', 'highlights')) {
                $table->dropColumn('highlights');
            }
        });
    }
};
