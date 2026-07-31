<?php

namespace App\Domain\Wallet\Exceptions;

use Exception;

class WalletException extends Exception
{
    public static function insufficientBalance(): self
    {
        return new self('The wallet does not have sufficient available balance for this operation.');
    }

    public static function bankAccountNotOwned(): self
    {
        return new self('That bank account does not belong to this vendor.');
    }
}
