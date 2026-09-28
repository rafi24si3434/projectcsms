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
        Schema::create('hse_leading_indicators', function (Blueprint $table) {
            $table->id();

            // Relasi ke laporan HSE
            $table->foreignId('report_id')
                ->constrained('hse_reports')
                ->cascadeOnDelete();

            // Nomor indikator
            $table->unsignedInteger('indicator_no')->nullable();

            // Nama indikator
            $table->string('indicator_name', 255);

            // Definisi
            $table->text('definition')->nullable();

            // Satuan / frequency rate / unit
            $table->string('unit', 100)->nullable();

            // =========================
            // TARGET
            // =========================
            $table->decimal('target_month', 15, 2)
                ->nullable();

            $table->decimal('target_year', 15, 2)
                ->nullable();

            // =========================
            // PLAN
            // =========================
            $table->decimal('plan', 15, 2)->default(0);

            // =========================
            // ACTUAL
            // =========================
            $table->decimal('actual', 15, 2)->default(0);

            // =========================
            // MONTH
            // =========================
            $table->unsignedTinyInteger('month')
                ->nullable();

            // Tahun
            $table->unsignedSmallInteger('year')
                ->nullable();

            // Catatan
            $table->text('notes')->nullable();

            $table->timestamps();

            // Index
            $table->index('report_id');
            $table->index('indicator_name');
            $table->index(['year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hse_leading_indicators');
    }
};