<?php

namespace App\Http\Controllers\Api\V1\Wallet;

use App\Domain\Vendor\Models\VendorUser;
use App\Domain\Wallet\Exceptions\WalletException;
use App\Domain\Wallet\Services\PayoutService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Wallet\RequestPayoutRequest;
use App\Http\Resources\Wallet\PayoutRequestResource;
use Illuminate\Http\JsonResponse;

class PayoutController extends Controller
{
    public function __construct(protected PayoutService $payouts) {}

    public function store(RequestPayoutRequest $request): JsonResponse
    {
        $vendorUser = VendorUser::where('user_id', $request->user()->id)
            ->where('role', 'owner')
            ->first();

        abort_unless($vendorUser, 403, 'Only the vendor owner can request a payout.');

        try {
            $payout = $this->payouts->request(
                $vendorUser->vendor,
                $request->validated('amount'),
                $request->validated('vendor_bank_account_id'),
            );
        } catch (WalletException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new PayoutRequestResource($payout))->response()->setStatusCode(201);
    }
}
