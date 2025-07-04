<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\Rule;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'birth_date',
        'gender',
        'height',
        'weight',
        'activity_level',
        'health_goals',
        'preferences',
        'timezone',
        'is_profile_public',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'height' => 'decimal:2',
        'weight' => 'decimal:2',
        'health_goals' => 'array',
        'preferences' => 'array',
        'is_profile_public' => 'boolean',
    ];

    protected $hidden = [
        'user_id', // Hide user_id from API responses for security
    ];

    /**
     * Get the user that owns this profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Validation rules for user profile creation/update.
     */
    public static function rules(): array
    {
        return [
            'first_name' => ['nullable', 'string', 'max:50', 'min:2'],
            'last_name' => ['nullable', 'string', 'max:50', 'min:2'],
            'birth_date' => ['nullable', 'date', 'before:today', 'after:1900-01-01'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other', 'prefer_not_to_say'])],
            'height' => ['nullable', 'numeric', 'min:50', 'max:300'], // 50cm to 300cm
            'weight' => ['nullable', 'numeric', 'min:20', 'max:500'], // 20kg to 500kg
            'activity_level' => ['nullable', Rule::in(['sedentary', 'light', 'moderate', 'active', 'very_active'])],
            'health_goals' => ['nullable', 'array'],
            'preferences' => ['nullable', 'array'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'is_profile_public' => ['boolean'],
        ];
    }

    /**
     * Calculate BMI if height and weight are available.
     */
    public function getBmiAttribute(): ?float
    {
        if ($this->height && $this->weight) {
            $heightInMeters = $this->height / 100;
            return round($this->weight / ($heightInMeters * $heightInMeters), 2);
        }
        
        return null;
    }

    /**
     * Get BMI category.
     */
    public function getBmiCategoryAttribute(): ?string
    {
        $bmi = $this->bmi;
        
        if (!$bmi) return null;
        
        if ($bmi < 18.5) return 'underweight';
        if ($bmi < 25) return 'normal';
        if ($bmi < 30) return 'overweight';
        return 'obese';
    }

    /**
     * Get full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Check if the profile belongs to the given user.
     */
    public function belongsToUser(int $userId): bool
    {
        return $this->user_id === $userId;
    }
} 