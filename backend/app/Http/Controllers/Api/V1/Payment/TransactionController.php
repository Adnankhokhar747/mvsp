<?php

namespace App\Http\Controllers\Api\V1\Payment;

use App\Domain\Payment\Models\Transaction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Payment\TransactionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransactionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $query = Transaction::query()->with('paymentGateway');

        if (! $user->hasAnyRole(['super-admin', 'finance-manager'])) {
            $ownerOrManagerVendorIds = $user->vendorMemberships()
                ->whereIn('role', ['owner', 'manager'])
                ->pluck('vendor_id');

            $query->where(function ($q) use ($user, $ownerOrManagerVendorIds) {
                $q->where('user_id', $user->id)->orWhereIn('vendor_id', $ownerOrManagerVendorIds);
            });
        }

        $transactions = $query->latest()->paginate($request->integer('per_page', 20));

        return TransactionResource::collection($transactions);
    }

    public function show(Transaction $transaction): TransactionResource
    {
        $this->authorize('view', $transaction);

        return new TransactionResource($transaction->load(['paymentGateway', 'refunds']));
    }
}
