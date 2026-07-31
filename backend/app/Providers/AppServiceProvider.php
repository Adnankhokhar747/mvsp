<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Models live under App\Domain\{Module}\Models rather than App\Models, so the
        // default factory resolver (which mirrors the full sub-namespace) never finds a
        // match. Factories stay flat in database/factories/{Model}Factory.php instead.
        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'Database\\Factories\\'.class_basename($modelName).'Factory'
        );

        // Brute-force targets (login, register, password reset) get a strict per-IP limit;
        // OTP send/verify gets its own since it's hit repeatedly by legitimate retries.
        RateLimiter::for('auth', fn ($request) => Limit::perMinute(10)->by($request->ip()));
        RateLimiter::for('otp', fn ($request) => Limit::perMinute(5)->by($request->ip()));
    }
}
