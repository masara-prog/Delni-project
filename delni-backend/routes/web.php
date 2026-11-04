<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DatabaseViewerController;

// The backend has no web pages; the platform's site and the mobile app use /api
Route::get('/', function () {
    return response()->json(['service' => 'Delni Laravel API', 'api' => url('/api')]);
});

/*
| Database viewer (development tool). It returned whole tables, password hashes included, to anyone,
| so it is off unless DB_VIEWER_ENABLED=true AND APP_ENV=local, and even then it answers this machine only.
| It is never available in production.
*/
if (config('app.db_viewer_enabled') && app()->environment('local')) {
    Route::middleware(function ($request, $next) {
        if (!in_array($request->ip(), ['127.0.0.1', '::1'], true)) {
            abort(404);
        }
        return $next($request);
    })->group(function () {
        Route::get('/db-viewer', [DatabaseViewerController::class, 'index'])->name('db.viewer');
        Route::get('/db-viewer/api/table/{tableName}', [DatabaseViewerController::class, 'tableData'])->name('db.viewer.table');
    });
}
