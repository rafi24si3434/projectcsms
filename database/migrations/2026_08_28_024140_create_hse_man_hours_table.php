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
        Schema::create('hse_man_hours', function (Blueprint $table) {
            $table->id();

            // Relasi ke laporan HSE
            $table->foreignId('report_id')
                ->constrained('hse_reports')
                ->cascadeOnDelete();

            // =========================
            // MAN HOURS PLAN
            // =========================
            $table->decimal('premises_plan', 15, 2)->default(0);

            $table->decimal('non_premises_plan', 15, 2)->default(0);

            // =========================
            // MAN HOURS ACTUAL
            // =========================
            $table->decimal('premises_actual', 15, 2)->default(0);

            $table->decimal('non_premises_actual', 15, 2)->default(0);

            // =========================
            // KILOMETER PLAN
            // =========================
            $table->decimal('kilometer_premises_plan', 15, 2)->default(0);

            $table->decimal('kilometer_non_premises_plan', 15, 2)->default(0);

            // =========================
            // KILOMETER ACTUAL
            // =========================
            $table->decimal('kilometer_premises_actual', 15, 2)->default(0);

            $table->decimal('kilometer_non_premises_actual', 15, 2)->default(0);

            // =========================
            // EXPOSURE
            // =========================
            $table->unsignedInteger('total_employees')->default(0);

            $table->unsignedInteger('total_vehicles')->default(0);

            $table->timestamps();

            // Index
            $table->index('report_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hse_man_hours');
    }
};