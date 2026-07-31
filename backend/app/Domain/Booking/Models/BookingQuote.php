<?php

namespace App\Domain\Booking\Models;

use App\Domain\Vendor\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingQuote extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vendor_id',
        'quoted_price',
        'quoted_duration',
        'message',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'quoted_price' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
