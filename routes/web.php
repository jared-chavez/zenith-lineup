<?php

use Illuminate\Support\Facades\Route;

// Catch-all para servir la SPA de React (excepto rutas de API)
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api).*$');
