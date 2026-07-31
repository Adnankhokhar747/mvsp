<?php

use App\Http\Controllers\Api\V1\Wallet\PayoutController;
use App\Http\Controllers\Api\V1\Wallet\WalletController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('vendor/wallet', [WalletController::class, 'show']);
    Route::get('vendor/wallet/ledger', [WalletController::class, 'ledger']);
    Route::post('vendor/payouts', [PayoutController::class, 'store']);
});
