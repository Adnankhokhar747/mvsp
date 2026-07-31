<?php

namespace App\Http\Resources\Vendor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_name' => $this->business_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo_path' => $this->logo_path,
            'cover_path' => $this->cover_path,
            'email' => $this->email,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'status' => $this->status,
            'rejection_reason' => $this->when(
                (bool) $request->user()?->can('update', $this->resource),
                $this->rejection_reason
            ),
            'approved_at' => $this->approved_at,
            'currency_code' => $this->currency_code,
            'timezone' => $this->timezone,
            'created_at' => $this->created_at,
        ];
    }
}
