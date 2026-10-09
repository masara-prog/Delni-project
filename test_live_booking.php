<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$controller = app(\App\Http\Controllers\Api\BookingController::class);
$request = new \Illuminate\Http\Request([
    'tourist_id' => 'T-1001',
    'daily_trip_id' => 'DT-101',
    'number_of_seats' => 2,
    'passengers_names' => 'أحمد المصراتي ومرافقه',
    'booking_notes' => 'حجز تجريبي مباشر في قاعدة البيانات',
]);

$response = $controller->bookDaily($request);
echo "Booking Response:\n" . $response->getContent() . "\n";

$bookings = Illuminate\Support\Facades\DB::table('bookings_daily')->get();
echo "\nTotal rows in bookings_daily now: " . count($bookings) . "\n";
foreach ($bookings as $b) {
    echo "ID: {$b->booking_daily_id} | Tourist: {$b->tourist_id} | Trip: {$b->daily_trip_id} | Seats: {$b->number_of_seats} | Price: {$b->total_price}\n";
}
