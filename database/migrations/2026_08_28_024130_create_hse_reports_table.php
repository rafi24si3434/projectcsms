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
        Schema::create('hse_reports', function (Blueprint $table) {
            $table->id();

            // =========================
            // IDENTIFICATION
            // =========================
            $table->date('report_date')->nullable();

            $table->string('contract_no', 100)->nullable();

            $table->string('rig_no', 100)->nullable();

            $table->string('work_period', 100)->nullable();

            // =========================
            // REPORT INFORMATION
            // =========================
            $table->year('year')->nullable();

            $table->string('period', 50)->nullable();

            $table->string('focus_project', 150)->nullable();

            $table->string('location_district', 150)->nullable();

            // Tanggal diterbitkan / revisi
            $table->date('issued_date')->nullable();

            $table->string('revision_no', 50)->nullable();

            // =========================
            // PROGRAM REFERENCES
            // =========================
            $table->text('program_reference')->nullable();

            // =========================
            // STATUS REPORT
            // =========================
            $table->enum('status', [
                'draft',
                'validation',
                'approved'
            ])->default('draft');

            // =========================
            // USER / CREATOR
            // =========================
            $table->unsignedBigInteger('created_by')->nullable();

            // =========================
            // TIMESTAMPS
            // =========================
            $table->timestamps();

            // =========================
            // INDEX
            // =========================
            $table->index('year');
            $table->index('rig_no');
            $table->index('contract_no');
            $table->index('period');
            $table->index('focus_project');
            $table->index('location_district');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hse_reports');
    }
};