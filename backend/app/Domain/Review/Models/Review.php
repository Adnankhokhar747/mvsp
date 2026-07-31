<?php

namespace App\Domain\Review\Models;

use App\Domain\Booking\Models\Booking;
use App\Domain\Catalog\Models\Service;
use App\Domain\Identity\Models\User;
use App\Domain\Vendor\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'customer_id',
        'vendor_id',
        'service_id',
        'rating',
        'title',
        'comment',
        'vendor_reply',
        'vendor_replied_at',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
        'vendor_replied_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
