<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AdminAuditController extends Controller
{
    /**
     * Get audit logs with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with(['user', 'model']);

        // Filter by action
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by model type
        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search in description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', '%' . $search . '%')
                  ->orWhere('action', 'like', '%' . $search . '%')
                  ->orWhere('ip_address', 'like', '%' . $search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 20);
        $logs = $query->paginate($perPage);

        // Get filter options
        $filterOptions = $this->getFilterOptions();

        return response()->json([
            'logs' => $logs,
            'filter_options' => $filterOptions,
        ]);
    }

    /**
     * Get specific audit log
     */
    public function show($id): JsonResponse
    {
        $log = AuditLog::with(['user', 'model'])->findOrFail($id);

        return response()->json([
            'log' => $log
        ]);
    }

    /**
     * Get audit logs for a specific model
     */
    public function modelLogs(Request $request, $modelType, $modelId): JsonResponse
    {
        $logs = AuditLog::with(['user'])
            ->where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'logs' => $logs
        ]);
    }

    /**
     * Get audit logs for a specific user
     */
    public function userLogs(Request $request, $userId): JsonResponse
    {
        $logs = AuditLog::with(['model'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'logs' => $logs
        ]);
    }

    /**
     * Get audit statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_logs' => AuditLog::count(),
            'logs_today' => AuditLog::whereDate('created_at', today())->count(),
            'logs_this_week' => AuditLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'logs_this_month' => AuditLog::whereMonth('created_at', now()->month)->count(),
            
            'actions_breakdown' => AuditLog::select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->get(),
                
            'model_types_breakdown' => AuditLog::select('model_type', DB::raw('count(*) as count'))
                ->whereNotNull('model_type')
                ->groupBy('model_type')
                ->orderBy('count', 'desc')
                ->get(),
                
            'top_users' => AuditLog::select('user_id', DB::raw('count(*) as count'))
                ->with('user:id,name,email')
                ->whereNotNull('user_id')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Export audit logs
     */
    public function export(Request $request): JsonResponse
    {
        $query = AuditLog::with(['user', 'model']);

        // Apply filters
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        // Format data for export
        $exportData = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? $log->user->name : 'Sistema',
                'action' => $log->formatted_action,
                'model' => $log->formatted_model,
                'model_id' => $log->model_id,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
            ];
        });

        // Log the export action
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'export_data',
            'description' => 'Exportó logs de auditoría',
            'metadata' => [
                'filters' => $request->all(),
                'count' => $logs->count(),
            ],
        ]);

        return response()->json([
            'data' => $exportData,
            'filename' => 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.json',
        ]);
    }

    /**
     * Get filter options for the frontend
     */
    private function getFilterOptions(): array
    {
        return [
            'actions' => AuditLog::select('action')
                ->distinct()
                ->pluck('action')
                ->map(function ($action) {
                    return [
                        'value' => $action,
                        'label' => (new AuditLog())->getFormattedActionAttribute()
                    ];
                }),
                
            'model_types' => AuditLog::select('model_type')
                ->whereNotNull('model_type')
                ->distinct()
                ->pluck('model_type')
                ->map(function ($modelType) {
                    return [
                        'value' => $modelType,
                        'label' => (new AuditLog())->getFormattedModelAttribute()
                    ];
                }),
                
            'users' => User::select('id', 'name', 'email')
                ->whereHas('auditLogs')
                ->orderBy('name')
                ->get()
                ->map(function ($user) {
                    return [
                        'value' => $user->id,
                        'label' => $user->name . ' (' . $user->email . ')'
                    ];
                }),
        ];
    }
} 