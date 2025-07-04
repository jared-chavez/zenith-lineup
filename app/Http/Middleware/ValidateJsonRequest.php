<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ValidateJsonRequest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if request is for API endpoints
        if ($request->is('api/*')) {
            // Validate Content-Type for POST/PUT/PATCH requests
            if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
                $contentType = $request->header('Content-Type');
                
                if (!$contentType || !str_contains($contentType, 'application/json')) {
                    Log::warning('Invalid Content-Type for API request', [
                        'method' => $request->method(),
                        'path' => $request->path(),
                        'content_type' => $contentType,
                        'ip' => $request->ip()
                    ]);

                    return response()->json([
                        'error' => 'Content-Type must be application/json'
                    ], 400);
                }
            }

            // Validate Accept header
            $accept = $request->header('Accept');
            if (!$accept || !str_contains($accept, 'application/json')) {
                Log::warning('Invalid Accept header for API request', [
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'accept' => $accept,
                    'ip' => $request->ip()
                ]);

                return response()->json([
                    'error' => 'Accept header must include application/json'
                ], 400);
            }

            // Check for suspicious patterns in request
            $this->checkSuspiciousPatterns($request);
        }

        return $next($request);
    }

    /**
     * Check for suspicious patterns in the request.
     */
    private function checkSuspiciousPatterns(Request $request): void
    {
        $suspiciousPatterns = [
            '/<script/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload=/i',
            '/onerror=/i',
            '/onclick=/i',
            '/union\s+select/i',
            '/drop\s+table/i',
            '/delete\s+from/i',
            '/insert\s+into/i',
            '/update\s+set/i',
            '/exec\s*\(/i',
            '/eval\s*\(/i',
        ];

        $requestData = json_encode($request->all());
        
        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $requestData)) {
                Log::alert('Suspicious pattern detected in API request', [
                    'pattern' => $pattern,
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'data' => $requestData
                ]);
                break;
            }
        }
    }
} 