<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $routeMiddleware = [
        'rateLimiting' => \App\Http\Middleware\RateLimiting::class,
        'securityHeaders' => \App\Http\Middleware\SecurityHeaders::class,
        'validateJson' => \App\Http\Middleware\ValidateJsonRequest::class,
        'is_admin' => \App\Http\Middleware\IsAdmin::class,
        'auth:sanctum' => \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // Otros middlewares de Laravel si los necesitas
    ];
} 