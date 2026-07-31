<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Catalog\Models\Service;
use App\Domain\Catalog\Services\ServiceService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\SetAvailabilityRequest;
use App\Http\Resources\Catalog\ServiceAvailabilityResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceAvailabilityController extends Controller
{
    public function __construct(protected ServiceService $services) {}

    public function update(SetAvailabilityRequest $request, Service $service): AnonymousResourceCollection
    {
        $this->authorize('update', $service);

        $this->services->setAvailability($service, $request->validated('slots'));

        return ServiceAvailabilityResource::collection($service->availability()->get());
    }
}
