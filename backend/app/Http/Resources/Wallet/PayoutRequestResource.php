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
            'currency_code' => $this->whenLoaded('wallet', fn () => $this->wallet->currency_code, 'USD'),
            'method' => $this->method,
            'status' => $this->status,
            'requested_at' => $this->requested_at,
            'processed_at' => $this->processed_at,
            'rejection_reason' => $this->rejection_reason,
            'vendor' => $this->whenLoaded('vendor', fn () => [
                'id' => $this->vendor->id,
                'business_name' => $this->vendor->business_name,
            ]),
            'bank_account' => $this->whenLoaded('bankAccount', fn () => $this->bankAccount ? [
                'account_holder_name' => $this->bankAccount->account_holder_name,
                'bank_name' => $this->bankAccount->bank_name,
                'account_number' => $this->bankAccount->account_number,
                'iban_or_routing' => $this->bankAccount->iban_or_routing,
            ] : null),
            'processed_by' => $this->whenLoaded('processedBy', fn () => $this->processedBy?->name),
        ];
    }
}
