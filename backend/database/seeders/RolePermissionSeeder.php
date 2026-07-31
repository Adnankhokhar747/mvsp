<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Permission catalog, grouped only for readability here — Spatie stores them flat.
     * Mirrors docs/architecture/02-permission-matrix.md §3.
     */
    protected array $permissions = [
        'settings.manage', 'plans.manage', 'commission.manage', 'languages.manage', 'currencies.manage',
        'cms.manage', 'legal.manage', 'notification-templates.manage', 'staff.manage',
        'vendors.view-all', 'vendors.approve', 'vendors.reject', 'vendors.suspend', 'vendors.edit-own',
        'kyc.review', 'kyc.upload', 'vendor-staff.manage',
        'categories.manage', 'services.create', 'services.edit', 'services.delete', 'services.moderate',
        'bookings.view-all', 'bookings.view-own', 'bookings.manage', 'bookings.cancel', 'bookings.dispute-resolve',
        'transactions.view-all', 'transactions.view-own', 'refunds.issue',
        'payouts.approve', 'payouts.request', 'bank-accounts.manage',
        'subscriptions.manage-plans', 'subscriptions.subscribe',
        'reviews.moderate', 'reviews.reply', 'reviews.create',
        'chat.access', 'reports.view-platform', 'reports.view-own', 'activity-logs.view',
    ];

    /**
     * Role => permission subset. 'super-admin' is granted everything separately below
     * (it also bypasses all checks via Gate::before, this is just for admin-UI display).
     */
    protected array $rolePermissions = [
        'kyc-reviewer' => [
            'vendors.view-all', 'vendors.approve', 'vendors.reject', 'kyc.review',
        ],
        'finance-manager' => [
            'vendors.view-all', 'commission.manage', 'transactions.view-all', 'refunds.issue',
            'payouts.approve', 'subscriptions.manage-plans', 'reports.view-platform',
        ],
        'support-agent' => [
            'vendors.view-all', 'bookings.view-all', 'bookings.cancel', 'bookings.dispute-resolve',
            'chat.access', 'activity-logs.view',
        ],
        'content-manager' => [
            'cms.manage', 'legal.manage', 'notification-templates.manage', 'categories.manage', 'services.moderate',
        ],
        'vendor-owner' => [
            'vendors.edit-own', 'kyc.upload', 'vendor-staff.manage',
            'services.create', 'services.edit', 'services.delete',
            'bookings.view-own', 'bookings.manage', 'bookings.cancel',
            'transactions.view-own', 'payouts.request', 'bank-accounts.manage',
            'subscriptions.subscribe', 'reviews.reply', 'chat.access', 'reports.view-own',
        ],
        'vendor-manager' => [
            'vendors.edit-own', 'kyc.upload', 'vendor-staff.manage',
            'services.create', 'services.edit', 'services.delete',
            'bookings.view-own', 'bookings.manage', 'bookings.cancel',
            'transactions.view-own', 'reviews.reply', 'chat.access', 'reports.view-own',
        ],
        'vendor-staff' => [
            'services.edit', 'bookings.view-own', 'bookings.manage', 'chat.access',
        ],
        'customer' => [
            'bookings.view-own', 'bookings.cancel', 'transactions.view-own', 'reviews.create', 'chat.access',
        ],
    ];

    public function run(): void
    {
        foreach ($this->permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions($this->permissions);

        foreach ($this->rolePermissions as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($permissions);
        }
    }
}
