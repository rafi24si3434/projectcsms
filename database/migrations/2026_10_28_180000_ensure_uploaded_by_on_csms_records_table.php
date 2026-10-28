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
        if (Schema::hasTable('csms_records') && !Schema::hasColumn('csms_records', 'uploaded_by')) {
            Schema::table('csms_records', function (Blueprint $table) {
                $table->string('uploaded_by')->nullable()->after('keterangan');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Tetap dipertahankan untuk integritas audit trail
    }
};
