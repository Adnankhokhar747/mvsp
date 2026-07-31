<?php

namespace App\Http\Resources\Catalog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'icon_path' => $this->icon_path,
            'image_path' => $this->image_path,
            'description' => $this->description,
            'attribute_schema' => $this->attribute_schema,
            'booking_mode_allowed' => $this->booking_mode_allowed,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'seo_meta' => $this->seo_meta,
            'children' => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
