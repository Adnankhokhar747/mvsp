<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Identity\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\SuspendStaffRequest;
use App\Http\Requests\Admin\UpdateStaffRoleRequest;
use App\Http\Resources\Identity\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    /**
     * Platform-side roles a staff member can be assigned. Deliberately excludes
     * vendor-side roles (vendor-owner, vendor-manager, vendor-staff) and
     * 'customer' - those are assigned through the vendor-staff and
     * registration flows, not here.
     */
    public const PLATFORM_ROLES = [
        'super-admin',
        'kyc-reviewer',
        'finance-manager',
        'support-agent',
        'content-manager',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('staff.manage');

        $query = User::query()->where('user_type', 'admin')->with('roles');

        if ($status = $request->input('filter.status')) {
            $query->where('status', $status);
        }

        if ($role = $request->input('filter.role')) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $role));
        }

        $staff = $query->latest()->paginate($request->integer('per_page', 20));

        return UserResource::collection($staff);
    }

    public function roles(): JsonResponse
    {
        $this->authorize('staff.manage');

        $roles = Role::whereIn('name', self::PLATFORM_ROLES)
            ->withCount('permissions')
            ->get()
            ->map(fn ($role) => [
                'name' => $role->name,
                'permissions_count' => $role->permissions_count,
            ]);

        return response()->json(['data' => $roles]);
    }

    public function store(StoreStaffRequest $request): JsonResponse
    {
        $this->authorize('staff.manage');

        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'user_type' => 'admin',
            'status' => 'active',
        ]);

        // email_verified_at isn't mass-assignable (by design, for the public
        // registration flow) - an admin creating a staff account is vouching
        // for it directly, so it's set explicitly here instead.
        $user->forceFill(['email_verified_at' => now()])->save();

        $user->assignRole($request->validated('role'));

        return (new UserResource($user->load('roles')))->response()->setStatusCode(201);
    }

    public function updateRole(UpdateStaffRoleRequest $request, User $user): UserResource
    {
        $this->authorize('staff.manage');

        abort_unless($user->user_type === 'admin', 404);

        $user->syncRoles([$request->validated('role')]);

        return new UserResource($user->load('roles'));
    }

    public function suspend(SuspendStaffRequest $request, User $user): UserResource
    {
        $this->authorize('staff.manage');

        abort_unless($user->user_type === 'admin', 404);

        if ($user->is($request->user())) {
            throw ValidationException::withMessages(['user' => 'You cannot suspend your own account.']);
        }

        $user->update(['status' => 'suspended']);
        $user->tokens()->delete();
        $user->deviceSessions()->whereNull('revoked_at')->update(['revoked_at' => now()]);

        return new UserResource($user->load('roles'));
    }

    public function reactivate(User $user): UserResource
    {
        $this->authorize('staff.manage');

        abort_unless($user->user_type === 'admin', 404);

        $user->update(['status' => 'active']);

        return new UserResource($user->load('roles'));
    }
}
