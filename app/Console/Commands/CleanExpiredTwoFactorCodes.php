<?php

namespace App\Console\Commands;

use App\Models\TwoFactorCode;
use Illuminate\Console\Command;

class CleanExpiredTwoFactorCodes extends Command
{
    protected $signature = '2fa:clean-expired';
    protected $description = 'Clean expired two-factor authentication codes';

    public function handle()
    {
        $deleted = TwoFactorCode::where('expires_at', '<', now())->delete();
        
        $this->info("Deleted {$deleted} expired two-factor codes.");
        
        return 0;
    }
} 