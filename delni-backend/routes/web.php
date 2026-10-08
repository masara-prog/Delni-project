<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DatabaseViewerController;

Route::get('/', function () {
    return redirect('/db-viewer');
});

Route::get('/db-viewer', [DatabaseViewerController::class, 'index'])->name('db.viewer');
