<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Convert VARCHAR columns to NVARCHAR for full Arabic UTF-16 Unicode support.
     */
    public function up(): void
    {
        $alterStatements = [
            "ALTER TABLE tourists ALTER COLUMN full_name NVARCHAR(150) NOT NULL",

            "ALTER TABLE tour_guides ALTER COLUMN full_name NVARCHAR(150) NOT NULL",
            "ALTER TABLE tour_guides ALTER COLUMN certificate NVARCHAR(500) NULL",
            "ALTER TABLE tour_guides ALTER COLUMN bio NVARCHAR(MAX) NULL",
            "ALTER TABLE tour_guides ALTER COLUMN title NVARCHAR(150) NULL",
            "ALTER TABLE tour_guides ALTER COLUMN verification_status NVARCHAR(50) NULL",

            "ALTER TABLE transportation_companies ALTER COLUMN company_name NVARCHAR(150) NOT NULL",
            "ALTER TABLE transportation_companies ALTER COLUMN address NVARCHAR(255) NULL",
            "ALTER TABLE transportation_companies ALTER COLUMN city NVARCHAR(100) NULL",
            "ALTER TABLE transportation_companies ALTER COLUMN verification_status NVARCHAR(50) NULL",

            "ALTER TABLE drivers ALTER COLUMN full_name NVARCHAR(150) NOT NULL",
            "ALTER TABLE drivers ALTER COLUMN account_status NVARCHAR(50) NULL",
            "ALTER TABLE drivers ALTER COLUMN operational_status NVARCHAR(50) NULL",

            "ALTER TABLE vehicles ALTER COLUMN vehicle_type NVARCHAR(100) NULL",
            "ALTER TABLE vehicles ALTER COLUMN vehicle_status NVARCHAR(50) NULL",
            "ALTER TABLE vehicles ALTER COLUMN category NVARCHAR(50) NULL",

            "ALTER TABLE daily_trips ALTER COLUMN trip_name NVARCHAR(200) NOT NULL",
            "ALTER TABLE daily_trips ALTER COLUMN destination_name NVARCHAR(150) NULL",
            "ALTER TABLE daily_trips ALTER COLUMN pickup_location NVARCHAR(255) NULL",
            "ALTER TABLE daily_trips ALTER COLUMN time_description NVARCHAR(255) NULL",
            "ALTER TABLE daily_trips ALTER COLUMN insurance_info NVARCHAR(255) NULL",
            "ALTER TABLE daily_trips ALTER COLUMN status NVARCHAR(50) NULL",

            "ALTER TABLE weekly_trips ALTER COLUMN trip_title NVARCHAR(200) NOT NULL",
            "ALTER TABLE weekly_trips ALTER COLUMN departure_city NVARCHAR(100) NULL",
            "ALTER TABLE weekly_trips ALTER COLUMN destination_region NVARCHAR(150) NULL",
            "ALTER TABLE weekly_trips ALTER COLUMN included_services NVARCHAR(MAX) NULL",
            "ALTER TABLE weekly_trips ALTER COLUMN itinerary_summary NVARCHAR(MAX) NULL",
            "ALTER TABLE weekly_trips ALTER COLUMN status NVARCHAR(50) NULL",

            "ALTER TABLE places ALTER COLUMN name NVARCHAR(150) NOT NULL",
            "ALTER TABLE places ALTER COLUMN city NVARCHAR(100) NULL",
            "ALTER TABLE places ALTER COLUMN region NVARCHAR(100) NULL",
            "ALTER TABLE places ALTER COLUMN category NVARCHAR(50) NULL",
            "ALTER TABLE places ALTER COLUMN description NVARCHAR(MAX) NULL",
            "ALTER TABLE places ALTER COLUMN historical_period NVARCHAR(100) NULL",
            "ALTER TABLE places ALTER COLUMN best_time_to_visit NVARCHAR(100) NULL",

            "ALTER TABLE hotels ALTER COLUMN hotel_name NVARCHAR(150) NOT NULL",
            "ALTER TABLE hotels ALTER COLUMN city NVARCHAR(100) NULL",
            "ALTER TABLE hotels ALTER COLUMN address NVARCHAR(255) NULL",
            "ALTER TABLE hotels ALTER COLUMN amenities NVARCHAR(MAX) NULL",
            "ALTER TABLE hotels ALTER COLUMN description NVARCHAR(MAX) NULL",

            "ALTER TABLE restaurants_cafes ALTER COLUMN facility_name NVARCHAR(150) NOT NULL",
            "ALTER TABLE restaurants_cafes ALTER COLUMN facility_type NVARCHAR(50) NULL",
            "ALTER TABLE restaurants_cafes ALTER COLUMN city NVARCHAR(100) NULL",
            "ALTER TABLE restaurants_cafes ALTER COLUMN address_details NVARCHAR(255) NULL",
            "ALTER TABLE restaurants_cafes ALTER COLUMN working_hours NVARCHAR(100) NULL",

            "ALTER TABLE private_trips ALTER COLUMN customer_name NVARCHAR(150) NULL",
            "ALTER TABLE private_trips ALTER COLUMN customer_description NVARCHAR(MAX) NULL",
            "ALTER TABLE private_trips ALTER COLUMN admin_itinerary_plan NVARCHAR(MAX) NULL",
            "ALTER TABLE private_trips ALTER COLUMN status_order NVARCHAR(50) NULL",

            "ALTER TABLE reviews_daily_trips ALTER COLUMN comment NVARCHAR(MAX) NULL",
            "ALTER TABLE reviews_weekly_trips ALTER COLUMN comment NVARCHAR(MAX) NULL",
            "ALTER TABLE reviews_hotels ALTER COLUMN comment NVARCHAR(MAX) NULL",
            "ALTER TABLE reviews_facilities ALTER COLUMN comment NVARCHAR(MAX) NULL",

            "ALTER TABLE bookings_daily ALTER COLUMN status NVARCHAR(50) NULL",
            "ALTER TABLE bookings_daily ALTER COLUMN payment_status NVARCHAR(50) NULL",
            "ALTER TABLE bookings_daily ALTER COLUMN passengers_names NVARCHAR(MAX) NULL",
            "ALTER TABLE bookings_daily ALTER COLUMN pickup_location NVARCHAR(255) NULL",

            "ALTER TABLE bookings_weekly ALTER COLUMN status NVARCHAR(50) NULL",
            "ALTER TABLE bookings_weekly ALTER COLUMN payment_status NVARCHAR(50) NULL",
            "ALTER TABLE bookings_weekly ALTER COLUMN passengers_names NVARCHAR(MAX) NULL",
            "ALTER TABLE bookings_weekly ALTER COLUMN pickup_location NVARCHAR(255) NULL",
        ];

        foreach ($alterStatements as $sql) {
            try {
                DB::statement($sql);
            } catch (\Exception $e) {
                // If a table or column doesn't exist, continue safely
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
