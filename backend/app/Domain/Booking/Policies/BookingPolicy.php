<?php

namespace App\Domain\Booking\Policies;

use App\Domain\Booking\Models\Booking;
use App\Domain\Identity\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        return $booking->customer_id === $user->id
            || $booking->staff_id === $user->id
            || $this->isVendorMember($user, $booking);
    }

    public function manage(User $user, Booking $booking): bool
    {
        return $booking->staff_id === $user->id || $this->isVendorMember($user, $booking, ['owner', 'manager']);
    }

    public function cancel(User $user, Booking $booking): bool
    {
        return $booking->customer_id === $user->id || $this->isVendorMember($user, $booking, ['owner', 'manager']);
    }

    protected function isVendorMember(User $user, Booking $booking, ?array $roles = null): bool
    {
        return $booking->vendor->vendorUsers()
            ->where('user_id', $user->id)
            ->when($roles, fn ($q) => $q->whereIn('role', $roles))
            ->exists();
    }
}
