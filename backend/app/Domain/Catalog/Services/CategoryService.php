<?php

namespace App\Domain\Catalog\Services;

use App\Domain\Catalog\Exceptions\CategoryException;
use App\Domain\Catalog\Models\Category;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class CategoryService
{
    public function tree(): Collection
    {
        return Category::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Admin management view — every category regardless of active state,
     * top-level with nested children (mirrors tree() but without the
     * public-facing active-only filter).
     */
    public function allForAdmin(): Collection
    {
        return Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();
    }

    public function create(array $data): Category
    {
        $data['slug'] = $this->uniqueSlug($data['name']);

        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->fresh();
    }

    /**
     * @throws CategoryException
     */
    public function delete(Category $category): void
    {
        if ($category->children()->exists() || $category->services()->exists()) {
            throw CategoryException::hasChildrenOrServices();
        }

        $category->delete();
    }

    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (Category::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
