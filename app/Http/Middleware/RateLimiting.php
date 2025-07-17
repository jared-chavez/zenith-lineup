<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RateLimiting
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveRequestSignature($request);
        $maxAttempts = $this->getMaxAttempts($request);
        $decayMinutes = $this->getDecayMinutes($request);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            Log::warning('Rate limit exceeded', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'path' => $request->path(),
                'key' => $key
            ]);

            return response()->json([
                'error' => 'Too many requests',
                'retry_after' => RateLimiter::availableIn($key)
            ], 429);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', RateLimiter::remaining($key, $maxAttempts));

        return $response;
    }

    /**
     * Resolve the request signature for rate limiting.
     */
    protected function resolveRequestSignature(Request $request): string
    {
        $user = $request->user();
        
        if ($user) {
            return sha1($user->getAuthIdentifier() . '|' . $request->ip());
        }

        return sha1($request->ip() . '|' . $request->userAgent());
    }

    /**
     * Get the maximum number of attempts for the given request.
     */
    protected function getMaxAttempts(Request $request): int
    {
        // Admin routes - very high limits
        if ($request->is('api/admin/*')) {
            return 1000; // 1000 requests per minute for admin
        }

        // Auth routes - moderate limits
        if ($request->is('api/auth/*')) {
            return 20; // Increased from 10 to 20 for login attempts
        }

        // API routes - high limits
        if ($request->is('api/*')) {
            return 500; // Increased from 300 to 500 for API requests per minute
        }

        // General routes - very high limits
        return 1000; // Increased from 600 to 1000 for general requests per minute
    }

    /**
     * Get the number of minutes to decay the rate limit.
     */
    protected function getDecayMinutes(Request $request): int
    {
        // Admin routes - very short decay
        if ($request->is('api/admin/*')) {
            return 1; // 1 minute for admin routes
        }

        // Auth routes - moderate decay
        if ($request->is('api/auth/*')) {
            return 3; // Reduced from 5 to 3 minutes for auth attempts
        }

        // All other routes - short decay
        return 1; // 1 minute for other requests
    }
} 