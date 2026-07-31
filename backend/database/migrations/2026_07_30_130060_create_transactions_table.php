<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->morphs('payable');
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payment_gateway_id')->constrained()->restrictOnDelete();
            $table->string('type')->default('payment');
            $table->unsignedBigInteger('amount')->comment('minor units');
            $table->string('currency_code', 3)->default('USD');
            $table->decimal('fx_rate', 12, 6)->default(1);
            $table->string('status')->default('pending');
            $table->string('gateway_reference')->nullable();
            $table->string('idempotency_key')->nullable()->unique();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['vendor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
