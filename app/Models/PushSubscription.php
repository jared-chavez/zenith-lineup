<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh',
        'auth',
        'preferences'
    ];

    protected $casts = [
        'preferences' => 'array',
    ];

    /**
     * Get the user who owns this subscription
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get default notification preferences
     */
    public function getDefaultPreferencesAttribute(): array
    {
        return [
            'reminders' => true,
            'achievements' => true,
            'streaks' => true,
            'weekly_reports' => true,
            'daily_motivation' => true,
        ];
    }

    /**
     * Get merged preferences (user preferences + defaults)
     */
    public function getMergedPreferencesAttribute(): array
    {
        $userPrefs = $this->preferences ?? [];
        $defaults = $this->default_preferences;
        
        return array_merge($defaults, $userPrefs);
    }
} 