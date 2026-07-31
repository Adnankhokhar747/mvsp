<?php

namespace App\Http\Resources\Identity;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'user_type' => $this->user_type,
            'status' => $this->status,
            'avatar_path' => $this->avatar_path,
            'locale' => $this->locale,
            'timezone' => $this->timezone,
            'email_verified_at' => $this->email_verified_at,
            'phone_verified_at' => $this->phone_verified_at,
            'roles' => $this->whenLoaded('roles', fn () => $this->getRoleNames()),
            'created_at' => $this->created_at,
        ];
    }
}
