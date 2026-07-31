<?php

namespace App\Http\Controllers\Api\V1\Identity;

use App\Domain\Identity\Exceptions\OtpVerificationException;
use App\Domain\Identity\Models\User;
use App\Domain\Identity\Services\AuthService;
use App\Domain\Identity\Services\OtpService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\LoginRequest;
use App\Http\Requests\Identity\RegisterRequest;
use App\Http\Requests\Identity\ResetPasswordRequest;
use App\Http\Requests\Identity\SendOtpRequest;
use App\Http\Requests\Identity\VerifyOtpRequest;
use App\Http\Resources\Identity\UserResource;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $auth,
        protected OtpService $otp,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->auth->register($request->validated());

        return (new UserResource($user))
            ->additional(['message' => 'Registration successful. Check your email for a verification code.'])
            ->response()
            ->setStatusCode(201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->auth->login(
                $request->validated('login'),
                $request->validated('password'),
                $request->validated('device_name'),
                $request->ip(),
                $request->userAgent(),
            );
        } catch (AuthenticationException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return (new UserResource($result['user']))
            ->additional(['message' => 'Login successful.', 'token' => $result['token']])
            ->response();
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout($request->user());

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    public function sendOtp(SendOtpRequest $request): JsonResponse
    {
        $destination = $request->validated('email') ?? $request->validated('phone');
        $channel = $request->filled('email') ? 'email' : 'sms';
        $user = User::where($channel === 'email' ? 'email' : 'phone', $destination)->first();

        $this->otp->generate($user, $channel, $request->validated('purpose'), $destination);

        return response()->json(['message' => 'Verification code sent.']);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $destination = $request->validated('email') ?? $request->validated('phone');
        $purpose = $request->validated('purpose');

        try {
            if ($purpose === 'email_verification') {
                $user = $this->auth->verifyEmail($destination, $request->validated('code'));

                return (new UserResource($user))
                    ->additional(['message' => 'Email verified successfully.'])
                    ->response();
            }

            $this->otp->verify($destination, $purpose, $request->validated('code'));

            return response()->json(['message' => 'Code verified.']);
        } catch (OtpVerificationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $this->otp->verify($request->validated('email'), 'password_reset', $request->validated('code'));
        } catch (OtpVerificationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $user = User::where('email', $request->validated('email'))->firstOrFail();
        $user->forceFill(['password' => $request->validated('password')])->save();

        // Any existing tokens are invalidated on password reset so other sessions are logged out.
        $user->tokens()->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
