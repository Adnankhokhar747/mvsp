<?php

namespace App\Domain\Booking\Models;

use App\Domain\Catalog\Models\Category;
use App\Domain\Vendor\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingCancellationPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'window_hours',
        'refund_percentage',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
