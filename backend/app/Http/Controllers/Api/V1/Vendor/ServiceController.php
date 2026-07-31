<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Catalog\Exceptions\ServiceLimitException;
use App\Domain\Catalog\Models\Service;
use App\Domain\Catalog\Services\ServiceService;
use App\Domain\Vendor\Models\VendorUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreServiceRequest;
use App\Http\Requests\Catalog\UpdateServiceRequest;
use App\Http\Resources\Catalog\ServiceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function __construct(protected ServiceService $services) {}

    public function index(Request $request): JsonResponse|AnonymousResourceCollection
    {
        $vendorUser = VendorUser::where('user_id', $request->user()->id)
            ->whereIn('role', ['owner', 'manager'])
            ->first();

        if (! $vendorUser) {
            return response()->json(['message' => 'You must be a vendor owner or manager to view services.'], 403);
        }

        $query = Service::query()->with('category')->where('vendor_id', $vendorUser->vendor_id);

        if ($status = $request->input('filter.status')) {
            $query->where('status', $status);
        }

        $services = $query->latest('created_at')->paginate($request->integer('per_page', 20));

        return ServiceResource::collection($services);
    }

    public function show(Service $service): ServiceResource
    {
        $this->authorize('view', $service);

        return new ServiceResource($service->load(['category', 'packages', 'availability']));
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $vendorUser = VendorUser::where('user_id', $request->user()->id)
            ->whereIn('role', ['owner', 'manager'])
            ->first();

        if (! $vendorUser) {
            return response()->json(['message' => 'You must be a vendor owner or manager to create services.'], 403);
        }

        try {
            $service = $this->services->create($vendorUser->vendor, $request->validated());
        } catch (ServiceLimitException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new ServiceResource($service))->response()->setStatusCode(201);
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $this->authorize('update', $service);

        try {
            $service = $this->services->update($service, $request->validated());
        } catch (ServiceLimitException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new ServiceResource($service))->response();
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);

        $this->services->delete($service);

        return response()->json(['message' => 'Service deleted.']);
    }
}
