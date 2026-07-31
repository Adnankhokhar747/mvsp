<?php

namespace App\Http\Controllers\Api\V1\Subscription;

use App\Domain\Subscription\Models\SubscriptionPlan;
use App\Http\Controllers\Controller;
use App\Http\Resources\Subscription\SubscriptionPlanResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubscriptionPlanController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $plans = SubscriptionPlan::where('is_active', true)
            ->with('featureValues.feature')
            ->orderBy('sort_order')
            ->get();

        return SubscriptionPlanResource::collection($plans);
    }
}
