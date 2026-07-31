<?php

namespace App\Http\Resources\Payment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentGatewayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'driver' => $this->driver,
            'name' => $this->name,
            'is_active' => $this->is_active,
            'is_default' => $this->is_default,
            'sort_order' => $this->sort_order,
        ];
    }
}
