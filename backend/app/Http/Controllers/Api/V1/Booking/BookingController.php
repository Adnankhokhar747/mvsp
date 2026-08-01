<?php

namespace App\Http\Controllers\Api\V1\Booking;

use App\Domain\Booking\Exceptions\BookingException;
use App\Domain\Booking\Models\Booking;
use App\Domain\Booking\Services\BookingService;
use App\Domain\Catalog\Models\Service;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CancelBookingRequest;
use App\Http\Requests\Booking\CreateBookingRequest;
use App\Http\Requests\Booking\RescheduleBookingRequest;
use App\Http\Resources\Booking\BookingResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookingController extends Controller
{
    public function __construct(protected BookingService $bookings) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Booking::query()->with(['service', 'quotes', 'customer', 'vendor', 'review', 'address']);

        // A user's roles aren't mutually exclusive — the same account can be a
        // customer AND a vendor's staff member — so this is a union of every
        // relationship the user has to a booking, not an exclusive if/elseif.
        if (! $user->hasAnyRole(['super-admin', 'support-agent'])) {
            $ownerOrManagerVendorIds = $user->vendorMemberships()
                ->whereIn('role', ['owner', 'manager'])
                ->pluck('vendor_id');

            $query->where(function ($q) use ($user, $ownerOrManagerVendorIds) {
                $q->where('customer_id', $user->id)
                    ->orWhere('staff_id', $user->id)
                    ->orWhereIn('vendor_id', $ownerOrManagerVendorIds);
            });
        }

        if ($status = $request->input('filter.status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('filter.booking_number')) {
            $query->where('booking_number', 'like', "%{$search}%");
        }

        $bookings = $query->latest('created_at')->paginate($request->integer('per_page', 20));

        return BookingResource::collection($bookings);
    }

    public function store(CreateBookingRequest $request): JsonResponse
    {
        $service = Service::findOrFail($request->validated('service_id'));

        try {
            $booking = $this->bookings->create($request->user(), $service, $request->validated());
        } catch (BookingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new BookingResource($booking))->response()->setStatusCode(201);
    }

    public function show(Booking $booking): BookingResource
    {
        $this->authorize('view', $booking);

        return new BookingResource($booking->load(['service', 'quotes', 'statusHistory', 'customer', 'vendor', 'review', 'address']));
    }

    public function reschedule(RescheduleBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        try {
            $new = $this->bookings->reschedule($booking, $request->user(), $request->validated('scheduled_at'));
        } catch (BookingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new BookingResource($new))->response()->setStatusCode(201);
    }

    public function cancel(CancelBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);

        try {
            $result = $this->bookings->cancel($booking, $request->user(), $request->validated('reason'));
        } catch (BookingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new BookingResource($result['booking']))
            ->additional(['refund_percentage' => $result['refund_percentage']])
            ->response();
    }

    public function acceptQuote(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        $quote = $booking->quotes()->where('status', 'pending')->latest()->firstOrFail();

        try {
            $booking = $this->bookings->acceptQuote($quote, $request->user());
        } catch (BookingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new BookingResource($booking))->response();
    }

    public function rejectQuote(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        $quote = $booking->quotes()->where('status', 'pending')->latest()->firstOrFail();

        try {
            $booking = $this->bookings->rejectQuote($quote, $request->user());
        } catch (BookingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new BookingResource($booking))->response();
    }
}
