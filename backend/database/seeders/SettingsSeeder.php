<?php

namespace Database\Seeders;

use App\Domain\Settings\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Baseline admin-configurable defaults. Every value here is meant to be
     * edited from the admin panel later, never redeployed as code.
     */
    protected array $settings = [
        'general' => [
            'site_name' => 'ServiceHub',
            'support_email' => 'support@servicehub.test',
            'default_locale' => 'en',
            'default_currency' => 'USD',
        ],
        'map' => [
            'provider' => 'osm',
            'nominatim_base_url' => 'https://nominatim.openstreetmap.org',
            'google_maps_api_key' => null,
        ],
        'mail' => [
            'verification_method' => 'link',
            'otp_expiry_minutes' => 10,
            'otp_max_attempts' => 5,
        ],
        'booking' => [
            'default_cancellation_window_hours' => 24,
            'default_refund_percentage' => 100,
            'quote_expiry_hours' => 72,
        ],
        'security' => [
            'password_min_length' => 8,
            'require_email_verification' => true,
        ],
    ];

    public function run(): void
    {
        foreach ($this->settings as $group => $keys) {
            foreach ($keys as $key => $value) {
                Setting::firstOrCreate(
                    ['group' => $group, 'key' => $key],
                    ['value' => $value, 'is_public' => in_array($group, ['general', 'map'], true)]
                );
            }
        }
    }
}
