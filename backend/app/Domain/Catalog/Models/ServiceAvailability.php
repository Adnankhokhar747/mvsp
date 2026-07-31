<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceAvailability extends Model
{
    use HasFactory;

    /**
     * Migration created `service_availability` (singular) — Eloquent's default
     * pluralization would guess `service_availabilities`.
     */
    protected $table = 'service_availability';

    protected $fillable = [
        'service_id',
        'staff_id',
        'day_of_week',
        'specific_date',
        'start_time',
        'end_time',
        'is_recurring',
    ];

    protected $casts = [
        'specific_date' => 'date',
        'is_recurring' => 'boolean',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
