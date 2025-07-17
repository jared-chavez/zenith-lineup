<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Habit;
use App\Models\HabitLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminStatsController extends Controller
{
    public function index()
    {
        try {
            // Basic counts - these should work
            $usersCount = User::count();
            $habitsCount = Habit::count();
            $logsCount = HabitLog::count();

            // User statistics - simplified
            $adminUsers = User::where('role', 'admin')->count();
            $usersWith2FA = User::where('two_factor_enabled', true)->count();
            $newUsersThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();
            
            // Comment out complex queries for now
            $activeUsers = User::whereHas('habitLogs', function($query) {
                $query->where('created_at', '>=', now()->subDays(30));
            })->count();
            
            $userGrowth = $this->getUserGrowthData();
            $activeHabits = Habit::where('is_active', true)->count();
            $habitsByType = Habit::select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get();
            $habitsByStatus = Habit::select('is_active', DB::raw('count(*) as count'))
                ->groupBy('is_active')
                ->get();
            $logsThisMonth = HabitLog::where('created_at', '>=', now()->startOfMonth())->count();
            $completedLogs = HabitLog::where('status', 'completed')->count();
            $completionRate = $logsCount > 0 ? round(($completedLogs / $logsCount) * 100, 2) : 0;
            $dailyActivity = $this->getDailyActivityData();
            $topHabits = Habit::withCount(['habitLogs' => function($query) {
                $query->where('status', 'completed');
            }])
            ->orderBy('habit_logs_count', 'desc')
            ->limit(10)
            ->get();
            $recentLogs = HabitLog::with(['user', 'habit'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $recentUsers = User::orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $systemHealth = $this->getSystemHealthMetrics();

            return response()->json([
                // Basic counts
                'users_count' => $usersCount,
                'habits_count' => $habitsCount,
                'logs_count' => $logsCount,
                
                // User metrics - simplified
                'active_users' => $activeUsers,
                'admin_users' => $adminUsers,
                'users_with_2fa' => $usersWith2FA,
                'new_users_this_month' => $newUsersThisMonth,
                'user_growth' => $userGrowth,
                
                // Habit metrics - simplified
                'active_habits' => $activeHabits,
                'habits_by_type' => $habitsByType,
                'habits_by_status' => $habitsByStatus,
                'top_habits' => $topHabits,
                
                // Log metrics - simplified
                'logs_this_month' => $logsThisMonth,
                'completed_logs' => $completedLogs,
                'completion_rate' => $completionRate,
                'daily_activity' => $dailyActivity,
                
                // Recent activity - simplified
                'recent_logs' => $recentLogs,
                'recent_users' => $recentUsers,
                
                // System health - simplified
                'system_health' => $systemHealth,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error in AdminStatsController: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Get user growth data for the last 6 months
     */
    private function getUserGrowthData()
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = User::whereYear('created_at', $date->year)
                        ->whereMonth('created_at', $date->month)
                        ->count();
            
            $data[] = [
                'month' => $date->format('M Y'),
                'count' => $count
            ];
        }
        
        return $data;
    }

    /**
     * Get daily activity data for the last 30 days
     */
    private function getDailyActivityData()
    {
        $data = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = HabitLog::whereDate('created_at', $date)->count();
            
            $data[] = [
                'date' => $date->format('Y-m-d'),
                'logs' => $count
            ];
        }
        
        return $data;
    }

    /**
     * Get system health metrics
     */
    private function getSystemHealthMetrics()
    {
        // Database performance
        $avgResponseTime = 0; // This would be calculated from actual metrics
        
        // Error rates (placeholder - would need error logging)
        $errorRate = 0;
        
        // Active sessions (users logged in last 24 hours)
        $activeSessions = User::where('last_login_at', '>=', now()->subDay())->count();
        
        // Storage usage (placeholder)
        $storageUsage = [
            'database' => '2.5 GB',
            'files' => '150 MB',
            'logs' => '50 MB'
        ];
        
        return [
            'avg_response_time' => $avgResponseTime,
            'error_rate' => $errorRate,
            'active_sessions' => $activeSessions,
            'storage_usage' => $storageUsage,
            'uptime' => '99.9%'
        ];
    }

    /**
     * Get detailed user analytics
     */
    public function userAnalytics(Request $request)
    {
        $period = $request->get('period', '30'); // days
        
        $users = User::withCount(['habits', 'habitLogs'])
            ->with(['profile'])
            ->orderBy('created_at', 'desc')
            ->get();

        $analytics = [
            'total_users' => $users->count(),
            'active_users' => $users->where('habit_logs_count', '>', 0)->count(),
            'users_with_habits' => $users->where('habits_count', '>', 0)->count(),
            'avg_habits_per_user' => round($users->avg('habits_count'), 2),
            'avg_logs_per_user' => round($users->avg('habit_logs_count'), 2),
            'top_users' => $users->sortByDesc('habit_logs_count')->take(10),
            'recent_signups' => $users->take(10),
        ];

        return response()->json($analytics);
    }

    /**
     * Get habit performance analytics
     */
    public function habitAnalytics(Request $request)
    {
        $habits = Habit::withCount(['habitLogs' => function($query) {
            $query->where('status', 'completed');
        }])
        ->with(['user'])
        ->get();

        $analytics = [
            'total_habits' => $habits->count(),
            'active_habits' => $habits->where('status', 'active')->count(),
            'avg_completion_rate' => round($habits->avg('habit_logs_count'), 2),
            'most_popular_type' => $habits->groupBy('type')
                ->map->count()
                ->sortDesc()
                ->first(),
            'top_performing_habits' => $habits->sortByDesc('habit_logs_count')->take(10),
            'habits_by_category' => $habits->groupBy('type')->map->count(),
        ];

        return response()->json($analytics);
    }

    /**
     * Get system performance metrics
     */
    public function performanceMetrics()
    {
        // This would integrate with actual monitoring tools
        $metrics = [
            'response_time' => [
                'avg' => 150, // ms
                'p95' => 300,
                'p99' => 500
            ],
            'throughput' => [
                'requests_per_minute' => 1200,
                'concurrent_users' => 150
            ],
            'errors' => [
                'rate' => 0.1, // percentage
                'count_24h' => 5
            ],
            'database' => [
                'connections' => 25,
                'query_time_avg' => 45 // ms
            ]
        ];

        return response()->json($metrics);
    }
}
