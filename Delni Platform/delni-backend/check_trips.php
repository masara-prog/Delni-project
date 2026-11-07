<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Daily Trips:\n";
foreach (\App\Models\DailyTrip::all() as $d) {
    echo "ID: [{$d->daily_trip_id}] Title: [{$d->trip_title}] Seats: [{$d->available_seats}] Price: [{$d->price_per_seat}]\n";
}

echo "\nWeekly Trips:\n";
foreach (\App\Models\WeeklyTrip::all() as $w) {
    echo "ID: [{$w->weekly_trip_id}] Title: [{$w->trip_title}] Seats: [{$w->available_seats}] Price: [{$w->seat_per_price}]\n";
}
