<?php

namespace App\Domain\Payment\Adapters;

use App\Domain\Payment\Contracts\PaymentGatewayAdapter;
use App\Domain\Payment\Exceptions\PaymentException;
use App\Domain\Payment\Models\Transaction;

/**
 * Structurally complete adapter for Stripe — wired to the same contract as every
 * other gateway — but left inactive with no API keys configured (see
 * docs/architecture/00-overview.md: avoid paid services during development).
 * Enabling it for real is: add STRIPE_SECRET/STRIPE_WEBHOOK_SECRET config, swap
 * the body of initiate()/refund() for real stripe-php SDK calls, flip
 * payment_gateways.is_active to true.
 */
class StripeAdapter implements PaymentGatewayAdapter
{
    public function __construct(protected array $config = []) {}

    public function initiate(Transaction $transaction): array
    {
        if (empty($this->config['secret_key'])) {
            throw PaymentException::gatewayNotConfigured('stripe');
        }

        // Real implementation: create a Stripe PaymentIntent for
        // $transaction->amount ($transaction->currency_code) and return its
        // client_secret for the frontend to confirm with Stripe.js/Elements.
        throw PaymentException::gatewayNotConfigured('stripe');
    }

    public function requiresManualConfirmation(): bool
    {
        return false;
    }

    public function refund(Transaction $transaction, int $amount): array
    {
        throw PaymentException::gatewayNotConfigured('stripe');
    }
}
