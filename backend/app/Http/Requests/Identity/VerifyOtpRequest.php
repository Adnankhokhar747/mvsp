<?php

namespace App\Http\Requests\Identity;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required_without:phone', 'nullable', 'email'],
            'phone' => ['required_without:email', 'nullable', 'string'],
            'purpose' => ['required', 'in:email_verification,phone_verification,password_reset'],
            'code' => ['required', 'digits:6'],
        ];
    }
}
