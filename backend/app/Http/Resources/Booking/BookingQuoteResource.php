<?php

namespace App\Http\Resources\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingQuoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'quoted_price' => $this->quoted_price,
            'quoted_duration' => $this->quoted_duration,
            'message' => $this->message,
            'status' => $this->status,
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
        ];
    }
}
