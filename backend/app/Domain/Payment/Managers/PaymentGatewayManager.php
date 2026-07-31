<?php

namespace App\Domain\Payment\Managers;

use App\Domain\Payment\Adapters\BankTransferAdapter;
use App\Domain\Payment\Adapters\CashAdapter;
use App\Domain\Payment\Adapters\OfflineAdapter;
use App\Domain\Payment\Adapters\PayPalAdapter;
use App\Domain\Payment\Adapters\StripeAdapter;
use App\Domain\Payment\Models\PaymentGateway;
use Illuminate\Support\Manager;

class PaymentGatewayManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return PaymentGateway::where('is_default', true)->value('driver') ?? 'cash';
    }

    protected function createCashDriver(): CashAdapter
    {
        return new CashAdapter;
    }

    protected function createBankTransferDriver(): BankTransferAdapter
    {
        return new BankTransferAdapter;
    }

    protected function createOfflineDriver(): OfflineAdapter
    {
        return new OfflineAdapter;
    }

    protected function createStripeDriver(): StripeAdapter
    {
        return new StripeAdapter($this->configFor('stripe'));
    }

    protected function createPaypalDriver(): PayPalAdapter
    {
        return new PayPalAdapter($this->configFor('paypal'));
    }

    protected function configFor(string $driver): array
    {
        $raw = PaymentGateway::where('driver', $driver)->value('config');

        return $raw ? (json_decode($raw, true) ?? []) : [];
    }
}
