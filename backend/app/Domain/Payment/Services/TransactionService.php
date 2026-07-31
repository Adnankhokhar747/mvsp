<?php

namespace App\Domain\Payment\Services;

use App\Domain\Booking\Models\Booking;
use App\Domain\Booking\Services\BookingService;
use App\Domain\Identity\Models\User;
use App\Domain\Payment\Exceptions\PaymentException;
use App\Domain\Payment\Managers\PaymentGatewayManager;
use App\Domain\Payment\Models\Invoice;
use App\Domain\Payment\Models\PaymentGateway;
use App\Domain\Payment\Models\Refund;
use App\Domain\Payment\Models\Transaction;
use App\Domain\Wallet\Services\CommissionResolver;
use App\Domain\Wallet\Services\WalletService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionService
{
    public function __construct(
        protected PaymentGatewayManager $gateways,
        protected CommissionResolver $commission,
        protected WalletService $wallet,
        protected BookingService $bookings,
    ) {}

    /**
     * @throws PaymentException
     */
    public function initiatePayment(Booking $booking, User $payer, string $driver, ?string $idempotencyKey): Transaction
    {
        if ($idempotencyKey) {
            $existing = Transaction::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
        }

        if ($booking->price === null) {
            throw PaymentException::bookingNotPayable();
        }

        $gateway = PaymentGateway::where('driver', $driver)->where('is_active', true)->first();
        if (! $gateway) {
            throw PaymentException::gatewayNotActive($driver);
        }

        return DB::transaction(function () use ($booking, $payer, $driver, $idempotencyKey, $gateway) {
            $transaction = Transaction::create([
                'transaction_number' => 'TXN-'.now()->format('ymd').'-'.Str::upper(Str::random(8)),
                'payable_type' => Booking::class,
                'payable_id' => $booking->id,
                'user_id' => $payer->id,
                'vendor_id' => $booking->vendor_id,
                'payment_gateway_id' => $gateway->id,
                'type' => 'payment',
                'amount' => $booking->price,
                'currency_code' => $booking->currency_code,
                'status' => 'pending',
                'idempotency_key' => $idempotencyKey,
            ]);

            $adapter = $this->gateways->driver($driver);
            $result = $adapter->initiate($transaction);
            $transaction->update(['meta' => $result]);

            return $transaction->fresh();
        });
    }

    public function confirmManualPayment(Transaction $transaction, User $actor): Transaction
    {
        return DB::transaction(function () use ($transaction, $actor) {
            $booking = $transaction->payable;
            $commissionAmount = $this->commission->commissionFor($transaction->vendor, $booking?->service?->category_id, $transaction->amount);
            $netAmount = $transaction->amount - $commissionAmount;

            $transaction->update([
                'status' => 'success',
                'meta' => array_merge($transaction->meta ?? [], [
                    'commission_amount' => $commissionAmount,
                    'net_amount' => $netAmount,
                    'confirmed_by' => $actor->id,
                ]),
            ]);

            $this->wallet->credit($transaction->vendor, $netAmount, $transaction, 'Payment received for booking '.($booking?->booking_number ?? $transaction->transaction_number));

            if ($booking) {
                $this->generateInvoice($booking, $transaction);
            }

            if ($booking && $booking->status === 'pending') {
                $this->bookings->transitionStatus($booking, $actor, 'confirm');
            }

            return $transaction->fresh();
        });
    }

    /**
     * @throws PaymentException
     */
    public function refund(Transaction $transaction, int $amount, ?string $reason, User $actor): Refund
    {
        if ($transaction->status !== 'success') {
            throw PaymentException::transactionNotSuccessful();
        }

        $alreadyRefunded = $transaction->refunds()->sum('amount');
        if ($alreadyRefunded + $amount > $transaction->amount) {
            throw PaymentException::refundExceedsAmount();
        }

        return DB::transaction(function () use ($transaction, $amount, $reason, $actor, $alreadyRefunded) {
            $adapter = $this->gateways->driver($transaction->paymentGateway->driver);
            $adapter->refund($transaction, $amount);

            $refund = Refund::create([
                'transaction_id' => $transaction->id,
                'amount' => $amount,
                'reason' => $reason,
                'status' => 'success',
                'processed_by' => $actor->id,
                'processed_at' => now(),
            ]);

            $commissionAmount = $transaction->meta['commission_amount'] ?? 0;
            $netRefund = $amount - (int) round($amount * $commissionAmount / max($transaction->amount, 1));
            $this->wallet->debit($transaction->vendor, $netRefund, $refund, 'Refund issued for transaction '.$transaction->transaction_number);

            if ($alreadyRefunded + $amount >= $transaction->amount) {
                $transaction->update(['status' => 'refunded']);

                $booking = $transaction->payable;
                if ($booking instanceof Booking) {
                    $booking->update(['status' => 'refunded']);
                }
            }

            return $refund;
        });
    }

    public function generateInvoice(Booking $booking, Transaction $transaction): Invoice
    {
        return Invoice::create([
            'invoice_number' => 'INV-'.now()->format('ymd').'-'.Str::upper(Str::random(8)),
            'invoiceable_type' => Booking::class,
            'invoiceable_id' => $booking->id,
            'billed_to_user_id' => $transaction->user_id,
            'amount' => $transaction->amount,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total' => $transaction->amount,
            'currency_code' => $transaction->currency_code,
            'status' => 'paid',
            'issued_at' => now(),
        ]);
    }
}
