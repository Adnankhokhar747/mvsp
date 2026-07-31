<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Payment\Models\PaymentGateway;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\UpdatePaymentGatewayRequest;
use App\Http\Resources\Payment\PaymentGatewayResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PaymentGatewayController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('settings.manage');

        return PaymentGatewayResource::collection(PaymentGateway::orderBy('sort_order')->get());
    }

    public function update(UpdatePaymentGatewayRequest $request, PaymentGateway $paymentGateway): PaymentGatewayResource
    {
        $this->authorize('settings.manage');

        $data = $request->validated();
        if (array_key_exists('config', $data)) {
            $data['config'] = json_encode($data['config']);
        }

        DB::transaction(function () use ($data, $paymentGateway) {
            // Only one gateway may be the default at a time — PaymentGatewayManager
            // resolves the default by an unordered `where('is_default', true)` lookup,
            // so leaving more than one row true makes that resolution non-deterministic.
            if (($data['is_active'] ?? $paymentGateway->is_active) === false) {
                $data['is_default'] = false;
            }

            if (! empty($data['is_default'])) {
                PaymentGateway::where('id', '!=', $paymentGateway->id)->update(['is_default' => false]);
            }

            $paymentGateway->update($data);
        });

        return new PaymentGatewayResource($paymentGateway->fresh());
    }
}
