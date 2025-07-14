<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['profile', 'habits', 'habitLogs']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhereHas('profile', function($profileQuery) use ($search) {
                      $profileQuery->where('first_name', 'like', '%' . $search . '%')
                                  ->orWhere('last_name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // 2FA filter
        if ($request->filled('two_factor_enabled')) {
            $query->where('two_factor_enabled', $request->two_factor_enabled);
        }

        // Date range filter
        if ($request->filled('created_from')) {
            $query->whereDate('created_at', '>=', $request->created_from);
        }

        if ($request->filled('created_to')) {
            $query->whereDate('created_at', '<=', $request->created_to);
        }

        // Activity filter
        if ($request->filled('activity_status')) {
            switch ($request->activity_status) {
                case 'active':
                    $query->whereHas('habitLogs', function($q) {
                        $q->where('created_at', '>=', now()->subDays(30));
                    });
                    break;
                case 'inactive':
                    $query->whereDoesntHave('habitLogs', function($q) {
                        $q->where('created_at', '>=', now()->subDays(30));
                    });
                    break;
                case 'new':
                    $query->where('created_at', '>=', now()->subDays(7));
                    break;
            }
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 20);
        $users = $query->paginate($perPage);

        // Get filter options
        $filterOptions = $this->getFilterOptions();

        return response()->json([
            'users' => $users,
            'filter_options' => $filterOptions,
        ]);
    }

    public function show($id): JsonResponse
    {
        $user = User::with(['profile', 'habits', 'habitLogs'])
            ->withCount(['habits', 'habitLogs'])
            ->findOrFail($id);

        // Get user statistics
        $userStats = $this->getUserStats($user);

        // Get recent audit logs for this user
        $recentAuditLogs = AuditLog::where('user_id', $id)
            ->orWhere('model_type', User::class)
            ->where('model_id', $id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'user' => $user,
            'stats' => $userStats,
            'recent_audit_logs' => $recentAuditLogs,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'role' => 'sometimes|required|in:user,admin',
            'two_factor_enabled' => 'sometimes|boolean',
            'password' => 'sometimes|nullable|string|min:8',
        ]);

        // Store old values for audit log
        $oldValues = $user->getAttributes();

        // Update user
        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        // Log the action manually since we want more control
        $user->logAudit('update', $oldValues, $user->getAttributes(), 
            "Admin actualizó usuario {$user->name}");

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user->load(['profile', 'habits', 'habitLogs'])
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent admin from deleting themselves
        if ($user->id === $request->user()->id) {
            return response()->json([
                'error' => 'No puedes eliminar tu propia cuenta'
            ], 400);
        }

        // Store user info for audit log
        $userInfo = $user->getAttributes();
        
        $user->delete();

        // Log the deletion
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete',
            'model_type' => User::class,
            'model_id' => $id,
            'old_values' => $userInfo,
            'description' => "Admin eliminó usuario {$userInfo['name']}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        
        return response()->json([
            'message' => 'Usuario eliminado correctamente'
        ]);
    }

    /**
     * Bulk actions on users
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'action' => 'required|in:delete,change_role,enable_2fa,disable_2fa,export',
            'role' => 'required_if:action,change_role|in:user,admin',
        ]);

        $userIds = $validated['user_ids'];
        $action = $validated['action'];

        switch ($action) {
            case 'delete':
                $this->bulkDelete($userIds, $request);
                $message = 'Usuarios eliminados correctamente';
                break;

            case 'change_role':
                User::whereIn('id', $userIds)->update(['role' => $validated['role']]);
                $message = 'Roles actualizados correctamente';
                break;

            case 'enable_2fa':
                User::whereIn('id', $userIds)->update(['two_factor_enabled' => true]);
                $message = '2FA habilitado para los usuarios seleccionados';
                break;

            case 'disable_2fa':
                User::whereIn('id', $userIds)->update(['two_factor_enabled' => false]);
                $message = '2FA deshabilitado para los usuarios seleccionados';
                break;

            case 'export':
                return $this->exportUsers($userIds);
        }

        // Log bulk action
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'bulk_action',
            'description' => "Acción masiva: {$action} en " . count($userIds) . " usuarios",
            'metadata' => [
                'action' => $action,
                'user_ids' => $userIds,
                'affected_count' => count($userIds),
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => $message,
            'affected_count' => count($userIds)
        ]);
    }

    /**
     * Export users data
     */
    public function export(Request $request): JsonResponse
    {
        $query = User::with(['profile', 'habits', 'habitLogs']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->get();

        $exportData = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'two_factor_enabled' => $user->two_factor_enabled ? 'Sí' : 'No',
                'habits_count' => $user->habits->count(),
                'logs_count' => $user->habitLogs->count(),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'last_login_at' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Nunca',
            ];
        });

        // Log export action
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'export_data',
            'description' => 'Exportó datos de usuarios',
            'metadata' => [
                'filters' => $request->all(),
                'count' => $users->count(),
            ],
        ]);

        return response()->json([
            'data' => $exportData,
            'filename' => 'users_' . now()->format('Y-m-d_H-i-s') . '.json',
        ]);
    }

    /**
     * Get user statistics
     */
    private function getUserStats(User $user): array
    {
        return [
            'total_habits' => $user->habits->count(),
            'active_habits' => $user->habits->where('status', 'active')->count(),
            'total_logs' => $user->habitLogs->count(),
            'completed_logs' => $user->habitLogs->where('status', 'completed')->count(),
            'completion_rate' => $user->habitLogs->count() > 0 
                ? round(($user->habitLogs->where('status', 'completed')->count() / $user->habitLogs->count()) * 100, 2)
                : 0,
            'days_since_registration' => $user->created_at->diffInDays(now()),
            'last_activity' => $user->habitLogs->max('created_at'),
        ];
    }

    /**
     * Bulk delete users
     */
    private function bulkDelete(array $userIds, Request $request): void
    {
        // Prevent deleting the current admin
        $userIds = array_filter($userIds, function($id) use ($request) {
            return $id != $request->user()->id;
        });

        User::whereIn('id', $userIds)->delete();
    }

    /**
     * Export specific users
     */
    private function exportUsers(array $userIds): JsonResponse
    {
        $users = User::with(['profile', 'habits', 'habitLogs'])
            ->whereIn('id', $userIds)
            ->get();

        $exportData = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'data' => $exportData,
            'filename' => 'selected_users_' . now()->format('Y-m-d_H-i-s') . '.json',
        ]);
    }

    /**
     * Get filter options for the frontend
     */
    private function getFilterOptions(): array
    {
        return [
            'roles' => [
                ['value' => 'user', 'label' => 'Usuario'],
                ['value' => 'admin', 'label' => 'Administrador'],
            ],
            'two_factor_options' => [
                ['value' => '1', 'label' => '2FA Habilitado'],
                ['value' => '0', 'label' => '2FA Deshabilitado'],
            ],
            'activity_status' => [
                ['value' => 'active', 'label' => 'Activo'],
                ['value' => 'inactive', 'label' => 'Inactivo'],
                ['value' => 'new', 'label' => 'Nuevo (< 7 días)'],
            ],
        ];
    }
}
