<?php

namespace App\Http\Resources\Wallet;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletLedgerEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'amount' => $this->amount,
            'balance_after' => $this->balance_after,
            'reference_type' => $this->reference_type ? class_basename($this->reference_type) : null,
            'reference_id' => $this->reference_id,
            'description' => $this->description,
            'created_at' => $this->created_at,
        ];
    }
}
