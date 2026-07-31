<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCmsPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slug' => [
                'sometimes', 'string', 'max:150', 'regex:/^[a-z0-9-]+$/',
                Rule::unique('cms_pages')
                    ->where('locale', $this->input('locale', $this->route('cmsPage')?->locale))
                    ->ignore($this->route('cmsPage')),
            ],
            'title' => ['sometimes', 'string', 'max:200'],
            'content' => ['sometimes', 'nullable', 'string'],
            'locale' => ['sometimes', 'string', 'max:10'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
