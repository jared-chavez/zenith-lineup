<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains security-related configuration settings for the
    | Zenith Lineup application following S-SDLC best practices.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for different types of requests to prevent
    | brute force attacks and abuse.
    |
    */

    'rate_limiting' => [
        'auth_attempts' => env('RATE_LIMIT_AUTH_ATTEMPTS', 5),
        'auth_decay_minutes' => env('RATE_LIMIT_AUTH_DECAY_MINUTES', 15),
        'api_requests' => env('RATE_LIMIT_API_REQUESTS', 60),
        'api_decay_minutes' => env('RATE_LIMIT_API_DECAY_MINUTES', 1),
        'general_requests' => env('RATE_LIMIT_GENERAL_REQUESTS', 120),
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Security
    |--------------------------------------------------------------------------
    |
    | Configure password requirements and hashing settings.
    |
    */

    'password' => [
        'min_length' => 8,
        'require_uppercase' => true,
        'require_lowercase' => true,
        'require_numbers' => true,
        'require_symbols' => true,
        'bcrypt_rounds' => 12,
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Security
    |--------------------------------------------------------------------------
    |
    | Configure session security settings.
    |
    */

    'session' => [
        'secure_cookie' => env('SESSION_SECURE_COOKIE', false),
        'http_only' => env('SESSION_HTTP_ONLY', true),
        'same_site' => env('SESSION_SAME_SITE', 'lax'),
        'lifetime' => env('SESSION_LIFETIME', 120),
    ],

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration
    |--------------------------------------------------------------------------
    |
    | Configure Cross-Origin Resource Sharing settings.
    |
    */

    'cors' => [
        'allowed_origins' => [
            env('FRONTEND_URL', 'http://localhost:3000'),
            env('APP_URL', 'http://localhost:8000'),
        ],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers' => [
            'Content-Type',
            'X-Requested-With',
            'Authorization',
            'X-CSRF-TOKEN',
            'Accept',
            'Origin',
            'X-API-Key',
        ],
        'exposed_headers' => [
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset',
        ],
        'max_age' => 86400,
        'supports_credentials' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Security Policy
    |--------------------------------------------------------------------------
    |
    | Configure Content Security Policy headers.
    |
    */

    'csp' => [
        'default_src' => ["'self'"],
        'script_src' => ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
        'style_src' => ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'font_src' => ["'self'", "https://fonts.gstatic.com"],
        'img_src' => ["'self'", "data:", "https:"],
        'connect_src' => ["'self'", "https://api.example.com"],
        'frame_ancestors' => ["'none'"],
        'base_uri' => ["'self'"],
        'form_action' => ["'self'"],
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Logging
    |--------------------------------------------------------------------------
    |
    | Configure what events should be logged for security auditing.
    |
    */

    'audit_logging' => [
        'enabled' => true,
        'events' => [
            'user_login',
            'user_logout',
            'user_registration',
            'password_reset',
            'profile_update',
            'habit_creation',
            'habit_update',
            'habit_deletion',
            'log_creation',
            'log_update',
            'log_deletion',
            'rate_limit_exceeded',
            'suspicious_pattern_detected',
            'failed_login_attempt',
        ],
        'sensitive_fields' => [
            'password',
            'password_confirmation',
            'token',
            'remember_token',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Suspicious Pattern Detection
    |--------------------------------------------------------------------------
    |
    | Configure patterns that should trigger security alerts.
    |
    */

    'suspicious_patterns' => [
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
    ],

    /*
    |--------------------------------------------------------------------------
    | Data Privacy
    |--------------------------------------------------------------------------
    |
    | Configure data privacy and GDPR compliance settings.
    |
    */

    'privacy' => [
        'data_retention_days' => 2555, // 7 years
        'anonymize_deleted_users' => true,
        'log_ip_addresses' => true,
        'log_user_agents' => true,
        'allow_data_export' => true,
        'allow_data_deletion' => true,
    ],

]; 