<?php

namespace App\Domain\Wallet\Exceptions;

use Exception;

class WalletException extends Exception
{
    public static function insufficientBalance(): self
    {
        return new self('The wallet does not have sufficient available balance for this operation.');
    }
}
