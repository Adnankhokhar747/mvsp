<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Domain\Catalog\Models\Service;
use App\Http\Controllers\Controller;
use App\Http\Resources\Catalog\ServiceResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ServiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $services = QueryBuilder::for(Service::query()->where('status', 'active'))
            ->allowedFilters([
                'category_id',
                'vendor_id',
                AllowedFilter::scope('min_price'),
                AllowedFilter::scope('max_price'),
            ])
            ->allowedSorts(['base_price', 'avg_rating', 'created_at'])
            ->defaultSort('-created_at')
            ->with('packages')
            ->paginate($request->integer('per_page', 20));

        return ServiceResource::collection($services);
    }

    public function show(Service $service): ServiceResource
    {
        $this->authorize('view', $service);

        $service->increment('view_count');

        return new ServiceResource($service->load('packages'));
    }
}
