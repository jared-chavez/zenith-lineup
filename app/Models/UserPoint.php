<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'points',
        'source',
        'description',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the user who earned these points
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get total points for a user
     */
    public static function getTotalPoints(User $user): int
    {
        return static::where('user_id', $user->id)->sum('points');
    }

    /**
     * Get points by source
     */
    public static function getPointsBySource(User $user, string $source): int
    {
        return static::where('user_id', $user->id)
                    ->where('source', $source)
                    ->sum('points');
    }

    /**
     * Get recent points history
     */
    public static function getRecentHistory(User $user, int $limit = 10)
    {
        return static::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();
    }

    /**
     * Get points breakdown by source
     */
    public static function getPointsBreakdown(User $user): array
    {
        return static::where('user_id', $user->id)
                    ->selectRaw('source, SUM(points) as total_points, COUNT(*) as count')
                    ->groupBy('source')
                    ->get()
                    ->toArray();
    }
}
