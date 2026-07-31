<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Review\Models\Review;
use App\Domain\Review\Services\ReviewService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Review\ModerateReviewRequest;
use App\Http\Resources\Review\ReviewResource;

class ReviewController extends Controller
{
    public function __construct(protected ReviewService $reviews) {}

    public function moderate(ModerateReviewRequest $request, Review $review): ReviewResource
    {
        $this->authorize('reviews.moderate');

        return new ReviewResource($this->reviews->moderate($review, $request->validated('status')));
    }
}
