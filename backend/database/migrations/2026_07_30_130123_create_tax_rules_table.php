<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('country_code', 2);
            $table->decimal('rate_percentage', 5, 2);
            $table->string('applies_to')->default('all');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('country_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_rules');
    }
};
