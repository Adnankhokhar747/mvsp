<?php

namespace App\Domain\Identity\Services;

use App\Domain\Identity\Exceptions\OtpVerificationException;
use App\Domain\Identity\Models\OtpCode;
use App\Domain\Identity\Models\User;
use App\Domain\Identity\Notifications\OtpCodeNotification;
use App\Domain\Settings\Services\SettingsService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

class OtpService
{
    public function __construct(protected SettingsService $settings) {}

    public function generate(?User $user, string $channel, string $purpose, string $destination): OtpCode
    {
        // Invalidate any still-pending codes for the same destination/purpose so only
        // the most recently sent code is ever valid.
        OtpCode::where('destination', $destination)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        $code = (string) random_int(100000, 999999);
        $expiryMinutes = (int) $this->settings->get('mail', 'otp_expiry_minutes', 10);

        $otp = OtpCode::create([
            'user_id' => $user?->id,
            'channel' => $channel,
            'purpose' => $purpose,
            'destination' => $destination,
            'code_hash' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes($expiryMinutes),
        ]);

        if ($channel === 'email') {
            Notification::route('mail', $destination)
                ->notify(new OtpCodeNotification($code, $purpose, $expiryMinutes));
        }

        return $otp;
    }

    /**
     * @throws OtpVerificationException
     */
    public function verify(string $destination, string $purpose, string $code): OtpCode
    {
        $maxAttempts = (int) $this->settings->get('mail', 'otp_max_attempts', 5);

        $otp = OtpCode::where('destination', $destination)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->where('expires_at', '>=', now())
            ->latest('id')
            ->first();

        if (! $otp) {
            throw OtpVerificationException::invalidOrExpired();
        }

        if ($otp->attempts >= $maxAttempts) {
            throw OtpVerificationException::tooManyAttempts();
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');
            throw OtpVerificationException::invalidOrExpired();
        }

        $otp->update(['consumed_at' => now()]);

        return $otp;
    }
}
