<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$cols = Illuminate\Support\Facades\DB::select("
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'bookings_daily'
");
foreach ($cols as $c) {
    echo "{$c->COLUMN_NAME} | {$c->DATA_TYPE} | {$c->CHARACTER_MAXIMUM_LENGTH}\n";
}
