<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Subscription\Exceptions\SubscriptionException;
use App\Domain\Subscription\Models\SubscriptionPlan;
use App\Domain\Subscription\Services\SubscriptionService;
use App\Domain\Vendor\Models\VendorUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\SwitchPlanRequest;
use App\Http\Resources\Subscription\VendorSubscriptionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(protected SubscriptionService $subscriptions) {}

    public function show(Request $request): VendorSubscriptionResource
    {
        $vendor = $this->resolveVendor($request);
        $subscription = $vendor->activeSubscription()->with(['plan.featureValues.feature', 'usageCounters'])->first();

        abort_unless($subscription, 404, 'No active subscription found.');

        return new VendorSubscriptionResource($subscription);
    }

    public function subscribe(SwitchPlanRequest $request): JsonResponse
    {
        return $this->switchPlan($request);
    }

    public function changePlan(SwitchPlanRequest $request): JsonResponse
    {
        return $this->switchPlan($request);
    }

    protected function switchPlan(SwitchPlanRequest $request): JsonResponse
    {
        $vendor = $this->resolveVendor($request);
        $plan = SubscriptionPlan::findOrFail($request->validated('plan_id'));

        try {
            $subscription = $this->subscriptions->switchPlan($vendor, $plan);
        } catch (SubscriptionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new VendorSubscriptionResource($subscription->load(['plan.featureValues.feature'])))
            ->response()
            ->setStatusCode(201);
    }

    public function cancel(Request $request): JsonResponse
    {
        $vendor = $this->resolveVendor($request);

        try {
            $subscription = $this->subscriptions->cancel($vendor);
        } catch (SubscriptionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new VendorSubscriptionResource($subscription))->response();
    }

    protected function resolveVendor(Request $request)
    {
        $vendorUser = VendorUser::where('user_id', $request->user()->id)->where('role', 'owner')->first();

        abort_unless($vendorUser, 403, 'Only the vendor owner can manage the subscription.');

        return $vendorUser->vendor;
    }
}
