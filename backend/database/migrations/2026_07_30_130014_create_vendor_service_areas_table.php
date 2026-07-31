<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_service_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('radius');
            $table->decimal('center_lat', 10, 7)->nullable();
            $table->decimal('center_lng', 10, 7)->nullable();
            $table->decimal('radius_km', 8, 2)->nullable();
            $table->json('polygon')->nullable();
            $table->string('city')->nullable();
            $table->string('country_code', 2);
            $table->timestamps();

            $table->index(['country_code', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_service_areas');
    }
};
