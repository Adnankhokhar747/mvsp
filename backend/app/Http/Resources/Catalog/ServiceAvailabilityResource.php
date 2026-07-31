<?php

namespace App\Http\Resources\Catalog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceAvailabilityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'staff_id' => $this->staff_id,
            'day_of_week' => $this->day_of_week,
            'specific_date' => $this->specific_date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'is_recurring' => $this->is_recurring,
        ];
    }
}
