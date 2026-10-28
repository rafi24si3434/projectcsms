<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('csms_rig_document_categories')) {
            Schema::create('csms_rig_document_categories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('rig_id')->constrained('csms_rigs')->onDelete('cascade');
                $table->foreignId('category_id')->constrained('csms_document_categories')->onDelete('cascade');
                $table->integer('no');
                $table->string('nama_dokumen');
                $table->string('durasi');
                $table->string('scope')->default('crew');
                $table->string('keterangan_default')->nullable();
                $table->timestamps();

                $table->unique(['rig_id', 'category_id']);
                $table->index(['rig_id', 'no']);
            });
        }

        // Seed initial matrix records for each rig from existing categories
        $rigs = DB::table('csms_rigs')->get();
        $categories = DB::table('csms_document_categories')->orderBy('no')->get();

        $rows = [];
        $now = now();
        foreach ($rigs as $rig) {
            foreach ($categories as $cat) {
                $rows[] = [
                    'rig_id'             => $rig->id,
                    'category_id'        => $cat->id,
                    'no'                 => $cat->no,
                    'nama_dokumen'       => $cat->nama_dokumen,
                    'durasi'             => $cat->durasi,
                    'scope'              => $cat->scope,
                    'keterangan_default' => $cat->keterangan_default,
                    'created_at'         => $now,
                    'updated_at'         => $now,
                ];
            }
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('csms_rig_document_categories')->insertOrIgnore($chunk);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('csms_rig_document_categories');
    }
};
