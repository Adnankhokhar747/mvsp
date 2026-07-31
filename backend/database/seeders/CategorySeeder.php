<?php

namespace Database\Seeders;

use App\Domain\Catalog\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Sample categories proving the platform is vertical-agnostic: each category
     * carries its own attribute_schema (docs/architecture/01-database-schema.md §3)
     * instead of the codebase hardcoding per-vertical columns.
     */
    protected array $categories = [
        [
            'name' => 'Home Cleaning', 'slug' => 'home-cleaning',
            'booking_mode_allowed' => ['slot'],
            'attribute_schema' => [
                ['key' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'required' => true, 'options' => ['Apartment', 'House', 'Office']],
                ['key' => 'rooms', 'label' => 'Number of Rooms', 'type' => 'number', 'required' => true],
            ],
        ],
        [
            'name' => 'Electrician', 'slug' => 'electrician',
            'booking_mode_allowed' => ['slot', 'request'],
            'attribute_schema' => [
                ['key' => 'issue_type', 'label' => 'Issue Type', 'type' => 'select', 'required' => true, 'options' => ['Wiring', 'Installation', 'Repair']],
                ['key' => 'urgent', 'label' => 'Urgent', 'type' => 'boolean', 'required' => false],
            ],
        ],
        [
            'name' => 'Tutoring', 'slug' => 'tutoring',
            'booking_mode_allowed' => ['slot'],
            'attribute_schema' => [
                ['key' => 'subject', 'label' => 'Subject', 'type' => 'text', 'required' => true],
                ['key' => 'level', 'label' => 'Level', 'type' => 'select', 'required' => true, 'options' => ['Primary', 'Secondary', 'University']],
            ],
        ],
        [
            'name' => 'Construction', 'slug' => 'construction',
            'booking_mode_allowed' => ['request'],
            'attribute_schema' => [
                ['key' => 'project_type', 'label' => 'Project Type', 'type' => 'select', 'required' => true, 'options' => ['Renovation', 'New Build', 'Repair']],
                ['key' => 'estimated_budget', 'label' => 'Estimated Budget', 'type' => 'number', 'required' => false],
            ],
        ],
        [
            'name' => 'Beauty & Salon', 'slug' => 'beauty-salon',
            'booking_mode_allowed' => ['slot'],
            'attribute_schema' => [
                ['key' => 'service_for', 'label' => 'Service For', 'type' => 'select', 'required' => true, 'options' => ['Men', 'Women', 'Kids']],
            ],
        ],
    ];

    public function run(): void
    {
        foreach ($this->categories as $index => $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category + ['sort_order' => $index + 1, 'is_active' => true]
            );
        }
    }
}
