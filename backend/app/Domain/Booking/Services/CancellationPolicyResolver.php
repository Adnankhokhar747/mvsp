<?php

namespace App\Domain\Booking\Services;

use App\Domain\Booking\Models\BookingCancellationPolicy;
use App\Domain\Catalog\Models\Category;
use App\Domain\Settings\Services\SettingsService;
use App\Domain\Vendor\Models\Vendor;

/**
 * Resolution order: vendor-specific policy -> category policy -> platform default
 * (docs/architecture/01-database-schema.md — same precedence pattern as commission
 * resolution). Returns window_hours + refund_percentage for the given booking.
 */
class CancellationPolicyResolver
{
    public function __construct(protected SettingsService $settings) {}

    public function resolve(Vendor $vendor, Category $category): array
    {
        $policy = BookingCancellationPolicy::where('vendor_id', $vendor->id)->first()
            ?? BookingCancellationPolicy::where('category_id', $category->id)->whereNull('vendor_id')->first();

        if ($policy) {
            return [
                'window_hours' => $policy->window_hours,
                'refund_percentage' => $policy->refund_percentage,
            ];
        }

        return [
            'window_hours' => (int) $this->settings->get('booking', 'default_cancellation_window_hours', 24),
            'refund_percentage' => (int) $this->settings->get('booking', 'default_refund_percentage', 100),
        ];
    }

    /**
     * Refund percentage for a cancellation happening right now against a booking
     * scheduled at $scheduledAt.
     */
    public function refundPercentageFor(Vendor $vendor, Category $category, ?\DateTimeInterface $scheduledAt): int
    {
        $policy = $this->resolve($vendor, $category);

        if (! $scheduledAt) {
            return $policy['refund_percentage'];
        }

        $hoursUntil = now()->diffInHours($scheduledAt, false);

        return $hoursUntil >= $policy['window_hours'] ? $policy['refund_percentage'] : 0;
    }
}
