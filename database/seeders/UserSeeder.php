<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Admin Account
        User::updateOrCreate(
            ['email' => 'admin@besmindo.com'],
            [
                'name' => 'HSE Administrator',
                'role' => 'admin',
                'status' => 'Active',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Field User / PIC Account
        User::updateOrCreate(
            ['email' => 'user@besmindo.com'],
            [
                'name' => 'Field PIC / Operator',
                'role' => 'user',
                'status' => 'Active',
                'password' => Hash::make('password'),
            ]
        );
    }
}
