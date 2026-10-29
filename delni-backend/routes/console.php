<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Partnership contracts ending within a week -> one admin alert each (was an hourly timer in the Node bridge)
Artisan::command('contracts:check-expiring', function () {
    $created = \App\Support\ContractExpiryAlerts::run();
    $this->info("Contract expiry alerts created: {$created}");
})->purpose('Alert the admin about partnership contracts ending within a week');

\Illuminate\Support\Facades\Schedule::command('contracts:check-expiring')->hourly();
