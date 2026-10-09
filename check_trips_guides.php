<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$trips = Illuminate\Support\Facades\DB::table('daily_trips')->select('daily_trip_id', 'trip_title', 'guide_license_number')->get();
echo "Daily trips:\n";
foreach ($trips as $t) {
    echo "ID: {$t->daily_trip_id} | Guide: {$t->guide_license_number}\n";
}

$wt = Illuminate\Support\Facades\DB::table('weekly_trips')->select('weekly_trip_id', 'trip_title', 'guide_license_number')->get();
echo "\nWeekly trips:\n";
foreach ($wt as $w) {
    echo "ID: {$w->weekly_trip_id} | Guide: {$w->guide_license_number}\n";
}

$pt = Illuminate\Support\Facades\DB::table('private_trips')->select('private_trip_id', 'guide_license_number')->get();
echo "\nPrivate trips:\n";
foreach ($pt as $p) {
    echo "ID: {$p->private_trip_id} | Guide: {$p->guide_license_number}\n";
}
