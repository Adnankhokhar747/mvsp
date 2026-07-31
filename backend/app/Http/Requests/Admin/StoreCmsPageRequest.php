<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCmsPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slug' => [
                'required', 'string', 'max:150', 'regex:/^[a-z0-9-]+$/',
                Rule::unique('cms_pages')->where('locale', $this->input('locale', 'en')),
            ],
            'title' => ['required', 'string', 'max:200'],
            'content' => ['nullable', 'string'],
            'locale' => ['sometimes', 'string', 'max:10'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
