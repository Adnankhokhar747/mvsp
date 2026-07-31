<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Review\Models\Review;
use App\Domain\Review\Services\ReviewService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Review\ModerateReviewRequest;
use App\Http\Resources\Review\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function __construct(protected ReviewService $reviews) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('reviews.moderate');

        $query = Review::query()->with(['customer', 'vendor', 'service']);

        if ($status = $request->input('filter.status')) {
            $query->where('status', $status);
        }

        $reviews = $query->latest()->paginate($request->integer('per_page', 20));

        return ReviewResource::collection($reviews);
    }

    public function moderate(ModerateReviewRequest $request, Review $review): ReviewResource
    {
        $this->authorize('reviews.moderate');

        return new ReviewResource($this->reviews->moderate($review, $request->validated('status')));
    }
}
