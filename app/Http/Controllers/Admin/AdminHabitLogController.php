<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HabitLog;
use Illuminate\Http\Request;

class AdminHabitLogController extends Controller
{
    public function index(Request $request)
    {
        $query = HabitLog::with(['user', 'habit']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('habit', function($habitQuery) use ($search) {
                    $habitQuery->where('title', 'like', '%' . $search . '%');
                })
                ->orWhereHas('user', function($userQuery) use ($search) {
                    $userQuery->where('name', 'like', '%' . $search . '%');
                })
                ->orWhere('notes', 'like', '%' . $search . '%');
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Date filter
        if ($request->filled('date')) {
            $query->whereDate('log_date', $request->date);
        }

        $logs = $query->orderBy('log_date', 'desc')->get();

        return response()->json([
            'logs' => $logs
        ]);
    }

    public function show($id)
    {
        $log = HabitLog::with(['user', 'habit'])->findOrFail($id);
        return response()->json([
            'log' => $log
        ]);
    }

    public function update(Request $request, $id)
    {
        $log = HabitLog::findOrFail($id);
        
        $validated = $request->validate([
            'log_date' => 'required|date',
            'status' => 'required|in:completed,missed,partial,pending',
            'data' => 'nullable|json',
            'notes' => 'nullable|string',
        ]);

        // Parse JSON data if provided
        if (isset($validated['data']) && is_string($validated['data'])) {
            $validated['data'] = json_decode($validated['data'], true);
        }

        $log->update($validated);
        
        return response()->json([
            'message' => 'Registro actualizado correctamente',
            'log' => $log->load(['user', 'habit'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $log = HabitLog::findOrFail($id);
        $log->delete();
        
        return response()->json([
            'message' => 'Registro eliminado correctamente'
        ]);
    }
}
