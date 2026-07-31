<?php

namespace App\Domain\Review\Services;

use App\Domain\Booking\Models\Booking;
use App\Domain\Catalog\Models\Service;
use App\Domain\Review\Exceptions\ReviewException;
use App\Domain\Review\Models\Review;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    /**
     * @throws ReviewException
     */
    public function create(Booking $booking, array $data): Review
    {
        if ($booking->status !== 'completed') {
            throw ReviewException::bookingNotCompleted();
        }

        if ($booking->review()->exists()) {
            throw ReviewException::alreadyReviewed();
        }

        return DB::transaction(function () use ($booking, $data) {
            $review = Review::create([
                'booking_id' => $booking->id,
                'customer_id' => $booking->customer_id,
                'vendor_id' => $booking->vendor_id,
                'service_id' => $booking->service_id,
                'rating' => $data['rating'],
                'title' => $data['title'] ?? null,
                'comment' => $data['comment'] ?? null,
                'status' => 'published',
            ]);

            $this->recalculateServiceRating($booking->service_id);

            return $review;
        });
    }

    public function reply(Review $review, string $reply): Review
    {
        $review->update([
            'vendor_reply' => $reply,
            'vendor_replied_at' => now(),
        ]);

        return $review->fresh();
    }

    public function moderate(Review $review, string $status): Review
    {
        $review->update(['status' => $status]);

        $this->recalculateServiceRating($review->service_id);

        return $review->fresh();
    }

    protected function recalculateServiceRating(int $serviceId): void
    {
        $stats = Review::where('service_id', $serviceId)
            ->where('status', 'published')
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as review_count')
            ->first();

        Service::whereKey($serviceId)->update([
            'avg_rating' => round($stats->avg_rating ?? 0, 2),
            'review_count' => $stats->review_count ?? 0,
        ]);
    }
}
