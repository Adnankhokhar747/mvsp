<?php

namespace App\Http\Resources\Identity;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeviceSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_name' => $this->device_name,
            'device_type' => $this->device_type,
            'ip_address' => $this->ip_address,
            'last_active_at' => $this->last_active_at,
            'revoked_at' => $this->revoked_at,
            'created_at' => $this->created_at,
        ];
    }
}
