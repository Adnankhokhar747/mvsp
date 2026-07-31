<?php

namespace App\Domain\Wallet\Models;

use App\Domain\Vendor\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorWallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'balance',
        'held_balance',
        'currency_code',
    ];

    protected $casts = [
        'balance' => 'integer',
        'held_balance' => 'integer',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(WalletLedgerEntry::class, 'wallet_id');
    }

    public function payoutRequests(): HasMany
    {
        return $this->hasMany(PayoutRequest::class, 'wallet_id');
    }
}
