<?php

namespace App\Domain\Catalog\Exceptions;

use Exception;

class ServiceLimitException extends Exception
{
    public static function maxServicesReached(): self
    {
        return new self('You have reached the maximum number of services allowed on your current plan. Upgrade your plan to add more.');
    }

    public static function bookingModeNotAllowed(string $mode): self
    {
        return new self("This category does not allow the \"{$mode}\" booking mode.");
    }
}
