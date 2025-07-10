<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class HabitLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'habit_id',
        'user_id',
        'log_date',
        'data',
        'status',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'log_date' => 'date',
        'data' => 'array',
        'metadata' => 'array',
    ];

    protected $hidden = [
        'user_id', // Hide user_id from API responses for security
    ];

    /**
     * Get the habit that this log belongs to.
     */
    public function habit(): BelongsTo
    {
        return $this->belongsTo(Habit::class);
    }

    /**
     * Get the user that owns this log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Validation rules for habit log creation/update.
     */
    public static function rules(): array
    {
        return [
            'habit_id' => ['required', 'exists:habits,id'],
            'log_date' => ['required', 'date', 'before_or_equal:today'],
            // 'data' => ['required', 'array'],
            // 'status' => ['required', Rule::in(['completed', 'partial', 'missed'])],
            'notes' => ['nullable', 'string', 'max:1000'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Scope to get logs for a specific date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('log_date', [$startDate, $endDate]);
    }

    /**
     * Scope to get logs by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Check if the log belongs to the given user.
     */
    public function belongsToUser(int $userId): bool
    {
        return $this->user_id === $userId;
    }

    /**
     * Resolve route binding to only return habit logs belonging to the authenticated user.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        if (!Auth::check()) {
            return null;
        }
        
        return $this->where('id', $value)
                    ->where('user_id', Auth::user()->id)
                    ->first();
    }
} 