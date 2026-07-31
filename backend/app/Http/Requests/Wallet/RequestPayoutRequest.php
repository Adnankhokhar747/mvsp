<?php

namespace App\Http\Requests\Wallet;

use Illuminate\Foundation\Http\FormRequest;

class RequestPayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:1'],
            'vendor_bank_account_id' => ['nullable', 'integer', 'exists:vendor_bank_accounts,id'],
        ];
    }
}
