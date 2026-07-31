<?php

namespace App\Http\Controllers\Api\V1\Payment;

use App\Domain\Payment\Models\PaymentGateway;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Inbound provider callbacks. Per docs/architecture/04-api-contract.md §3:
     * verify signature -> enqueue a job -> return 200 immediately, so a slow DB
     * never causes the provider to retry/duplicate.
     *
     * Stripe/PayPal are not configured with real credentials in this environment
     * (docs/architecture/00-overview.md — avoid paid services in development), so
     * there is no real signature to verify yet. This intentionally returns 501
     * rather than faking a 200 for a webhook nothing is actually sending.
     */
    public function handle(Request $request, string $gateway): JsonResponse
    {
        $config = PaymentGateway::where('driver', $gateway)->first();

        if (! $config || ! $config->is_active) {
            return response()->json(['message' => "Unknown or inactive gateway: {$gateway}"], 404);
        }

        Log::info("Webhook received for {$gateway}, but no credentials are configured to verify it.", [
            'gateway' => $gateway,
        ]);

        return response()->json(['message' => "The {$gateway} gateway has no webhook handling configured yet."], 501);
    }
}
