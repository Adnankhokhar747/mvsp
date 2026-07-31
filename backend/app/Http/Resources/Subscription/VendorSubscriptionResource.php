<?php

namespace App\Http\Resources\Subscription;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorSubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vendor_id' => $this->vendor_id,
            'status' => $this->status,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'trial_ends_at' => $this->trial_ends_at,
            'cancelled_at' => $this->cancelled_at,
            'auto_renew' => $this->auto_renew,
            'plan' => new SubscriptionPlanResource($this->whenLoaded('plan')),
            'usage_counters' => $this->whenLoaded('usageCounters', fn () => $this->usageCounters->map(fn ($c) => [
                'feature_key' => $c->feature_key,
                'current_value' => $c->current_value,
                'period_start' => $c->period_start,
                'period_end' => $c->period_end,
            ])),
        ];
    }
}
