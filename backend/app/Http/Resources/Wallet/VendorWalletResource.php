<?php

namespace App\Http\Resources\Wallet;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorWalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vendor_id' => $this->vendor_id,
            'balance' => $this->balance,
            'held_balance' => $this->held_balance,
            'currency_code' => $this->currency_code,
        ];
    }
}
