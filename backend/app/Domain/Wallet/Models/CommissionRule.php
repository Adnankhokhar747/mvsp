<?php

namespace App\Domain\Wallet\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'scope',
        'scope_id',
        'type',
        'value',
        'min_amount',
        'max_amount',
        'is_active',
    ];

    protected $casts = [
        'value' => 'integer',
        'min_amount' => 'integer',
        'max_amount' => 'integer',
        'is_active' => 'boolean',
    ];

    // scope_id intentionally has no belongsTo: it is a polymorphic-by-`scope`
    // reference (platform/category/vendor/plan) with no FK constraint in the
    // migration, so there is no single fixed related model to bind to.
}
