<?php

namespace App\Domain\Messaging\Exceptions;

use Exception;

class MessagingException extends Exception
{
    public static function chatNotAvailable(): self
    {
        return new self('This vendor\'s current plan does not include chat.');
    }
}
