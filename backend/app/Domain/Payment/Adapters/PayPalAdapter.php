<?php

namespace App\Domain\Payment\Adapters;

use App\Domain\Payment\Contracts\PaymentGatewayAdapter;
use App\Domain\Payment\Exceptions\PaymentException;
use App\Domain\Payment\Models\Transaction;

/**
 * Same status as StripeAdapter — structurally complete, inactive, no credentials.
 * Real implementation: create a PayPal Order via the PayPal Orders v2 API and
 * return its approval redirect URL.
 */
class PayPalAdapter implements PaymentGatewayAdapter
{
    public function __construct(protected array $config = []) {}

    public function initiate(Transaction $transaction): array
    {
        if (empty($this->config['client_id'])) {
            throw PaymentException::gatewayNotConfigured('paypal');
        }

        throw PaymentException::gatewayNotConfigured('paypal');
    }

    public function requiresManualConfirmation(): bool
    {
        return false;
    }

    public function refund(Transaction $transaction, int $amount): array
    {
        throw PaymentException::gatewayNotConfigured('paypal');
    }
}
