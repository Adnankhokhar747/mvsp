<?php

namespace App\Domain\Settings\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CmsPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'content',
        'locale',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];
}
