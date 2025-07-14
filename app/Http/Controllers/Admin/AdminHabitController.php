<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Habit;
use Illuminate\Http\Request;

class AdminHabitController extends Controller
{
    public function index(Request $request)
    {
        $query = Habit::with(['user', 'habitLogs']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $habits = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'habits' => $habits
        ]);
    }

    public function show($id)
    {
        $habit = Habit::with(['user', 'habitLogs'])->findOrFail($id);
        return response()->json([
            'habit' => $habit
        ]);
    }

    public function update(Request $request, $id)
    {
        $habit = Habit::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'type' => 'required|in:water,sleep,exercise,nutrition,meditation',
            'is_active' => 'required|boolean',
            'reminder_time' => 'nullable|date_format:H:i',
            'target_goals' => 'nullable|json',
        ]);

        $habit->update($validated);
        
        return response()->json([
            'message' => 'Hábito actualizado correctamente',
            'habit' => $habit->load(['user', 'habitLogs'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $habit = Habit::findOrFail($id);
        $habit->delete();
        
        return response()->json([
            'message' => 'Hábito eliminado correctamente'
        ]);
    }
}
