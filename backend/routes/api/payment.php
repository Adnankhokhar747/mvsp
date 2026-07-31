<?php

use App\Http\Controllers\Api\V1\Payment\InvoiceController;
use App\Http\Controllers\Api\V1\Payment\PaymentController;
use App\Http\Controllers\Api\V1\Payment\TransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('bookings/{booking}/pay', [PaymentController::class, 'pay']);
    Route::post('transactions/{transaction}/confirm', [PaymentController::class, 'confirm']);
    Route::post('transactions/{transaction}/refund', [PaymentController::class, 'refund']);

    Route::get('transactions', [TransactionController::class, 'index']);
    Route::get('transactions/{transaction}', [TransactionController::class, 'show']);

    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
});
