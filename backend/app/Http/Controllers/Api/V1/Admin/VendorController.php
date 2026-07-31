<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Vendor\Models\Vendor;
use App\Domain\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectVendorRequest;
use App\Http\Requests\Admin\SuspendVendorRequest;
use App\Http\Resources\Vendor\VendorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\QueryBuilder;

class VendorController extends Controller
{
    public function __construct(protected VendorService $vendors) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('vendors.view-all');

        $vendors = QueryBuilder::for(Vendor::class)
            ->allowedFilters(['status', 'business_name'])
            ->allowedSorts(['created_at', 'business_name'])
            ->defaultSort('-created_at')
            ->paginate($request->integer('per_page', 20));

        return VendorResource::collection($vendors);
    }

    public function approve(Request $request, Vendor $vendor): VendorResource
    {
        $this->authorize('vendors.approve');

        return new VendorResource($this->vendors->approve($vendor, $request->user()));
    }

    public function reject(RejectVendorRequest $request, Vendor $vendor): VendorResource
    {
        $this->authorize('vendors.reject');

        return new VendorResource($this->vendors->reject($vendor, $request->validated('reason')));
    }

    public function suspend(SuspendVendorRequest $request, Vendor $vendor): VendorResource
    {
        $this->authorize('vendors.suspend');

        return new VendorResource($this->vendors->suspend($vendor, $request->validated('reason')));
    }
}
