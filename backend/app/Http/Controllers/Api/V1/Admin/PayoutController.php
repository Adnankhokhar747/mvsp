<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Wallet\Models\PayoutRequest;
use App\Domain\Wallet\Services\PayoutService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Wallet\RejectPayoutRequest;
use App\Http\Resources\Wallet\PayoutRequestResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PayoutController extends Controller
{
    public function __construct(protected PayoutService $payouts) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('payouts.approve');

        $query = PayoutRequest::query()->with(['vendor', 'bankAccount', 'wallet', 'processedBy']);

        if ($status = $request->input('filter.status')) {
            $query->where('status', $status);
        }

        $payouts = $query->latest('requested_at')->paginate($request->integer('per_page', 20));

        return PayoutRequestResource::collection($payouts);
    }

    public function approve(Request $request, PayoutRequest $payout): PayoutRequestResource
    {
        $this->authorize('payouts.approve');

        return new PayoutRequestResource($this->payouts->approve($payout, $request->user()));
    }

    public function reject(RejectPayoutRequest $request, PayoutRequest $payout): PayoutRequestResource
    {
        $this->authorize('payouts.approve');

        return new PayoutRequestResource($this->payouts->reject($payout, $request->user(), $request->validated('reason')));
    }
}
