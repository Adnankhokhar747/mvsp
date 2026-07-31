<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Domain\Catalog\Models\Category;
use App\Domain\Catalog\Services\CategoryService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Catalog\CategoryResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(protected CategoryService $categories) {}

    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection($this->categories->tree());
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->load('children'));
    }
}
