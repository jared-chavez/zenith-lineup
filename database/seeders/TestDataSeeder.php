<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Habit;
use App\Models\HabitLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users
        $users = [
            [
                'name' => 'Juan Pérez',
                'email' => 'juan@example.com',
                'password' => Hash::make('password'),
                'role' => 'user',
            ],
            [
                'name' => 'María García',
                'email' => 'maria@example.com',
                'password' => Hash::make('password'),
                'role' => 'user',
            ],
            [
                'name' => 'Carlos López',
                'email' => 'carlos@example.com',
                'password' => Hash::make('password'),
                'role' => 'user',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Create user profile if it doesn't exist
            if (!$user->profile) {
                $user->profile()->create([
                    'timezone' => 'America/Mexico_City',
                ]);
            }

            // Create habits for each user
            $habits = [
                [
                    'name' => 'Ejercicio diario',
                    'description' => 'Hacer 30 minutos de ejercicio',
                    'type' => 'exercise',
                    'reminder_time' => '07:00',
                    'target_goals' => json_encode(['duration' => 30]),
                    'is_active' => true,
                ],
                [
                    'name' => 'Meditar',
                    'description' => 'Sesión de meditación de 10 minutos',
                    'type' => 'meditation',
                    'reminder_time' => '06:30',
                    'target_goals' => json_encode(['duration' => 10]),
                    'is_active' => true,
                ],
                [
                    'name' => 'Dormir bien',
                    'description' => 'Dormir 8 horas por noche',
                    'type' => 'sleep',
                    'reminder_time' => '22:00',
                    'target_goals' => json_encode(['hours' => 8]),
                    'is_active' => true,
                ],
                [
                    'name' => 'Beber agua',
                    'description' => 'Beber 2 litros de agua',
                    'type' => 'water',
                    'reminder_time' => '08:00',
                    'target_goals' => json_encode(['liters' => 2]),
                    'is_active' => true,
                ],
            ];

            foreach ($habits as $habitData) {
                $habit = $user->habits()->firstOrCreate(
                    ['name' => $habitData['name']],
                    $habitData
                );

                // Create some habit logs for the last 30 days
                for ($i = 0; $i < 30; $i++) {
                    $date = now()->subDays($i);
                    $status = ['completed', 'missed', 'partial'][array_rand(['completed', 'missed', 'partial'])];
                    
                    // Create log with 70% probability
                    if (rand(1, 100) <= 70) {
                        $user->habitLogs()->firstOrCreate(
                            [
                                'habit_id' => $habit->id,
                                'log_date' => $date->format('Y-m-d'),
                            ],
                            [
                                'status' => $status,
                                'data' => json_encode(['duration' => rand(10, 60)]),
                                'notes' => $status === 'completed' ? 'Completado exitosamente' : 
                                         ($status === 'partial' ? 'Completado parcialmente' : 'No realizado'),
                            ]
                        );
                    }
                }
            }
        }

        // Create some inactive habits
        $inactiveHabits = [
            [
                'name' => 'Comer saludable',
                'description' => 'Comer 3 comidas balanceadas',
                'type' => 'nutrition',
                'reminder_time' => '12:00',
                'target_goals' => json_encode(['meals' => 3]),
                'is_active' => false,
            ],
        ];

        foreach ($inactiveHabits as $habitData) {
            $user = User::inRandomOrder()->first();
            $user->habits()->firstOrCreate(
                ['name' => $habitData['name']],
                $habitData
            );
        }
    }
} 