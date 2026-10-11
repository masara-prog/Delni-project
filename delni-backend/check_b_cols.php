<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "bookings_daily columns:\n";
print_r(\Illuminate\Support\Facades\Schema::getColumnListing('bookings_daily'));

echo "\nbookings_weekly columns:\n";
print_r(\Illuminate\Support\Facades\Schema::getColumnListing('bookings_weekly'));
