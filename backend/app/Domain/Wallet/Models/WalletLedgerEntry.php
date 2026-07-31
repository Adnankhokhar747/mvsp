<?php

namespace App\Domain\Wallet\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WalletLedgerEntry extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'balance_after',
        'reference_type',
        'reference_id',
        'description',
    ];

    protected $casts = [
        'amount' => 'integer',
        'balance_after' => 'integer',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(VendorWallet::class, 'wallet_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
