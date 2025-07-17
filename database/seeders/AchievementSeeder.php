<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $achievements = [
            // Streak Achievements
            [
                'name' => 'Primer Paso',
                'description' => 'Completa un hábito por primera vez',
                'icon' => 'first-step',
                'type' => 'streak',
                'category' => 'habits',
                'requirement' => 1,
                'points' => 10,
                'badge_color' => '#10B981',
            ],
            [
                'name' => 'Racha de 3 Días',
                'description' => 'Mantén una racha de 3 días consecutivos',
                'icon' => 'streak-3',
                'type' => 'streak',
                'category' => 'consistency',
                'requirement' => 3,
                'points' => 25,
                'badge_color' => '#3B82F6',
            ],
            [
                'name' => 'Racha de 7 Días',
                'description' => 'Mantén una racha de 7 días consecutivos',
                'icon' => 'streak-7',
                'type' => 'streak',
                'category' => 'consistency',
                'requirement' => 7,
                'points' => 50,
                'badge_color' => '#8B5CF6',
            ],
            [
                'name' => 'Racha de 30 Días',
                'description' => 'Mantén una racha de 30 días consecutivos',
                'icon' => 'streak-30',
                'type' => 'streak',
                'category' => 'consistency',
                'requirement' => 30,
                'points' => 200,
                'badge_color' => '#F59E0B',
            ],

            // Count Achievements
            [
                'name' => 'Creador de Hábitos',
                'description' => 'Crea tu primer hábito',
                'icon' => 'habit-creator',
                'type' => 'count',
                'category' => 'habits',
                'requirement' => 1,
                'points' => 15,
                'badge_color' => '#10B981',
            ],
            [
                'name' => 'Multi-Hábitos',
                'description' => 'Crea 5 hábitos diferentes',
                'icon' => 'multi-habits',
                'type' => 'count',
                'category' => 'habits',
                'requirement' => 5,
                'points' => 75,
                'badge_color' => '#3B82F6',
            ],
            [
                'name' => 'Maestro de Hábitos',
                'description' => 'Crea 10 hábitos diferentes',
                'icon' => 'habit-master',
                'type' => 'count',
                'category' => 'habits',
                'requirement' => 10,
                'points' => 150,
                'badge_color' => '#8B5CF6',
            ],
            [
                'name' => 'Primer Registro',
                'description' => 'Completa tu primer registro de hábito',
                'icon' => 'first-log',
                'type' => 'count',
                'category' => 'logs',
                'requirement' => 1,
                'points' => 10,
                'badge_color' => '#10B981',
            ],
            [
                'name' => 'Registrador Activo',
                'description' => 'Completa 50 registros de hábitos',
                'icon' => 'active-logger',
                'type' => 'count',
                'category' => 'completed_logs',
                'requirement' => 50,
                'points' => 100,
                'badge_color' => '#3B82F6',
            ],
            [
                'name' => 'Registrador Experto',
                'description' => 'Completa 100 registros de hábitos',
                'icon' => 'expert-logger',
                'type' => 'count',
                'category' => 'completed_logs',
                'requirement' => 100,
                'points' => 200,
                'badge_color' => '#8B5CF6',
            ],

            // Milestone Achievements
            [
                'name' => 'Nivel 1',
                'description' => 'Alcanza el nivel 1 (100 puntos)',
                'icon' => 'level-1',
                'type' => 'milestone',
                'category' => 'consistency',
                'requirement' => 100,
                'points' => 0, // No additional points for level milestones
                'badge_color' => '#10B981',
            ],
            [
                'name' => 'Nivel 5',
                'description' => 'Alcanza el nivel 5 (500 puntos)',
                'icon' => 'level-5',
                'type' => 'milestone',
                'category' => 'consistency',
                'requirement' => 500,
                'points' => 0,
                'badge_color' => '#3B82F6',
            ],
            [
                'name' => 'Nivel 10',
                'description' => 'Alcanza el nivel 10 (1000 puntos)',
                'icon' => 'level-10',
                'type' => 'milestone',
                'category' => 'consistency',
                'requirement' => 1000,
                'points' => 0,
                'badge_color' => '#8B5CF6',
            ],

            // Special Achievements
            [
                'name' => 'Primera Semana',
                'description' => 'Usa la aplicación durante 7 días consecutivos',
                'icon' => 'first-week',
                'type' => 'special',
                'category' => 'consistency',
                'requirement' => 7,
                'points' => 50,
                'badge_color' => '#F59E0B',
            ],
            [
                'name' => 'Primer Mes',
                'description' => 'Usa la aplicación durante 30 días consecutivos',
                'icon' => 'first-month',
                'type' => 'special',
                'category' => 'consistency',
                'requirement' => 30,
                'points' => 200,
                'badge_color' => '#EF4444',
            ],
            [
                'name' => 'Perfeccionista',
                'description' => 'Completa todos tus hábitos en un solo día',
                'icon' => 'perfectionist',
                'type' => 'special',
                'category' => 'consistency',
                'requirement' => 1,
                'points' => 100,
                'badge_color' => '#EC4899',
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['name' => $achievement['name']],
                $achievement
            );
        }
    }
}
