<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * 1) Transport companies and vehicles: the rules the server already applies are now kept by DelniDB too
 *    (unique company email, contract end date required, allowed company/vehicle statuses, 15/25/50 seats).
 * 2) Guide reply time limit: a trip sent to a guide records when it was sent (guide_requested_at); if the guide
 *    does not answer within 24 hours the trip is taken back from the guide (guide_reply_expired = 1) and the admin
 *    is asked to choose another guide (App\Support\GuideReplyTimeout).
 *
 * Run on its own: php artisan migrate --path=database/migrations/2026_11_17_000000_company_constraints_and_guide_reply_timeout.php
 */
return new class extends Migration
{
    private const TRIPS = ['daily_trips', 'weekly_trips', 'private_trips'];

    public function up(): void
    {
        DB::statement("CREATE UNIQUE INDEX UQ_transportation_companies_email ON transportation_companies(email) WHERE email IS NOT NULL");
        DB::statement("ALTER TABLE transportation_companies ALTER COLUMN contract_end_date DATE NOT NULL");
        DB::statement("ALTER TABLE transportation_companies ADD CONSTRAINT chk_company_status CHECK (verification_status IN (N'نشطة', N'موقوفة'))");
        DB::statement("ALTER TABLE vehicles ADD CONSTRAINT chk_vehicle_status CHECK (vehicle_status IN (N'جاهزة', N'في رحلة', N'صيانة', N'خارج الخدمة'))");
        DB::statement("ALTER TABLE vehicles ADD CONSTRAINT chk_vehicle_seats CHECK (seating_capacity IN (15, 25, 50))");

        foreach (self::TRIPS as $table) {
            DB::statement("ALTER TABLE {$table} ADD guide_requested_at DATETIME2 NULL");
            DB::statement("ALTER TABLE {$table} ADD guide_reply_expired BIT NOT NULL CONSTRAINT DF_{$table}_guide_reply_expired DEFAULT 0");
        }
        // Trips already waiting for a guide get their 24 hours from now
        DB::statement("UPDATE daily_trips SET guide_requested_at = SYSDATETIME() WHERE guide_approval_status = N'بانتظار رد المرشد'");
        DB::statement("UPDATE weekly_trips SET guide_requested_at = SYSDATETIME() WHERE guide_approval_status = N'بانتظار رد المرشد'");
        DB::statement("UPDATE private_trips SET guide_requested_at = SYSDATETIME() WHERE status_order = N'بانتظار رد المرشد'");
    }

    public function down(): void
    {
        foreach (self::TRIPS as $table) {
            DB::statement("ALTER TABLE {$table} DROP CONSTRAINT DF_{$table}_guide_reply_expired");
            DB::statement("ALTER TABLE {$table} DROP COLUMN guide_reply_expired, guide_requested_at");
        }
        DB::statement("ALTER TABLE vehicles DROP CONSTRAINT chk_vehicle_seats");
        DB::statement("ALTER TABLE vehicles DROP CONSTRAINT chk_vehicle_status");
        DB::statement("ALTER TABLE transportation_companies DROP CONSTRAINT chk_company_status");
        DB::statement("ALTER TABLE transportation_companies ALTER COLUMN contract_end_date DATE NULL");
        DB::statement("DROP INDEX UQ_transportation_companies_email ON transportation_companies");
    }
};
