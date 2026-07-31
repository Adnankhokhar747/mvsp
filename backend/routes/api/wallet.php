<?php

use App\Http\Controllers\Api\V1\Wallet\BankAccountController;
use App\Http\Controllers\Api\V1\Wallet\PayoutController;
use App\Http\Controllers\Api\V1\Wallet\WalletController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('vendor/wallet', [WalletController::class, 'show']);
    Route::get('vendor/wallet/ledger', [WalletController::class, 'ledger']);
    Route::post('vendor/payouts', [PayoutController::class, 'store']);

    Route::get('vendor/bank-accounts', [BankAccountController::class, 'index']);
    Route::post('vendor/bank-accounts', [BankAccountController::class, 'store']);
    Route::delete('vendor/bank-accounts/{bankAccount}', [BankAccountController::class, 'destroy']);
});
