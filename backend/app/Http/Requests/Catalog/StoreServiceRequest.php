<?php

namespace App\Http\Requests\Catalog;

use App\Domain\Catalog\Rules\ValidCategoryAttributes;
use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:150'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'base_price' => ['required_unless:price_type,quote', 'integer', 'min:0'],
            'currency_code' => ['sometimes', 'string', 'size:3'],
            'price_type' => ['required', 'in:fixed,hourly,quote'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'attributes' => ['nullable', 'array', new ValidCategoryAttributes($this->input('category_id'))],
        ];
    }
}
