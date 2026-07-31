<?php

namespace App\Domain\Location\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'addressable_type',
        'addressable_id',
        'label',
        'line1',
        'line2',
        'city',
        'state',
        'country_code',
        'postal_code',
        'lat',
        'lng',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function addressable(): MorphTo
    {
        return $this->morphTo();
    }
}
