<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained('vendor_wallets')->cascadeOnDelete();
            $table->unsignedBigInteger('amount')->comment('minor units');
            $table->string('method')->default('bank_transfer');
            $table->foreignId('vendor_bank_account_id')->nullable()->constrained('vendor_bank_accounts')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_requests');
    }
};
