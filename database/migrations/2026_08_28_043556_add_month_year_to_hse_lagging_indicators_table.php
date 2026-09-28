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
        Schema::table('hse_lagging_indicators', function (Blueprint $table) {

            // =========================
            // PERIOD
            // =========================

            $table->unsignedTinyInteger('month')
                ->nullable()
                ->after('frequency_rate');

            $table->unsignedSmallInteger('year')
                ->nullable()
                ->after('month');

            // =========================
            // INDEX
            // =========================

            $table->index(['year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hse_lagging_indicators', function (Blueprint $table) {

            $table->dropIndex([
                'hse_lagging_indicators_year_month_index'
            ]);

            $table->dropColumn([
                'month',
                'year',
            ]);
        });
    }
};