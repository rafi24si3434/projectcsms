<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('hse_reports', function (Blueprint $table) {
            if (!Schema::hasColumn('hse_reports', 'submitter_name')) {
                $table->string('submitter_name', 255)->nullable();
            }
            if (!Schema::hasColumn('hse_reports', 'submitter_email')) {
                $table->string('submitter_email', 255)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hse_reports', function (Blueprint $table) {
            if (Schema::hasColumn('hse_reports', 'submitter_name')) {
                $table->dropColumn('submitter_name');
            }
            if (Schema::hasColumn('hse_reports', 'submitter_email')) {
                $table->dropColumn('submitter_email');
            }
        });
    }
};
