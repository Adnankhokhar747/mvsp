<?php

namespace App\Domain\Review\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Review\Models\Review;

class ReviewPolicy
{
    public function reply(User $user, Review $review): bool
    {
        return $review->vendor->vendorUsers()
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'manager'])
            ->exists();
    }
}
