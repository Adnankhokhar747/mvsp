<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Booking\Exceptions\BookingException;
use App\Domain\Booking\Models\Booking;
use App\Domain\Booking\Services\BookingService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\SubmitQuoteRequest;
use App\Http\Requests\Booking\VendorBookingStatusRequest;
use App\Http\Resources\Booking\BookingQuoteResource;
use App\Http\Resources\Booking\BookingResource;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function __construct(protected BookingService $bookings) {}

    public function quote(SubmitQuoteRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        try {
            $quote = $this->bookings->submitQuote($booking, $request->validated());
        } catch (BookingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new BookingQuoteResource($quote))->response()->setStatusCode(201);
    }

    public function status(VendorBookingStatusRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        try {
            $booking = $this->bookings->transitionStatus($booking, $request->user(), $request->validated('action'));
        } catch (BookingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new BookingResource($booking))->response();
    }
}
