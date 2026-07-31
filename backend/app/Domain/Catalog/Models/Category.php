<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Booking\Models\BookingCancellationPolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'icon_path',
        'image_path',
        'description',
        'attribute_schema',
        'booking_mode_allowed',
        'sort_order',
        'is_active',
        'seo_meta',
    ];

    protected $casts = [
        'attribute_schema' => 'array',
        'booking_mode_allowed' => 'array',
        'is_active' => 'boolean',
        'seo_meta' => 'array',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function cancellationPolicies(): HasMany
    {
        return $this->hasMany(BookingCancellationPolicy::class);
    }
}
