<?php

namespace App\Http\Controllers\Api\V1\Payment;

use App\Domain\Booking\Models\Booking;
use App\Domain\Payment\Exceptions\PaymentException;
use App\Domain\Payment\Models\Transaction;
use App\Domain\Payment\Services\TransactionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\InitiatePaymentRequest;
use App\Http\Requests\Payment\RefundRequest;
use App\Http\Resources\Payment\RefundResource;
use App\Http\Resources\Payment\TransactionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(protected TransactionService $transactions) {}

    public function pay(InitiatePaymentRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        try {
            $transaction = $this->transactions->initiatePayment(
                $booking,
                $request->user(),
                $request->validated('driver'),
                $request->header('Idempotency-Key'),
            );
        } catch (PaymentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new TransactionResource($transaction))->response()->setStatusCode(201);
    }

    public function confirm(Request $request, Transaction $transaction): JsonResponse
    {
        $this->authorize('confirm', $transaction);

        $transaction = $this->transactions->confirmManualPayment($transaction, $request->user());

        return (new TransactionResource($transaction))->response();
    }

    public function refund(RefundRequest $request, Transaction $transaction): JsonResponse
    {
        $this->authorize('refunds.issue');

        try {
            $refund = $this->transactions->refund(
                $transaction,
                $request->validated('amount'),
                $request->validated('reason'),
                $request->user(),
            );
        } catch (PaymentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new RefundResource($refund))->response()->setStatusCode(201);
    }
}
