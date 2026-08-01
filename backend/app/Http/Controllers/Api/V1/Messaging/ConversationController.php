<?php

namespace App\Http\Controllers\Api\V1\Messaging;

use App\Domain\Booking\Models\Booking;
use App\Domain\Messaging\Exceptions\MessagingException;
use App\Domain\Messaging\Models\Conversation;
use App\Domain\Messaging\Services\MessagingService;
use App\Domain\Vendor\Models\Vendor;
use App\Http\Controllers\Controller;
use App\Http\Requests\Messaging\StartConversationRequest;
use App\Http\Resources\Messaging\ConversationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ConversationController extends Controller
{
    public function __construct(protected MessagingService $messaging) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $ownerOrManagerVendorIds = $user->vendorMemberships()
            ->whereIn('role', ['owner', 'manager'])
            ->pluck('vendor_id');

        $conversations = Conversation::where(function ($q) use ($user, $ownerOrManagerVendorIds) {
            $q->where('customer_id', $user->id)->orWhereIn('vendor_id', $ownerOrManagerVendorIds);
        })
            ->with(['vendor', 'customer'])
            ->latest('last_message_at')
            ->paginate($request->integer('per_page', 20));

        return ConversationResource::collection($conversations);
    }

    public function show(Conversation $conversation): ConversationResource
    {
        $this->authorize('view', $conversation);

        return new ConversationResource($conversation->load(['vendor', 'customer']));
    }

    public function store(StartConversationRequest $request): JsonResponse
    {
        $vendor = Vendor::findOrFail($request->validated('vendor_id'));
        $booking = $request->validated('booking_id') ? Booking::find($request->validated('booking_id')) : null;

        try {
            $conversation = $this->messaging->startOrGetConversation($request->user(), $vendor, $booking);
            $this->messaging->sendMessage($conversation, $request->user(), $request->validated('message'));
        } catch (MessagingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new ConversationResource($conversation->fresh()->load(['vendor', 'customer'])))->response()->setStatusCode(201);
    }
}
