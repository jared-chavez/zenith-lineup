<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\PushSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendDailyNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:daily {--type=all : Type of notifications to send (all, motivation, reminders, achievements)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily notifications to users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->option('type');
        
        $this->info("Sending daily notifications (type: {$type})...");

        $users = User::with('pushSubscriptions', 'habits', 'habitLogs')->get();
        
        $totalSent = 0;

        foreach ($users as $user) {
            if ($user->pushSubscriptions->isEmpty()) {
                continue; // Skip users without push subscriptions
            }

            $notificationsSent = 0;

            // Send motivational messages
            if (in_array($type, ['all', 'motivation'])) {
                if ($this->shouldSendMotivation($user)) {
                    $this->sendMotivationNotification($user);
                    $notificationsSent++;
                }
            }

            // Send reminders for incomplete habits
            if (in_array($type, ['all', 'reminders'])) {
                $remindersSent = $this->sendReminderNotifications($user);
                $notificationsSent += $remindersSent;
            }

            // Send achievement notifications
            if (in_array($type, ['all', 'achievements'])) {
                if ($this->shouldSendAchievementNotification($user)) {
                    $this->sendAchievementNotification($user);
                    $notificationsSent++;
                }
            }

            if ($notificationsSent > 0) {
                $this->line("📱 Sent {$notificationsSent} notification(s) to {$user->name}");
                $totalSent += $notificationsSent;
            }
        }

        $this->info("🎯 Total notifications sent: {$totalSent}");
        
        return 0;
    }

    /**
     * Check if user should receive motivation notification
     */
    private function shouldSendMotivation(User $user): bool
    {
        // Send motivation if user hasn't logged any habits today
        $todayLogs = $user->habitLogs()
            ->whereDate('created_at', today())
            ->count();

        return $todayLogs === 0;
    }

    /**
     * Send motivation notification
     */
    private function sendMotivationNotification(User $user): void
    {
        $messages = [
            "¡Buenos días {$user->name}! 🌅 Es un nuevo día para construir mejores hábitos.",
            "¡Hola {$user->name}! 💪 Cada pequeño paso cuenta hacia tus objetivos.",
            "¡Saludos {$user->name}! ✨ Hoy es perfecto para continuar tu progreso.",
            "¡Hola {$user->name}! 🎯 Recuerda: la consistencia es la clave del éxito.",
            "¡Buen día {$user->name}! 🌟 Tú tienes el poder de cambiar tus hábitos.",
        ];

        $message = $messages[array_rand($messages)];

        // Log the notification (in a real app, this would send via push service)
        Log::info('Motivation notification would be sent', [
            'user_id' => $user->id,
            'message' => $message,
        ]);

        $this->line("💬 Motivation: {$message}");
    }

    /**
     * Send reminder notifications for incomplete habits
     */
    private function sendReminderNotifications(User $user): int
    {
        $activeHabits = $user->habits()->where('status', 'active')->get();
        $remindersSent = 0;

        foreach ($activeHabits as $habit) {
            // Check if habit hasn't been logged today
            $todayLog = $user->habitLogs()
                ->where('habit_id', $habit->id)
                ->whereDate('created_at', today())
                ->first();

            if (!$todayLog) {
                $message = "⏰ Recordatorio: No olvides completar '{$habit->name}' hoy.";
                
                // Log the notification
                Log::info('Reminder notification would be sent', [
                    'user_id' => $user->id,
                    'habit_id' => $habit->id,
                    'message' => $message,
                ]);

                $this->line("⏰ Reminder: {$message}");
                $remindersSent++;
            }
        }

        return $remindersSent;
    }

    /**
     * Check if user should receive achievement notification
     */
    private function shouldSendAchievementNotification(User $user): bool
    {
        // Send achievement notification if user has made progress recently
        $recentLogs = $user->habitLogs()
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return $recentLogs > 0;
    }

    /**
     * Send achievement notification
     */
    private function sendAchievementNotification(User $user): void
    {
        $totalPoints = $user->total_points;
        $level = $user->level;
        $levelProgress = $user->level_progress;

        $message = "🏆 ¡Excelente trabajo! Tienes {$totalPoints} puntos y estás en el nivel {$level}. ";
        $message .= "Te faltan {$levelProgress['required']} puntos para el siguiente nivel.";

        // Log the notification
        Log::info('Achievement notification would be sent', [
            'user_id' => $user->id,
            'message' => $message,
        ]);

        $this->line("🏆 Achievement: {$message}");
    }
}
