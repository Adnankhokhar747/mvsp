<?php

namespace App\Domain\Subscription\Exceptions;

use Exception;

class SubscriptionException extends Exception
{
    public static function downgradeBlocked(array $overLimitFeatures): self
    {
        $list = implode(', ', $overLimitFeatures);

        return new self("Cannot switch to this plan — current usage exceeds its limits for: {$list}. Reduce usage first or choose a higher plan.");
    }

    public static function alreadyOnPlan(): self
    {
        return new self('This vendor is already on the requested plan.');
    }

    public static function noActiveSubscription(): self
    {
        return new self('This vendor has no active subscription to cancel.');
    }
}
