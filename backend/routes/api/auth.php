<?php

use App\Http\Controllers\Api\V1\Identity\AuthController;
use App\Http\Controllers\Api\V1\Identity\ProfileController;
use App\Http\Controllers\Api\V1\Identity\SessionController;
use Illuminate\Support\Facades\Route;

Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:auth');
Route::post('auth/otp/send', [AuthController::class, 'sendOtp'])->middleware('throttle:otp');
Route::post('auth/otp/verify', [AuthController::class, 'verifyOtp'])->middleware('throttle:otp');
Route::post('auth/password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('me', [ProfileController::class, 'show']);
    Route::patch('me', [ProfileController::class, 'update']);

    Route::get('me/sessions', [SessionController::class, 'index']);
    Route::delete('me/sessions/{deviceSession}', [SessionController::class, 'destroy']);
});
