<?php

namespace App\Domain\Review\Exceptions;

use Exception;

class ReviewException extends Exception
{
    public static function bookingNotCompleted(): self
    {
        return new self('Only completed bookings can be reviewed.');
    }

    public static function alreadyReviewed(): self
    {
        return new self('This booking has already been reviewed.');
    }
}
