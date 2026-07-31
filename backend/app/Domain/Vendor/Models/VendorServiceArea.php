<?php

namespace App\Domain\Vendor\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorServiceArea extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'type',
        'center_lat',
        'center_lng',
        'radius_km',
        'polygon',
        'city',
        'country_code',
    ];

    protected $casts = [
        'polygon' => 'array',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
