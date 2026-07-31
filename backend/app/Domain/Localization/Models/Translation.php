<?php

namespace App\Domain\Localization\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    use HasFactory;

    protected $fillable = [
        'locale',
        'group',
        'key',
        'value',
    ];
}
