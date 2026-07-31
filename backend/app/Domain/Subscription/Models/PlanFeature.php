<?php

namespace App\Domain\Subscription\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'label',
        'type',
        'description',
    ];

    public function values(): HasMany
    {
        return $this->hasMany(PlanFeatureValue::class);
    }
}
