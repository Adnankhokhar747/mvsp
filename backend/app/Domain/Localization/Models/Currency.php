<?php

namespace App\Domain\Localization\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'symbol',
        'decimal_places',
        'is_active',
        'is_default',
        'exchange_rate_to_base',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];
}
