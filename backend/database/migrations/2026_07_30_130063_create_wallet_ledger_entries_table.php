<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('vendor_wallets')->cascadeOnDelete();
            $table->string('type');
            $table->bigInteger('amount')->comment('minor units, always positive; type determines direction');
            $table->bigInteger('balance_after')->comment('minor units');
            $table->nullableMorphs('reference');
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_ledger_entries');
    }
};
