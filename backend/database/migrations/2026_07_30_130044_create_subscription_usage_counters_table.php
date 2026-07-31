<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_usage_counters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_subscription_id')->constrained()->cascadeOnDelete();
            $table->string('feature_key');
            $table->unsignedBigInteger('current_value')->default(0);
            $table->timestamp('period_start');
            $table->timestamp('period_end');
            $table->timestamps();

            $table->unique(['vendor_subscription_id', 'feature_key', 'period_start'], 'usage_counter_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_usage_counters');
    }
};
