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
        Schema::table('csms_rigs', function (Blueprint $table) {
            $table->string('hfo_1')->nullable()->after('status');
            $table->string('hfo_2')->nullable()->after('hfo_1');
            $table->string('hfo_3')->nullable()->after('hfo_2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('csms_rigs', function (Blueprint $table) {
            $table->dropColumn(['hfo_1', 'hfo_2', 'hfo_3']);
        });
    }
};
