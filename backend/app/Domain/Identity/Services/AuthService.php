<?php

namespace App\Domain\Identity\Services;

use App\Domain\Identity\Exceptions\OtpVerificationException;
use App\Domain\Identity\Models\DeviceSession;
use App\Domain\Identity\Models\User;
use App\Domain\Settings\Services\SettingsService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    public function __construct(
        protected OtpService $otp,
        protected SettingsService $settings,
    ) {}

    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $role = $data['role'] ?? 'customer';

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'user_type' => $role === 'vendor' ? 'vendor' : 'customer',
            ]);

            $user->assignRole($role === 'vendor' ? 'vendor-owner' : 'customer');

            $this->otp->generate($user, 'email', 'email_verification', $user->email);

            return $user->refresh();
        });
    }

    /**
     * @throws OtpVerificationException
     */
    public function verifyEmail(string $email, string $code): User
    {
        $this->otp->verify($email, 'email_verification', $code);

        $user = User::where('email', $email)->firstOrFail();
        $user->forceFill(['email_verified_at' => now()])->save();

        return $user;
    }

    /**
     * @throws AuthenticationException
     */
    public function login(string $login, string $password, ?string $deviceName, ?string $ip, ?string $userAgent): array
    {
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user = User::where($field, $login)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new AuthenticationException('These credentials do not match our records.');
        }

        if ($user->status !== 'active') {
            throw new AuthenticationException('This account is not active. Please contact support.');
        }

        if ($this->settings->get('security', 'require_email_verification', true) && ! $user->email_verified_at) {
            throw new AuthenticationException('Please verify your email address before signing in.');
        }

        // Establishes the session-based login the 'web' guard needs for Sanctum's
        // cookie-based SPA auth. The token below is what mobile/Bearer clients use —
        // both paths hit the exact same controllers (docs/architecture/02-permission-matrix.md §1).
        Auth::login($user);

        $tokenResult = $user->createToken($deviceName ?: 'api-token');

        DeviceSession::create([
            'user_id' => $user->id,
            'device_name' => $deviceName,
            'device_type' => $this->guessDeviceType($userAgent),
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'last_active_at' => now(),
        ]);

        $user->forceFill(['last_login_at' => now()])->save();

        return ['user' => $user, 'token' => $tokenResult->plainTextToken];
    }

    public function logout(User $user): void
    {
        // A cookie/session-authenticated request resolves currentAccessToken()
        // to a Sanctum TransientToken stand-in (never null, but not a real
        // persisted token), which has no delete() method - only a genuine
        // bearer-token request has a PersonalAccessToken row to revoke.
        $token = $user->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        // Explicitly target the 'web' guard, not the ambiguous Auth::logout().
        // Laravel's Authenticate middleware calls Auth::shouldUse('sanctum')
        // once the auth:sanctum check on this route succeeds, making 'sanctum'
        // (a RequestGuard, which has no logout() method) the default guard for
        // the rest of the request - Auth::logout() would fatal here.
        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
        }
    }

    protected function guessDeviceType(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'unknown';
        }

        return match (true) {
            (bool) preg_match('/mobile/i', $userAgent) => 'mobile',
            (bool) preg_match('/tablet/i', $userAgent) => 'tablet',
            default => 'desktop',
        };
    }
}
