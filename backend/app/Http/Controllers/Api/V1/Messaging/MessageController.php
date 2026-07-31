<?php

namespace App\Http\Controllers\Api\V1\Messaging;

use App\Domain\Messaging\Models\Conversation;
use App\Domain\Messaging\Services\MessagingService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Messaging\SendMessageRequest;
use App\Http\Resources\Messaging\MessageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MessageController extends Controller
{
    public function __construct(protected MessagingService $messaging) {}

    public function index(Request $request, Conversation $conversation): AnonymousResourceCollection
    {
        $this->authorize('view', $conversation);

        $this->messaging->markRead($conversation, $request->user());

        $messages = $conversation->messages()->oldest()->paginate($request->integer('per_page', 50));

        return MessageResource::collection($messages);
    }

    public function store(SendMessageRequest $request, Conversation $conversation): MessageResource
    {
        $this->authorize('view', $conversation);

        $message = $this->messaging->sendMessage($conversation, $request->user(), $request->validated('body'));

        return new MessageResource($message);
    }
}
