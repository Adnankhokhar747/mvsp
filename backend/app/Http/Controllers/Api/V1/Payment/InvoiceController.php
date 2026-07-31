<?php

namespace App\Http\Controllers\Api\V1\Payment;

use App\Domain\Booking\Models\Booking;
use App\Domain\Payment\Models\Invoice;
use App\Http\Controllers\Controller;
use App\Http\Resources\Payment\InvoiceResource;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function show(Request $request, Invoice $invoice): InvoiceResource
    {
        $user = $request->user();
        $canView = $invoice->billed_to_user_id === $user->id
            || $user->hasAnyRole(['super-admin', 'finance-manager'])
            || ($invoice->invoiceable instanceof Booking && $invoice->invoiceable->vendor->vendorUsers()->where('user_id', $user->id)->exists());

        abort_unless($canView, 403);

        return new InvoiceResource($invoice);
    }
}
