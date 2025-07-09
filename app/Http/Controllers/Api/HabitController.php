<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class HabitController extends Controller
{
    /**
     * Get all habits for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $habits = $user->habits()
            ->with('habitLogs')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'habits' => [
                'data' => $habits
            ]
        ]);
    }

    /**
     * Store a new habit.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), Habit::rules());

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $habit = $request->user()->habits()->create($request->all());

            Log::info('Habit created', [
                'user_id' => $request->user()->id,
                'habit_id' => $habit->id,
                'habit_type' => $habit->type
            ]);

            return response()->json([
                'message' => 'Habit created successfully',
                'habit' => $habit->load('habitLogs')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Habit creation failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to create habit'
            ], 500);
        }
    }

    /**
     * Get a specific habit.
     */
    public function show(Request $request, Habit $habit): JsonResponse
    {
        // Check if the habit belongs to the authenticated user
        if (!$habit->belongsToUser($request->user()->id)) {
            return response()->json([
                'error' => 'Habit not found'
            ], 404);
        }

        return response()->json([
            'habit' => $habit->load('habitLogs')
        ]);
    }

    /**
     * Update a habit.
     */
    public function update(Request $request, $id): JsonResponse
    {
        // Use resolveRouteBinding manually
        $habit = (new Habit())->resolveRouteBinding($id);
        
        if (!$habit) {
            return response()->json([
                'error' => 'Habit not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Habit::rules());

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $habit->update($request->all());

            Log::info('Habit updated', [
                'user_id' => $request->user()->id,
                'habit_id' => $habit->id
            ]);

            return response()->json([
                'message' => 'Habit updated successfully',
                'habit' => $habit->load('habitLogs')
            ]);

        } catch (\Exception $e) {
            Log::error('Habit update failed', [
                'user_id' => $request->user()->id,
                'habit_id' => $habit->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to update habit'
            ], 500);
        }
    }

    /**
     * Delete a habit.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        // Use resolveRouteBinding manually
        $habit = (new Habit())->resolveRouteBinding($id);
        
        if (!$habit) {
            return response()->json([
                'error' => 'Habit not found'
            ], 404);
        }

        try {
            $habit->delete();

            Log::info('Habit deleted', [
                'user_id' => $request->user()->id,
                'habit_id' => $habit->id
            ]);

            return response()->json([
                'message' => 'Habit deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Habit deletion failed', [
                'user_id' => $request->user()->id,
                'habit_id' => $habit->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to delete habit'
            ], 500);
        }
    }

    /**
     * Get statistics for a specific habit.
     */
    public function stats(Request $request, $id)
    {
        $habit = $request->user()->habits()->findOrFail($id);
        
        // Get logs for the last 30 days
        $thirtyDaysAgo = now()->subDays(30);
        $logs = $habit->habitLogs()
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->get();
        
        // Calculate statistics
        $totalLogs = $logs->count();
        $completionRate = $totalLogs > 0 ? ($totalLogs / 30) * 100 : 0;
        
        // Group by date for streak calculation
        $logsByDate = $logs->groupBy(function($log) {
            return $log->created_at->format('Y-m-d');
        });
        
        // Calculate current streak
        $currentStreak = 0;
        $maxStreak = 0;
        $tempStreak = 0;
        
        for ($i = 0; $i < 30; $i++) {
            $date = now()->subDays($i)->format('Y-m-d');
            if ($logsByDate->has($date)) {
                $tempStreak++;
                if ($i === 0) {
                    $currentStreak = $tempStreak;
                }
                $maxStreak = max($maxStreak, $tempStreak);
            } else {
                $tempStreak = 0;
            }
        }
        
        // Get weekly breakdown
        $weeklyStats = [];
        for ($week = 0; $week < 4; $week++) {
            $weekStart = now()->subWeeks($week)->startOfWeek();
            $weekEnd = now()->subWeeks($week)->endOfWeek();
            
            $weekLogs = $habit->habitLogs()
                ->whereBetween('created_at', [$weekStart, $weekEnd])
                ->count();
            
            $weeklyStats[] = [
                'week' => $weekStart->format('M d') . ' - ' . $weekEnd->format('M d'),
                'logs' => $weekLogs,
                'completion_rate' => ($weekLogs / 7) * 100
            ];
        }

        return response()->json([
            'habit' => $habit,
            'statistics' => [
                'total_logs' => $totalLogs,
                'completion_rate' => round($completionRate, 2),
                'current_streak' => $currentStreak,
                'max_streak' => $maxStreak,
                'weekly_breakdown' => array_reverse($weeklyStats),
                'last_30_days' => $logsByDate->keys()->toArray()
            ]
        ]);
    }
} 