<?php

namespace Database\Seeders;

use App\Domain\Vendor\Models\KycDocumentType;
use Illuminate\Database\Seeder;

class KycDocumentTypeSeeder extends Seeder
{
    protected array $types = [
        ['name' => 'Government-issued ID', 'slug' => 'government-id', 'is_required' => true, 'instructions' => 'A valid passport, national ID, or driver\'s license.'],
        ['name' => 'Proof of Address', 'slug' => 'proof-of-address', 'is_required' => true, 'instructions' => 'A utility bill or bank statement issued within the last 3 months.'],
        ['name' => 'Business Registration Certificate', 'slug' => 'business-registration', 'is_required' => false, 'instructions' => 'Required for registered companies, optional for individual/freelance vendors.'],
    ];

    public function run(): void
    {
        foreach ($this->types as $type) {
            KycDocumentType::firstOrCreate(['slug' => $type['slug']], $type + ['is_active' => true]);
        }
    }
}
