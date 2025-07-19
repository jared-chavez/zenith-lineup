<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class Habit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'description',
        'target_goals',
        'reminder_time',
        'is_active',
        'is_public',
    ];

    protected $casts = [
        'target_goals' => 'array',
        'reminder_time' => 'datetime',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
    ];

    protected $hidden = [
        'user_id', // Hide user_id from API responses for security
    ];

    /**
     * Get the user that owns the habit.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the habit logs for this habit.
     */
    public function habitLogs(): HasMany
    {
        return $this->hasMany(HabitLog::class);
    }

    /**
     * Validation rules for habit creation/update.
     */
    public static function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'min:2', 'regex:/^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ]+$/'],
            'type' => ['required', Rule::in(['water', 'sleep', 'exercise', 'nutrition', 'meditation'])],
            'description' => ['nullable', 'string', 'max:1000', 'regex:/^[a-zA-Z0-9\s\-_.,!?áéíóúÁÉÍÓÚñÑ]+$/'],
            'target_goals' => ['nullable', 'array'],
            'target_goals.*' => ['numeric', 'min:0', 'max:1000'],
            'reminder_time' => ['nullable', 'date_format:H:i'],
            'is_active' => ['boolean'],
            'is_public' => ['boolean'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public static function validationMessages(): array
    {
        return [
            'name.regex' => 'El nombre solo puede contener letras, números, espacios y guiones.',
            'description.regex' => 'La descripción contiene caracteres no permitidos.',
            'target_goals.*.max' => 'Los objetivos no pueden exceder 1000.',
        ];
    }

    /**
     * Scope to get only active habits.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get habits by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if the habit belongs to the given user.
     */
    public function belongsToUser(int $userId): bool
    {
        return $this->user_id === $userId;
    }

    /**
     * Get habit statistics for the current month.
     */
    public function getMonthlyStats(): array
    {
        $currentMonth = now()->startOfMonth();
        
        $logs = $this->habitLogs()
            ->whereBetween('log_date', [
                $currentMonth->format('Y-m-d'),
                $currentMonth->endOfMonth()->format('Y-m-d')
            ])
            ->get();

        return [
            'total_logs' => $logs->count(),
            'completed' => $logs->where('status', 'completed')->count(),
            'partial' => $logs->where('status', 'partial')->count(),
            'missed' => $logs->where('status', 'missed')->count(),
            'completion_rate' => $logs->count() > 0 ? 
                round(($logs->where('status', 'completed')->count() / $logs->count()) * 100, 2) : 0,
        ];
    }

    /**
     * Resolve route binding to only return habits belonging to the authenticated user.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        if (!Auth::check()) {
            Log::info('Route binding: No user authenticated');
            return null;
        }
        
        $userId = Auth::user()->id;
        Log::info('Route binding: Looking for habit', ['habit_id' => $value, 'user_id' => $userId]);
        
        $habit = $this->where('id', $value)
                    ->where('user_id', $userId)
                    ->first();
                    
        Log::info('Route binding: Result', ['found' => $habit ? 'yes' : 'no']);
        
        return $habit;
    }
} 