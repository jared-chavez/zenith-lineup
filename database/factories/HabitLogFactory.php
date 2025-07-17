<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Habit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HabitLog>
 */
class HabitLogFactory extends Factory
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
            'habit_id' => Habit::factory(),
            'log_date' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'data' => [
                'detalle' => $this->faker->sentence(),
                'duracion' => $this->faker->numberBetween(10, 120),
                'intensidad' => $this->faker->randomElement(['baja', 'moderada', 'alta'])
            ],
            'status' => $this->faker->randomElement(['completed', 'partial', 'missed']),
            'notes' => $this->faker->optional()->sentence(),
            'metadata' => null,
        ];
    }

    /**
     * Indicate that the log is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    /**
     * Indicate that the log is partial.
     */
    public function partial(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'partial',
        ]);
    }

    /**
     * Indicate that the log is missed.
     */
    public function missed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'missed',
        ]);
    }

    /**
     * Set a specific date for the log.
     */
    public function forDate(string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'log_date' => $date,
        ]);
    }
} 