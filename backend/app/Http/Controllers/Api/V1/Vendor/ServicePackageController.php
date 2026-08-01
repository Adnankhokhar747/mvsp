<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Catalog\Models\Service;
use App\Domain\Catalog\Models\ServicePackage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreServicePackageRequest;
use App\Http\Requests\Catalog\UpdateServicePackageRequest;
use App\Http\Resources\Catalog\ServicePackageResource;
use Illuminate\Http\JsonResponse;

class ServicePackageController extends Controller
{
    public function store(StoreServicePackageRequest $request, Service $service): JsonResponse
    {
        $this->authorize('update', $service);

        $package = $service->packages()->create($request->validated());

        return (new ServicePackageResource($package))->response()->setStatusCode(201);
    }

    public function update(UpdateServicePackageRequest $request, Service $service, ServicePackage $package): ServicePackageResource
    {
        $this->authorize('update', $service);

        abort_unless($package->service_id === $service->id, 404);

        $package->update($request->validated());

        return new ServicePackageResource($package->fresh());
    }

    public function destroy(Service $service, ServicePackage $package): JsonResponse
    {
        $this->authorize('update', $service);

        abort_unless($package->service_id === $service->id, 404);

        $package->delete();

        return response()->json(['message' => 'Package deleted.']);
    }
}
