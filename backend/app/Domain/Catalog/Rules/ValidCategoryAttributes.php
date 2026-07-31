<?php

namespace App\Domain\Catalog\Rules;

use App\Domain\Catalog\Models\Category;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates a service's `attributes` payload against its category's admin-defined
 * attribute_schema (docs/architecture/01-database-schema.md §3) — the mechanism
 * that keeps the platform vertical-agnostic instead of hardcoding per-category fields.
 */
class ValidCategoryAttributes implements ValidationRule
{
    public function __construct(protected ?int $categoryId) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->categoryId) {
            return;
        }

        $category = Category::find($this->categoryId);

        if (! $category || empty($category->attribute_schema)) {
            return;
        }

        $value = $value ?? [];

        foreach ($category->attribute_schema as $field) {
            $key = $field['key'];
            $present = array_key_exists($key, $value);

            if (($field['required'] ?? false) && ! $present) {
                $fail("The attributes.{$key} field is required for this category.");

                continue;
            }

            if (! $present) {
                continue;
            }

            if (($field['type'] ?? null) === 'select' && ! in_array($value[$key], $field['options'] ?? [], true)) {
                $fail("The attributes.{$key} value must be one of the allowed options.");
            }

            if (($field['type'] ?? null) === 'boolean' && ! is_bool($value[$key])) {
                $fail("The attributes.{$key} value must be true or false.");
            }

            if (($field['type'] ?? null) === 'number' && ! is_numeric($value[$key])) {
                $fail("The attributes.{$key} value must be a number.");
            }
        }
    }
}
