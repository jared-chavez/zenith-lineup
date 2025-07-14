<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HabitAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(HabitAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get comprehensive analytics for the user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $analytics = $this->analyticsService->analyzeUserPatterns($user);

        return response()->json([
            'analytics' => $analytics,
            'generated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get habit performance analytics
     */
    public function habitPerformance(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $habits = $user->habits()->with('habitLogs')->get();
        
        $performance = $habits->map(function ($habit) {
            $logs = $habit->habitLogs;
            $totalLogs = $logs->count();
            $completedLogs = $logs->where('status', 'completed')->count();
            $completionRate = $totalLogs > 0 ? round(($completedLogs / $totalLogs) * 100, 2) : 0;

            return [
                'id' => $habit->id,
                'name' => $habit->name,
                'total_logs' => $totalLogs,
                'completed_logs' => $completedLogs,
                'completion_rate' => $completionRate,
                'status' => $habit->status,
                'created_at' => $habit->created_at,
            ];
        });

        return response()->json([
            'performance' => $performance,
            'summary' => [
                'total_habits' => $habits->count(),
                'active_habits' => $habits->where('status', 'active')->count(),
                'average_completion_rate' => $performance->avg('completion_rate'),
            ],
        ]);
    }

    /**
     * Get time-based analytics
     */
    public function timeAnalytics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $logs = $user->habitLogs()->where('status', 'completed')->get();

        $hourlyData = $logs->groupBy(function ($log) {
            return \Carbon\Carbon::parse($log->created_at)->format('H');
        })->map->count();

        $dailyData = $logs->groupBy(function ($log) {
            return \Carbon\Carbon::parse($log->created_at)->format('l');
        })->map->count();

        $weeklyData = $logs->groupBy(function ($log) {
            return \Carbon\Carbon::parse($log->created_at)->format('Y-W');
        })->map->count();

        return response()->json([
            'hourly_distribution' => $hourlyData,
            'daily_distribution' => $dailyData,
            'weekly_distribution' => $weeklyData,
            'peak_hour' => $hourlyData->sortDesc()->keys()->first(),
            'peak_day' => $dailyData->sortDesc()->keys()->first(),
        ]);
    }

    /**
     * Get streak analytics
     */
    public function streakAnalytics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $logs = $user->habitLogs()->where('status', 'completed')
            ->orderBy('created_at')
            ->get()
            ->groupBy(function ($log) {
                return \Carbon\Carbon::parse($log->created_at)->format('Y-m-d');
            });

        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;
        $date = now();

        // Calculate current streak
        while ($logs->has($date->format('Y-m-d'))) {
            $currentStreak++;
            $date = $date->subDay();
        }

        // Calculate longest streak
        $dates = $logs->keys()->sort()->values();
        foreach ($dates as $date) {
            $tempStreak++;
            $longestStreak = max($longestStreak, $tempStreak);
        }

        return response()->json([
            'current_streak' => $currentStreak,
            'longest_streak' => $longestStreak,
            'total_active_days' => $logs->count(),
            'streak_history' => $this->getStreakHistory($logs),
        ]);
    }

    /**
     * Get predictions and insights
     */
    public function predictions(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $logs = $user->habitLogs()->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        $completionRate = $logs->count() > 0 ? $logs->where('status', 'completed')->count() / $logs->count() : 0;

        $predictions = [
            'predicted_completion_rate_next_week' => min(100, $completionRate * 100 + (rand(-5, 5))),
            'estimated_completions_next_week' => round($completionRate * 7, 0),
            'confidence_level' => $this->calculateConfidenceLevel($logs),
            'trend' => $this->calculateTrend($logs),
        ];

        return response()->json([
            'predictions' => $predictions,
            'based_on' => $logs->count() . ' registros recientes',
        ]);
    }

    /**
     * Get personalized recommendations
     */
    public function recommendations(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $recommendations = [];

        $overallStats = $this->getOverallStats($user);

        // Low completion rate recommendation
        if ($overallStats['completion_rate'] < 70) {
            $recommendations[] = [
                'type' => 'completion_rate',
                'title' => 'Mejora tu tasa de completitud',
                'description' => 'Tu tasa de completitud está por debajo del 70%. Considera reducir la cantidad de hábitos o ajustar tus objetivos.',
                'priority' => 'high',
                'action' => 'Revisa tus hábitos activos y considera pausar algunos temporalmente.',
            ];
        }

        // Consistency recommendation
        if ($overallStats['consistency_score'] < 0.6) {
            $recommendations[] = [
                'type' => 'consistency',
                'title' => 'Mejora tu consistencia',
                'description' => 'Tu patrón de actividad es irregular. Intenta establecer horarios fijos para tus hábitos.',
                'priority' => 'medium',
                'action' => 'Establece recordatorios diarios a la misma hora.',
            ];
        }

        // New habit recommendation
        if ($overallStats['total_habits'] < 3) {
            $recommendations[] = [
                'type' => 'new_habits',
                'title' => 'Considera agregar más hábitos',
                'description' => 'Tienes pocos hábitos activos. Agregar más puede ayudarte a construir una rutina más sólida.',
                'priority' => 'low',
                'action' => 'Explora la sección de sugerencias de hábitos.',
            ];
        }

        return response()->json([
            'recommendations' => $recommendations,
            'total_recommendations' => count($recommendations),
        ]);
    }

    /**
     * Get streak history
     */
    private function getStreakHistory($logs): array
    {
        $streaks = [];
        $currentStreak = 0;
        $dates = $logs->keys()->sort()->values();

        foreach ($dates as $date) {
            $currentStreak++;
        }

        if ($currentStreak > 0) {
            $streaks[] = [
                'length' => $currentStreak,
                'start_date' => $dates->first(),
                'end_date' => $dates->last(),
            ];
        }

        return $streaks;
    }

    /**
     * Calculate confidence level for predictions
     */
    private function calculateConfidenceLevel($logs): float
    {
        $dataPoints = $logs->count();
        
        if ($dataPoints < 7) {
            return 0.3;
        } elseif ($dataPoints < 30) {
            return 0.6;
        } else {
            return 0.9;
        }
    }

    /**
     * Calculate trend
     */
    private function calculateTrend($logs): string
    {
        if ($logs->count() < 7) {
            return 'insufficient_data';
        }

        $recentLogs = $logs->take(7);
        $olderLogs = $logs->slice(7, 7);

        $recentCompletionRate = $recentLogs->where('status', 'completed')->count() / $recentLogs->count();
        $olderCompletionRate = $olderLogs->where('status', 'completed')->count() / $olderLogs->count();

        if ($recentCompletionRate > $olderCompletionRate + 0.1) {
            return 'improving';
        } elseif ($recentCompletionRate < $olderCompletionRate - 0.1) {
            return 'declining';
        } else {
            return 'stable';
        }
    }

    /**
     * Get overall stats
     */
    private function getOverallStats($user): array
    {
        $totalLogs = $user->habitLogs()->count();
        $completedLogs = $user->habitLogs()->where('status', 'completed')->count();
        $completionRate = $totalLogs > 0 ? round(($completedLogs / $totalLogs) * 100, 2) : 0;

        return [
            'total_logs' => $totalLogs,
            'completed_logs' => $completedLogs,
            'completion_rate' => $completionRate,
            'consistency_score' => $this->calculateConsistencyScore($user),
        ];
    }

    /**
     * Calculate consistency score
     */
    private function calculateConsistencyScore($user): float
    {
        $logs = $user->habitLogs()->where('status', 'completed')
            ->orderBy('created_at')
            ->get();

        if ($logs->count() < 2) {
            return 0;
        }

        $intervals = [];
        for ($i = 1; $i < $logs->count(); $i++) {
            $interval = \Carbon\Carbon::parse($logs[$i-1]->created_at)
                ->diffInHours(\Carbon\Carbon::parse($logs[$i]->created_at));
            $intervals[] = $interval;
        }

        $avgInterval = array_sum($intervals) / count($intervals);
        $variance = array_sum(array_map(function ($interval) use ($avgInterval) {
            return pow($interval - $avgInterval, 2);
        }, $intervals)) / count($intervals);

        $consistencyScore = 1 / (1 + sqrt($variance) / $avgInterval);
        return min(1, max(0, $consistencyScore));
    }
} 