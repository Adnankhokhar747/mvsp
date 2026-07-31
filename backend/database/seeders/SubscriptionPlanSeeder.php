<?php

namespace Database\Seeders;

use App\Domain\Subscription\Models\PlanFeature;
use App\Domain\Subscription\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Feature catalog. Adding a plan or changing a limit later is a data operation
     * (docs/architecture/00-overview.md decision #6) — never a code change.
     */
    protected array $features = [
        ['key' => 'max_services', 'label' => 'Maximum active services', 'type' => 'limit'],
        ['key' => 'max_images_per_service', 'label' => 'Maximum images per service', 'type' => 'limit'],
        ['key' => 'max_staff', 'label' => 'Maximum vendor staff members', 'type' => 'limit'],
        ['key' => 'max_bookings_per_month', 'label' => 'Maximum bookings per month', 'type' => 'limit'],
        ['key' => 'storage_limit_mb', 'label' => 'Storage limit (MB)', 'type' => 'limit'],
        ['key' => 'chat_enabled', 'label' => 'Customer chat', 'type' => 'boolean'],
        ['key' => 'reports_enabled', 'label' => 'Advanced reports', 'type' => 'boolean'],
        ['key' => 'analytics_enabled', 'label' => 'Analytics dashboard', 'type' => 'boolean'],
        ['key' => 'priority_listing', 'label' => 'Priority search placement', 'type' => 'boolean'],
        ['key' => 'featured_listing_count', 'label' => 'Featured listing slots', 'type' => 'limit'],
    ];

    protected array $plans = [
        [
            'name' => 'Free', 'slug' => 'free', 'price' => 0, 'billing_cycle' => 'monthly',
            'trial_days' => 0, 'is_default' => true, 'sort_order' => 1,
            'values' => [
                'max_services' => 3, 'max_images_per_service' => 3, 'max_staff' => 1,
                'max_bookings_per_month' => 30, 'storage_limit_mb' => 100,
                'chat_enabled' => false, 'reports_enabled' => false, 'analytics_enabled' => false,
                'priority_listing' => false, 'featured_listing_count' => 0,
            ],
        ],
        [
            'name' => 'Pro', 'slug' => 'pro', 'price' => 2900, 'billing_cycle' => 'monthly',
            'trial_days' => 14, 'is_default' => false, 'sort_order' => 2,
            'values' => [
                'max_services' => 25, 'max_images_per_service' => 10, 'max_staff' => 5,
                'max_bookings_per_month' => 500, 'storage_limit_mb' => 2000,
                'chat_enabled' => true, 'reports_enabled' => true, 'analytics_enabled' => false,
                'priority_listing' => true, 'featured_listing_count' => 3,
            ],
        ],
        [
            'name' => 'Business', 'slug' => 'business', 'price' => 9900, 'billing_cycle' => 'monthly',
            'trial_days' => 14, 'is_default' => false, 'sort_order' => 3,
            'values' => [
                'max_services' => 0, 'max_images_per_service' => 25, 'max_staff' => 0,
                'max_bookings_per_month' => 0, 'storage_limit_mb' => 20000,
                'chat_enabled' => true, 'reports_enabled' => true, 'analytics_enabled' => true,
                'priority_listing' => true, 'featured_listing_count' => 10,
            ],
        ],
    ];

    public function run(): void
    {
        $featureModels = collect($this->features)->mapWithKeys(function (array $feature) {
            return [$feature['key'] => PlanFeature::firstOrCreate(
                ['key' => $feature['key']],
                ['label' => $feature['label'], 'type' => $feature['type']]
            )];
        });

        foreach ($this->plans as $planData) {
            $values = $planData['values'];
            unset($planData['values']);

            $plan = SubscriptionPlan::firstOrCreate(
                ['slug' => $planData['slug']],
                $planData + ['currency_code' => 'USD', 'is_active' => true]
            );

            foreach ($values as $key => $value) {
                $plan->featureValues()->updateOrCreate(
                    ['plan_feature_id' => $featureModels[$key]->id],
                    ['value' => $value]
                );
            }
        }
    }
}
