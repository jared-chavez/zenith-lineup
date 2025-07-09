<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Habit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HabitTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_user_can_create_habit()
    {
        $habitData = [
            'name' => 'Test Habit',
            'type' => 'exercise',
            'description' => 'Test description',
            'is_active' => true,
            'is_public' => false
        ];

        $response = $this->postJson('/api/habits', $habitData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'habit' => [
                        'id',
                        'name',
                        'type',
                        'description',
                        'is_active',
                        'is_public'
                    ]
                ]);

        $this->assertDatabaseHas('habits', [
            'user_id' => $this->user->id,
            'name' => 'Test Habit',
            'type' => 'exercise'
        ]);
    }

    public function test_user_can_view_their_habits()
    {
        Habit::factory()->count(3)->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson('/api/habits');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'habits' => [
                        'data' => [
                            '*' => [
                                'id',
                                'name',
                                'type',
                                'description',
                                'is_active',
                                'is_public'
                            ]
                        ]
                    ]
                ]);

        $this->assertCount(3, $response->json('habits.data'));
    }

    public function test_user_cannot_view_other_users_habits()
    {
        $otherUser = User::factory()->create();
        Habit::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $response = $this->getJson('/api/habits');

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('habits.data'));
    }

    public function test_user_can_update_their_habit()
    {
        $habit = Habit::factory()->create([
            'user_id' => $this->user->id
        ]);

        $updateData = [
            'name' => 'Updated Habit',
            'type' => 'water',
            'description' => 'Updated description'
        ];

        $response = $this->putJson("/api/habits/{$habit->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Habit updated successfully',
                    'habit' => [
                        'name' => 'Updated Habit',
                        'type' => 'water'
                    ]
                ]);

        $this->assertDatabaseHas('habits', [
            'id' => $habit->id,
            'name' => 'Updated Habit',
            'type' => 'water'
        ]);
    }

    public function test_user_cannot_update_other_users_habit()
    {
        $otherUser = User::factory()->create();
        $habit = Habit::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $updateData = [
            'name' => 'Updated Habit',
            'type' => 'water'
        ];

        $response = $this->putJson("/api/habits/{$habit->id}", $updateData);

        $response->assertStatus(404);
    }

    public function test_user_can_delete_their_habit()
    {
        $habit = Habit::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->deleteJson("/api/habits/{$habit->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Habit deleted successfully'
                ]);

        $this->assertDatabaseMissing('habits', [
            'id' => $habit->id
        ]);
    }

    public function test_user_cannot_delete_other_users_habit()
    {
        $otherUser = User::factory()->create();
        $habit = Habit::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $response = $this->deleteJson("/api/habits/{$habit->id}");

        $response->assertStatus(404);
    }

    public function test_habit_validation()
    {
        $response = $this->postJson('/api/habits', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'type']);
    }
} 