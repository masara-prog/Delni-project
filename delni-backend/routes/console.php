<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Contracts and driver licenses ending within a week -> one alert each to the people concerned (was an hourly timer in the Node bridge)
Artisan::command('contracts:check-expiring', function () {
    $created = \App\Support\ContractExpiryAlerts::run();
    $this->info("Contract expiry alerts created: {$created}");
})->purpose('Alert about contracts and driver licenses ending within a week');

\Illuminate\Support\Facades\Schedule::command('contracts:check-expiring')->hourly();

// One-off: images saved inside the database as base64 text (older records) become files under public/uploads,
// so lists such as /api/guides and /api/places no longer carry megabytes of image text. New uploads are files already.
Artisan::command('images:extract', function () {
    // table => [id column, image column, file name prefix, uploads folder]
    $sources = [
        ['tour_guides', 'license_number', 'avatar', 'guide', 'guides'],
        ['places_tourist', 'place_id', 'place_image', 'place', 'places'],
        ['vehicles', 'plate_number', 'vehicle_image', 'vehicle', 'vehicles'],
    ];
    foreach ($sources as [$table, $key, $column, $prefix, $folder]) {
        $moved = $skipped = 0;
        foreach (\Illuminate\Support\Facades\DB::table($table)->where($column, 'like', 'data:%')->get([$key, $column]) as $row) {
            try {
                $path = \App\Support\Base64Image::store($row->{$column}, "{$prefix}-{$row->{$key}}", $folder);
                \Illuminate\Support\Facades\DB::table($table)->where($key, $row->{$key})->update([$column => $path]);
                $moved++;
            } catch (\Illuminate\Validation\ValidationException) {
                $skipped++; // not a supported raster image: left as it is
            }
        }
        $this->info("{$table}.{$column}: {$moved} moved to files, {$skipped} left (unsupported format)");
    }
})->purpose('Move base64 images stored in the database into files under public/uploads');
