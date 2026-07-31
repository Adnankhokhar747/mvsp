<?php

namespace Database\Seeders;

use App\Domain\Payment\Models\PaymentGateway;
use Illuminate\Database\Seeder;

class PaymentGatewaySeeder extends Seeder
{
    public function run(): void
    {
        $gateways = [
            ['driver' => 'cash', 'name' => 'Cash on Service', 'is_active' => true, 'is_default' => true, 'sort_order' => 1],
            ['driver' => 'bank_transfer', 'name' => 'Bank Transfer', 'is_active' => true, 'is_default' => false, 'sort_order' => 2],
            ['driver' => 'offline', 'name' => 'Offline / Manual', 'is_active' => false, 'is_default' => false, 'sort_order' => 3],
            ['driver' => 'stripe', 'name' => 'Stripe', 'is_active' => false, 'is_default' => false, 'sort_order' => 4],
            ['driver' => 'paypal', 'name' => 'PayPal', 'is_active' => false, 'is_default' => false, 'sort_order' => 5],
        ];

        foreach ($gateways as $gateway) {
            PaymentGateway::firstOrCreate(['driver' => $gateway['driver']], $gateway);
        }
    }
}
