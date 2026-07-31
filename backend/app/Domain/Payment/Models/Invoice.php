<?php

namespace App\Domain\Payment\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'invoiceable_type',
        'invoiceable_id',
        'billed_to_user_id',
        'amount',
        'tax_amount',
        'discount_amount',
        'total',
        'currency_code',
        'status',
        'pdf_path',
        'issued_at',
        'due_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'tax_amount' => 'integer',
        'discount_amount' => 'integer',
        'total' => 'integer',
        'issued_at' => 'datetime',
        'due_at' => 'datetime',
    ];

    public function invoiceable(): MorphTo
    {
        return $this->morphTo();
    }

    public function billedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'billed_to_user_id');
    }
}
