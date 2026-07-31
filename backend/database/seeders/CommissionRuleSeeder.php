<?php

namespace Database\Seeders;

use App\Domain\Wallet\Models\CommissionRule;
use Illuminate\Database\Seeder;

class CommissionRuleSeeder extends Seeder
{
    public function run(): void
    {
        CommissionRule::firstOrCreate(
            ['scope' => 'platform', 'scope_id' => null],
            ['type' => 'percentage', 'value' => 1000, 'is_active' => true]
        );
    }
}
