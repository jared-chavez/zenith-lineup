<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Habit;
use App\Models\HabitLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HabitLogControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Habit $habit;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->habit = Habit::factory()->create([
            'user_id' => $this->user->id
        ]);
        
        Sanctum::actingAs($this->user);
    }

    public function test_user_can_view_their_habit_logs()
    {
        HabitLog::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'habit_id' => $this->habit->id
        ]);

        $response = $this->getJson('/api/habit-logs');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'logs' => [
                        'data' => [
                            '*' => [
                                'id',
                                'habit_id',
                                'log_date',
                                'data',
                                'status',
                                'habit'
                            ]
                        ]
                    ]
                ]);

        $this->assertCount(3, $response->json('logs.data'));
    }

    public function test_user_cannot_view_other_users_habit_logs()
    {
        $otherUser = User::factory()->create();
        $otherHabit = Habit::factory()->create([
            'user_id' => $otherUser->id
        ]);
        
        HabitLog::factory()->create([
            'user_id' => $otherUser->id,
            'habit_id' => $otherHabit->id
        ]);

        $response = $this->getJson('/api/habit-logs');

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('logs.data'));
    }

    public function test_user_can_create_habit_log()
    {
        $logData = [
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-01',
            'data' => ['detalle' => 'Test log'],
            'status' => 'completed',
            'notes' => 'Test notes'
        ];

        $response = $this->postJson('/api/habit-logs', $logData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'log' => [
                        'id',
                        'habit_id',
                        'log_date',
                        'data',
                        'status',
                        'notes',
                        'habit'
                    ]
                ]);

        $this->assertDatabaseHas('habit_logs', [
            'user_id' => $this->user->id,
            'habit_id' => $this->habit->id,
            'status' => 'completed'
        ]);
    }

    public function test_user_cannot_create_log_for_other_users_habit()
    {
        $otherUser = User::factory()->create();
        $otherHabit = Habit::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $logData = [
            'habit_id' => $otherHabit->id,
            'log_date' => '2025-07-07',
            'data' => ['detalle' => 'Test log'],
            'status' => 'completed'
        ];

        $response = $this->postJson('/api/habit-logs', $logData);

        $response->assertStatus(404)
                ->assertJson([
                    'error' => 'Habit not found'
                ]);
    }

    public function test_habit_log_validation()
    {
        $response = $this->postJson('/api/habit-logs', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['habit_id', 'log_date', 'data', 'status']);
    }

    public function test_user_can_view_specific_habit_log()
    {
        $log = HabitLog::factory()->create([
            'user_id' => $this->user->id,
            'habit_id' => $this->habit->id
        ]);

        $response = $this->getJson("/api/habit-logs/{$log->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'log' => [
                        'id',
                        'habit_id',
                        'log_date',
                        'data',
                        'status',
                        'habit'
                    ]
                ]);
    }

    public function test_user_cannot_view_other_users_habit_log()
    {
        $otherUser = User::factory()->create();
        $otherHabit = Habit::factory()->create([
            'user_id' => $otherUser->id
        ]);
        
        $log = HabitLog::factory()->create([
            'user_id' => $otherUser->id,
            'habit_id' => $otherHabit->id
        ]);

        $response = $this->getJson("/api/habit-logs/{$log->id}");

        $response->assertStatus(404);
    }

    public function test_user_can_update_their_habit_log()
    {
        $log = HabitLog::factory()->create([
            'user_id' => $this->user->id,
            'habit_id' => $this->habit->id
        ]);

        $updateData = [
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-01',
            'data' => ['detalle' => 'Updated log'],
            'status' => 'partial',
            'notes' => 'Updated notes'
        ];

        $response = $this->putJson("/api/habit-logs/{$log->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Habit log updated successfully'
                ]);

        $this->assertDatabaseHas('habit_logs', [
            'id' => $log->id,
            'status' => 'partial'
        ]);
    }

    public function test_user_cannot_update_other_users_habit_log()
    {
        $otherUser = User::factory()->create();
        $otherHabit = Habit::factory()->create([
            'user_id' => $otherUser->id
        ]);
        
        $log = HabitLog::factory()->create([
            'user_id' => $otherUser->id,
            'habit_id' => $otherHabit->id
        ]);

        $updateData = [
            'log_date' => '2025-07-08',
            'data' => ['detalle' => 'Updated log'],
            'status' => 'partial'
        ];

        $response = $this->putJson("/api/habit-logs/{$log->id}", $updateData);

        $response->assertStatus(404);
    }

    public function test_user_can_delete_their_habit_log()
    {
        $log = HabitLog::factory()->create([
            'user_id' => $this->user->id,
            'habit_id' => $this->habit->id
        ]);

        $response = $this->deleteJson("/api/habit-logs/{$log->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Habit log deleted successfully'
                ]);

        $this->assertDatabaseMissing('habit_logs', [
            'id' => $log->id
        ]);
    }

    public function test_user_cannot_delete_other_users_habit_log()
    {
        $otherUser = User::factory()->create();
        $otherHabit = Habit::factory()->create([
            'user_id' => $otherUser->id
        ]);
        
        $log = HabitLog::factory()->create([
            'user_id' => $otherUser->id,
            'habit_id' => $otherHabit->id
        ]);

        $response = $this->deleteJson("/api/habit-logs/{$log->id}");

        $response->assertStatus(404);
    }

    public function test_user_can_get_logs_by_date()
    {
        // Crear logs con fechas específicas (usando fechas pasadas)
        $this->user->habitLogs()->create([
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-01',
            'data' => ['detalle' => 'Test log 1'],
            'status' => 'completed'
        ]);

        $this->user->habitLogs()->create([
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-02',
            'data' => ['detalle' => 'Test log 2'],
            'status' => 'completed'
        ]);

        // Verificar que los logs se crearon correctamente
        $this->assertDatabaseHas('habit_logs', [
            'user_id' => $this->user->id,
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-01 00:00:00'
        ]);

        $response = $this->getJson('/api/habit-logs/date/2024-01-01');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'date',
                    'logs'
                ]);

        $this->assertCount(1, $response->json('logs'));
        $this->assertEquals('2024-01-01', $response->json('date'));
    }

    public function test_user_can_get_logs_by_date_range()
    {
        // Crear logs con fechas específicas (usando fechas pasadas)
        $this->user->habitLogs()->create([
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-01',
            'data' => ['detalle' => 'Test log 1'],
            'status' => 'completed'
        ]);

        $this->user->habitLogs()->create([
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-02',
            'data' => ['detalle' => 'Test log 2'],
            'status' => 'completed'
        ]);

        $this->user->habitLogs()->create([
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-03',
            'data' => ['detalle' => 'Test log 3'],
            'status' => 'completed'
        ]);

        // Verificar que los logs se crearon correctamente
        $this->assertDatabaseHas('habit_logs', [
            'user_id' => $this->user->id,
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-01 00:00:00'
        ]);

        $this->assertDatabaseHas('habit_logs', [
            'user_id' => $this->user->id,
            'habit_id' => $this->habit->id,
            'log_date' => '2024-01-02 00:00:00'
        ]);

        $response = $this->getJson('/api/habit-logs/range/2024-01-01/2024-01-02');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'start_date',
                    'end_date',
                    'logs'
                ]);

        $this->assertCount(2, $response->json('logs'));
        $this->assertEquals('2024-01-01', $response->json('start_date'));
        $this->assertEquals('2024-01-02', $response->json('end_date'));
    }

    public function test_date_validation()
    {
        $response = $this->getJson('/api/habit-logs/date/invalid-date');
        $response->assertStatus(422);

        $response = $this->getJson('/api/habit-logs/date/2026-01-01');
        $response->assertStatus(422);

        $response = $this->getJson('/api/habit-logs/range/2024-01-02/2024-01-01');
        $response->assertStatus(422);
    }
} 