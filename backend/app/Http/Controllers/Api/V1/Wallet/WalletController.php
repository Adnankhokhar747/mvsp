<?php

namespace App\Http\Controllers\Api\V1\Wallet;

use App\Domain\Vendor\Models\VendorUser;
use App\Http\Controllers\Controller;
use App\Http\Resources\Wallet\VendorWalletResource;
use App\Http\Resources\Wallet\WalletLedgerEntryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WalletController extends Controller
{
    public function show(Request $request): VendorWalletResource
    {
        $vendor = $this->resolveVendor($request);

        return new VendorWalletResource($vendor->wallet);
    }

    public function ledger(Request $request): AnonymousResourceCollection
    {
        $vendor = $this->resolveVendor($request);

        $entries = $vendor->wallet->ledgerEntries()->latest()->paginate($request->integer('per_page', 20));

        return WalletLedgerEntryResource::collection($entries);
    }

    protected function resolveVendor(Request $request)
    {
        $vendorUser = VendorUser::where('user_id', $request->user()->id)
            ->whereIn('role', ['owner', 'manager'])
            ->first();

        abort_unless($vendorUser, 403, 'You must be a vendor owner or manager to view wallet information.');

        return $vendorUser->vendor;
    }
}
