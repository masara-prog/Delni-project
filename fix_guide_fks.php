<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// 1. Drop foreign key constraints on daily_trips and weekly_trips
Illuminate\Support\Facades\DB::statement("ALTER TABLE daily_trips DROP CONSTRAINT FK__daily_tri__guide__5EBF139D");
Illuminate\Support\Facades\DB::statement("ALTER TABLE weekly_trips DROP CONSTRAINT FK__weekly_tr__guide__66603565");

// 2. Alter column to allow NULL
Illuminate\Support\Facades\DB::statement("ALTER TABLE daily_trips ALTER COLUMN guide_license_number varchar(50) NULL");
Illuminate\Support\Facades\DB::statement("ALTER TABLE weekly_trips ALTER COLUMN guide_license_number varchar(50) NULL");

// 3. Re-add foreign key with ON DELETE SET NULL
Illuminate\Support\Facades\DB::statement("ALTER TABLE daily_trips ADD CONSTRAINT FK_daily_trips_guide FOREIGN KEY (guide_license_number) REFERENCES tour_guides(license_number) ON DELETE SET NULL");
Illuminate\Support\Facades\DB::statement("ALTER TABLE weekly_trips ADD CONSTRAINT FK_weekly_trips_guide FOREIGN KEY (guide_license_number) REFERENCES tour_guides(license_number) ON DELETE SET NULL");

echo "Constraints updated to allow NULL and ON DELETE SET NULL successfully!\n";
