<?php

namespace App\Domain\Catalog\Services;

use App\Domain\Catalog\Exceptions\ServiceLimitException;
use App\Domain\Catalog\Models\Category;
use App\Domain\Catalog\Models\Service;
use App\Domain\Subscription\Services\FeatureGateService;
use App\Domain\Vendor\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ServiceService
{
    public function __construct(protected FeatureGateService $featureGate) {}

    /**
     * @throws ServiceLimitException
     */
    public function create(Vendor $vendor, array $data): Service
    {
        $activeCount = $vendor->services()->whereIn('status', ['draft', 'active', 'paused'])->count();

        if ($this->featureGate->hasReachedLimit($vendor, 'max_services', $activeCount)) {
            throw ServiceLimitException::maxServicesReached();
        }

        $category = Category::findOrFail($data['category_id']);
        $this->assertBookingModeAllowed($category, $data['price_type']);

        return DB::transaction(function () use ($vendor, $data) {
            return Service::create([
                'vendor_id' => $vendor->id,
                'category_id' => $data['category_id'],
                'title' => $data['title'],
                'slug' => $this->uniqueSlug($vendor, $data['title']),
                'short_description' => $data['short_description'] ?? null,
                'description' => $data['description'] ?? null,
                'base_price' => $data['base_price'] ?? 0,
                'currency_code' => $data['currency_code'] ?? $vendor->currency_code,
                'price_type' => $data['price_type'],
                'duration_minutes' => $data['duration_minutes'] ?? null,
                'attributes' => $data['attributes'] ?? [],
                'status' => 'draft',
            ]);
        });
    }

    /**
     * @throws ServiceLimitException
     */
    public function update(Service $service, array $data): Service
    {
        $categoryId = $data['category_id'] ?? $service->category_id;
        $priceType = $data['price_type'] ?? $service->price_type;

        if (isset($data['category_id']) || isset($data['price_type'])) {
            $this->assertBookingModeAllowed(Category::findOrFail($categoryId), $priceType);
        }

        $service->update($data);

        return $service->fresh();
    }

    public function delete(Service $service): void
    {
        $service->delete();
    }

    public function setAvailability(Service $service, array $slots): void
    {
        DB::transaction(function () use ($service, $slots) {
            $service->availability()->delete();

            foreach ($slots as $slot) {
                $service->availability()->create($slot);
            }
        });
    }

    public function addMedia(Service $service, UploadedFile $file): Media
    {
        return $service->addMedia($file)->toMediaCollection('gallery');
    }

    public function moderate(Service $service, string $action, ?int $featuredDays = null): Service
    {
        match ($action) {
            'approve' => $service->update(['status' => 'active']),
            'reject' => $service->update(['status' => 'rejected']),
            'feature' => $service->update([
                'is_featured' => true,
                'featured_until' => now()->addDays($featuredDays ?? 30),
            ]),
        };

        return $service->fresh();
    }

    /**
     * @throws ServiceLimitException
     */
    protected function assertBookingModeAllowed(Category $category, string $priceType): void
    {
        $mode = $priceType === 'quote' ? 'request' : 'slot';

        if (! in_array($mode, $category->booking_mode_allowed ?? [], true)) {
            throw ServiceLimitException::bookingModeNotAllowed($mode);
        }
    }

    protected function uniqueSlug(Vendor $vendor, string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 1;

        while ($vendor->services()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
