<?php

namespace App\Domain\Messaging\Services;

use App\Domain\Booking\Models\Booking;
use App\Domain\Identity\Models\User;
use App\Domain\Messaging\Exceptions\MessagingException;
use App\Domain\Messaging\Models\Conversation;
use App\Domain\Messaging\Models\Message;
use App\Domain\Subscription\Services\FeatureGateService;
use App\Domain\Vendor\Models\Vendor;
use Illuminate\Support\Facades\DB;

class MessagingService
{
    public function __construct(protected FeatureGateService $featureGate) {}

    /**
     * @throws MessagingException
     */
    public function startOrGetConversation(User $customer, Vendor $vendor, ?Booking $booking = null): Conversation
    {
        if (! $this->featureGate->isEnabled($vendor, 'chat_enabled')) {
            throw MessagingException::chatNotAvailable();
        }

        return Conversation::firstOrCreate([
            'vendor_id' => $vendor->id,
            'customer_id' => $customer->id,
            'booking_id' => $booking?->id,
        ]);
    }

    public function sendMessage(Conversation $conversation, User $sender, ?string $body, ?string $attachmentPath = null): Message
    {
        return DB::transaction(function () use ($conversation, $sender, $body, $attachmentPath) {
            $message = $conversation->messages()->create([
                'sender_id' => $sender->id,
                'body' => $body,
                'attachment_path' => $attachmentPath,
            ]);

            $conversation->update(['last_message_at' => now()]);

            return $message;
        });
    }

    public function markRead(Conversation $conversation, User $reader): void
    {
        $conversation->messages()
            ->where('sender_id', '!=', $reader->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
