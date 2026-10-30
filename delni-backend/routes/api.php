<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TransportController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\GuideController;
use App\Http\Controllers\Api\PlaceController;
use App\Http\Controllers\Api\TouristController;
use App\Http\Controllers\Api\TripCatalogController;
use App\Http\Controllers\Api\TripOfferController;
use App\Http\Controllers\Api\PrivateTripController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\FavoriteController;

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
Route::prefix('ai')->middleware('throttle:30,1')->group(function () {
    Route::post('/chat', [AiController::class, 'chat']);
    Route::post('/plan-trip', [AiController::class, 'planTrip']);
});

// --- Auth Routes (sign-in attempts are rate limited) ---
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/register/tourist', [AuthController::class, 'registerTourist'])->middleware('throttle:10,1');
    Route::post('/register/guide', [AuthController::class, 'registerGuide'])->middleware('throttle:10,1');
    Route::post('/guide/resubmit', [AuthController::class, 'resubmitGuide'])->middleware('throttle:10,1');
    Route::post('/tourist/update-profile', [AuthController::class, 'updateTouristProfile'])->middleware('role:tourist');
});

/*
| Public reads (visitors). Lists return extra rows/fields only to the admin (?all=1, private documents).
| Every write needs a token, and every role except the admin can only act as its own account (see RequireRole).
| Trips, offers, landmarks, guides, tourists, facilities and bookings are never deleted (status fields instead).
*/
Route::get('/trips/daily', [TripCatalogController::class, 'dailyIndex']);
Route::get('/trips/weekly', [TripCatalogController::class, 'weeklyIndex']);
Route::get('/trips/daily/{tripId}/availability', [TripCatalogController::class, 'dailyAvailability']);
Route::get('/offers/{kind}', [TripOfferController::class, 'index'])->whereIn('kind', ['daily', 'weekly']);
Route::get('/places', [PlaceController::class, 'index']);
Route::get('/guides', [GuideController::class, 'index']);
Route::get('/guides/{licenseNumber}', [GuideController::class, 'show']);
Route::get('/hotels', [FacilityController::class, 'hotels']);
Route::get('/restaurants', [FacilityController::class, 'restaurants']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/transport/companies', [TransportController::class, 'companies']);
Route::get('/transport/vehicles', [TransportController::class, 'vehicles']);
Route::get('/transport/drivers', [TransportController::class, 'drivers']);

// --- Notifications: the recipient is always the signed-in account (visitors can only write to the admin) ---
Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
Route::post('/notifications', [NotificationController::class, 'store'])->middleware('throttle:30,1');
Route::post('/notifications/read', [NotificationController::class, 'markRead']);

// --- Tourist ---
Route::middleware('role:tourist,admin')->group(function () {
    Route::get('/tourists/{touristId}', [TouristController::class, 'show']);
    Route::get('/bookings/tourist/{touristId}', [BookingController::class, 'touristBookings']);
    Route::get('/private-trips', [PrivateTripController::class, 'index']);
});
Route::middleware('role:tourist')->group(function () {
    Route::post('/bookings/daily', [BookingController::class, 'bookDaily']);
    Route::post('/bookings/weekly', [BookingController::class, 'bookWeekly']);
    Route::post('/bookings/{kind}/{bookingId}/cancel', [BookingController::class, 'cancel'])->whereIn('kind', ['daily', 'weekly']);
    Route::post('/private-trips', [PrivateTripController::class, 'store']);
    Route::post('/private-trips/{tripId}/decision', [PrivateTripController::class, 'decide']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'toggle']);
});

// --- Guide ---
Route::middleware('role:guide,admin')->group(function () {
    Route::get('/dashboard/guide/{licenseNumber}', [DashboardController::class, 'guideDashboard']);
    Route::put('/dashboard/guide/{licenseNumber}', [DashboardController::class, 'updateGuideProfile']);
});
Route::middleware('role:guide')->group(function () {
    Route::post('/trips/weekly/{tripId}/guide-response', [TripCatalogController::class, 'weeklyGuideResponse']);
    Route::post('/trips/daily/{tripId}/guide-response', [TripCatalogController::class, 'dailyGuideResponse']);
    Route::post('/private-trips/{tripId}/guide-response', [PrivateTripController::class, 'guideResponse']);
});

// --- Driver ---
Route::middleware('role:driver,admin')->group(function () {
    Route::get('/dashboard/driver/{driverLicenseNumber}', [DashboardController::class, 'driverDashboard']);
});
Route::middleware('role:driver')->prefix('transport')->group(function () {
    // Passwords are changed only by the account owner, who must enter the current password
    Route::post('/drivers/{licenseNumber}/password', [TransportController::class, 'changeDriverPassword']);
    Route::post('/drivers/{licenseNumber}/trip-stage', [TransportController::class, 'updateTripStage']);
});

// --- Transport company (its own vehicles and drivers; a driver also edits their own record) ---
Route::middleware('role:transport,admin')->group(function () {
    Route::get('/dashboard/transport/{contractNumber}', [DashboardController::class, 'transportDashboard']);
    Route::post('/transport/vehicles', [TransportController::class, 'saveVehicle']);
});
Route::post('/transport/drivers', [TransportController::class, 'saveDriver'])->middleware('role:transport,driver,admin');
Route::post('/transport/companies/{contractNumber}/password', [TransportController::class, 'changeCompanyPassword'])->middleware('role:transport');

// --- Admin ---
Route::middleware('role:admin')->group(function () {
    Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard']);

    Route::post('/trips/daily', [TripCatalogController::class, 'saveDaily']);
    Route::post('/trips/daily/{tripId}/cancel', [TripCatalogController::class, 'cancelDaily']);
    Route::post('/trips/weekly', [TripCatalogController::class, 'saveWeekly']);
    Route::post('/trips/weekly/{tripId}/cancel', [TripCatalogController::class, 'cancelWeekly']);
    Route::post('/offers/{kind}', [TripOfferController::class, 'save'])->whereIn('kind', ['daily', 'weekly']);
    Route::post('/offers/{kind}/{offerId}/end', [TripOfferController::class, 'end'])->whereIn('kind', ['daily', 'weekly']);
    Route::post('/private-trips/{tripId}/review', [PrivateTripController::class, 'review']);

    Route::post('/places', [PlaceController::class, 'save']);
    Route::post('/guides/{licenseNumber}/verify', [GuideController::class, 'verify']);
    Route::get('/tourists', [TouristController::class, 'index']);
    Route::put('/tourists/{touristId}/status', [TouristController::class, 'updateStatus']);
    Route::post('/hotels', [FacilityController::class, 'saveHotel']);
    Route::post('/restaurants', [FacilityController::class, 'saveRestaurant']);
    Route::post('/transport/companies', [TransportController::class, 'saveCompany']);

    Route::get('/bookings/ticket/{code}', [BookingController::class, 'findTicket']);
    Route::get('/bookings/{kind}', [BookingController::class, 'index'])->whereIn('kind', ['daily', 'weekly']);
    Route::post('/bookings/{kind}/{bookingId}/payment', [BookingController::class, 'setPayment'])->whereIn('kind', ['daily', 'weekly']);
    Route::post('/bookings/{kind}/{bookingId}/attendance', [BookingController::class, 'setAttendance'])->whereIn('kind', ['daily', 'weekly']);
    Route::post('/bookings/{kind}/{bookingId}/check-in', [BookingController::class, 'checkIn'])->whereIn('kind', ['daily', 'weekly']);
});

// --- Authenticated User Profile ---
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
