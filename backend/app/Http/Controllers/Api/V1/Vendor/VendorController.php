<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Vendor\Exceptions\VendorException;
use App\Domain\Vendor\Models\Vendor;
use App\Domain\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\CreateVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Http\Resources\Vendor\VendorResource;
use Illuminate\Http\JsonResponse;

class VendorController extends Controller
{
    public function __construct(protected VendorService $vendors) {}

    public function store(CreateVendorRequest $request): JsonResponse
    {
        try {
            $vendor = $this->vendors->createProfile($request->user(), $request->validated());
        } catch (VendorException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new VendorResource($vendor))
            ->additional(['message' => 'Vendor profile created. Submit your KYC documents to proceed with approval.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Vendor $vendor): VendorResource
    {
        return new VendorResource($vendor);
    }

    public function update(UpdateVendorRequest $request, Vendor $vendor): VendorResource
    {
        $this->authorize('update', $vendor);

        return new VendorResource($this->vendors->updateProfile($vendor, $request->validated()));
    }
}
