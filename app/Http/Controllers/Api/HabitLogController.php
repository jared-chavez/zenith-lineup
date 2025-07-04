<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HabitLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class HabitLogController extends Controller
{
    /**
     * Get all habit logs for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $logs = $user->habitLogs()
            ->with('habit')
            ->orderBy('log_date', 'desc')
            ->paginate(20);

        return response()->json([
            'logs' => $logs
        ]);
    }

    /**
     * Store a new habit log.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), HabitLog::rules());

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        // Check if the habit belongs to the user
        $habit = $request->user()->habits()->find($request->habit_id);
        if (!$habit) {
            return response()->json([
                'error' => 'Habit not found'
            ], 404);
        }

        try {
            $log = $request->user()->habitLogs()->create($request->all());

            Log::info('Habit log created', [
                'user_id' => $request->user()->id,
                'habit_id' => $log->habit_id,
                'log_date' => $log->log_date
            ]);

            return response()->json([
                'message' => 'Habit log created successfully',
                'log' => $log->load('habit')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Habit log creation failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to create habit log'
            ], 500);
        }
    }

    /**
     * Get a specific habit log.
     */
    public function show(Request $request, HabitLog $habitLog): JsonResponse
    {
        // Check if the log belongs to the authenticated user
        if (!$habitLog->belongsToUser($request->user()->id)) {
            return response()->json([
                'error' => 'Habit log not found'
            ], 404);
        }

        return response()->json([
            'log' => $habitLog->load('habit')
        ]);
    }

    /**
     * Update a habit log.
     */
    public function update(Request $request, HabitLog $habitLog): JsonResponse
    {
        // Check if the log belongs to the authenticated user
        if (!$habitLog->belongsToUser($request->user()->id)) {
            return response()->json([
                'error' => 'Habit log not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), HabitLog::rules());

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            $habitLog->update($request->all());

            Log::info('Habit log updated', [
                'user_id' => $request->user()->id,
                'log_id' => $habitLog->id
            ]);

            return response()->json([
                'message' => 'Habit log updated successfully',
                'log' => $habitLog->load('habit')
            ]);

        } catch (\Exception $e) {
            Log::error('Habit log update failed', [
                'user_id' => $request->user()->id,
                'log_id' => $habitLog->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to update habit log'
            ], 500);
        }
    }

    /**
     * Delete a habit log.
     */
    public function destroy(Request $request, HabitLog $habitLog): JsonResponse
    {
        // Check if the log belongs to the authenticated user
        if (!$habitLog->belongsToUser($request->user()->id)) {
            return response()->json([
                'error' => 'Habit log not found'
            ], 404);
        }

        try {
            $habitLog->delete();

            Log::info('Habit log deleted', [
                'user_id' => $request->user()->id,
                'log_id' => $habitLog->id
            ]);

            return response()->json([
                'message' => 'Habit log deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Habit log deletion failed', [
                'user_id' => $request->user()->id,
                'log_id' => $habitLog->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to delete habit log'
            ], 500);
        }
    }

    /**
     * Get habit logs for a specific date.
     */
    public function getByDate(Request $request, string $date): JsonResponse
    {
        $validator = Validator::make(['date' => $date], [
            'date' => ['required', 'date', 'before_or_equal:today']
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid date format'
            ], 422);
        }

        $logs = $request->user()->habitLogs()
            ->with('habit')
            ->where('log_date', $date)
            ->get();

        return response()->json([
            'date' => $date,
            'logs' => $logs
        ]);
    }

    /**
     * Get habit logs for a date range.
     */
    public function getByDateRange(Request $request, string $start, string $end): JsonResponse
    {
        $validator = Validator::make(['start' => $start, 'end' => $end], [
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start']
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid date range'
            ], 422);
        }

        $logs = $request->user()->habitLogs()
            ->with('habit')
            ->dateRange($start, $end)
            ->orderBy('log_date', 'desc')
            ->get();

        return response()->json([
            'start_date' => $start,
            'end_date' => $end,
            'logs' => $logs
        ]);
    }
} 