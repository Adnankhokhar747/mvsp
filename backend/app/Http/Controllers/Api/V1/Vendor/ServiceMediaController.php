<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Catalog\Models\Service;
use App\Domain\Catalog\Services\ServiceService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\UploadServiceMediaRequest;
use Illuminate\Http\JsonResponse;

class ServiceMediaController extends Controller
{
    public function __construct(protected ServiceService $services) {}

    public function store(UploadServiceMediaRequest $request, Service $service): JsonResponse
    {
        $this->authorize('update', $service);

        $media = $this->services->addMedia($service, $request->file('file'));

        return response()->json([
            'data' => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'mime_type' => $media->mime_type,
            ],
        ], 201);
    }
}
