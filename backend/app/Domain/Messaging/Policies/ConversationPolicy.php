<?php

namespace App\Domain\Messaging\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Messaging\Models\Conversation;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->customer_id === $user->id
            || $conversation->vendor->vendorUsers()->where('user_id', $user->id)->exists();
    }
}
