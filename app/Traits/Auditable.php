<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Auditable
{
    /**
     * Boot the trait
     */
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            $model->logAudit('create', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $model->logAudit('update', $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            $model->logAudit('delete', $model->getAttributes(), null);
        });
    }

    /**
     * Log an audit entry
     */
    public function logAudit($action, $oldValues = null, $newValues = null, $description = null, $metadata = [])
    {
        // Don't log if no user is authenticated (system actions)
        if (!Auth::check()) {
            return;
        }

        // Filter out sensitive fields
        $sensitiveFields = ['password', 'remember_token', 'two_factor_secret'];
        
        if ($oldValues) {
            $oldValues = array_diff_key($oldValues, array_flip($sensitiveFields));
        }
        
        if ($newValues) {
            $newValues = array_diff_key($newValues, array_flip($sensitiveFields));
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'description' => $description ?? $this->getAuditDescription($action),
            'metadata' => $metadata,
        ]);
    }

    /**
     * Get audit description for the action
     */
    protected function getAuditDescription($action)
    {
        $modelName = class_basename($this);
        
        $descriptions = [
            'create' => "Creó {$modelName} #{$this->id}",
            'update' => "Actualizó {$modelName} #{$this->id}",
            'delete' => "Eliminó {$modelName} #{$this->id}",
        ];

        return $descriptions[$action] ?? "Acción {$action} en {$modelName} #{$this->id}";
    }

    /**
     * Get audit logs for this model
     */
    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'model');
    }

    /**
     * Get recent audit logs
     */
    public function getRecentAuditLogs($limit = 10)
    {
        return $this->auditLogs()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
} 