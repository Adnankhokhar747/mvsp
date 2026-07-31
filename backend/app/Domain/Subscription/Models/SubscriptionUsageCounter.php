<?php

namespace App\Domain\Subscription\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionUsageCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_subscription_id',
        'feature_key',
        'current_value',
        'period_start',
        'period_end',
    ];

    protected $casts = [
        'period_start' => 'datetime',
        'period_end' => 'datetime',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(VendorSubscription::class, 'vendor_subscription_id');
    }
}
