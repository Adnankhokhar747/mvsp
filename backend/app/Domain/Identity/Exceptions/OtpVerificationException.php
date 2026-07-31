<?php

namespace App\Domain\Identity\Exceptions;

use Exception;

class OtpVerificationException extends Exception
{
    public static function invalidOrExpired(): self
    {
        return new self('The verification code is invalid or has expired.');
    }

    public static function tooManyAttempts(): self
    {
        return new self('Too many incorrect attempts. Please request a new code.');
    }
}
