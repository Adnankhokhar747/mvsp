<?php

namespace App\Http\Controllers\Api\V1\Identity;

use App\Http\Controllers\Controller;
use App\Http\Resources\Identity\DeviceSessionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SessionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $sessions = $request->user()
            ->deviceSessions()
            ->whereNull('revoked_at')
            ->latest('last_active_at')
            ->get();

        return DeviceSessionResource::collection($sessions);
    }

    public function destroy(Request $request, int $deviceSession): JsonResponse
    {
        $session = $request->user()->deviceSessions()->findOrFail($deviceSession);
        $session->update(['revoked_at' => now()]);

        return response()->json(['message' => 'Session revoked.']);
    }
}
