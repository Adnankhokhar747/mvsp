<?php

use App\Http\Controllers\Api\V1\Subscription\SubscriptionPlanController;
use App\Http\Controllers\Api\V1\Vendor\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::get('subscription-plans', [SubscriptionPlanController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('vendor/subscription', [SubscriptionController::class, 'show']);
    Route::post('vendor/subscription/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::post('vendor/subscription/change-plan', [SubscriptionController::class, 'changePlan']);
    Route::post('vendor/subscription/cancel', [SubscriptionController::class, 'cancel']);
});
