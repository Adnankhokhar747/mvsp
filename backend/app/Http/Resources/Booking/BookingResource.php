<?php

namespace App\Http\Resources\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_number' => $this->booking_number,
            'customer_id' => $this->customer_id,
            'vendor_id' => $this->vendor_id,
            'service_id' => $this->service_id,
            'service_package_id' => $this->service_package_id,
            'staff_id' => $this->staff_id,
            'booking_mode' => $this->booking_mode,
            'scheduled_at' => $this->scheduled_at,
            'duration_minutes' => $this->duration_minutes,
            'address_id' => $this->address_id,
            'status' => $this->status,
            'price' => $this->price,
            'currency_code' => $this->currency_code,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_at' => $this->cancelled_at,
            'rescheduled_from_id' => $this->rescheduled_from_id,
            'notes' => $this->notes,
            'quotes' => BookingQuoteResource::collection($this->whenLoaded('quotes')),
            'service' => $this->whenLoaded('service', fn () => [
                'id' => $this->service->id,
                'title' => $this->service->title,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
