<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Review\Models\Review;
use App\Domain\Review\Services\ReviewService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Review\ReplyReviewRequest;
use App\Http\Resources\Review\ReviewResource;

class ReviewController extends Controller
{
    public function __construct(protected ReviewService $reviews) {}

    public function reply(ReplyReviewRequest $request, Review $review): ReviewResource
    {
        $this->authorize('reply', $review);

        return new ReviewResource($this->reviews->reply($review, $request->validated('reply')));
    }
}
