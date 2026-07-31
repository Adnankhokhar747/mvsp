# ServiceHub SaaS — Platform Architecture Overview

## 1. What this is

A generic, vertical-agnostic multi-vendor service marketplace. The same schema and codebase must serve home services, rentals, salons, clinics, tutoring, legal, photography, restaurants, freelancers, construction, etc. Verticals differ only in **configuration data** (categories, custom attributes, booking rules), never in code or schema.

## 2. Foundational architecture decisions

These decisions are assumed for everything that follows. Flag any of them early if they don't match your intent — they're expensive to reverse later.

| # | Decision | Rationale |
|---|---|---|
| 1 | **Single marketplace instance, multi-vendor** (not multi-tenant-per-schema). One database, vendors scoped by `vendor_id` foreign keys. White-labeling (future) is a theming/config layer on top of this single instance, not separate DB schemas per client. | Matches "Future White Labeling" being explicitly a *future* concern, and Urban Company/Fiverr-style platforms are single-instance marketplaces. Multi-tenant-per-schema would add huge complexity for no near-term benefit. |
| 2 | **Category-driven genericity via configurable attributes.** Instead of hardcoded columns per vertical (e.g. `plumber.pipe_diameter`), services carry a `category_id` + a JSON `attributes` payload validated against an admin-defined **attribute schema** per category (similar to a lightweight EAV/JSON-schema hybrid). | This is *the* mechanism that makes "not just for plumbers" real at the data layer. |
| 3 | **Booking model supports both slot-based and request-based services.** Slot-based (salon chair, tutor hour) uses staff/resource + time-slot availability. Request-based (consultants, freelancers, construction quotes) uses a quote/negotiation step before a booking is confirmed. Both funnel into the same `bookings` table with a `booking_mode` discriminator. | A hair salon and a construction contractor cannot both be forced through fixed 30-minute slots. |
| 4 | **Money is currency-aware and integer-minor-unit stored** (store cents/fils as integers, never floats), with a platform base currency plus per-vendor/per-country display currency and FX-rate snapshot per transaction. | Standard fintech practice; also required for "future countries." |
| 5 | **All payment and map providers sit behind an adapter/strategy interface** resolved by admin-configured driver name (`config('services.payment.default')`, `config('services.map.default')`), following Laravel's own filesystem/mail multi-driver pattern. | Explicit requirement — gateways/providers are plug-in, not hardcoded. |
| 6 | **Subscription plans gate features via a single `plan_features` capability table**, checked through one `FeatureGate` service (`FeatureGate::allows($vendor, 'chat')`, `FeatureGate::limit($vendor, 'max_services')`) rather than scattered `if ($vendor->plan == 'gold')` checks. | Keeps "no code changes ever required" true — new plans/features are data, not deploys. |
| 7 | **Every mutable admin-facing entity is a "settings" or "config" table row, not a `.env`/config file value**, wherever it plausibly needs to change post-launch (commission %, booking cancellation window, KYC document types, notification templates, languages, currencies). `.env`/config files stay reserved for true deploy-time infra values (DB creds, queue driver, cache driver). | Matches "Everything should be configurable from Admin Panel." |
| 8 | **Soft deletes + audit logging on all core business entities** (vendors, services, bookings, transactions, subscriptions). Hard deletes are never exposed to end users. | Marketplace disputes and financial records must be reconstructable. |

## 3. Module map

Eighteen bounded modules. Each becomes its own Laravel domain namespace (see [folder structure](03-folder-structure.md)) and its own migration group.

1. **Identity & Access** — users, roles/permissions (Spatie), auth (Sanctum), 2FA, device sessions, email verification
2. **Vendor Management** — vendor profile, KYC documents, vendor staff, approval workflow
3. **Service Catalog** — categories (hierarchical + attribute schema), services, packages/variants, media, availability
4. **Booking & Scheduling** — bookings, slots, staff assignment, quotes (request-based), rescheduling/cancellation
5. **Payments & Transactions** — gateway adapters, transactions, refunds, invoices
6. **Vendor Wallet & Payouts** — vendor balance ledger, payout requests, commission rules
7. **Subscription & Billing** — plans, plan features/limits, vendor subscriptions, renewals, plan-change proration
8. **Reviews & Ratings**
9. **Notifications** — channels (email/SMS-future/push/in-app), admin-editable templates, preferences
10. **Messaging/Chat** — vendor↔customer, plan-gated
11. **Search & Discovery** — filters, geo search, featured/priority listing
12. **Location & Maps** — addresses, service areas, map-provider abstraction (Leaflet/OSM default)
13. **Platform Settings & CMS** — site settings, legal pages, SEO, feature flags
14. **Localization** — languages, translations, currencies, tax rules
15. **Reporting & Analytics** — vendor + admin dashboards, exports
16. **Audit & Activity Logs**
17. **Admin & Staff Management** — Super Admin, Staff roles with granular permission scoping
18. **Media/Storage** — disk-abstracted uploads (local now, S3-compatible later)

AI features (chatbot, recommendations, AI search, analytics, description/SEO generation) are **not a module yet** — see [Future AI extension points](07-future-extension-points.md) for where hooks are reserved.

## 4. User types & scoping

| Type | Scope | Notes |
|---|---|---|
| Super Admin | Global | Full access, plan/feature/commission config |
| Staff | Global, permission-scoped | Admin employees; permissions assigned via Spatie roles (e.g. `kyc-reviewer`, `support-agent`, `finance`) |
| Vendor (Owner) | Own vendor account | One `users` row is the vendor owner; owns the `vendors` row |
| Vendor Staff | Own vendor account, permission-scoped | e.g. can manage bookings but not payouts |
| Customer | Own data only | Books services, pays, reviews |

All four map to the same `users` table + Spatie roles/permissions — there is no separate `admins`/`vendors`/`customers` table. A `user_type` enum on `users` (`admin`, `vendor`, `customer`) is kept as a fast discriminator for query scoping and route middleware, while Spatie roles carry the fine-grained permission logic. Vendor owner vs vendor staff is distinguished by a `vendor_user` pivot with a `role` column (`owner`, `staff`).

## 5. Documents in this set

1. [00-overview.md](00-overview.md) — this file
2. [01-database-schema.md](01-database-schema.md) — full schema + ER diagrams
3. [02-permission-matrix.md](02-permission-matrix.md) — RBAC matrix
4. [03-folder-structure.md](03-folder-structure.md) — Laravel/React/Flutter structure
5. [04-api-contract.md](04-api-contract.md) — REST endpoint map
6. [05-ui-flows.md](05-ui-flows.md) — key journey flows
7. [06-validation-and-edge-cases.md](06-validation-and-edge-cases.md)
8. [07-future-extension-points.md](07-future-extension-points.md) — AI, white-labeling, licensing hooks
