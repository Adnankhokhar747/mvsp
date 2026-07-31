<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LegalDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'version' => $this->version,
            'content' => $this->content,
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
        ];
    }
}
