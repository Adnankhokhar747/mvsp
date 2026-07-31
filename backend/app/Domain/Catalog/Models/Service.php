<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Booking\Models\Booking;
use App\Domain\Identity\Models\User;
use App\Domain\Review\Models\Review;
use App\Domain\Vendor\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Service extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'title',
        'slug',
        'short_description',
        'description',
        'base_price',
        'currency_code',
        'price_type',
        'duration_minutes',
        'attributes',
        'status',
        'is_featured',
        'featured_until',
        'avg_rating',
        'review_count',
        'view_count',
    ];

    protected $casts = [
        'base_price' => 'integer',
        'attributes' => 'array',
        'is_featured' => 'boolean',
        'featured_until' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnlyDirty();
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(ServicePackage::class);
    }

    public function availability(): HasMany
    {
        return $this->hasMany(ServiceAvailability::class);
    }

    public function serviceStaff(): HasMany
    {
        return $this->hasMany(ServiceStaff::class);
    }

    public function staff(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'service_staff', 'service_id', 'staff_user_id')
            ->using(ServiceStaff::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function scopeMinPrice($query, $value)
    {
        return $query->where('base_price', '>=', $value);
    }

    public function scopeMaxPrice($query, $value)
    {
        return $query->where('base_price', '<=', $value);
    }
}
