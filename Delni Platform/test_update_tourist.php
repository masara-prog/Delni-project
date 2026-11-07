<?php
require 'delni-backend/vendor/autoload.php';
$app = require_once 'delni-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$controller = app(\App\Http\Controllers\Api\AuthController::class);
$request = new \Illuminate\Http\Request([
    'tourist_id' => 'T-1001',
    'full_name' => 'أحمد سالم المصراتي المحدث',
    'email' => 'tourist@dalni.ly',
    'phone_number' => '0912223344',
]);

$response = $controller->updateTouristProfile($request);
echo "Response:\n" . $response->getContent() . "\n";

$tourist = \App\Models\Tourist::where('tourist_id', 'T-1001')->first();
echo "Updated tourist in DB: Name = {$tourist->full_name}\n";
