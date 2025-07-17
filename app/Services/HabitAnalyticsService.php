<?php

namespace App\Services;

use App\Models\User;
use App\Models\Habit;
use App\Models\HabitLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HabitAnalyticsService
{
    /**
     * Analyze user's habit patterns and provide insights
     */
    public function analyzeUserPatterns(User $user): array
    {
        $habits = $user->habits()->with('habitLogs')->get();
        
        $analysis = [
            'overall_stats' => $this->getOverallStats($user),
            'habit_performance' => $this->getHabitPerformance($habits),
            'time_patterns' => $this->getTimePatterns($user),
            'streak_analysis' => $this->getStreakAnalysis($user),
            'predictions' => $this->getPredictions($user),
            'recommendations' => $this->getRecommendations($user),
        ];

        return $analysis;
    }

    /**
     * Get overall statistics for the user
     */
    private function getOverallStats(User $user): array
    {
        $totalLogs = $user->habitLogs()->count();
        $completedLogs = $user->habitLogs()->where('status', 'completed')->count();
        $completionRate = $totalLogs > 0 ? round(($completedLogs / $totalLogs) * 100, 2) : 0;

        $activeHabits = $user->habits()->where('status', 'active')->count();
        $totalHabits = $user->habits()->count();

        $daysActive = $user->habitLogs()
            ->selectRaw('DATE(created_at) as date')
            ->distinct()
            ->count();

        $firstLog = $user->habitLogs()->orderBy('created_at')->first();
        $daysSinceFirst = $firstLog ? Carbon::parse($firstLog->created_at)->diffInDays(now()) : 0;

        return [
            'total_logs' => $totalLogs,
            'completed_logs' => $completedLogs,
            'completion_rate' => $completionRate,
            'active_habits' => $activeHabits,
            'total_habits' => $totalHabits,
            'days_active' => $daysActive,
            'days_since_first_log' => $daysSinceFirst,
            'consistency_score' => $this->calculateConsistencyScore($user),
        ];
    }

    /**
     * Get performance analysis for each habit
     */
    private function getHabitPerformance($habits): array
    {
        return $habits->map(function ($habit) {
            $logs = $habit->habitLogs;
            $totalLogs = $logs->count();
            $completedLogs = $logs->where('status', 'completed')->count();
            $completionRate = $totalLogs > 0 ? round(($completedLogs / $totalLogs) * 100, 2) : 0;

            // Calculate average completion time
            $avgCompletionTime = $logs->where('status', 'completed')
                ->avg('completion_time') ?? 0;

            // Get best and worst days
            $dayPerformance = $logs->groupBy(function ($log) {
                return Carbon::parse($log->created_at)->format('l');
            })->map(function ($dayLogs) {
                return round(($dayLogs->where('status', 'completed')->count() / $dayLogs->count()) * 100, 2);
            });

            $bestDay = $dayPerformance->sortDesc()->keys()->first();
            $worstDay = $dayPerformance->sort()->keys()->first();

            return [
                'id' => $habit->id,
                'name' => $habit->name,
                'total_logs' => $totalLogs,
                'completed_logs' => $completedLogs,
                'completion_rate' => $completionRate,
                'avg_completion_time' => $avgCompletionTime,
                'best_day' => $bestDay,
                'worst_day' => $worstDay,
                'day_performance' => $dayPerformance,
                'trend' => $this->calculateTrend($logs),
            ];
        })->toArray();
    }

    /**
     * Analyze time patterns
     */
    private function getTimePatterns(User $user): array
    {
        $logs = $user->habitLogs()->where('status', 'completed')->get();

        $hourlyPattern = $logs->groupBy(function ($log) {
            return Carbon::parse($log->created_at)->format('H');
        })->map->count();

        $weeklyPattern = $logs->groupBy(function ($log) {
            return Carbon::parse($log->created_at)->format('l');
        })->map->count();

        $monthlyPattern = $logs->groupBy(function ($log) {
            return Carbon::parse($log->created_at)->format('Y-m');
        })->map->count();

        return [
            'hourly_distribution' => $hourlyPattern,
            'weekly_distribution' => $weeklyPattern,
            'monthly_distribution' => $monthlyPattern,
            'peak_hour' => $hourlyPattern->sortDesc()->keys()->first(),
            'peak_day' => $weeklyPattern->sortDesc()->keys()->first(),
        ];
    }

    /**
     * Analyze streak patterns
     */
    private function getStreakAnalysis(User $user): array
    {
        $logs = $user->habitLogs()->where('status', 'completed')
            ->orderBy('created_at')
            ->get()
            ->groupBy(function ($log) {
                return Carbon::parse($log->created_at)->format('Y-m-d');
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

        return [
            'current_streak' => $currentStreak,
            'longest_streak' => $longestStreak,
            'average_streak' => $this->calculateAverageStreak($logs),
            'streak_consistency' => $this->calculateStreakConsistency($logs),
        ];
    }

    /**
     * Generate predictions based on user data
     */
    private function getPredictions(User $user): array
    {
        $logs = $user->habitLogs()->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        $completionRate = $logs->count() > 0 ? $logs->where('status', 'completed')->count() / $logs->count() : 0;

        // Predict next week's completion rate
        $predictedCompletionRate = min(100, $completionRate * 100 + (rand(-5, 5)));

        // Predict next milestone
        $totalCompleted = $user->habitLogs()->where('status', 'completed')->count();
        $nextMilestone = ceil($totalCompleted / 10) * 10;

        return [
            'predicted_completion_rate_next_week' => round($predictedCompletionRate, 2),
            'next_milestone' => $nextMilestone,
            'estimated_days_to_milestone' => $this->estimateDaysToMilestone($user, $nextMilestone),
            'confidence_level' => $this->calculateConfidenceLevel($logs),
        ];
    }

    /**
     * Generate personalized recommendations
     */
    private function getRecommendations(User $user): array
    {
        $recommendations = [];

        $overallStats = $this->getOverallStats($user);
        $timePatterns = $this->getTimePatterns($user);

        // Low completion rate recommendation
        if ($overallStats['completion_rate'] < 70) {
            $recommendations[] = [
                'type' => 'completion_rate',
                'title' => 'Mejora tu tasa de completitud',
                'description' => 'Tu tasa de completitud está por debajo del 70%. Considera reducir la cantidad de hábitos o ajustar tus objetivos.',
                'priority' => 'high',
            ];
        }

        // Inconsistent patterns recommendation
        if ($overallStats['consistency_score'] < 0.6) {
            $recommendations[] = [
                'type' => 'consistency',
                'title' => 'Mejora tu consistencia',
                'description' => 'Tu patrón de actividad es irregular. Intenta establecer horarios fijos para tus hábitos.',
                'priority' => 'medium',
            ];
        }

        // Time optimization recommendation
        if ($timePatterns['peak_hour']) {
            $recommendations[] = [
                'type' => 'timing',
                'title' => 'Optimiza tu horario',
                'description' => "Tu hora más productiva es las {$timePatterns['peak_hour']}:00. Programa tus hábitos más importantes para esta hora.",
                'priority' => 'low',
            ];
        }

        return $recommendations;
    }

    /**
     * Calculate consistency score (0-1)
     */
    private function calculateConsistencyScore(User $user): float
    {
        $logs = $user->habitLogs()->where('status', 'completed')
            ->orderBy('created_at')
            ->get();

        if ($logs->count() < 2) {
            return 0;
        }

        $intervals = [];
        for ($i = 1; $i < $logs->count(); $i++) {
            $interval = Carbon::parse($logs[$i-1]->created_at)
                ->diffInHours(Carbon::parse($logs[$i]->created_at));
            $intervals[] = $interval;
        }

        $avgInterval = array_sum($intervals) / count($intervals);
        $variance = array_sum(array_map(function ($interval) use ($avgInterval) {
            return pow($interval - $avgInterval, 2);
        }, $intervals)) / count($intervals);

        $consistencyScore = 1 / (1 + sqrt($variance) / $avgInterval);
        return min(1, max(0, $consistencyScore));
    }

    /**
     * Calculate trend for a habit
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
     * Calculate average streak
     */
    private function calculateAverageStreak($logs): float
    {
        // Implementation for average streak calculation
        return 0.0;
    }

    /**
     * Calculate streak consistency
     */
    private function calculateStreakConsistency($logs): float
    {
        // Implementation for streak consistency calculation
        return 0.0;
    }

    /**
     * Estimate days to reach milestone
     */
    private function estimateDaysToMilestone(User $user, int $milestone): int
    {
        $totalCompleted = $user->habitLogs()->where('status', 'completed')->count();
        $remaining = $milestone - $totalCompleted;

        if ($remaining <= 0) {
            return 0;
        }

        $avgDailyCompletions = $user->habitLogs()
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->count() / 30;

        return $avgDailyCompletions > 0 ? ceil($remaining / $avgDailyCompletions) : 999;
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
} 