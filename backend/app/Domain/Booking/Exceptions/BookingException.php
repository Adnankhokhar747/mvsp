<?php

namespace App\Domain\Booking\Exceptions;

use Exception;

class BookingException extends Exception
{
    public static function serviceNotBookable(): self
    {
        return new self('This service is not currently available for booking.');
    }

    public static function scheduledAtRequired(): self
    {
        return new self('A scheduled time is required for this service.');
    }

    public static function outsideAvailability(): self
    {
        return new self('The selected time is outside the vendor\'s available hours.');
    }

    public static function slotUnavailable(): self
    {
        return new self('That time slot is no longer available. Please choose another.');
    }

    public static function maxBookingsReached(): self
    {
        return new self('This vendor has reached its monthly booking limit on its current plan.');
    }

    public static function invalidStatusTransition(string $from, string $to): self
    {
        return new self("Cannot move a booking from \"{$from}\" to \"{$to}\".");
    }

    public static function notCancellable(string $status): self
    {
        return new self("A booking with status \"{$status}\" can no longer be cancelled.");
    }

    public static function notRequestMode(): self
    {
        return new self('Quotes only apply to request-based bookings.');
    }

    public static function quoteNotPending(): self
    {
        return new self('This quote has already been actioned or has expired.');
    }
}
