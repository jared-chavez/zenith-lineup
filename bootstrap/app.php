<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global security middleware
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->append(\App\Http\Middleware\ValidateJsonRequest::class);
        
        // API middleware group
        $middleware->group('api', [
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\RateLimiting::class,
            \App\Http\Middleware\ValidateJsonRequest::class,
        ]);
        
        // Register custom middleware aliases
        $middleware->alias([
            'is_admin' => \App\Http\Middleware\IsAdmin::class,
            'rateLimiting' => \App\Http\Middleware\RateLimiting::class,
            'securityHeaders' => \App\Http\Middleware\SecurityHeaders::class,
            'validateJson' => \App\Http\Middleware\ValidateJsonRequest::class,
            'api.auth' => \App\Http\Middleware\ApiAuthenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
