<?php

namespace App\Http\Controllers\Api\V1\Wallet;

use App\Domain\Vendor\Models\VendorUser;
use App\Domain\Wallet\Models\VendorBankAccount;
use App\Http\Controllers\Controller;
use App\Http\Requests\Wallet\StoreBankAccountRequest;
use App\Http\Resources\Wallet\VendorBankAccountResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class BankAccountController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $vendor = $this->resolveVendor($request);

        return VendorBankAccountResource::collection($vendor->bankAccounts()->latest()->get());
    }

    public function store(StoreBankAccountRequest $request): JsonResponse
    {
        $vendor = $this->resolveVendor($request);
        $data = $request->validated();

        $account = DB::transaction(function () use ($vendor, $data) {
            $isFirst = $vendor->bankAccounts()->count() === 0;
            $makeDefault = ($data['is_default'] ?? false) || $isFirst;

            if ($makeDefault) {
                $vendor->bankAccounts()->update(['is_default' => false]);
            }

            return $vendor->bankAccounts()->create([...$data, 'is_default' => $makeDefault]);
        });

        return (new VendorBankAccountResource($account))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, VendorBankAccount $bankAccount): JsonResponse
    {
        $vendor = $this->resolveVendor($request);

        abort_unless($bankAccount->vendor_id === $vendor->id, 404);

        $bankAccount->delete();

        return response()->json(['message' => 'Bank account removed.']);
    }

    protected function resolveVendor(Request $request)
    {
        $vendorUser = VendorUser::where('user_id', $request->user()->id)
            ->whereIn('role', ['owner', 'manager'])
            ->first();

        abort_unless($vendorUser, 403, 'You must be a vendor owner or manager to manage bank accounts.');

        return $vendorUser->vendor;
    }
}
