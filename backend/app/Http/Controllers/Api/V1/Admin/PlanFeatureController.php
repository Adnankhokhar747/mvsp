<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Subscription\Models\PlanFeature;
use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\StorePlanFeatureRequest;
use App\Http\Requests\Subscription\UpdatePlanFeatureRequest;
use App\Http\Resources\Subscription\PlanFeatureResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PlanFeatureController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('subscriptions.manage-plans');

        return PlanFeatureResource::collection(PlanFeature::orderBy('key')->get());
    }

    public function store(StorePlanFeatureRequest $request): JsonResponse
    {
        $this->authorize('subscriptions.manage-plans');

        $feature = PlanFeature::create($request->validated());

        return (new PlanFeatureResource($feature))->response()->setStatusCode(201);
    }

    public function update(UpdatePlanFeatureRequest $request, PlanFeature $planFeature): PlanFeatureResource
    {
        $this->authorize('subscriptions.manage-plans');

        $planFeature->update($request->validated());

        return new PlanFeatureResource($planFeature->fresh());
    }
}
