<?php

namespace App\Http\Controllers\Api\V1\Location;

use App\Domain\Location\Models\Address;
use App\Domain\Location\Services\AddressService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Location\StoreAddressRequest;
use App\Http\Requests\Location\UpdateAddressRequest;
use App\Http\Resources\Location\AddressResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AddressController extends Controller
{
    public function __construct(protected AddressService $addresses) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return AddressResource::collection($request->user()->addresses()->get());
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        $address = $this->addresses->create($request->user(), $request->validated());

        return (new AddressResource($address))->response()->setStatusCode(201);
    }

    public function update(UpdateAddressRequest $request, Address $address): AddressResource
    {
        $this->authorizeOwnership($request, $address);

        return new AddressResource($this->addresses->update($address, $request->validated()));
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorizeOwnership($request, $address);

        $this->addresses->delete($address);

        return response()->json(['message' => 'Address deleted.']);
    }

    protected function authorizeOwnership(Request $request, Address $address): void
    {
        $user = $request->user();
        abort_unless(
            $address->addressable_type === $user->getMorphClass() && $address->addressable_id === $user->id,
            403
        );
    }
}
