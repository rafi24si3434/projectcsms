<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Admin User
        User::firstOrCreate(
            ['email' => 'admin@besmindo.com'],
            [
                'name' => 'Administrator CSMS',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'Active',
            ]
        );

        // Default HSE User
        User::firstOrCreate(
            ['email' => 'hse@besmindo.com'],
            [
                'name' => 'Crew HSE Rig',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'Active',
            ]
        );

        $this->call([
            CsmsSeeder::class,
        ]);
    }
}