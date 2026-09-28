<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hse_performances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('hse_indicator_id')
                ->constrained('hse_indicators')
                ->cascadeOnDelete();

            $table->integer('year');

            $table->unsignedTinyInteger('month');

            // Input dasar
            $table->decimal('cases', 15, 2)->nullable();

            $table->decimal('working_hours', 15, 2)->nullable();

            $table->decimal('kilometers', 15, 2)->nullable();

            $table->decimal('amount', 15, 2)->nullable();

            $table->decimal('barrels', 15, 2)->nullable();

            // Hasil perhitungan
            $table->decimal('result', 15, 4)->nullable();

            $table->timestamps();

            $table->unique([
                'hse_indicator_id',
                'year',
                'month'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hse_performances');
    }
};