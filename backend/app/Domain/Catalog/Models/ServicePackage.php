<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Booking\Models\Booking;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServicePackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'price',
        'duration_minutes',
        'description',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'integer',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
