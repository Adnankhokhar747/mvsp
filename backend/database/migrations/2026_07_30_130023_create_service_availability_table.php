<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->date('specific_date')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_recurring')->default(true);
            $table->timestamps();

            $table->index(['service_id', 'day_of_week']);
            $table->index(['service_id', 'specific_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_availability');
    }
};
