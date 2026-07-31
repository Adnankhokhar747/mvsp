<?php

namespace App\Domain\Subscription\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'currency_code',
        'billing_cycle',
        'trial_days',
        'is_active',
        'is_default',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'integer',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    public function featureValues(): HasMany
    {
        return $this->hasMany(PlanFeatureValue::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(VendorSubscription::class);
    }
}
