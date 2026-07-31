<?php

namespace App\Domain\Subscription\Services;

use App\Domain\Vendor\Models\Vendor;
use Illuminate\Support\Facades\Cache;

/**
 * Single choke point for "can this vendor do X" checks driven entirely by their
 * subscription plan's feature values — never a hardcoded plan-name comparison.
 * Convention: a `limit`-type feature value of 0 means unlimited.
 */
class FeatureGateService
{
    public function isEnabled(Vendor $vendor, string $featureKey): bool
    {
        $value = $this->valueFor($vendor, $featureKey);

        return (bool) ($value ?? false);
    }

    /**
     * @return int|null Null means unlimited.
     */
    public function limitFor(Vendor $vendor, string $featureKey): ?int
    {
        $value = $this->valueFor($vendor, $featureKey);

        if ($value === null) {
            return 0;
        }

        return ((int) $value) === 0 ? null : (int) $value;
    }

    public function hasReachedLimit(Vendor $vendor, string $featureKey, int $currentUsage): bool
    {
        $limit = $this->limitFor($vendor, $featureKey);

        return $limit !== null && $currentUsage >= $limit;
    }

    protected function valueFor(Vendor $vendor, string $featureKey): mixed
    {
        $subscription = $vendor->activeSubscription;

        if (! $subscription) {
            return null;
        }

        $key = "plan-features.{$subscription->subscription_plan_id}";

        $values = Cache::remember($key, 3600, function () use ($subscription) {
            return $subscription->plan->featureValues()
                ->with('feature')
                ->get()
                ->mapWithKeys(fn ($fv) => [$fv->feature->key => $fv->value]);
        });

        return $values->get($featureKey);
    }
}
