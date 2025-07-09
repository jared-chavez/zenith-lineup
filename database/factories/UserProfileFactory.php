<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserProfile>
 */
class UserProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'birth_date' => $this->faker->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'height' => $this->faker->numberBetween(140, 200),
            'weight' => $this->faker->numberBetween(40, 150),
            'activity_level' => $this->faker->randomElement(['sedentary', 'light', 'moderate', 'active', 'very_active']),
            'health_goals' => $this->faker->randomElements([
                'Perder peso',
                'Ganar músculo',
                'Mejorar resistencia',
                'Mantener peso',
                'Mejorar flexibilidad'
            ], $this->faker->numberBetween(1, 3)),
            'preferences' => [
                'notifications' => $this->faker->boolean(),
                'theme' => $this->faker->randomElement(['light', 'dark', 'auto']),
                'language' => $this->faker->randomElement(['es', 'en']),
                'units' => $this->faker->randomElement(['metric', 'imperial'])
            ],
            'timezone' => $this->faker->randomElement([
                'UTC',
                'America/Mexico_City',
                'America/New_York',
                'Europe/Madrid',
                'Asia/Tokyo'
            ]),
            'is_profile_public' => $this->faker->boolean(20), // 20% chance of being public
        ];
    }

    /**
     * Indicate that the profile is public.
     */
    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_profile_public' => true,
        ]);
    }

    /**
     * Indicate that the profile is private.
     */
    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_profile_public' => false,
        ]);
    }

    /**
     * Set a specific gender for the profile.
     */
    public function male(): static
    {
        return $this->state(fn (array $attributes) => [
            'gender' => 'male',
        ]);
    }

    /**
     * Set a specific gender for the profile.
     */
    public function female(): static
    {
        return $this->state(fn (array $attributes) => [
            'gender' => 'female',
        ]);
    }

    /**
     * Set a specific activity level for the profile.
     */
    public function sedentary(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_level' => 'sedentary',
        ]);
    }

    /**
     * Set a specific activity level for the profile.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_level' => 'active',
        ]);
    }
} 