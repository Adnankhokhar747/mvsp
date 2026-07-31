<?php

namespace App\Domain\Wallet\Models;

use App\Domain\Identity\Models\User;
use App\Domain\Vendor\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class PayoutRequest extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'vendor_id',
        'wallet_id',
        'amount',
        'method',
        'vendor_bank_account_id',
        'status',
        'requested_at',
        'processed_by',
        'processed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'integer',
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnlyDirty();
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(VendorWallet::class, 'wallet_id');
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(VendorBankAccount::class, 'vendor_bank_account_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
