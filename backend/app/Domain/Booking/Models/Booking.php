<?php

namespace App\Domain\Booking\Models;

use App\Domain\Catalog\Models\Service;
use App\Domain\Catalog\Models\ServicePackage;
use App\Domain\Identity\Models\User;
use App\Domain\Location\Models\Address;
use App\Domain\Messaging\Models\Conversation;
use App\Domain\Payment\Models\Invoice;
use App\Domain\Payment\Models\Transaction;
use App\Domain\Review\Models\Review;
use App\Domain\Vendor\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Booking extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'booking_number',
        'customer_id',
        'vendor_id',
        'service_id',
        'service_package_id',
        'staff_id',
        'booking_mode',
        'scheduled_at',
        'duration_minutes',
        'address_id',
        'status',
        'price',
        'currency_code',
        'cancellation_reason',
        'cancelled_by',
        'cancelled_at',
        'rescheduled_from_id',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'price' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnlyDirty();
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

    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function rescheduledFrom(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'rescheduled_from_id');
    }

    public function rescheduledBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'rescheduled_from_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(BookingStatusHistory::class);
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(BookingQuote::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function transactions(): MorphMany
    {
        return $this->morphMany(Transaction::class, 'payable');
    }

    public function invoices(): MorphMany
    {
        return $this->morphMany(Invoice::class, 'invoiceable');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }
}
