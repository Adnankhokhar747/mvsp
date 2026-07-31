<?php

namespace App\Domain\Payment\Adapters;

use App\Domain\Payment\Contracts\PaymentGatewayAdapter;
use App\Domain\Payment\Models\Transaction;

class CashAdapter implements PaymentGatewayAdapter
{
    public function initiate(Transaction $transaction): array
    {
        return [
            'instructions' => 'Pay in cash directly to the vendor when the service is completed.',
        ];
    }

    public function requiresManualConfirmation(): bool
    {
        return true;
    }

    public function refund(Transaction $transaction, int $amount): array
    {
        return ['note' => 'Cash refund handled in person by the vendor; recorded here for the ledger only.'];
    }
}
