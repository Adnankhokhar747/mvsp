<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->string('short_description')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('base_price')->default(0)->comment('minor units');
            $table->string('currency_code', 3)->default('USD');
            $table->string('price_type')->default('fixed');
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->json('attributes')->nullable();
            $table->string('status')->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->timestamp('featured_until')->nullable();
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['vendor_id', 'slug']);
            $table->index(['vendor_id', 'status']);
            $table->index(['category_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
