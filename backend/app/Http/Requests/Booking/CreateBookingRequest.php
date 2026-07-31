<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'service_package_id' => ['nullable', 'integer', 'exists:service_packages,id'],
            'staff_id' => ['nullable', 'integer', 'exists:users,id'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
            'address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
