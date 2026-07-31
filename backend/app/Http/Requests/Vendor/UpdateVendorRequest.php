<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVendorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name' => ['sometimes', 'string', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'whatsapp' => ['sometimes', 'nullable', 'string', 'max:20'],
            'currency_code' => ['sometimes', 'string', 'size:3'],
            'timezone' => ['sometimes', 'string', 'max:64'],
        ];
    }
}
