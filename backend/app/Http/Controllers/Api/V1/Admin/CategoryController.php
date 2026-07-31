<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Catalog\Exceptions\CategoryException;
use App\Domain\Catalog\Models\Category;
use App\Domain\Catalog\Services\CategoryService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreCategoryRequest;
use App\Http\Requests\Catalog\UpdateCategoryRequest;
use App\Http\Resources\Catalog\CategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(protected CategoryService $categories) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('categories.manage');

        return CategoryResource::collection($this->categories->allForAdmin());
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('categories.manage');

        $category = $this->categories->create($request->validated());

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $this->authorize('categories.manage');

        return new CategoryResource($this->categories->update($category, $request->validated()));
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('categories.manage');

        try {
            $this->categories->delete($category);
        } catch (CategoryException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Category deleted.']);
    }
}
