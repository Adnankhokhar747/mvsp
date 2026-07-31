<?php

namespace App\Http\Requests\Subscription;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanFeatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:100', 'unique:plan_features,key', 'regex:/^[a-z0-9_]+$/'],
            'label' => ['required', 'string', 'max:150'],
            'type' => ['required', 'in:limit,boolean'],
            'description' => ['nullable', 'string'],
        ];
    }
}
