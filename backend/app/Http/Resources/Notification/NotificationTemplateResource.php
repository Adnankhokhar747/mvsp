<?php

namespace App\Http\Resources\Notification;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'channel' => $this->channel,
            'locale' => $this->locale,
            'subject' => $this->subject,
            'body' => $this->body,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
