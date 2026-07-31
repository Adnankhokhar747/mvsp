<?php

namespace App\Domain\Vendor\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'user_id',
        'role',
        'permissions',
        'invited_by',
        'joined_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'joined_at' => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
