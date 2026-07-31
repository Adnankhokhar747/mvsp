<?php

namespace App\Http\Requests\Subscription;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubscriptionPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'integer', 'min:0'],
            'currency_code' => ['sometimes', 'string', 'size:3'],
            'billing_cycle' => ['sometimes', 'in:monthly,yearly,lifetime'],
            'trial_days' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'is_default' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer'],
            'values' => ['sometimes', 'array'],
            'values.*' => ['nullable'],
        ];
    }
}
