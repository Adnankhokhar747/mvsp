<?php

namespace App\Http\Resources\Subscription;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'currency_code' => $this->currency_code,
            'billing_cycle' => $this->billing_cycle,
            'trial_days' => $this->trial_days,
            'is_active' => $this->is_active,
            'is_default' => $this->is_default,
            'sort_order' => $this->sort_order,
            'features' => $this->whenLoaded('featureValues', fn () => $this->featureValues->mapWithKeys(
                fn ($fv) => [$fv->feature->key => $fv->value]
            )),
        ];
    }
}
