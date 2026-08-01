<?php

namespace App\Http\Resources\Messaging;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'vendor_id' => $this->vendor_id,
            'customer_id' => $this->customer_id,
            'last_message_at' => $this->last_message_at,
            'vendor' => $this->whenLoaded('vendor', fn () => [
                'id' => $this->vendor->id,
                'business_name' => $this->vendor->business_name,
                'slug' => $this->vendor->slug,
            ]),
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
            ]),
            'unread_count' => $this->when(
                $request->user() !== null,
                fn () => $this->messages()->where('sender_id', '!=', $request->user()->id)->whereNull('read_at')->count()
            ),
            'created_at' => $this->created_at,
        ];
    }
}
