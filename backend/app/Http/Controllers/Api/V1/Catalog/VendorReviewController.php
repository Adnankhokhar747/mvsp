<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Domain\Review\Models\Review;
use App\Domain\Vendor\Models\Vendor;
use App\Http\Controllers\Controller;
use App\Http\Resources\Review\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VendorReviewController extends Controller
{
    public function index(Request $request, Vendor $vendor): AnonymousResourceCollection
    {
        $user = $request->user();
        $canSeeAll = $user && ($user->hasAnyRole(['super-admin', 'support-agent'])
            || $vendor->vendorUsers()->where('user_id', $user->id)->exists());

        $query = Review::where('vendor_id', $vendor->id)->with(['customer', 'service']);
        if (! $canSeeAll) {
            $query->where('status', 'published');
        }

        $reviews = $query->latest()->paginate($request->integer('per_page', 20));

        return ReviewResource::collection($reviews);
    }
}
