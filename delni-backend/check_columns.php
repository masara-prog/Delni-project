<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Tourists columns:\n";
print_r(\Illuminate\Support\Facades\Schema::getColumnListing('tourists'));

echo "\nBookingDaily columns:\n";
print_r(\Illuminate\Support\Facades\Schema::getColumnListing('booking_daily'));

echo "\nBookingWeekly columns:\n";
print_r(\Illuminate\Support\Facades\Schema::getColumnListing('booking_weekly'));
