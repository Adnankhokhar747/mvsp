<?php

namespace Database\Seeders;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            LocalizationSeeder::class,
            SettingsSeeder::class,
            PaymentGatewaySeeder::class,
            SubscriptionPlanSeeder::class,
            CategorySeeder::class,
            KycDocumentTypeSeeder::class,
            CommissionRuleSeeder::class,
        ]);

        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@servicehub.test',
            'user_type' => 'admin',
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('super-admin');

        $customer = User::factory()->create([
            'name' => 'Test Customer',
            'email' => 'customer@servicehub.test',
            'user_type' => 'customer',
            'email_verified_at' => now(),
        ]);
        $customer->assignRole('customer');
    }
}
