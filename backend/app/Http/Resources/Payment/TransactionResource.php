<?php

namespace App\Http\Resources\Payment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_number' => $this->transaction_number,
            'payable_type' => class_basename($this->payable_type),
            'payable_id' => $this->payable_id,
            'user_id' => $this->user_id,
            'vendor_id' => $this->vendor_id,
            'type' => $this->type,
            'amount' => $this->amount,
            'currency_code' => $this->currency_code,
            'status' => $this->status,
            'gateway' => $this->whenLoaded('paymentGateway', fn () => $this->paymentGateway->driver),
            'meta' => $this->when((bool) $request->user()?->can('confirm', $this->resource), $this->meta),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'vendor' => $this->whenLoaded('vendor', fn () => [
                'id' => $this->vendor->id,
                'business_name' => $this->vendor->business_name,
            ]),
            'refunds' => RefundResource::collection($this->whenLoaded('refunds')),
            'refunded_amount' => $this->whenLoaded('refunds', fn () => $this->refunds->sum('amount')),
            'created_at' => $this->created_at,
        ];
    }
}
