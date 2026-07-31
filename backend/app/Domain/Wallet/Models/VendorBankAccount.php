<?php

namespace App\Domain\Wallet\Models;

use App\Domain\Vendor\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorBankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'account_holder_name',
        'account_number',
        'bank_name',
        'iban_or_routing',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function payoutRequests(): HasMany
    {
        return $this->hasMany(PayoutRequest::class);
    }
}
