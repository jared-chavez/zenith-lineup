<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'description',
        'metadata'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the user who performed the action
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the model that was affected
     */
    public function model()
    {
        return $this->morphTo();
    }

    /**
     * Scope to filter by action type
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by model type
     */
    public function scopeByModelType($query, $modelType)
    {
        return $query->where('model_type', $modelType);
    }

    /**
     * Get formatted action description
     */
    public function getFormattedActionAttribute()
    {
        $actions = [
            'create' => 'Crear',
            'update' => 'Actualizar',
            'delete' => 'Eliminar',
            'login' => 'Inicio de sesión',
            'logout' => 'Cerrar sesión',
            'enable_2fa' => 'Habilitar 2FA',
            'disable_2fa' => 'Deshabilitar 2FA',
            'export_data' => 'Exportar datos',
            'bulk_action' => 'Acción masiva',
        ];

        return $actions[$this->action] ?? $this->action;
    }

    /**
     * Get formatted model name
     */
    public function getFormattedModelAttribute()
    {
        $models = [
            'App\Models\User' => 'Usuario',
            'App\Models\Habit' => 'Hábito',
            'App\Models\HabitLog' => 'Registro de hábito',
            'App\Models\UserProfile' => 'Perfil de usuario',
        ];

        return $models[$this->model_type] ?? $this->model_type;
    }
} 