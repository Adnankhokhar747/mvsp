<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Settings\Models\CmsPage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCmsPageRequest;
use App\Http\Requests\Admin\UpdateCmsPageRequest;
use App\Http\Resources\Settings\CmsPageResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CmsPageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('cms.manage');

        return CmsPageResource::collection(CmsPage::orderBy('slug')->orderBy('locale')->get());
    }

    public function store(StoreCmsPageRequest $request): JsonResponse
    {
        $this->authorize('cms.manage');

        $page = CmsPage::create($request->validated());

        return (new CmsPageResource($page->fresh()))->response()->setStatusCode(201);
    }

    public function update(UpdateCmsPageRequest $request, CmsPage $cmsPage): CmsPageResource
    {
        $this->authorize('cms.manage');

        $cmsPage->update($request->validated());

        return new CmsPageResource($cmsPage->fresh());
    }

    public function destroy(CmsPage $cmsPage): JsonResponse
    {
        $this->authorize('cms.manage');

        $cmsPage->delete();

        return response()->json(['message' => 'Page deleted.']);
    }
}
