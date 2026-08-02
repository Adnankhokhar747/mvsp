<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// This is an API-only backend — there is no real login page. Laravel's
// default unauthenticated-guest handling falls back to `route('login')`
// whenever a request doesn't send `Accept: application/json` (uncommon for
// our real clients, which all set that header, but easy to hit from a bare
// curl/Postman request with no headers) — without a named "login" route,
// that throws a fatal RouteNotFoundException (500) instead of a clean 401.
// This route just needs to exist and resolve; it returns the same JSON a
// normal unauthenticated API request would get.
Route::get('/login', fn () => response()->json(['message' => 'Unauthenticated.'], 401))->name('login');
