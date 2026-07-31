<?php

namespace App\Domain\Payment\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Payment\Models\Transaction;

class TransactionPolicy
{
    public function view(User $user, Transaction $transaction): bool
    {
        return $transaction->user_id === $user->id || $this->isVendorMember($user, $transaction);
    }

    public function confirm(User $user, Transaction $transaction): bool
    {
        return $this->isVendorMember($user, $transaction, ['owner', 'manager']);
    }

    protected function isVendorMember(User $user, Transaction $transaction, ?array $roles = null): bool
    {
        if (! $transaction->vendor_id) {
            return false;
        }

        return $transaction->vendor->vendorUsers()
            ->where('user_id', $user->id)
            ->when($roles, fn ($q) => $q->whereIn('role', $roles))
            ->exists();
    }
}
