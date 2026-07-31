<?php

namespace App\Http\Resources\Messaging;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'body' => $this->body,
            'attachment_path' => $this->attachment_path,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}
