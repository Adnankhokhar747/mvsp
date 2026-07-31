<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_rules', function (Blueprint $table) {
            $table->id();
            $table->string('scope')->default('platform');
            $table->unsignedBigInteger('scope_id')->nullable()->comment('id in category/vendor/subscription_plans depending on scope, no FK constraint since it is polymorphic by scope');
            $table->string('type')->default('percentage');
            $table->unsignedInteger('value')->comment('percentage in basis points, or minor units for flat');
            $table->unsignedBigInteger('min_amount')->nullable();
            $table->unsignedBigInteger('max_amount')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['scope', 'scope_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_rules');
    }
};
