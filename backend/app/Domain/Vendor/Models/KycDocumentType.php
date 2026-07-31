<?php

namespace App\Domain\Vendor\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KycDocumentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'is_required',
        'applicable_country_code',
        'instructions',
        'is_active',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function vendorKycDocuments(): HasMany
    {
        return $this->hasMany(VendorKycDocument::class);
    }
}
