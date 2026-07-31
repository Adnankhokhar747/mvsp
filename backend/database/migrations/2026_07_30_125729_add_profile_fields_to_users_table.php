<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->unique()->after('email');
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            $table->string('user_type')->default('customer')->after('phone_verified_at');
            $table->string('avatar_path')->nullable()->after('user_type');
            $table->string('locale', 10)->default('en')->after('avatar_path');
            $table->string('timezone', 64)->default('UTC')->after('locale');
            $table->string('status')->default('active')->after('timezone');
            $table->timestamp('last_login_at')->nullable()->after('status');
            $table->text('two_factor_secret')->nullable()->after('last_login_at');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
            $table->softDeletes();

            $table->index('user_type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone', 'phone_verified_at', 'user_type', 'avatar_path',
                'locale', 'timezone', 'status', 'last_login_at', 'deleted_at',
                'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at',
            ]);
        });
    }
};
