<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Catalog\Models\Service;
use App\Domain\Catalog\Services\ServiceService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerateServiceRequest;
use App\Http\Resources\Catalog\ServiceResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ServiceController extends Controller
{
    public function __construct(protected ServiceService $services) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('services.moderate');

        $services = QueryBuilder::for(Service::class)
            ->with(['vendor', 'category'])
            ->allowedFilters([
                'status',
                'vendor_id',
                AllowedFilter::callback('search', fn ($query, $value) => $query->where('title', 'like', "%{$value}%")),
            ])
            ->allowedSorts(['created_at', 'title'])
            ->defaultSort('-created_at')
            ->paginate($request->integer('per_page', 20));

        return ServiceResource::collection($services);
    }

    public function moderate(ModerateServiceRequest $request, Service $service): ServiceResource
    {
        $this->authorize('services.moderate');

        $service = $this->services->moderate(
            $service,
            $request->validated('action'),
            $request->validated('featured_days'),
        );

        return new ServiceResource($service);
    }
}
