<?php

namespace App\Domain\Payment\Contracts;

use App\Domain\Payment\Models\Transaction;

/**
 * Every payment provider (cash, bank transfer, Stripe, PayPal, ...) implements this
 * same contract so the rest of the app never branches on gateway name
 * (docs/architecture/00-overview.md decision #5).
 */
interface PaymentGatewayAdapter
{
    /**
     * Start a payment. Returns client-facing instructions/data — for manual
     * gateways that's static instructions; for hosted gateways it's a redirect
     * URL or client secret the frontend needs to complete the charge.
     */
    public function initiate(Transaction $transaction): array;

    /**
     * True for gateways where completion is confirmed by a human (vendor/admin)
     * rather than an automatic provider callback.
     */
    public function requiresManualConfirmation(): bool;

    public function refund(Transaction $transaction, int $amount): array;
}
