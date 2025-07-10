<?php

use Illuminate\Support\Facades\Route;

// Serve React SPA for all frontend routes (excluding API routes)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
