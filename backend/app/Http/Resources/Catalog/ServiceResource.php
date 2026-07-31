<?php

namespace App\Http\Resources\Catalog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vendor_id' => $this->vendor_id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'base_price' => $this->base_price,
            'currency_code' => $this->currency_code,
            'price_type' => $this->price_type,
            'duration_minutes' => $this->duration_minutes,
            'attributes' => $this->attributes,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'featured_until' => $this->featured_until,
            'avg_rating' => (float) $this->avg_rating,
            'review_count' => $this->review_count,
            'media' => $this->getMedia('gallery')->map(fn ($media) => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'mime_type' => $media->mime_type,
            ]),
            'packages' => ServicePackageResource::collection($this->whenLoaded('packages')),
            'availability' => ServiceAvailabilityResource::collection($this->whenLoaded('availability')),
            'vendor' => $this->whenLoaded('vendor', fn () => [
                'id' => $this->vendor->id,
                'business_name' => $this->vendor->business_name,
                'slug' => $this->vendor->slug,
            ]),
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
