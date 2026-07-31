<?php

namespace App\Domain\Settings\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'version',
        'content',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
