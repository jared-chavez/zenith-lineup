<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        User::firstOrCreate(
            ['email' => 'admin@zenithlineup.com'],
            [
                'name' => 'Administrador',
                'email' => 'admin@zenithlineup.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Create user profile for admin
        $admin = User::where('email', 'admin@zenithlineup.com')->first();
        if ($admin && !$admin->profile) {
            $admin->profile()->create([
                'timezone' => 'UTC',
            ]);
        }
    }
} 