<?php

namespace App\Domain\Vendor\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorKycDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'kyc_document_type_id',
        'file_path',
        'status',
        'rejected_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function kycDocumentType(): BelongsTo
    {
        return $this->belongsTo(KycDocumentType::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
