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
        Schema::table('csms_records', function (Blueprint $table) {
            $table->string('approval_status')->default('pending')->after('status'); // pending, approved, revision, rejected
            $table->text('approval_notes')->nullable()->after('approval_status');
            $table->string('approved_by')->nullable()->after('approval_notes');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('csms_records', function (Blueprint $table) {
            $table->dropColumn(['approval_status', 'approval_notes', 'approved_by', 'approved_at']);
        });
    }
};
