<?php

namespace App\Domain\Wallet\Services;

use App\Domain\Vendor\Models\Vendor;
use App\Domain\Wallet\Exceptions\WalletException;
use App\Domain\Wallet\Models\VendorWallet;
use App\Domain\Wallet\Models\WalletLedgerEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class WalletService
{
    public function credit(Vendor $vendor, int $amount, ?Model $reference, ?string $description = null): WalletLedgerEntry
    {
        return DB::transaction(function () use ($vendor, $amount, $reference, $description) {
            $wallet = VendorWallet::where('vendor_id', $vendor->id)->lockForUpdate()->first();
            $wallet->increment('balance', $amount);

            return $this->log($wallet, 'credit', $amount, $reference, $description);
        });
    }

    /**
     * @throws WalletException
     */
    public function debit(Vendor $vendor, int $amount, ?Model $reference, ?string $description = null): WalletLedgerEntry
    {
        return DB::transaction(function () use ($vendor, $amount, $reference, $description) {
            $wallet = VendorWallet::where('vendor_id', $vendor->id)->lockForUpdate()->first();

            if ($wallet->balance < $amount) {
                throw WalletException::insufficientBalance();
            }

            $wallet->decrement('balance', $amount);

            return $this->log($wallet, 'debit', $amount, $reference, $description);
        });
    }

    public function hold(Vendor $vendor, int $amount, ?Model $reference, ?string $description = null): WalletLedgerEntry
    {
        return DB::transaction(function () use ($vendor, $amount, $reference, $description) {
            $wallet = VendorWallet::where('vendor_id', $vendor->id)->lockForUpdate()->first();
            $wallet->decrement('balance', $amount);
            $wallet->increment('held_balance', $amount);

            return $this->log($wallet, 'hold', $amount, $reference, $description);
        });
    }

    public function release(Vendor $vendor, int $amount, ?Model $reference, ?string $description = null): WalletLedgerEntry
    {
        return DB::transaction(function () use ($vendor, $amount, $reference, $description) {
            $wallet = VendorWallet::where('vendor_id', $vendor->id)->lockForUpdate()->first();
            $wallet->decrement('held_balance', $amount);
            $wallet->increment('balance', $amount);

            return $this->log($wallet, 'release', $amount, $reference, $description);
        });
    }

    protected function log(VendorWallet $wallet, string $type, int $amount, ?Model $reference, ?string $description): WalletLedgerEntry
    {
        return WalletLedgerEntry::create([
            'wallet_id' => $wallet->id,
            'type' => $type,
            'amount' => $amount,
            'balance_after' => $wallet->fresh()->balance,
            'reference_type' => $reference?->getMorphClass(),
            'reference_id' => $reference?->getKey(),
            'description' => $description,
        ]);
    }
}
