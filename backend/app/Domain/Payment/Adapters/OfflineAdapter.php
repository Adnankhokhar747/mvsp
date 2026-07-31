<?php

namespace App\Domain\Payment\Adapters;

use App\Domain\Payment\Contracts\PaymentGatewayAdapter;
use App\Domain\Payment\Models\Transaction;

class OfflineAdapter implements PaymentGatewayAdapter
{
    public function initiate(Transaction $transaction): array
    {
        return [
            'instructions' => 'Payment will be collected offline and confirmed manually by the vendor or admin.',
        ];
    }

    public function requiresManualConfirmation(): bool
    {
        return true;
    }

    public function refund(Transaction $transaction, int $amount): array
    {
        return ['note' => 'Offline refund recorded manually.'];
    }
}
