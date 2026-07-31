<?php

namespace App\Http\Resources\Payment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RefundResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'amount' => $this->amount,
            'reason' => $this->reason,
            'status' => $this->status,
            'processed_at' => $this->processed_at,
        ];
    }
}
