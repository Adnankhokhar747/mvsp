<?php

namespace App\Http\Resources\Payment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'invoiceable_type' => class_basename($this->invoiceable_type),
            'invoiceable_id' => $this->invoiceable_id,
            'amount' => $this->amount,
            'tax_amount' => $this->tax_amount,
            'discount_amount' => $this->discount_amount,
            'total' => $this->total,
            'currency_code' => $this->currency_code,
            'status' => $this->status,
            'issued_at' => $this->issued_at,
            'due_at' => $this->due_at,
        ];
    }
}
