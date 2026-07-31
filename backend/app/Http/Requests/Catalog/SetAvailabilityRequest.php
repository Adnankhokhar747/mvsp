<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class SetAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slots' => ['required', 'array', 'min:1'],
            'slots.*.day_of_week' => ['nullable', 'integer', 'between:0,6', 'required_without:slots.*.specific_date'],
            'slots.*.specific_date' => ['nullable', 'date', 'required_without:slots.*.day_of_week'],
            'slots.*.start_time' => ['required', 'date_format:H:i'],
            'slots.*.end_time' => ['required', 'date_format:H:i', 'after:slots.*.start_time'],
            'slots.*.is_recurring' => ['sometimes', 'boolean'],
            'slots.*.staff_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
