<?php

namespace App\Domain\Catalog\Exceptions;

use Exception;

class CategoryException extends Exception
{
    public static function hasChildrenOrServices(): self
    {
        return new self('This category has subcategories or services and cannot be deleted.');
    }
}
