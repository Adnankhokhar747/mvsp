<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->string('channel');
            $table->string('locale', 10)->default('en');
            $table->string('subject')->nullable();
            $table->text('body');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['key', 'channel', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
