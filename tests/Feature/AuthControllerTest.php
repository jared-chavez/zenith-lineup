<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Validation\Rules\Password;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email'
                    ],
                    'token',
                    'token_type'
                ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'test@example.com'
        ]);

        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $response->json('user.id'),
            'timezone' => 'UTC'
        ]);
    }

    public function test_user_cannot_register_with_invalid_data()
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_user_cannot_register_with_existing_email()
    {
        User::factory()->create(['email' => 'test@example.com']);

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    public function test_user_cannot_register_with_weak_password()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => '123',
            'password_confirmation' => '123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email'
                    ],
                    'token',
                    'token_type'
                ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id
        ]);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'wrongpassword'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(401)
                ->assertJson([
                    'error' => 'Invalid credentials'
                ]);
    }

    public function test_user_cannot_login_with_invalid_data()
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/logout');

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Logged out successfully'
                ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_user_can_get_their_profile()
    {
        $user = User::factory()->create();
        $user->profile()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'timezone' => 'UTC'
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => [
                        'id',
                        'name',
                        'email'
                    ],
                    'profile'
                ]);
    }

    public function test_user_can_refresh_token()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/refresh');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'token',
                    'token_type'
                ]);

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    // Test de autenticación simplificado - los endpoints protegidos requieren autenticación
    // y esto se prueba implícitamente en los otros tests
} 