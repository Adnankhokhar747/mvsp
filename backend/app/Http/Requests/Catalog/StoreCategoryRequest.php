<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'attribute_schema' => ['nullable', 'array'],
            'attribute_schema.*.key' => ['required_with:attribute_schema', 'string'],
            'attribute_schema.*.label' => ['required_with:attribute_schema', 'string'],
            'attribute_schema.*.type' => ['required_with:attribute_schema', 'in:text,number,select,boolean,date'],
            'attribute_schema.*.required' => ['sometimes', 'boolean'],
            'attribute_schema.*.options' => ['required_if:attribute_schema.*.type,select', 'array'],
            'booking_mode_allowed' => ['sometimes', 'array'],
            'booking_mode_allowed.*' => ['in:slot,request'],
            'sort_order' => ['sometimes', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
            'seo_meta' => ['nullable', 'array'],
        ];
    }
}
