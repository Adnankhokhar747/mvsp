<?php

namespace App\Domain\Vendor\Models;

use App\Domain\Booking\Models\Booking;
use App\Domain\Booking\Models\BookingCancellationPolicy;
use App\Domain\Booking\Models\BookingQuote;
use App\Domain\Catalog\Models\Service;
use App\Domain\Identity\Models\User;
use App\Domain\Location\Models\Address;
use App\Domain\Messaging\Models\Conversation;
use App\Domain\Payment\Models\Transaction;
use App\Domain\Review\Models\Review;
use App\Domain\Subscription\Models\VendorSubscription;
use App\Domain\Wallet\Models\PayoutRequest;
use App\Domain\Wallet\Models\VendorBankAccount;
use App\Domain\Wallet\Models\VendorWallet;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Vendor extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $fillable = [
        'user_id',
        'business_name',
        'slug',
        'description',
        'logo_path',
        'cover_path',
        'email',
        'phone',
        'whatsapp',
        'address_id',
        'status',
        'rejection_reason',
        'approved_at',
        'approved_by',
        'commission_override',
        'currency_code',
        'timezone',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnlyDirty();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function addresses(): MorphMany
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(VendorWallet::class);
    }

    public function kycDocuments(): HasMany
    {
        return $this->hasMany(VendorKycDocument::class);
    }

    public function serviceAreas(): HasMany
    {
        return $this->hasMany(VendorServiceArea::class);
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(VendorBankAccount::class);
    }

    public function vendorUsers(): HasMany
    {
        return $this->hasMany(VendorUser::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'vendor_users')
            ->using(VendorUser::class)
            ->withPivot(['role', 'permissions'])
            ->withTimestamps();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(VendorSubscription::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(VendorSubscription::class)
            ->whereIn('status', ['trialing', 'active'])
            ->latestOfMany();
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function cancellationPolicies(): HasMany
    {
        return $this->hasMany(BookingCancellationPolicy::class);
    }

    public function bookingQuotes(): HasMany
    {
        return $this->hasMany(BookingQuote::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function payoutRequests(): HasMany
    {
        return $this->hasMany(PayoutRequest::class);
    }
}
