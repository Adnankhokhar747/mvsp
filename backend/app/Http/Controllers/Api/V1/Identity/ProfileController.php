<?php

namespace App\Http\Controllers\Api\V1\Identity;

use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\UpdateProfileRequest;
use App\Http\Resources\Identity\UserResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): UserResource
    {
        return new UserResource($request->user()->load('roles'));
    }

    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->validated());

        return new UserResource($user->fresh('roles'));
    }
}
