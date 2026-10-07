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

        $defaultPassword = Hash::make('password');

        // 1. Default Admin User (Bisa melihat & ACC seluruh 20 Rig)
        User::updateOrCreate(
            ['email' => 'admin@besmindo.com'],
            [
                'name' => 'Administrator HSE Pusat',
                'password' => $defaultPassword,
                'role' => 'admin',
                'status' => 'Active',
                'csms_rig_id' => null,
            ]
        );

        // 2. Default HSE General Field PIC
        User::updateOrCreate(
            ['email' => 'hse@besmindo.com'],
            [
                'name' => 'HSE Officer BMS 01',
                'password' => $defaultPassword,
                'role' => 'user',
                'status' => 'Active',
                'csms_rig_id' => CsmsRig::where('code', 'BMS 01')->first()?->id ?? 1,
            ]
        );

        // 3. Buat Akun untuk SELURUH 20 RIG (BMS 01 sampai BMS 23)
        $rigs = CsmsRig::where('status', 'active')->orderBy('id')->get();

        foreach ($rigs as $rig) {
            // Bersihkan format kode rig untuk email (misal: "BMS 01" -> "bms01", "BMS 03A" -> "bms03a")
            $cleanCode = strtolower(str_replace(' ', '', $rig->code));
            $email = "{$cleanCode}@besmindo.com";
            $name = "Crew {$rig->name}";

            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => $defaultPassword,
                    'role' => 'user',
                    'status' => 'Active',
                    'csms_rig_id' => $rig->id,
                ]
            );
        }
    }
}