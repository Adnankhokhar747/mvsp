<?php

namespace App\Domain\Vendor\Exceptions;

use Exception;

class VendorException extends Exception
{
    public static function alreadyHasVendorProfile(): self
    {
        return new self('This user already has a vendor profile.');
    }

    public static function cannotRemoveOwner(): self
    {
        return new self('The vendor owner cannot be removed from the vendor team.');
    }

    public static function userAlreadyMember(): self
    {
        return new self('This user is already a member of the vendor team.');
    }

    public static function userNotFound(): self
    {
        return new self('No user was found with that email address.');
    }
}
