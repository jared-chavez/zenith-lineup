<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Achievement;
use Illuminate\Console\Command;

class CheckAchievements extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'achievements:check {--user-id= : Check achievements for specific user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and unlock achievements for users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        
        if ($userId) {
            $user = User::find($userId);
            if (!$user) {
                $this->error("User with ID {$userId} not found.");
                return 1;
            }
            $users = collect([$user]);
        } else {
            $users = User::all();
        }

        $this->info("Checking achievements for {$users->count()} user(s)...");

        $totalUnlocked = 0;
        $achievements = Achievement::active()->get();

        foreach ($users as $user) {
            $userUnlocked = 0;
            
            foreach ($achievements as $achievement) {
                if (!$achievement->isUnlockedBy($user)) {
                    if ($achievement->unlockFor($user)) {
                        $userUnlocked++;
                        $totalUnlocked++;
                        
                        $this->line("✅ {$user->name} unlocked: {$achievement->name}");
                    }
                }
            }
            
            if ($userUnlocked > 0) {
                $this->info("🎉 {$user->name} unlocked {$userUnlocked} new achievement(s)");
            }
        }

        $this->info("🎯 Total achievements unlocked: {$totalUnlocked}");
        
        return 0;
    }
}
