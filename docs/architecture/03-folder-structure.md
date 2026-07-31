# Folder Structure

## 1. Laravel API (`/backend`)

Domain-oriented, not MVC-flat. Each module from [00-overview.md](00-overview.md) gets an identical internal shape so any developer can navigate any module the same way. Controllers/Requests/Resources stay in the conventional `Http` layer (Laravel routing expects them there); business logic lives in `app/Domain/*`.

```
backend/
├── app/
│   ├── Domain/
│   │   ├── Identity/            # users, roles, auth, 2FA, device sessions, OTP
│   │   ├── Vendor/              # vendor profile, KYC, vendor staff, approval
│   │   ├── Catalog/             # categories, services, packages, media, availability
│   │   ├── Booking/             # bookings, quotes, status history, cancellation policy
│   │   ├── Payment/             # gateway adapters, transactions, invoices, refunds
│   │   ├── Wallet/               # vendor wallet, ledger, payouts, commission rules
│   │   ├── Subscription/        # plans, plan features, vendor subscriptions, usage
│   │   ├── Review/
│   │   ├── Notification/        # templates, preferences (wraps Laravel notifications)
│   │   ├── Messaging/           # conversations, messages
│   │   ├── Search/               # query builders, search logs
│   │   ├── Location/             # addresses, service areas, map provider adapters
│   │   ├── Settings/             # settings store, CMS pages, legal documents
│   │   ├── Localization/         # languages, translations, currencies, tax
│   │   ├── Reporting/
│   │   └── Audit/                 # activity log wrapper
│   │
│   │   # Each Domain/{Module} follows this internal shape:
│   │   #   Models/
│   │   #   DTOs/                  data transfer objects in/out of services
│   │   #   Repositories/          {X}RepositoryInterface + Eloquent{X}Repository
│   │   #   Services/              orchestration + business rules, DB transactions live here
│   │   #   Actions/               single-purpose invokable classes for one business action
│   │   #   Policies/
│   │   #   Events/ Listeners/
│   │   #   Notifications/
│   │   #   Exceptions/            domain-specific exceptions
│   │
│   ├── Http/
│   │   ├── Controllers/Api/V1/{Module}/     # thin: validate via Request, call a Service/Action, return a Resource
│   │   ├── Requests/{Module}/               # FormRequest per endpoint, houses validation rules
│   │   ├── Resources/{Module}/              # API Resource transformers
│   │   ├── Middleware/                      # EnsureVendorApproved, EnsureFeatureEnabled, ForceJsonResponse, etc.
│   │   └── Kernel.php
│   │
│   ├── Providers/
│   │   ├── PaymentGatewayServiceProvider.php   # binds driver manager, registers Stripe/PayPal/Offline adapters
│   │   ├── MapProviderServiceProvider.php      # binds Leaflet/OSM (default) + Google adapters
│   │   ├── RepositoryServiceProvider.php       # binds every {X}RepositoryInterface -> Eloquent{X}Repository
│   │   └── EventServiceProvider.php
│   │
│   ├── Support/
│   │   ├── Managers/            # PaymentGatewayManager, MapProviderManager (Laravel Manager pattern)
│   │   ├── FeatureGate/         # FeatureGate::allows($vendor, 'chat'), ::limit($vendor,'max_services')
│   │   └── Money/               # Money value object (minor units + currency)
│   │
│   └── Console/Commands/         # e.g. RenewSubscriptions, ExpireQuotes, RollOverUsageCounters
│
├── config/
│   ├── services.php               # payment.default, map.default, notification.default drivers
│   ├── marketplace.php            # non-DB structural config: driver class maps, cache TTLs
│   └── ...
│
├── database/
│   ├── migrations/                # one migration group per module, prefixed by domain for readability
│   ├── factories/
│   └── seeders/                   # RolePermissionSeeder, SubscriptionPlanSeeder, CategorySeeder, SettingsSeeder
│
├── routes/
│   ├── api.php                    # includes routes/api/*.php per module, all under /api/v1
│   └── api/
│       ├── auth.php identity.php vendor.php catalog.php booking.php payment.php
│       ├── wallet.php subscription.php review.php messaging.php admin.php ...
│
├── tests/
│   ├── Unit/{Module}/             # services, actions, value objects
│   └── Feature/{Module}/          # HTTP endpoint tests, one file per controller
│
└── docs/api/                      # generated Swagger/OpenAPI (via l5-swagger or scramble)
```

