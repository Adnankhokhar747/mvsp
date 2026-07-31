<?php

namespace App\Domain\Wallet\Services;

use App\Domain\Vendor\Models\Vendor;
use App\Domain\Wallet\Models\CommissionRule;

/**
 * Resolution order: vendor-specific override -> plan -> category -> platform
 * default (docs/architecture/01-database-schema.md "Commission resolution order").
 * Returns the commission amount in minor units for a given gross amount.
 */
class CommissionResolver
{
    public function commissionFor(Vendor $vendor, ?int $categoryId, int $amount): int
    {
        $rule = $this->resolveRule($vendor, $categoryId);

        if (! $rule) {
            return 0;
        }

        $commission = $rule->type === 'percentage'
            ? (int) round($amount * $rule->value / 10000)
            : $rule->value;

        if ($rule->min_amount !== null) {
            $commission = max($commission, $rule->min_amount);
        }
        if ($rule->max_amount !== null) {
            $commission = min($commission, $rule->max_amount);
        }

        return min($commission, $amount);
    }

    protected function resolveRule(Vendor $vendor, ?int $categoryId): ?CommissionRule
    {
        if ($vendor->commission_override !== null) {
            return new CommissionRule([
                'type' => 'percentage',
                'value' => $vendor->commission_override,
            ]);
        }

        return CommissionRule::where('is_active', true)->where('scope', 'vendor')->where('scope_id', $vendor->id)->first()
            ?? $this->planRule($vendor)
            ?? ($categoryId ? CommissionRule::where('is_active', true)->where('scope', 'category')->where('scope_id', $categoryId)->first() : null)
            ?? CommissionRule::where('is_active', true)->where('scope', 'platform')->first();
    }

    protected function planRule(Vendor $vendor): ?CommissionRule
    {
        $planId = $vendor->activeSubscription?->subscription_plan_id;

        if (! $planId) {
            return null;
        }

        return CommissionRule::where('is_active', true)->where('scope', 'plan')->where('scope_id', $planId)->first();
    }
}
