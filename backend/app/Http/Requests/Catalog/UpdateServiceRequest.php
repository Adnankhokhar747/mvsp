<?php

namespace App\Http\Requests\Catalog;

use App\Domain\Catalog\Rules\ValidCategoryAttributes;
use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->input('category_id', $this->route('service')?->category_id);

        return [
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'string', 'max:150'],
            'short_description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'base_price' => ['sometimes', 'integer', 'min:0'],
            'currency_code' => ['sometimes', 'string', 'size:3'],
            'price_type' => ['sometimes', 'in:fixed,hourly,quote'],
            'duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:draft,paused'],
            'attributes' => ['sometimes', 'nullable', 'array', new ValidCategoryAttributes($categoryId)],
        ];
    }
}
