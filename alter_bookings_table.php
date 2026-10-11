<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
Illuminate\Support\Facades\DB::statement('ALTER TABLE bookings_daily ALTER COLUMN booking_status nvarchar(100)');
Illuminate\Support\Facades\DB::statement('ALTER TABLE bookings_weekly ALTER COLUMN booking_status nvarchar(100)');
echo "Columns altered successfully to nvarchar(100)!\n";
