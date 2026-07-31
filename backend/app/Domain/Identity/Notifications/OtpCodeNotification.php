<?php

namespace App\Domain\Identity\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpCodeNotification extends Notification
{
    use Queueable;

    protected const PURPOSE_LABELS = [
        'email_verification' => 'verify your email address',
        'phone_verification' => 'verify your phone number',
        'password_reset' => 'reset your password',
        'login_2fa' => 'complete sign-in',
    ];

    public function __construct(
        protected string $code,
        protected string $purpose,
        protected int $expiresInMinutes,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $action = self::PURPOSE_LABELS[$this->purpose] ?? 'continue';

        return (new MailMessage)
            ->subject('Your ServiceHub verification code')
            ->greeting('Hello,')
            ->line("Use the code below to {$action}.")
            ->line("Verification code: {$this->code}")
            ->line("This code expires in {$this->expiresInMinutes} minutes.")
            ->line('If you did not request this, you can safely ignore this email.');
    }
}