**Why Repository + Service instead of "fat models" or "controllers call Eloquent directly":** the brief mandates Repository Pattern, Service Pattern, and testability; it also means payment/map providers, commission math, and subscription-limit checks are unit-testable without booting HTTP.

## 2. React Admin/Web App (`/frontend`)

Feature-based (colocation over type-based folders), matching how React Query + route-based code-splitting actually get consumed.

```
frontend/
├── src/
│   ├── app/
│   │   ├── router/                 # React Router route tree, one file per area (admin, vendor, customer, auth)
│   │   ├── providers/              # QueryClientProvider, ThemeProvider (MUI + dark mode), AuthProvider
│   │   └── layouts/                 # AdminLayout, VendorLayout, CustomerLayout, AuthLayout
│   │
│   ├── features/
│   │   ├── auth/                   # login, register, OTP verify, 2FA, password reset
│   │   ├── vendors/                 # admin: vendor list/approve/KYC review | vendor: own profile
│   │   ├── catalog/                  # categories (admin), services CRUD (vendor), service browse (customer)
│   │   ├── bookings/                  # booking calendar, booking detail, quote flow
│   │   ├── payments/                   # checkout, invoices, transaction history
│   │   ├── wallet/                      # vendor wallet, payout requests
│   │   ├── subscriptions/                # plan picker, billing, usage meters
│   │   ├── reviews/
│   │   ├── messaging/
│   │   ├── settings/                      # admin platform settings, CMS, localization
│   │   └── reports/
│   │   #   Each feature/{X} follows: api/ (React Query hooks calling the API client),
│   │   #   components/, pages/, types.ts, schema.ts (Zod/RHF validation mirrors backend rules)
│   │
│   ├── shared/
│   │   ├── components/              # DataTable, StatCard, EmptyState, ErrorState, SkeletonX — the design system
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api-client.ts         # axios/fetch instance, interceptors (auth, error normalization)
│   │   │   └── query-keys.ts
│   │   └── utils/
│   │
│   ├── theme/                        # MUI theme tokens (light/dark), spacing scale, typography
│   └── i18n/                          # translation bundles, matches backend `languages`/`translations`
│
└── tests/                              # Vitest + React Testing Library, colocated per feature preferred
```

## 3. Flutter Mobile App (`/mobile`)

```
mobile/
├── lib/
│   ├── app.dart                       # MaterialApp.router, theme wiring
│   ├── core/
│   │   ├── router/                     # go_router route tree + redirect guards (auth, role)
│   │   ├── network/                    # Dio client, interceptors, offline queue
│   │   ├── theme/                       # Material 3 ColorScheme (light/dark), typography
│   │   └── storage/                      # local cache (Hive/Isar) for offline support
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── vendor_onboarding/            # vendor-facing app or vendor mode within customer app
│   │   ├── catalog/
│   │   ├── booking/
│   │   ├── payments/
│   │   ├── chat/
│   │   ├── reviews/
│   │   └── profile/
│   │   #   Each feature/{X}: data/ (Dio repositories), domain/ (models, riverpod providers),
│   │   #   presentation/ (screens, widgets)
│   │
│   └── shared/
│       ├── widgets/
│       └── utils/
│
└── test/
```

**Why this split:** whether the Flutter app ships as one universal app with a role switch or two separate apps (customer / vendor) is a product decision, not an architecture one — the `features/` layout above works either way since each feature module is self-contained.
