# RBAC & Permission Matrix

## 1. Model

- Auth: Laravel Sanctum (SPA cookie-session for React admin/web, personal access tokens for Flutter mobile).
- Authorization: `spatie/laravel-permission`. Every permission is a plain string `module.action`, assigned to **roles**, never directly to users (except rare, logged one-off grants via `user.givePermissionTo` for support overrides).
- `users.user_type` (`admin`/`vendor`/`customer`) gates which **route group/middleware** a user can even reach; Spatie roles/permissions gate **what they can do** inside it. A vendor staff member cannot reach `/admin/*` routes regardless of permissions — the two layers are independent.
- Super Admin bypasses all permission checks via `Gate::before(fn($user) => $user->hasRole('super-admin') ? true : null)` — a single seeded role, not a permission list to maintain.
- Vendor-scoped roles (`Vendor Owner`, `Vendor Manager`, `Vendor Staff`) are additionally scoped by `vendor_users.vendor_id` — a permission check always implies "for the acting vendor," enforced by policy classes (`VendorPolicy`, `ServicePolicy`, `BookingPolicy`, ...), not by the permission string alone.
- Roles are seed data, not hardcoded in controllers — new Staff sub-roles (e.g. "Regional Manager") can be created from the admin panel by combining existing permissions, with no deploy.

## 2. Seeded roles

| Role | Type | Purpose |
|---|---|---|
| Super Admin | admin | Full platform control |
| KYC Reviewer | admin (staff) | Vendor onboarding/document review only |
| Finance Manager | admin (staff) | Payouts, refunds, commission, financial reports |
| Support Agent | admin (staff) | Bookings, disputes, read-only user lookup |
| Content Manager | admin (staff) | Categories, CMS pages, notification templates, SEO |
| Vendor Owner | vendor | Full control of their own vendor account |
| Vendor Manager | vendor | Operational control, no payout/bank-account access |
| Vendor Staff | vendor | Execute assigned bookings only |
| Customer | customer | Book, pay, review |

## 3. Permission matrix

Legend: **Y** = full access · **Own** = scoped to own vendor/records · **Assigned** = scoped to records explicitly assigned to them · **–** = no access

| Permission | Super Admin | KYC Reviewer | Finance Mgr | Support Agent | Content Mgr | Vendor Owner | Vendor Manager | Vendor Staff | Customer |
|---|---|---|---|---|---|---|---|---|---|
| settings.manage (site, map, mail, tax) | Y | – | – | – | – | – | – | – | – |
| plans.manage (subscription plans/features) | Y | – | – | – | – | – | – | – | – |
| commission.manage | Y | – | Y | – | – | – | – | – | – |
| languages.manage / currencies.manage | Y | – | – | – | – | – | – | – | – |
| cms.manage / legal.manage | Y | – | – | – | Y | – | – | – | – |
| notification-templates.manage | Y | – | – | – | Y | – | – | – | – |
| staff.manage (create/edit admin staff + roles) | Y | – | – | – | – | – | – | – | – |
| vendors.view-all | Y | Y | Y | Y | – | – | – | – | – |
| vendors.approve / reject / suspend | Y | Y (approve/reject only) | – | – | – | – | – | – | – |
| vendors.edit-own | – | – | – | – | – | Y | Y | – | – |
| kyc.review | Y | Y | – | – | – | – | – | – | – |
| kyc.upload | – | – | – | – | – | Own | Own | – | – |
| vendor-staff.manage (invite/remove/roles within vendor) | – | – | – | – | – | Own | Own (except Owner) | – | – |
| categories.manage (platform taxonomy + attribute schemas) | Y | – | – | – | Y | – | – | – | – |
| services.create / edit / delete | – | – | – | – | – | Own | Own | Assigned (edit only) | – |
| services.moderate (approve/reject/feature) | Y | – | – | – | Y | – | – | – | – |
| bookings.view-all | Y | – | Y | Y | – | – | – | – | – |
| bookings.view-own | – | – | – | – | – | Own | Own | Assigned | Own |
| bookings.manage (accept/quote/reschedule/complete) | – | – | – | – | – | Own | Own | Assigned | – |
| bookings.cancel | Y | – | – | Y | – | Own | Own | – | Own (per policy) |
| bookings.dispute-resolve | Y | – | – | Y | – | – | – | – | – |
| transactions.view-all | Y | – | Y | – | – | – | – | – | – |
| transactions.view-own | – | – | – | – | – | Own | Own | – | Own |
| refunds.issue | Y | – | Y | – | – | – | – | – | – |
| payouts.approve | Y | – | Y | – | – | – | – | – | – |
| payouts.request | – | – | – | – | – | Own | – | – | – |
| bank-accounts.manage | – | – | – | – | – | Own | – | – | – |
| subscriptions.manage-plans | Y | – | Y | – | – | – | – | – | – |
| subscriptions.subscribe / change-plan | – | – | – | – | – | Own | – | – | – |
| reviews.moderate (hide/flag) | Y | – | – | Y | – | – | – | – | – |
| reviews.reply | – | – | – | – | – | Own | Own | – | – |
| reviews.create | – | – | – | – | – | – | – | – | Own |
| chat.access | Y (support) | – | – | Y | – | Own (plan-gated) | Own (plan-gated) | Assigned (plan-gated) | Own |
| reports.view-platform | Y | – | Y (financial) | – | – | – | – | – | – |
| reports.view-own | – | – | – | – | – | Own | Own | – | – |
| activity-logs.view | Y | – | – | Y (read-only) | – | – | – | – | – |

## 4. Notes on enforcement

- **Policies over inline checks.** Every model with row-level ownership gets a Laravel Policy (`VendorPolicy`, `ServicePolicy`, `BookingPolicy`, `TransactionPolicy`, `ReviewPolicy`). Controllers call `$this->authorize()`; permission strings above map to policy methods, never to ad-hoc `if ($user->vendor_id == ...)` checks scattered in controllers.
- **Vendor Staff "Assigned" scope** means: a booking is visible/actionable only if `bookings.staff_id === auth()->id()` or the staff member is in `service_staff` for that booking's service.
- **Plan-gated permissions** (chat, featured listing, advanced reports) are a second, independent check via `FeatureGate::allows($vendor, 'chat')` — having the *role* permission is necessary but not sufficient; the vendor's active subscription must also include the feature.
- **Staff role permissions are still data**, not a hardcoded enum in code — this matrix is the seed/default configuration; Super Admin can create new staff roles from the matrix's permission catalog without a deploy.
