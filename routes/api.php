<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HabitController;
use App\Http\Controllers\Api\HabitLogController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TwoFactorController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminHabitController;
use App\Http\Controllers\Admin\AdminHabitLogController;
use App\Http\Controllers\Admin\AdminStatsController;
use App\Http\Controllers\Admin\AdminAuditController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\PushNotificationController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no authentication required)
Route::middleware('api')->post('/auth/register', [AuthController::class, 'register']);
Route::middleware('api')->post('/auth/login', [AuthController::class, 'login']);

// 2FA routes (public for sending codes)
Route::middleware('api')->post('/auth/2fa/send', [TwoFactorController::class, 'sendCode']);
Route::middleware('api')->post('/auth/2fa/verify', [TwoFactorController::class, 'verifyCode']);

// Password reset routes
Route::middleware('api')->post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::middleware('api')->post('/password/validate-token', [PasswordResetController::class, 'validateToken']);
Route::middleware('api')->post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Protected routes (authentication required)
Route::middleware(['auth:sanctum', 'api'])->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::delete('/auth/delete-account', [AuthController::class, 'deleteAccount']);
    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    // 2FA routes (protected)
    Route::get('/auth/2fa/status', [TwoFactorController::class, 'status']);
    Route::post('/auth/2fa/enable', [TwoFactorController::class, 'enable']);
    Route::post('/auth/2fa/confirm', [TwoFactorController::class, 'confirmEnable']);
    Route::post('/auth/2fa/disable', [TwoFactorController::class, 'disable']);
    
    // Habits routes
    Route::apiResource('/habits', HabitController::class);
    Route::get('/habits/{habit}/stats', [HabitController::class, 'stats']);
    
    // Habit logs routes
    Route::apiResource('habit-logs', HabitLogController::class);
    Route::get('/habit-logs/date/{date}', [HabitLogController::class, 'getByDate']);
    Route::get('/habit-logs/range/{start}/{end}', [HabitLogController::class, 'getByDateRange']);
});

// Logout route that handles invalid tokens gracefully
Route::post('/auth/logout-invalid', [AuthController::class, 'logoutInvalid']);

// Achievement routes
Route::middleware(['auth:sanctum', 'api'])->group(function () {
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::get('/achievements/unlocked', [AchievementController::class, 'unlocked']);
    Route::get('/achievements/category/{category}', [AchievementController::class, 'byCategory']);
    Route::post('/achievements/check', [AchievementController::class, 'checkAchievements']);
    Route::get('/achievements/leaderboard', [AchievementController::class, 'leaderboard']);
    Route::get('/achievements/points', [AchievementController::class, 'pointsHistory']);
});

// Analytics routes
Route::middleware(['auth:sanctum', 'api'])->group(function () {
    Route::get('/analytics', [AnalyticsController::class, 'index']);
    Route::get('/analytics/performance', [AnalyticsController::class, 'habitPerformance']);
    Route::get('/analytics/time', [AnalyticsController::class, 'timeAnalytics']);
    Route::get('/analytics/streaks', [AnalyticsController::class, 'streakAnalytics']);
    Route::get('/analytics/predictions', [AnalyticsController::class, 'predictions']);
    Route::get('/analytics/recommendations', [AnalyticsController::class, 'recommendations']);
});

// Rutas de admin protegidas
Route::middleware(['auth:sanctum', 'is_admin', 'api'])->prefix('admin')->group(function () {
    // Test route for debugging
    Route::get('/test-auth', function (Request $request) {
        return response()->json([
            'message' => 'Admin authentication working!',
            'user' => $request->user(),
            'user_id' => $request->user()->id,
            'user_role' => $request->user()->role
        ]);
    });
    
    // User management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    Route::post('/users/bulk-action', [AdminUserController::class, 'bulkAction']);
    Route::post('/users/export', [AdminUserController::class, 'export']);
    
    // Habit management
    Route::get('/habits', [AdminHabitController::class, 'index']);
    Route::get('/habits/{id}', [AdminHabitController::class, 'show']);
    Route::put('/habits/{id}', [AdminHabitController::class, 'update']);
    Route::delete('/habits/{id}', [AdminHabitController::class, 'destroy']);
    
    // Log management
    Route::get('/logs', [AdminHabitLogController::class, 'index']);
    Route::get('/logs/{id}', [AdminHabitLogController::class, 'show']);
    Route::put('/logs/{id}', [AdminHabitLogController::class, 'update']);
    Route::delete('/logs/{id}', [AdminHabitLogController::class, 'destroy']);
    
    // Statistics and analytics
    Route::get('/stats', [AdminStatsController::class, 'index']);
    Route::get('/stats/user-analytics', [AdminStatsController::class, 'userAnalytics']);
    Route::get('/stats/habit-analytics', [AdminStatsController::class, 'habitAnalytics']);
    Route::get('/stats/performance', [AdminStatsController::class, 'performanceMetrics']);
    
    // Audit logs
    Route::get('/audit-logs', [AdminAuditController::class, 'index']);
    Route::get('/audit-logs/{id}', [AdminAuditController::class, 'show']);
    Route::get('/audit-logs/model/{modelType}/{modelId}', [AdminAuditController::class, 'modelLogs']);
    Route::get('/audit-logs/user/{userId}', [AdminAuditController::class, 'userLogs']);
    Route::get('/audit-logs/statistics', [AdminAuditController::class, 'statistics']);
    Route::post('/audit-logs/export', [AdminAuditController::class, 'export']);
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
}); 