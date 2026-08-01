<?php

use App\Http\Controllers\Api\V1\Vendor\BookingController as VendorBookingController;
use App\Http\Controllers\Api\V1\Vendor\KycDocumentController;
use App\Http\Controllers\Api\V1\Vendor\ServiceAvailabilityController;
use App\Http\Controllers\Api\V1\Vendor\ServiceController;
use App\Http\Controllers\Api\V1\Vendor\ServiceMediaController;
use App\Http\Controllers\Api\V1\Vendor\ServicePackageController;
use App\Http\Controllers\Api\V1\Vendor\StaffController;
use App\Http\Controllers\Api\V1\Vendor\VendorController;
use Illuminate\Support\Facades\Route;

Route::get('vendors/{vendor:slug}', [VendorController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('vendor/me', [VendorController::class, 'me']);
    Route::post('vendors', [VendorController::class, 'store']);
    Route::patch('vendors/{vendor}', [VendorController::class, 'update']);

    Route::get('vendor/kyc-document-types', [KycDocumentController::class, 'types']);
    Route::get('vendors/{vendor}/kyc-documents', [KycDocumentController::class, 'index']);
    Route::post('vendors/{vendor}/kyc-documents', [KycDocumentController::class, 'store']);

    Route::get('vendors/{vendor}/staff', [StaffController::class, 'index']);
    Route::post('vendors/{vendor}/staff/invite', [StaffController::class, 'invite']);
    Route::delete('vendors/{vendor}/staff/{user}', [StaffController::class, 'destroy']);

    Route::get('vendor/services', [ServiceController::class, 'index']);
    Route::get('vendor/services/{service}', [ServiceController::class, 'show']);
    Route::post('vendor/services', [ServiceController::class, 'store']);
    Route::patch('vendor/services/{service}', [ServiceController::class, 'update']);
    Route::delete('vendor/services/{service}', [ServiceController::class, 'destroy']);
    Route::post('vendor/services/{service}/media', [ServiceMediaController::class, 'store']);
    Route::patch('vendor/services/{service}/availability', [ServiceAvailabilityController::class, 'update']);
    Route::post('vendor/services/{service}/packages', [ServicePackageController::class, 'store']);
    Route::patch('vendor/services/{service}/packages/{package}', [ServicePackageController::class, 'update']);
    Route::delete('vendor/services/{service}/packages/{package}', [ServicePackageController::class, 'destroy']);

    Route::post('vendor/bookings/{booking}/quote', [VendorBookingController::class, 'quote']);
    Route::post('vendor/bookings/{booking}/status', [VendorBookingController::class, 'status']);
});
