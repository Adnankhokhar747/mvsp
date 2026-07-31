<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug');
            $table->string('title');
            $table->longText('content')->nullable();
            $table->string('locale', 10)->default('en');
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->unique(['slug', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_pages');
    }
};
