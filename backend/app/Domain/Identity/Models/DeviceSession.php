<?php

namespace App\Domain\Identity\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'device_name',
        'device_type',
        'ip_address',
        'user_agent',
        'last_active_at',
        'revoked_at',
    ];

    protected $casts = [
        'last_active_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
