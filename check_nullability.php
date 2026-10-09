<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$cols = Illuminate\Support\Facades\DB::select("
    SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE COLUMN_NAME = 'guide_license_number'
");

foreach ($cols as $c) {
    echo "Table: {$c->TABLE_NAME} | Col: {$c->COLUMN_NAME} | Nullable: {$c->IS_NULLABLE}\n";
}
