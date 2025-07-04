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
            'habits' => $habits
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
                'error' => 'Validation failed',
                'messages' => $validator->errors()
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
    public function update(Request $request, Habit $habit): JsonResponse
    {
        // Check if the habit belongs to the authenticated user
        if (!$habit->belongsToUser($request->user()->id)) {
            return response()->json([
                'error' => 'Habit not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Habit::rules());

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
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
    public function destroy(Request $request, Habit $habit): JsonResponse
    {
        // Check if the habit belongs to the authenticated user
        if (!$habit->belongsToUser($request->user()->id)) {
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
     * Get habit statistics.
     */
    public function stats(Request $request, Habit $habit): JsonResponse
    {
        // Check if the habit belongs to the authenticated user
        if (!$habit->belongsToUser($request->user()->id)) {
            return response()->json([
                'error' => 'Habit not found'
            ], 404);
        }

        $stats = $habit->getMonthlyStats();

        return response()->json([
            'habit_id' => $habit->id,
            'stats' => $stats
        ]);
    }
} 