<?php

namespace App\Http\Resources\Wallet;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorBankAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'account_holder_name' => $this->account_holder_name,
            'account_number' => $this->account_number,
            'bank_name' => $this->bank_name,
            'iban_or_routing' => $this->iban_or_routing,
            'is_default' => $this->is_default,
            'created_at' => $this->created_at,
        ];
    }
}
