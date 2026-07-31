<?php

namespace App\Domain\Settings\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'group',
        'key',
        'value',
        'is_public',
    ];

    protected $casts = [
        'value' => 'array',
        'is_public' => 'boolean',
    ];
}
