<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\UserPoint;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AchievementController extends Controller
{
    /**
     * Get all achievements for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $achievements = Achievement::active()
            ->with(['users' => function($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($achievement) use ($user) {
                $progress = $achievement->getProgressFor($user);
                return [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon_url,
                    'type' => $achievement->type,
                    'category' => $achievement->category,
                    'points' => $achievement->points,
                    'badge_color' => $achievement->badge_color,
                    'progress' => $progress,
                ];
            });

        return response()->json([
            'achievements' => $achievements,
            'user_stats' => [
                'total_points' => $user->total_points,
                'level' => $user->level,
                'level_progress' => $user->level_progress,
                'unlocked_count' => $user->achievements()->count(),
                'total_available' => Achievement::active()->count(),
            ]
        ]);
    }

    /**
     * Get user's points history
     */
    public function pointsHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $points = UserPoint::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $breakdown = UserPoint::getPointsBreakdown($user);

        return response()->json([
            'points' => $points,
            'breakdown' => $breakdown,
            'total_points' => $user->total_points,
            'level' => $user->level,
            'level_progress' => $user->level_progress,
        ]);
    }

    /**
     * Get user's unlocked achievements
     */
    public function unlocked(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $achievements = $user->achievements()
            ->orderBy('pivot_unlocked_at', 'desc')
            ->get()
            ->map(function ($achievement) {
                return [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon_url,
                    'points' => $achievement->points,
                    'badge_color' => $achievement->badge_color,
                    'unlocked_at' => $achievement->pivot->unlocked_at,
                ];
            });

        return response()->json([
            'achievements' => $achievements,
            'count' => $achievements->count(),
        ]);
    }

    /**
     * Get achievements by category
     */
    public function byCategory(Request $request, string $category): JsonResponse
    {
        $user = $request->user();
        
        $achievements = Achievement::active()
            ->byCategory($category)
            ->with(['users' => function($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($achievement) use ($user) {
                $progress = $achievement->getProgressFor($user);
                return [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon_url,
                    'type' => $achievement->type,
                    'points' => $achievement->points,
                    'badge_color' => $achievement->badge_color,
                    'progress' => $progress,
                ];
            });

        return response()->json([
            'category' => $category,
            'achievements' => $achievements,
        ]);
    }

    /**
     * Check and unlock achievements for the user
     */
    public function checkAchievements(Request $request): JsonResponse
    {
        $user = $request->user();
        $newlyUnlocked = [];

        // Get all active achievements
        $achievements = Achievement::active()->get();

        foreach ($achievements as $achievement) {
            if (!$achievement->isUnlockedBy($user)) {
                if ($achievement->unlockFor($user)) {
                    $newlyUnlocked[] = [
                        'id' => $achievement->id,
                        'name' => $achievement->name,
                        'description' => $achievement->description,
                        'icon' => $achievement->icon_url,
                        'points' => $achievement->points,
                        'badge_color' => $achievement->badge_color,
                    ];
                }
            }
        }

        return response()->json([
            'newly_unlocked' => $newlyUnlocked,
            'count' => count($newlyUnlocked),
            'user_stats' => [
                'total_points' => $user->total_points,
                'level' => $user->level,
                'level_progress' => $user->level_progress,
            ]
        ]);
    }

    /**
     * Get leaderboard
     */
    public function leaderboard(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        
        $leaderboard = UserPoint::selectRaw('user_id, SUM(points) as total_points')
            ->with('user:id,name')
            ->groupBy('user_id')
            ->orderBy('total_points', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item, $index) {
                return [
                    'rank' => $index + 1,
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name,
                    'total_points' => $item->total_points,
                    'level' => floor($item->total_points / 100) + 1,
                ];
            });

        return response()->json([
            'leaderboard' => $leaderboard,
        ]);
    }
} 