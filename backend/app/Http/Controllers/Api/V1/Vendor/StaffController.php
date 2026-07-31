<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Vendor\Exceptions\VendorException;
use App\Domain\Vendor\Models\Vendor;
use App\Domain\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\InviteStaffRequest;
use App\Http\Resources\Vendor\VendorStaffResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StaffController extends Controller
{
    public function __construct(protected VendorService $vendors) {}

    public function index(Vendor $vendor): AnonymousResourceCollection
    {
        $this->authorize('viewStaff', $vendor);

        return VendorStaffResource::collection($vendor->vendorUsers()->with('user')->get());
    }

    public function invite(InviteStaffRequest $request, Vendor $vendor): JsonResponse
    {
        $this->authorize('manageStaff', $vendor);

        try {
            $vendorUser = $this->vendors->inviteStaff(
                $vendor,
                $request->user(),
                $request->validated('email'),
                $request->validated('role'),
            );
        } catch (VendorException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new VendorStaffResource($vendorUser->load('user')))
            ->additional(['message' => 'Staff member added.'])
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Vendor $vendor, int $user): JsonResponse
    {
        $this->authorize('manageStaff', $vendor);

        try {
            $this->vendors->removeStaff($vendor, $user);
        } catch (VendorException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Staff member removed.']);
    }
}
