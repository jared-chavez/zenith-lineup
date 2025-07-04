<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuario de prueba
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@zenith-lineup.com',
            'password' => Hash::make('SecurePass123!'),
            'email_verified_at' => now(),
        ]);

        // Crear perfil de usuario
        $profile = $user->profile()->create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'activity_level' => 'moderate',
            'timezone' => 'UTC',
            'health_goals' => [
                'drink_water' => 2000, // ml por día
                'sleep_hours' => 8,    // horas por noche
                'exercise_minutes' => 30, // minutos por día
            ],
            'preferences' => [
                'notifications' => true,
                'reminders' => true,
                'privacy' => 'private',
            ],
        ]);

        // Crear hábitos de ejemplo
        $habits = [
            [
                'name' => 'Beber Agua',
                'type' => 'water',
                'description' => 'Beber 2 litros de agua al día',
                'target_goals' => ['daily_target' => 2000], // ml
                'reminder_time' => '09:00',
                'is_active' => true,
            ],
            [
                'name' => 'Dormir Bien',
                'type' => 'sleep',
                'description' => 'Dormir 8 horas por noche',
                'target_goals' => ['hours' => 8],
                'reminder_time' => '22:00',
                'is_active' => true,
            ],
            [
                'name' => 'Ejercicio Diario',
                'type' => 'exercise',
                'description' => 'Hacer 30 minutos de ejercicio',
                'target_goals' => ['minutes' => 30],
                'reminder_time' => '18:00',
                'is_active' => true,
            ],
        ];

        foreach ($habits as $habitData) {
            $habit = $user->habits()->create($habitData);

            // Crear algunos logs de ejemplo para el último mes
            for ($i = 0; $i < 7; $i++) {
                $date = now()->subDays($i);
                
                $logData = [
                    'habit_id' => $habit->id,
                    'log_date' => $date->format('Y-m-d'),
                    'status' => rand(0, 2) === 0 ? 'completed' : (rand(0, 1) === 0 ? 'partial' : 'missed'),
                    'notes' => $i % 3 === 0 ? 'Nota de ejemplo' : null,
                ];

                // Datos específicos según el tipo de hábito
                switch ($habit->type) {
                    case 'water':
                        $logData['data'] = [
                            'amount' => rand(1500, 2500), // ml
                            'glasses' => rand(6, 12),
                        ];
                        break;
                    case 'sleep':
                        $logData['data'] = [
                            'hours' => rand(6, 9),
                            'quality' => rand(1, 5), // 1-5 escala
                            'bedtime' => '22:' . str_pad(rand(0, 59), 2, '0', STR_PAD_LEFT),
                            'wake_time' => '07:' . str_pad(rand(0, 59), 2, '0', STR_PAD_LEFT),
                        ];
                        break;
                    case 'exercise':
                        $logData['data'] = [
                            'minutes' => rand(20, 60),
                            'type' => ['cardio', 'strength', 'flexibility'][rand(0, 2)],
                            'calories' => rand(100, 500),
                        ];
                        break;
                }

                $user->habitLogs()->create($logData);
            }
        }

        $this->command->info('✅ Datos de prueba creados exitosamente!');
        $this->command->info('👤 Usuario de prueba: test@zenith-lineup.com');
        $this->command->info('🔑 Contraseña: SecurePass123!');
    }
}
