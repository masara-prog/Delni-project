<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AiController;

/*
|--------------------------------------------------------------------------
| API Routes for Delni Platform
|--------------------------------------------------------------------------
*/

// --- Health Check ---
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Delni Laravel API',
        'database' => config('database.default'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// --- AI Chat & Itinerary Planner ---
Route::prefix('ai')->group(function () {
    Route::post('/chat', [AiController::class, 'chat']);
    Route::post('/plan-trip', [AiController::class, 'planTrip']);
});

// --- Auth Routes ---
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register/tourist', [AuthController::class, 'registerTourist']);
    Route::post('/register/guide', [AuthController::class, 'registerGuide']);
});

// --- Public / Catalog Routes ---
Route::get('/trips/daily', [TripController::class, 'dailyTrips']);
Route::get('/trips/weekly', [TripController::class, 'weeklyTrips']);
Route::post('/trips/private/request', [TripController::class, 'requestPrivateTrip']);

Route::get('/places', [TripController::class, 'places']);
Route::get('/hotels', [TripController::class, 'hotels']);
Route::get('/restaurants', [TripController::class, 'restaurants']);
Route::get('/guides', [TripController::class, 'guides']);

// --- Bookings & Manifests ---
Route::post('/bookings/daily', [BookingController::class, 'bookDaily']);
Route::post('/bookings/weekly', [BookingController::class, 'bookWeekly']);
Route::get('/bookings/tourist/{touristId}', [BookingController::class, 'touristBookings']);
Route::post('/bookings/toggle-payment', [BookingController::class, 'togglePayment']);
Route::post('/bookings/toggle-attendance', [BookingController::class, 'toggleAttendance']);

// --- Dashboards Specific Data ---
Route::get('/dashboard/guide/{licenseNumber}', [DashboardController::class, 'guideDashboard']);
Route::put('/dashboard/guide/{licenseNumber}', [DashboardController::class, 'updateGuideProfile']);
Route::post('/dashboard/guide/{licenseNumber}/trip-response', [DashboardController::class, 'guideRespondTrip']);
Route::get('/dashboard/driver/{driverLicenseNumber}', [DashboardController::class, 'driverDashboard']);
Route::get('/dashboard/transport/{contractNumber}', [DashboardController::class, 'transportDashboard']);
Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard']);
Route::put('/dashboard/admin/private-trips/{privateTripId}', [DashboardController::class, 'adminUpdatePrivateTrip']);
Route::put('/dashboard/admin/guides/{licenseNumber}/verify', [DashboardController::class, 'adminVerifyGuide']);

// --- Authenticated User Profile ---
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
