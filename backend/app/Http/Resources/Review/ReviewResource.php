<?php

namespace App\Http\Resources\Review;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'customer_id' => $this->customer_id,
            'vendor_id' => $this->vendor_id,
            'service_id' => $this->service_id,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'vendor_reply' => $this->vendor_reply,
            'vendor_replied_at' => $this->vendor_replied_at,
            'status' => $this->status,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
            ]),
            'vendor' => $this->whenLoaded('vendor', fn () => [
                'id' => $this->vendor->id,
                'business_name' => $this->vendor->business_name,
            ]),
            'service' => $this->whenLoaded('service', fn () => [
                'id' => $this->service->id,
                'title' => $this->service->title,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
