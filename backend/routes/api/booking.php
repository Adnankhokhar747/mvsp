<?php

use App\Http\Controllers\Api\V1\Booking\BookingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('bookings', [BookingController::class, 'store']);
    Route::get('bookings', [BookingController::class, 'index']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('bookings/{booking}/reschedule', [BookingController::class, 'reschedule']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('bookings/{booking}/quote/accept', [BookingController::class, 'acceptQuote']);
    Route::post('bookings/{booking}/quote/reject', [BookingController::class, 'rejectQuote']);
});
