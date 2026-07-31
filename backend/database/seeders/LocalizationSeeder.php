<?php

namespace Database\Seeders;

use App\Domain\Localization\Models\Currency;
use App\Domain\Localization\Models\Language;
use Illuminate\Database\Seeder;

class LocalizationSeeder extends Seeder
{
    public function run(): void
    {
        Language::firstOrCreate(
            ['code' => 'en'],
            ['name' => 'English', 'native_name' => 'English', 'is_active' => true, 'is_default' => true, 'direction' => 'ltr']
        );

        Currency::firstOrCreate(
            ['code' => 'USD'],
            ['symbol' => '$', 'decimal_places' => 2, 'is_active' => true, 'is_default' => true, 'exchange_rate_to_base' => 1]
        );
    }
}
