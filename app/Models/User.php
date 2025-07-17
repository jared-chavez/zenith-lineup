<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\Auditable;

class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;
    use Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'two_factor_enabled',
        'two_factor_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
            'two_factor_verified_at' => 'datetime',
        ];
    }

    /**
     * Get the user's profile.
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Get the user's habits.
     */
    public function habits()
    {
        return $this->hasMany(Habit::class);
    }

    /**
     * Get the user's habit logs.
     */
    public function habitLogs()
    {
        return $this->hasMany(HabitLog::class);
    }

    /**
     * Get the user's achievements.
     */
    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
                    ->withPivot('unlocked_at', 'progress')
                    ->withTimestamps();
    }

    /**
     * Get the user's points history.
     */
    public function points()
    {
        return $this->hasMany(UserPoint::class);
    }

    /**
     * Get total points for the user.
     */
    public function getTotalPointsAttribute(): int
    {
        return UserPoint::getTotalPoints($this);
    }

    /**
     * Get user's level based on total points.
     */
    public function getLevelAttribute(): int
    {
        $points = $this->total_points;
        return floor($points / 100) + 1; // Every 100 points = 1 level
    }

    /**
     * Get progress to next level.
     */
    public function getLevelProgressAttribute(): array
    {
        $points = $this->total_points;
        $currentLevel = $this->level;
        $pointsForCurrentLevel = ($currentLevel - 1) * 100;
        $pointsForNextLevel = $currentLevel * 100;
        $progress = $points - $pointsForCurrentLevel;
        $required = $pointsForNextLevel - $pointsForCurrentLevel;
        
        return [
            'current_level' => $currentLevel,
            'next_level' => $currentLevel + 1,
            'progress' => $progress,
            'required' => $required,
            'percentage' => min(100, round(($progress / $required) * 100, 2))
        ];
    }

    /**
     * Get the user's push notification subscriptions
     */
    public function pushSubscriptions()
    {
        return $this->hasMany(PushSubscription::class);
    }
}
