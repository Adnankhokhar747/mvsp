<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Public API routes (category/service browse, vendor storefronts) still need to know
 * "is there a logged-in vendor/admin viewing this" for policy checks like
 * ServicePolicy::view() — but they can't use `auth:sanctum`, which rejects guests
 * outright. This resolves the token if one is present, without ever blocking the
 * request when it's not.
 */
class ResolveSanctumUserIfPresent
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->bearerToken() && Auth::guard('sanctum')->check()) {
            Auth::shouldUse('sanctum');
        }

        return $next($request);
    }
}
