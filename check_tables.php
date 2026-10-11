<?php
require __DIR__ . '/delni-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/delni-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\DailyTrip;
use App\Models\WeeklyTrip;
use App\Models\PrivateTrip;
use App\Models\BookingDaily;
use App\Models\BookingWeekly;
use App\Models\TransportationCompany;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\TourGuide;
use App\Models\Tourist;
use App\Models\Hotel;
use App\Models\RestaurantCafe;
use App\Models\PlaceTourist;

echo "DailyTrips: " . DailyTrip::count() . "\n";
foreach (DailyTrip::all(['daily_trip_id', 'trip_title']) as $t) {
    echo "  - {$t->daily_trip_id}: {$t->trip_title}\n";
}

echo "WeeklyTrips: " . WeeklyTrip::count() . "\n";
foreach (WeeklyTrip::all(['weekly_trip_id', 'trip_title']) as $t) {
    echo "  - {$t->weekly_trip_id}: {$t->trip_title}\n";
}

echo "PrivateTrips: " . PrivateTrip::count() . "\n";
echo "BookingDaily: " . BookingDaily::count() . "\n";
echo "BookingWeekly: " . BookingWeekly::count() . "\n";
echo "TransportationCompany: " . TransportationCompany::count() . "\n";
echo "Driver: " . Driver::count() . "\n";
echo "Vehicle: " . Vehicle::count() . "\n";
echo "TourGuide: " . TourGuide::count() . "\n";
echo "Tourist: " . Tourist::count() . "\n";
echo "Hotels: " . Hotel::count() . "\n";
echo "Restaurants: " . RestaurantCafe::count() . "\n";
echo "Places: " . PlaceTourist::count() . "\n";
