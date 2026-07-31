<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Catalog\Models\Service;
use App\Domain\Catalog\Services\ServiceService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerateServiceRequest;
use App\Http\Resources\Catalog\ServiceResource;

class ServiceController extends Controller
{
    public function __construct(protected ServiceService $services) {}

    public function moderate(ModerateServiceRequest $request, Service $service): ServiceResource
    {
        $this->authorize('services.moderate');

        $service = $this->services->moderate(
            $service,
            $request->validated('action'),
            $request->validated('featured_days'),
        );

        return new ServiceResource($service);
    }
}
