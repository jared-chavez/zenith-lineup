<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
            'name' => ['required', 'string', 'max:100', 'min:2'],
            'type' => ['required', Rule::in(['water', 'sleep', 'exercise', 'nutrition', 'meditation'])],
            'description' => ['nullable', 'string', 'max:1000'],
            'target_goals' => ['nullable', 'array'],
            'target_goals.*' => ['numeric', 'min:0'],
            'reminder_time' => ['nullable', 'date_format:H:i'],
            'is_active' => ['boolean'],
            'is_public' => ['boolean'],
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
} 