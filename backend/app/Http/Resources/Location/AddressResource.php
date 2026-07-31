<?php

namespace App\Http\Resources\Location;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'line1' => $this->line1,
            'line2' => $this->line2,
            'city' => $this->city,
            'state' => $this->state,
            'country_code' => $this->country_code,
            'postal_code' => $this->postal_code,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'is_default' => $this->is_default,
        ];
    }
}
