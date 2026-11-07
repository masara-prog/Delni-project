<?php
require __DIR__ . '/delni-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/delni-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::statement('DELETE FROM offers_daily_trips');
    DB::statement('DELETE FROM offers_weekly_trips');
    DB::statement('DELETE FROM bookings_daily');
    DB::statement('DELETE FROM bookings_weekly');
    DB::statement('DELETE FROM daily_trips');
    DB::statement('DELETE FROM weekly_trips');
    DB::statement('DELETE FROM private_trips');
    echo "SUCCESS: All static trips and related bookings/offers deleted from DelniDB.\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
