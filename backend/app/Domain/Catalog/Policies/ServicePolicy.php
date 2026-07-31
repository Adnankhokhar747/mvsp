<?php

namespace App\Domain\Catalog\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Catalog\Models\Service;

class ServicePolicy
{
    public function view(?User $user, Service $service): bool
    {
        if ($service->status === 'active') {
            return true;
        }

        return $user && $this->isOwnerOrManager($user, $service);
    }

    public function update(User $user, Service $service): bool
    {
        return $this->isOwnerOrManager($user, $service)
            || $service->serviceStaff()->where('staff_user_id', $user->id)->exists();
    }

    public function delete(User $user, Service $service): bool
    {
        return $this->isOwnerOrManager($user, $service);
    }

    protected function isOwnerOrManager(User $user, Service $service): bool
    {
        return $service->vendor->vendorUsers()
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'manager'])
            ->exists();
    }
}
