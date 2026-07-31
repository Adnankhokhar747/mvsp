<?php

namespace App\Domain\Settings\Services;

use App\Domain\Settings\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    protected const CACHE_TTL = 3600;

    public function get(string $group, string $key, mixed $default = null): mixed
    {
        $cacheKey = "settings.{$group}.{$key}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($group, $key, $default) {
            $setting = Setting::where('group', $group)->where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    public function set(string $group, string $key, mixed $value, bool $isPublic = false): Setting
    {
        $setting = Setting::updateOrCreate(
            ['group' => $group, 'key' => $key],
            ['value' => $value, 'is_public' => $isPublic]
        );

        Cache::forget("settings.{$group}.{$key}");

        return $setting;
    }
}
