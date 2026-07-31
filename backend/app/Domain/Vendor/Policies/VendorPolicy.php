<?php

namespace App\Domain\Vendor\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Vendor\Models\Vendor;

class VendorPolicy
{
    public function view(?User $user, Vendor $vendor): bool
    {
        return true;
    }

    public function update(User $user, Vendor $vendor): bool
    {
        return $vendor->vendorUsers()
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'manager'])
            ->exists();
    }

    public function manageStaff(User $user, Vendor $vendor): bool
    {
        return $this->update($user, $vendor);
    }

    public function uploadKyc(User $user, Vendor $vendor): bool
    {
        return $this->update($user, $vendor);
    }

    public function viewStaff(User $user, Vendor $vendor): bool
    {
        return $vendor->vendorUsers()->where('user_id', $user->id)->exists();
    }
}
