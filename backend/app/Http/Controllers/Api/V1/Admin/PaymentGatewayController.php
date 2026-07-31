<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Payment\Models\PaymentGateway;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\UpdatePaymentGatewayRequest;
use App\Http\Resources\Payment\PaymentGatewayResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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

        $paymentGateway->update($data);

        return new PaymentGatewayResource($paymentGateway->fresh());
    }
}
