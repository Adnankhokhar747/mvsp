<?php

namespace App\Domain\Wallet\Services;

use App\Domain\Identity\Models\User;
use App\Domain\Vendor\Models\Vendor;
use App\Domain\Wallet\Exceptions\WalletException;
use App\Domain\Wallet\Models\PayoutRequest;
use Illuminate\Support\Facades\DB;

class PayoutService
{
    public function __construct(protected WalletService $wallet) {}

    /**
     * @throws WalletException
     */
    public function request(Vendor $vendor, int $amount, ?int $bankAccountId): PayoutRequest
    {
        $wallet = $vendor->wallet;

        if ($wallet->balance < $amount) {
            throw WalletException::insufficientBalance();
        }

        return DB::transaction(function () use ($vendor, $wallet, $amount, $bankAccountId) {
            // Hold the funds immediately so a vendor can't request the same balance twice.
            $this->wallet->hold($vendor, $amount, null, 'Held pending payout request');

            return PayoutRequest::create([
                'vendor_id' => $vendor->id,
                'wallet_id' => $wallet->id,
                'amount' => $amount,
                'method' => 'bank_transfer',
                'vendor_bank_account_id' => $bankAccountId,
                'status' => 'pending',
                'requested_at' => now(),
            ]);
        });
    }

    public function approve(PayoutRequest $payout, User $admin): PayoutRequest
    {
        return DB::transaction(function () use ($payout, $admin) {
            $this->wallet->release($payout->vendor, $payout->amount, $payout, 'Payout approved, released from hold');
            $this->wallet->debit($payout->vendor, $payout->amount, $payout, 'Payout paid out');

            $payout->update([
                'status' => 'paid',
                'processed_by' => $admin->id,
                'processed_at' => now(),
            ]);

            return $payout->fresh();
        });
    }

    public function reject(PayoutRequest $payout, User $admin, string $reason): PayoutRequest
    {
        return DB::transaction(function () use ($payout, $admin, $reason) {
            $this->wallet->release($payout->vendor, $payout->amount, $payout, 'Payout rejected, released from hold');

            $payout->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
                'processed_by' => $admin->id,
                'processed_at' => now(),
            ]);

            return $payout->fresh();
        });
    }
}
