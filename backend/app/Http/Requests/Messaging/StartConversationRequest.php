<?php

namespace App\Http\Requests\Messaging;

use Illuminate\Foundation\Http\FormRequest;

class StartConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => ['required', 'integer', 'exists:vendors,id'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'message' => ['required', 'string', 'max:2000'],
        ];
    }
}
