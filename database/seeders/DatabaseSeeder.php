<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use App\Models\CsmsRig;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CsmsSeeder::class,
        ]);

        $rigBms01 = CsmsRig::where('code', 'BMS 01')->first() ?? CsmsRig::first();
        $rigBms02 = CsmsRig::where('code', 'BMS 02')->first() ?? CsmsRig::skip(1)->first();
        $rigBms03 = CsmsRig::where('code', 'BMS 03')->first() ?? CsmsRig::skip(2)->first();

        // 1. Default Admin User (Bisa melihat & ACC seluruh 20 Rig)
        User::updateOrCreate(
            ['email' => 'admin@besmindo.com'],
            [
                'name' => 'Administrator HSE Pusat',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'Active',
                'csms_rig_id' => null,
            ]
        );

        // 2. Default HSE User Lapangan (Hanya ditugaskan di Rig BMS 01)
        User::updateOrCreate(
            ['email' => 'hse@besmindo.com'],
            [
                'name' => 'HSE Officer BMS 01',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'Active',
                'csms_rig_id' => $rigBms01?->id ?? 1,
            ]
        );

        // 3. Operator Rig BMS 01
        User::updateOrCreate(
            ['email' => 'bms01@besmindo.com'],
            [
                'name' => 'Crew RIG BMS 01',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'Active',
                'csms_rig_id' => $rigBms01?->id ?? 1,
            ]
        );

        // 4. Operator Rig BMS 02
        User::updateOrCreate(
            ['email' => 'bms02@besmindo.com'],
            [
                'name' => 'Crew RIG BMS 02',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'Active',
                'csms_rig_id' => $rigBms02?->id ?? 2,
            ]
        );

        // 5. Operator Rig BMS 03
        User::updateOrCreate(
            ['email' => 'bms03@besmindo.com'],
            [
                'name' => 'Crew RIG BMS 03',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'Active',
                'csms_rig_id' => $rigBms03?->id ?? 3,
            ]
        );
    }
}