<?php

namespace App\Http\Resources\Vendor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KycDocumentTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'is_required' => $this->is_required,
            'applicable_country_code' => $this->applicable_country_code,
            'instructions' => $this->instructions,
            'is_active' => $this->is_active,
        ];
    }
}
