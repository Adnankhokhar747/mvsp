<?php

namespace App\Http\Requests\Wallet;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_holder_name' => ['required', 'string', 'max:150'],
            'account_number' => ['required', 'string', 'max:64'],
            'bank_name' => ['required', 'string', 'max:150'],
            'iban_or_routing' => ['nullable', 'string', 'max:64'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
