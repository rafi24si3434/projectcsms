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
        Schema::create('hse_kpi_targets', function (Blueprint $table) {
            $table->id();

            // =========================
            // IDENTIFICATION
            // =========================
            $table->unsignedSmallInteger('year');

            $table->string('contract_no', 100)
                ->nullable();

            $table->string('rig_no', 100)
                ->nullable();

            $table->string('focus_project', 150)
                ->nullable();

            $table->string('location_district', 150)
                ->nullable();

            // =========================
            // KPI
            // =========================
            $table->unsignedInteger('indicator_no')
                ->nullable();

            $table->string('indicator_name', 255);

            $table->text('definition')
                ->nullable();

            // =========================
            // TARGET
            // =========================
            $table->string('frequency_rate', 100)
                ->nullable();

            $table->decimal('target_month', 15, 2)
                ->nullable();

            $table->decimal('target_year', 15, 2)
                ->nullable();

            // Satuan
            $table->string('unit', 100)
                ->nullable();

            // =========================
            // PERIOD
            // =========================
            $table->unsignedTinyInteger('month')
                ->nullable();

            $table->string('quarter', 10)
                ->nullable();

            // =========================
            // PLAN
            // =========================
            $table->decimal('plan', 15, 2)
                ->nullable();

            // =========================
            // ACTUAL
            // =========================
            $table->decimal('actual', 15, 2)
                ->nullable();

            // =========================
            // NOTES
            // =========================
            $table->text('notes')
                ->nullable();

            $table->timestamps();

            // Index
            $table->index('year');
            $table->index('rig_no');
            $table->index('contract_no');
            $table->index('indicator_name');
            $table->index(['year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hse_kpi_targets');
    }
};