<?php

namespace App\Domain\Subscription\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanFeatureValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_plan_id',
        'plan_feature_id',
        'value',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function feature(): BelongsTo
    {
        return $this->belongsTo(PlanFeature::class, 'plan_feature_id');
    }
}
