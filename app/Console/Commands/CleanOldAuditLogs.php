<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;

class CleanOldAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:clean {--days=90 : Number of days to keep logs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean old audit logs to prevent database bloat';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = now()->subDays($days);

        $this->info("Cleaning audit logs older than {$days} days...");

        $deletedCount = AuditLog::where('created_at', '<', $cutoffDate)->delete();

        $this->info("Deleted {$deletedCount} old audit logs.");

        // Show remaining logs count
        $remainingCount = AuditLog::count();
        $this->info("Remaining audit logs: {$remainingCount}");

        return Command::SUCCESS;
    }
}
