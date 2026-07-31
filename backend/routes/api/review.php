<?php

use App\Http\Controllers\Api\V1\Booking\ReviewController as BookingReviewController;
use App\Http\Controllers\Api\V1\Catalog\VendorReviewController;
use App\Http\Controllers\Api\V1\Vendor\ReviewController as VendorReplyController;
use Illuminate\Support\Facades\Route;

Route::get('vendors/{vendor}/reviews', [VendorReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('bookings/{booking}/review', [BookingReviewController::class, 'store']);
    Route::post('vendor/reviews/{review}/reply', [VendorReplyController::class, 'reply']);
});
