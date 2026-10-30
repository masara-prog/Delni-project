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
