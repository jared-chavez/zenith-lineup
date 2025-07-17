<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Solo aplica headers estrictos en producción
        if (app()->environment('production')) {
            // Content Security Policy (CSP)
            $response->headers->set('Content-Security-Policy', 
                "default-src 'self'; " .
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " .
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
                "font-src 'self' https://fonts.gstatic.com; " .
                "img-src 'self' data: https:; " .
                "connect-src 'self' https://api.example.com; " .
                "frame-ancestors 'none'; " .
                "base-uri 'self'; " .
                "form-action 'self'"
            );
            $response->headers->set('X-Frame-Options', 'DENY');
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        } else {
            // En desarrollo/testing, relajar CSP y HSTS
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
            // No poner CSP ni HSTS para evitar problemas con hot reload, Vite, etc.
        }

        // Headers comunes para todos los entornos
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 
            'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
        );

        // Cache Control for sensitive data
        if ($request->is('api/*') || $request->is('auth/*')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
        }

        return $response;
    }
} 