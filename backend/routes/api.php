<?php

use App\Http\Controllers\Api\V1\Payment\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    require __DIR__.'/api/auth.php';
    require __DIR__.'/api/vendor.php';
    require __DIR__.'/api/catalog.php';
    require __DIR__.'/api/booking.php';
    require __DIR__.'/api/payment.php';
    require __DIR__.'/api/wallet.php';
    require __DIR__.'/api/subscription.php';
    require __DIR__.'/api/review.php';
    require __DIR__.'/api/messaging.php';
    require __DIR__.'/api/location.php';
    require __DIR__.'/api/admin.php';
});

// Not versioned, no auth middleware — provider callbacks per
// docs/architecture/04-api-contract.md §3.
Route::post('webhooks/payments/{gateway}', [WebhookController::class, 'handle']);
