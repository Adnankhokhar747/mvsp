<?php

namespace App\Http\Requests\Subscription;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubscriptionPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'currency_code' => ['sometimes', 'string', 'size:3'],
            'billing_cycle' => ['required', 'in:monthly,yearly,lifetime'],
            'trial_days' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'is_default' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer'],
            'values' => ['sometimes', 'array'],
            'values.*' => ['nullable'],
        ];
    }
}
