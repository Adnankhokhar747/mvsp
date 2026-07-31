<?php

namespace App\Domain\Payment\Adapters;

use App\Domain\Payment\Contracts\PaymentGatewayAdapter;
use App\Domain\Payment\Models\Transaction;

class BankTransferAdapter implements PaymentGatewayAdapter
{
    public function initiate(Transaction $transaction): array
    {
        return [
            'instructions' => 'Transfer the amount to the platform\'s bank account and upload proof of payment. An admin will confirm receipt.',
            'reference' => $transaction->transaction_number,
        ];
    }

    public function requiresManualConfirmation(): bool
    {
        return true;
    }

    public function refund(Transaction $transaction, int $amount): array
    {
        return ['note' => 'Bank transfer refund must be processed manually by finance staff.'];
    }
}
