<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->morphs('invoiceable');
            $table->foreignId('billed_to_user_id')->constrained('users')->restrictOnDelete();
            $table->unsignedBigInteger('amount')->comment('minor units');
            $table->unsignedBigInteger('tax_amount')->default(0);
            $table->unsignedBigInteger('discount_amount')->default(0);
            $table->unsignedBigInteger('total')->comment('minor units');
            $table->string('currency_code', 3)->default('USD');
            $table->string('status')->default('draft');
            $table->string('pdf_path')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
