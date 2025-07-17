<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'type',
        'category',
        'requirement',
        'points',
        'badge_color',
        'is_active',
        'conditions'
    ];

    protected $casts = [
        'conditions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get users who have unlocked this achievement
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
                    ->withPivot('unlocked_at', 'progress')
                    ->withTimestamps();
    }

    /**
     * Check if a user has unlocked this achievement
     */
    public function isUnlockedBy(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Get user's progress towards this achievement
     */
    public function getProgressFor(User $user): array
    {
        $userAchievement = $this->users()->where('user_id', $user->id)->first();
        
        if ($userAchievement) {
            return [
                'unlocked' => true,
                'unlocked_at' => $userAchievement->pivot->unlocked_at,
                'progress' => $userAchievement->pivot->progress ?? [],
            ];
        }

        // Calculate current progress
        $progress = $this->calculateProgress($user);
        
        return [
            'unlocked' => false,
            'current' => $progress['current'],
            'required' => $this->requirement,
            'percentage' => min(100, round(($progress['current'] / $this->requirement) * 100, 2)),
            'progress' => $progress,
        ];
    }

    /**
     * Calculate user's progress towards this achievement
     */
    private function calculateProgress(User $user): array
    {
        switch ($this->type) {
            case 'streak':
                return $this->calculateStreakProgress($user);
            case 'count':
                return $this->calculateCountProgress($user);
            case 'milestone':
                return $this->calculateMilestoneProgress($user);
            case 'special':
                return $this->calculateSpecialProgress($user);
            default:
                return ['current' => 0];
        }
    }

    /**
     * Calculate streak-based progress
     */
    private function calculateStreakProgress(User $user): array
    {
        $category = $this->category;
        
        switch ($category) {
            case 'habits':
                // Longest streak of habit completions
                $streak = $user->habitLogs()
                    ->where('status', 'completed')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->groupBy(function ($log) {
                        return $log->created_at->format('Y-m-d');
                    })
                    ->keys()
                    ->sort()
                    ->reverse()
                    ->values();
                
                $currentStreak = 0;
                $maxStreak = 0;
                $tempStreak = 0;
                
                foreach ($streak as $date) {
                    $tempStreak++;
                    $maxStreak = max($maxStreak, $tempStreak);
                }
                
                return ['current' => $maxStreak];
                
            case 'logs':
                // Consecutive days with any log
                $logs = $user->habitLogs()
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->groupBy(function ($log) {
                        return $log->created_at->format('Y-m-d');
                    });
                
                $currentStreak = 0;
                $date = now();
                
                while ($logs->has($date->format('Y-m-d'))) {
                    $currentStreak++;
                    $date = $date->subDay();
                }
                
                return ['current' => $currentStreak];
        }
        
        return ['current' => 0];
    }

    /**
     * Calculate count-based progress
     */
    private function calculateCountProgress(User $user): array
    {
        $category = $this->category;
        
        switch ($category) {
            case 'habits':
                return ['current' => $user->habits()->count()];
            case 'logs':
                return ['current' => $user->habitLogs()->count()];
            case 'completed_logs':
                return ['current' => $user->habitLogs()->where('status', 'completed')->count()];
            case 'days_active':
                return ['current' => $user->habitLogs()
                    ->distinct('created_at')
                    ->count()];
        }
        
        return ['current' => 0];
    }

    /**
     * Calculate milestone-based progress
     */
    private function calculateMilestoneProgress(User $user): array
    {
        // Milestones are typically based on total counts
        return $this->calculateCountProgress($user);
    }

    /**
     * Calculate special achievement progress
     */
    private function calculateSpecialProgress(User $user): array
    {
        // Special achievements might have custom logic
        if (isset($this->conditions['custom_logic'])) {
            // Implement custom logic based on conditions
            return ['current' => 0];
        }
        
        return ['current' => 0];
    }

    /**
     * Unlock achievement for a user
     */
    public function unlockFor(User $user): bool
    {
        if ($this->isUnlockedBy($user)) {
            return false; // Already unlocked
        }

        $progress = $this->calculateProgress($user);
        
        if ($progress['current'] >= $this->requirement) {
            // Unlock achievement
            $this->users()->attach($user->id, [
                'unlocked_at' => now(),
                'progress' => json_encode($progress)
            ]);

            // Award points
            if ($this->points > 0) {
                UserPoint::create([
                    'user_id' => $user->id,
                    'points' => $this->points,
                    'source' => 'achievement',
                    'description' => "Logro desbloqueado: {$this->name}",
                    'metadata' => ['achievement_id' => $this->id]
                ]);
            }

            return true;
        }

        return false;
    }

    /**
     * Get formatted icon
     */
    public function getIconUrlAttribute(): string
    {
        if ($this->icon) {
            return asset("images/achievements/{$this->icon}");
        }
        
        // Default icons based on category
        $defaultIcons = [
            'habits' => '🎯',
            'logs' => '📝',
            'consistency' => '🔥',
            'social' => '👥',
        ];
        
        return $defaultIcons[$this->category] ?? '🏆';
    }

    /**
     * Scope for active achievements
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}
