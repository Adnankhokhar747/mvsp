<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Subscription\Models\SubscriptionPlan;
use App\Domain\Subscription\Services\SubscriptionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\StoreSubscriptionPlanRequest;
use App\Http\Requests\Subscription\UpdateSubscriptionPlanRequest;
use App\Http\Resources\Subscription\SubscriptionPlanResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class SubscriptionPlanController extends Controller
{
    public function __construct(protected SubscriptionService $subscriptions) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('subscriptions.manage-plans');

        $plans = SubscriptionPlan::with('featureValues.feature')->orderBy('sort_order')->get();

        return SubscriptionPlanResource::collection($plans);
    }

    public function store(StoreSubscriptionPlanRequest $request): JsonResponse
    {
        $this->authorize('subscriptions.manage-plans');

        $data = $request->validated();
        $values = $data['values'] ?? [];
        unset($data['values']);
        $data['slug'] = Str::slug($data['name']);

        $plan = SubscriptionPlan::create($data);
        $this->subscriptions->syncFeatureValues($plan, $values);

        return (new SubscriptionPlanResource($plan->fresh()->load('featureValues.feature')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateSubscriptionPlanRequest $request, SubscriptionPlan $subscriptionPlan): SubscriptionPlanResource
    {
        $this->authorize('subscriptions.manage-plans');

        $data = $request->validated();
        $values = $data['values'] ?? null;
        unset($data['values']);

        $subscriptionPlan->update($data);
        if ($values !== null) {
            $this->subscriptions->syncFeatureValues($subscriptionPlan, $values);
        }

        return new SubscriptionPlanResource($subscriptionPlan->fresh()->load('featureValues.feature'));
    }

    public function destroy(SubscriptionPlan $subscriptionPlan): JsonResponse
    {
        $this->authorize('subscriptions.manage-plans');

        if ($subscriptionPlan->subscriptions()->exists()) {
            return response()->json(['message' => 'This plan has vendors subscribed to it and cannot be deleted. Deactivate it instead.'], 422);
        }

        $subscriptionPlan->delete();

        return response()->json(['message' => 'Plan deleted.']);
    }
}
