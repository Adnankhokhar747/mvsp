<?php

namespace App\Http\Controllers\Api\V1\Booking;

use App\Domain\Booking\Models\Booking;
use App\Domain\Review\Exceptions\ReviewException;
use App\Domain\Review\Services\ReviewService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\Review\ReviewResource;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function __construct(protected ReviewService $reviews) {}

    public function store(StoreReviewRequest $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->customer_id === $request->user()->id, 403, 'Only the customer who booked this can leave a review.');

        try {
            $review = $this->reviews->create($booking, $request->validated());
        } catch (ReviewException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new ReviewResource($review))->response()->setStatusCode(201);
    }
}
