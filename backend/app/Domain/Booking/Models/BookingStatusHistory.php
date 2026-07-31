<?php

namespace App\Domain\Booking\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingStatusHistory extends Model
{
    use HasFactory;

    /**
     * Migration created `booking_status_history` (singular) — Eloquent's default
     * pluralization would guess `booking_status_histories`.
     */
    protected $table = 'booking_status_history';

    const UPDATED_AT = null;

    protected $fillable = [
        'booking_id',
        'from_status',
        'to_status',
        'changed_by',
        'note',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
