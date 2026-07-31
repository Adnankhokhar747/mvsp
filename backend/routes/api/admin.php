<?php

use App\Http\Controllers\Api\V1\Admin\ActivityLogController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\CmsPageController;
use App\Http\Controllers\Api\V1\Admin\KycDocumentTypeController;
use App\Http\Controllers\Api\V1\Admin\LegalDocumentController;
use App\Http\Controllers\Api\V1\Admin\NotificationTemplateController;
use App\Http\Controllers\Api\V1\Admin\PaymentGatewayController;
use App\Http\Controllers\Api\V1\Admin\PayoutController as AdminPayoutController;
use App\Http\Controllers\Api\V1\Admin\PlanFeatureController;
use App\Http\Controllers\Api\V1\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\V1\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\StaffController;
use App\Http\Controllers\Api\V1\Admin\SubscriptionPlanController as AdminSubscriptionPlanController;
use App\Http\Controllers\Api\V1\Admin\VendorController as AdminVendorController;
use App\Http\Controllers\Api\V1\Admin\VendorKycDocumentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('vendors', [AdminVendorController::class, 'index']);
    Route::post('vendors/{vendor}/approve', [AdminVendorController::class, 'approve']);
    Route::post('vendors/{vendor}/reject', [AdminVendorController::class, 'reject']);
    Route::post('vendors/{vendor}/suspend', [AdminVendorController::class, 'suspend']);

    Route::get('kyc-document-types', [KycDocumentTypeController::class, 'index']);
    Route::get('vendors/{vendor}/kyc-documents', [VendorKycDocumentController::class, 'index']);
    Route::get('vendors/{vendor}/kyc-documents/{document}/download', [VendorKycDocumentController::class, 'download']);
    Route::post('vendors/{vendor}/kyc-documents/{document}/review', [VendorKycDocumentController::class, 'review']);

    Route::get('categories', [AdminCategoryController::class, 'index']);
    Route::post('categories', [AdminCategoryController::class, 'store']);
    Route::patch('categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy']);

    Route::get('services', [AdminServiceController::class, 'index']);
    Route::post('services/{service}/moderate', [AdminServiceController::class, 'moderate']);

    Route::get('payouts', [AdminPayoutController::class, 'index']);
    Route::post('payouts/{payout}/approve', [AdminPayoutController::class, 'approve']);
    Route::post('payouts/{payout}/reject', [AdminPayoutController::class, 'reject']);

    Route::get('payment-gateways', [PaymentGatewayController::class, 'index']);
    Route::patch('payment-gateways/{paymentGateway}', [PaymentGatewayController::class, 'update']);

    Route::get('subscription-plans', [AdminSubscriptionPlanController::class, 'index']);
    Route::post('subscription-plans', [AdminSubscriptionPlanController::class, 'store']);
    Route::patch('subscription-plans/{subscriptionPlan}', [AdminSubscriptionPlanController::class, 'update']);
    Route::delete('subscription-plans/{subscriptionPlan}', [AdminSubscriptionPlanController::class, 'destroy']);

    Route::get('plan-features', [PlanFeatureController::class, 'index']);
    Route::post('plan-features', [PlanFeatureController::class, 'store']);
    Route::patch('plan-features/{planFeature}', [PlanFeatureController::class, 'update']);

    Route::get('reviews', [AdminReviewController::class, 'index']);
    Route::post('reviews/{review}/moderate', [AdminReviewController::class, 'moderate']);

    Route::get('activity-logs', [ActivityLogController::class, 'index']);

    Route::get('staff', [StaffController::class, 'index']);
    Route::get('staff-roles', [StaffController::class, 'roles']);
    Route::post('staff', [StaffController::class, 'store']);
    Route::patch('staff/{user}/role', [StaffController::class, 'updateRole']);
    Route::post('staff/{user}/suspend', [StaffController::class, 'suspend']);
    Route::post('staff/{user}/reactivate', [StaffController::class, 'reactivate']);

    Route::get('cms-pages', [CmsPageController::class, 'index']);
    Route::post('cms-pages', [CmsPageController::class, 'store']);
    Route::patch('cms-pages/{cmsPage}', [CmsPageController::class, 'update']);
    Route::delete('cms-pages/{cmsPage}', [CmsPageController::class, 'destroy']);

    Route::get('legal-documents', [LegalDocumentController::class, 'index']);
    Route::post('legal-documents', [LegalDocumentController::class, 'store']);
    Route::patch('legal-documents/{legalDocument}', [LegalDocumentController::class, 'update']);
    Route::post('legal-documents/{legalDocument}/publish', [LegalDocumentController::class, 'publish']);

    Route::get('notification-templates', [NotificationTemplateController::class, 'index']);
    Route::post('notification-templates', [NotificationTemplateController::class, 'store']);
    Route::patch('notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'update']);
    Route::delete('notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'destroy']);
});
