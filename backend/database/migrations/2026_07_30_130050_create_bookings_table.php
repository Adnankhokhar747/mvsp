<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('vendor_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_package_id')->nullable()->constrained('service_packages')->nullOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('booking_mode')->default('slot');
            $table->timestamp('scheduled_at')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->foreignId('address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('price')->nullable()->comment('minor units');
            $table->string('currency_code', 3)->default('USD');
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('rescheduled_from_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['vendor_id', 'scheduled_at']);
            $table->index(['customer_id', 'status']);
            $table->index(['staff_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
