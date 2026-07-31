<?php

namespace App\Http\Resources\Wallet;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayoutRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vendor_id' => $this->vendor_id,
            'amount' => $this->amount,
            'method' => $this->method,
            'status' => $this->status,
            'requested_at' => $this->requested_at,
            'processed_at' => $this->processed_at,
            'rejection_reason' => $this->rejection_reason,
        ];
    }
}
