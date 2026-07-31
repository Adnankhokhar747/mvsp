<?php

namespace App\Providers;

use App\Domain\Booking\Models\Booking;
use App\Domain\Booking\Policies\BookingPolicy;
use App\Domain\Catalog\Models\Service;
use App\Domain\Catalog\Policies\ServicePolicy;
use App\Domain\Messaging\Models\Conversation;
use App\Domain\Messaging\Policies\ConversationPolicy;
use App\Domain\Payment\Models\Transaction;
use App\Domain\Payment\Policies\TransactionPolicy;
use App\Domain\Review\Models\Review;
use App\Domain\Review\Policies\ReviewPolicy;
use App\Domain\Vendor\Models\Vendor;
use App\Domain\Vendor\Policies\VendorPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthorizationServiceProvider extends ServiceProvider
{
    /**
     * Model => Policy map. Models live under App\Domain\{Module}\Models rather than
     * App\Models, so Laravel's policy auto-discovery never finds a match — every
     * policy has to be registered here explicitly.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Vendor::class => VendorPolicy::class,
        Service::class => ServicePolicy::class,
        Booking::class => BookingPolicy::class,
        Transaction::class => TransactionPolicy::class,
        Review::class => ReviewPolicy::class,
        Conversation::class => ConversationPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Super Admin bypasses every permission-string AND policy-method check
        // (docs/architecture/02-permission-matrix.md §1) rather than needing every
        // policy to special-case it.
        Gate::before(fn ($user, string $ability) => $user->hasRole('super-admin') ? true : null);
    }
}
