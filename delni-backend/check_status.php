<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Tourists in DelniDB ===\n";
foreach (\App\Models\Tourist::all() as $t) {
    echo "tourist_id: {$t->tourist_id} | Name: {$t->full_name} | Phone: {$t->phone_number} | Email: {$t->email} | national_id_or_passport: " . ($t->national_id_or_passport ?? 'NULL') . "\n";
}

echo "\n=== Daily Trips in DelniDB ===\n";
foreach (\App\Models\DailyTrip::all() as $d) {
    echo "ID: {$d->daily_trip_id} | Title: {$d->trip_title} | Seats: {$d->available_seats}/{$d->total_seats} | Price: {$d->price_per_seat}\n";
}

echo "\n=== Weekly Trips in DelniDB ===\n";
foreach (\App\Models\WeeklyTrip::all() as $w) {
    echo "ID: {$w->weekly_trip_id} | Title: {$w->trip_title} | Seats: {$w->available_seats}/{$w->total_seats} | Price: {$w->seat_per_price}\n";
}

echo "\n=== Existing Bookings Daily ===\n";
foreach (\App\Models\BookingDaily::all() as $bd) {
    echo "Booking: {$bd->booking_daily_id} | Tourist: {$bd->tourist_id} | Trip: {$bd->daily_trip_id} | Seats: {$bd->number_of_seats} | Price: {$bd->total_price} | Status: {$bd->booking_status}\n";
}

echo "\n=== Existing Bookings Weekly ===\n";
foreach (\App\Models\BookingWeekly::all() as $bw) {
    echo "Booking: {$bw->booking_weekly_id} | Tourist: {$bw->tourist_id} | Trip: {$bw->weekly_trip_id} | Seats: {$bw->number_of_seats} | Price: {$bw->total_price} | Status: {$bw->booking_status}\n";
}
