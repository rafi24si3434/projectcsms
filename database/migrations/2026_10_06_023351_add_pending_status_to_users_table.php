<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Tambahkan kolom status baru yang mendukung 'pending' untuk sistem approval akun.
     * Jika kolom `status` sudah ada dari migrasi sebelumnya, kita modify nilainya saja.
     */
    public function up(): void
    {
        // Cek apakah kolom status sudah ada
        if (Schema::hasColumn('users', 'status')) {
            // Update semua status NULL menjadi 'Active' dahulu
            DB::table('users')->whereNull('status')->update(['status' => 'Active']);
            // Tidak perlu tambah kolom lagi, hanya pastikan seeder support 'Pending'
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->string('status')->default('Active')->after('role');
            });
        }

        // Tambahkan kolom approved_by dan approved_at untuk audit trail persetujuan akun
        if (!Schema::hasColumn('users', 'approved_by')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('status');
                $table->timestamp('approved_at')->nullable()->after('approved_by');
                $table->text('rejection_reason')->nullable()->after('approved_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'approved_by')) {
                $table->dropColumn(['approved_by', 'approved_at', 'rejection_reason']);
            }
        });
    }
};
