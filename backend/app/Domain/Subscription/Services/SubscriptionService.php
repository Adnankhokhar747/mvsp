<?php

namespace App\Domain\Subscription\Services;

use App\Domain\Subscription\Exceptions\SubscriptionException;
use App\Domain\Subscription\Models\PlanFeature;
use App\Domain\Subscription\Models\SubscriptionPlan;
use App\Domain\Subscription\Models\VendorSubscription;
use App\Domain\Vendor\Models\Vendor;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    /**
     * Admin-facing: set/replace a plan's feature values by feature key, e.g.
     * ['max_services' => 10, 'chat_enabled' => true]. This is the mechanism that
     * lets a plan change from the admin panel with zero code changes.
     */
    public function syncFeatureValues(SubscriptionPlan $plan, array $values): void
    {
        foreach ($values as $key => $value) {
            $feature = PlanFeature::where('key', $key)->first();
            if (! $feature) {
                continue;
            }

            $plan->featureValues()->updateOrCreate(
                ['plan_feature_id' => $feature->id],
                ['value' => $value]
            );
        }
    }

    /**
     * Feature keys this can actually measure current usage for. Keys not listed
     * here (e.g. max_images_per_service, storage_limit_mb) are skipped in the
     * downgrade guard rather than guessed at — a documented simplification, not
     * a silent gap: see docs/architecture/06-validation-and-edge-cases.md §6.
     */
    protected function usageFor(Vendor $vendor, string $featureKey): ?int
    {
        return match ($featureKey) {
            'max_services' => $vendor->services()->whereIn('status', ['draft', 'active', 'paused'])->count(),
            'max_staff' => $vendor->vendorUsers()->whereIn('role', ['manager', 'staff'])->count(),
            'max_bookings_per_month' => $vendor->bookings()->where('created_at', '>=', now()->startOfMonth())->count(),
            default => null,
        };
    }

    /**
     * @throws SubscriptionException
     */
    public function switchPlan(Vendor $vendor, SubscriptionPlan $newPlan): VendorSubscription
    {
        $current = $vendor->activeSubscription;

        if ($current && $current->subscription_plan_id === $newPlan->id) {
            throw SubscriptionException::alreadyOnPlan();
        }

        $overLimit = [];
        foreach ($newPlan->featureValues()->with('feature')->get() as $featureValue) {
            $feature = $featureValue->feature;
            if ($feature->type !== 'limit') {
                continue;
            }

            $limit = (int) $featureValue->value;
            if ($limit === 0) {
                continue; // unlimited
            }

            $usage = $this->usageFor($vendor, $feature->key);
            if ($usage !== null && $usage > $limit) {
                $overLimit[] = "{$feature->label} ({$usage}/{$limit})";
            }
        }

        if (! empty($overLimit)) {
            throw SubscriptionException::downgradeBlocked($overLimit);
        }

        return DB::transaction(function () use ($vendor, $newPlan, $current) {
            if ($current) {
                $current->update(['status' => 'cancelled', 'cancelled_at' => now(), 'ends_at' => now()]);
            }

            $usedThisPlanBefore = VendorSubscription::where('vendor_id', $vendor->id)
                ->where('subscription_plan_id', $newPlan->id)
                ->exists();

            $trialDays = (! $usedThisPlanBefore && $newPlan->trial_days > 0) ? $newPlan->trial_days : 0;

            return VendorSubscription::create([
                'vendor_id' => $vendor->id,
                'subscription_plan_id' => $newPlan->id,
                'status' => $trialDays > 0 ? 'trialing' : 'active',
                'starts_at' => now(),
                'trial_ends_at' => $trialDays > 0 ? now()->addDays($trialDays) : null,
                'auto_renew' => true,
            ]);
        });
    }

    /**
     * @throws SubscriptionException
     */
    public function cancel(Vendor $vendor): VendorSubscription
    {
        $current = $vendor->activeSubscription;

        if (! $current) {
            throw SubscriptionException::noActiveSubscription();
        }

        $current->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'auto_renew' => false,
        ]);

        return $current->fresh();
    }
}
