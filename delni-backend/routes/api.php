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
Route::prefix('ai')->group(function () {
    Route::post('/chat', [AiController::class, 'chat']);
    Route::post('/plan-trip', [AiController::class, 'planTrip']);
});

// --- Auth Routes ---
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register/tourist', [AuthController::class, 'registerTourist']);
    Route::post('/register/guide', [AuthController::class, 'registerGuide']);
    Route::post('/tourist/update-profile', [AuthController::class, 'updateTouristProfile']);
});

// --- Public / Catalog Routes ---
// Trips and offers: never deleted (trips are cancelled via is_active, offers are ended, private trips are rejected/cancelled)
Route::get('/trips/daily', [TripCatalogController::class, 'dailyIndex']);
Route::post('/trips/daily', [TripCatalogController::class, 'saveDaily']);
Route::post('/trips/daily/{tripId}/cancel', [TripCatalogController::class, 'cancelDaily']);
Route::get('/trips/weekly', [TripCatalogController::class, 'weeklyIndex']);
Route::post('/trips/weekly', [TripCatalogController::class, 'saveWeekly']);
Route::post('/trips/weekly/{tripId}/cancel', [TripCatalogController::class, 'cancelWeekly']);
Route::post('/trips/weekly/{tripId}/guide-response', [TripCatalogController::class, 'weeklyGuideResponse']);
Route::get('/offers/{kind}', [TripOfferController::class, 'index'])->whereIn('kind', ['daily', 'weekly']);
Route::post('/offers/{kind}', [TripOfferController::class, 'save'])->whereIn('kind', ['daily', 'weekly']);
Route::post('/offers/{kind}/{offerId}/end', [TripOfferController::class, 'end'])->whereIn('kind', ['daily', 'weekly']);
Route::get('/private-trips', [PrivateTripController::class, 'index']);
Route::post('/private-trips', [PrivateTripController::class, 'store']);
Route::post('/private-trips/{tripId}/review', [PrivateTripController::class, 'review']);
Route::post('/private-trips/{tripId}/decision', [PrivateTripController::class, 'decide']);
Route::post('/private-trips/{tripId}/guide-response', [PrivateTripController::class, 'guideResponse']);

// Landmarks, guides and tourists: never deleted (deactivate/reject/restrict through status fields)
Route::get('/places', [PlaceController::class, 'index']);
Route::post('/places', [PlaceController::class, 'save']);
Route::get('/guides', [GuideController::class, 'index']);
Route::get('/guides/{licenseNumber}', [GuideController::class, 'show']);
Route::post('/guides/{licenseNumber}/verify', [GuideController::class, 'verify']);
Route::get('/tourists', [TouristController::class, 'index']);
Route::get('/tourists/{touristId}', [TouristController::class, 'show']);
Route::put('/tourists/{touristId}/status', [TouristController::class, 'updateStatus']);
// Hotels and restaurants/cafes: saved records are never deleted (deactivate via partnership_status)
Route::get('/hotels', [FacilityController::class, 'hotels']);
Route::post('/hotels', [FacilityController::class, 'saveHotel']);
Route::get('/restaurants', [FacilityController::class, 'restaurants']);
Route::post('/restaurants', [FacilityController::class, 'saveRestaurant']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/favorites', [FavoriteController::class, 'index']);
Route::post('/favorites', [FavoriteController::class, 'toggle']);

// --- Transport: companies, vehicles, drivers (never deleted; deactivate via status fields) ---
Route::prefix('transport')->group(function () {
    Route::get('/companies', [TransportController::class, 'companies']);
    Route::post('/companies', [TransportController::class, 'saveCompany']);
    Route::get('/vehicles', [TransportController::class, 'vehicles']);
    Route::post('/vehicles', [TransportController::class, 'saveVehicle']);
    Route::get('/drivers', [TransportController::class, 'drivers']);
    Route::post('/drivers', [TransportController::class, 'saveDriver']);
    // Passwords are changed only by the account owner, who must enter the current password
    Route::post('/companies/{contractNumber}/password', [TransportController::class, 'changeCompanyPassword']);
    Route::post('/drivers/{licenseNumber}/password', [TransportController::class, 'changeDriverPassword']);
    Route::post('/drivers/{licenseNumber}/trip-stage', [TransportController::class, 'updateTripStage']);
});

// --- Notifications System ---
Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
Route::post('/notifications', [NotificationController::class, 'store']);
Route::post('/notifications/read', [NotificationController::class, 'markRead']);

// --- Bookings & Manifests ---
// Bookings are never deleted; the price is computed on the server
Route::post('/bookings/daily', [BookingController::class, 'bookDaily']);
Route::post('/bookings/weekly', [BookingController::class, 'bookWeekly']);
Route::get('/bookings/tourist/{touristId}', [BookingController::class, 'touristBookings']);
Route::get('/bookings/ticket/{code}', [BookingController::class, 'findTicket']);
Route::get('/bookings/{kind}', [BookingController::class, 'index'])->whereIn('kind', ['daily', 'weekly']);
Route::post('/bookings/{kind}/{bookingId}/payment', [BookingController::class, 'setPayment'])->whereIn('kind', ['daily', 'weekly']);
Route::post('/bookings/{kind}/{bookingId}/attendance', [BookingController::class, 'setAttendance'])->whereIn('kind', ['daily', 'weekly']);
Route::post('/bookings/{kind}/{bookingId}/check-in', [BookingController::class, 'checkIn'])->whereIn('kind', ['daily', 'weekly']);

// --- Dashboards Specific Data ---
Route::get('/dashboard/guide/{licenseNumber}', [DashboardController::class, 'guideDashboard']);
Route::put('/dashboard/guide/{licenseNumber}', [DashboardController::class, 'updateGuideProfile']);
Route::get('/dashboard/driver/{driverLicenseNumber}', [DashboardController::class, 'driverDashboard']);
Route::get('/dashboard/transport/{contractNumber}', [DashboardController::class, 'transportDashboard']);
Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard']);

// --- Authenticated User Profile ---
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
