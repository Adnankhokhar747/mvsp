<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class SubmitQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quoted_price' => ['required', 'integer', 'min:0'],
            'quoted_duration' => ['nullable', 'integer', 'min:1'],
            'message' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
