<?php

namespace App\Domain\Payment\Exceptions;

use Exception;

class PaymentException extends Exception
{
    public static function gatewayNotActive(string $driver): self
    {
        return new self("The \"{$driver}\" payment gateway is not currently enabled.");
    }

    public static function gatewayNotConfigured(string $driver): self
    {
        return new self("The \"{$driver}\" payment gateway has not been configured with API credentials yet.");
    }

    public static function bookingNotPayable(): self
    {
        return new self('This booking does not have a price to pay yet — it may be an unquoted request.');
    }

    public static function refundExceedsAmount(): self
    {
        return new self('The refund amount exceeds what remains refundable on this transaction.');
    }

    public static function transactionNotSuccessful(): self
    {
        return new self('Only successful transactions can be refunded.');
    }
}
