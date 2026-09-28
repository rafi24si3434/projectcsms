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
        Schema::create('csms_rigs', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. RIG BMS 01
            $table->string('code')->unique(); // e.g. BMS 01
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('csms_document_categories', function (Blueprint $table) {
            $table->id();
            $table->string('dept')->default('Dokumen dan Rekaman HSE');
            $table->integer('no');
            $table->string('nama_dokumen');
            $table->string('durasi');
            $table->string('scope')->default('crew'); // 'rig' or 'crew'
            $table->string('keterangan_default')->nullable();
            $table->timestamps();
        });

        Schema::create('csms_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('csms_rig_id')->constrained('csms_rigs')->onDelete('cascade');
            $table->foreignId('csms_document_category_id')->constrained('csms_document_categories')->onDelete('cascade');
            $table->string('periode_bulan'); // e.g. 'Januari' or '01'
            $table->integer('periode_tahun'); // e.g. 2025
            $table->string('crew')->nullable(); // 'Crew A', 'Crew B', 'Crew C', 'Rig'
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->integer('file_size')->nullable();
            $table->string('file_type')->nullable();
            $table->enum('status', ['Lengkap', 'Tidak Ada', 'Pending', 'In Progress'])->default('Pending');
            $table->text('keterangan')->nullable();
            $table->string('uploaded_by')->nullable();
            $table->timestamps();

            // Indexes for fast lookup
            $table->index(['csms_rig_id', 'periode_bulan', 'periode_tahun']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('csms_records');
        Schema::dropIfExists('csms_document_categories');
        Schema::dropIfExists('csms_rigs');
    }
};
