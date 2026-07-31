<?php

namespace App\Http\Requests\Admin;

use App\Http\Controllers\Api\V1\Admin\StaffController;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', Rule::in(StaffController::PLATFORM_ROLES)],
        ];
    }
}
