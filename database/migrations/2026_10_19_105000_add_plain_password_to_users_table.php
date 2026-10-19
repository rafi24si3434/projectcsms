<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\CsmsRig;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'plain_password')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('plain_password')->nullable()->after('password');
            });
        }

        // Backfill kata sandi plain untuk akun crew RIG dan admin yang sudah ada
        try {
            // 1. Admin default
            DB::table('users')
                ->where('email', 'admin@besmindo.com')
                ->whereNull('plain_password')
                ->update(['plain_password' => 'password']);

            // 2. Akun-akun RIG BMS (sesuai nomor BMS diulang 4x, contoh: BMS 01 = 01010101)
            $users = DB::table('users')->where('role', 'user')->get();
            foreach ($users as $u) {
                $email = strtolower($u->email);
                if (str_starts_with($email, 'bms') && str_contains($email, '@besmindo.com')) {
                    $prefix = explode('@', $email)[0]; // misal "bms01", "bms03a", "bms15"
                    $bmsNum = substr($prefix, 3);
                    if (!empty($bmsNum)) {
                        $defaultRigPw = str_repeat($bmsNum, 4);
                        DB::table('users')->where('id', $u->id)->update([
                            'plain_password' => $defaultRigPw
                        ]);
                    }
                }
            }
        } catch (\Throwable $e) {
            // Ignore backfill errors if tables are empty
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'plain_password')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('plain_password');
            });
        }
    }
};
