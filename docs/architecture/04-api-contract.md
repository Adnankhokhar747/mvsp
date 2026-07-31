# REST API Contract

Full endpoint-by-endpoint specs belong in generated OpenAPI/Swagger (`docs/api/`, generated from code annotations — see [00-overview.md](00-overview.md) stack). This document fixes the conventions and the endpoint map so the Swagger output has a consistent shape to grow into.

## 1. Conventions

- Base path: `/api/v1/...` — version in the URL, not a header; a breaking change ships as `/api/v2` alongside `/v1` until deprecated.
- Auth: `Authorization: Bearer {sanctum_token}` for mobile; cookie-session + CSRF for the React SPA. Both hit the same controllers.
- Response envelope:
  ```json
  { "data": {}, "meta": {}, "message": "optional human string" }
  ```
  Collections: `{ "data": [...], "meta": { "pagination": { "current_page", "per_page", "total", "last_page" } } }` — standard Laravel `AnonymousResourceCollection` pagination shape, never a bespoke one.
- Errors:
  ```json
  { "message": "The given data was invalid.", "errors": { "field": ["rule failed"] } }
  ```
  HTTP status carries the semantics (422 validation, 401 unauthenticated, 403 unauthorized, 404, 409 conflict — e.g. slot already booked, 429 rate-limited, 500).
- Filtering/sorting on list endpoints: `?filter[status]=active&sort=-created_at&include=category,vendor` (`spatie/laravel-query-builder` conventions) — kept uniform across every module rather than each controller inventing its own query params.
- Idempotency: all payment-initiating POSTs accept an `Idempotency-Key` header, stored against the transaction to prevent double-charge on retry.
- Rate limiting: per-route throttle groups — `auth` (strict, brute-force target), `api` (standard authenticated), `public` (search/browse, IP-based).

## 2. Endpoint map

### Auth & Identity
```
POST   /auth/register                     customer or vendor signup (role param)
POST   /auth/login
POST   /auth/logout
POST   /auth/otp/send                     email/phone verification or 2FA
POST   /auth/otp/verify
POST   /auth/password/forgot
POST   /auth/password/reset
GET    /me                                current user + role + permissions
PATCH  /me
GET    /me/sessions                       device sessions
DELETE /me/sessions/{id}                  revoke a device
POST   /me/2fa/enable | disable
```

### Vendors
```
POST   /vendors                            create vendor profile (post-registration onboarding)
GET    /vendors/{vendor}                    public profile
PATCH  /vendors/{vendor}
GET    /vendors/{vendor}/kyc-documents
POST   /vendors/{vendor}/kyc-documents
GET    /vendors/{vendor}/staff
POST   /vendors/{vendor}/staff/invite
DELETE /vendors/{vendor}/staff/{user}

# Admin
GET    /admin/vendors                       list/filter (status, category, country)
POST   /admin/vendors/{vendor}/approve
POST   /admin/vendors/{vendor}/reject
POST   /admin/vendors/{vendor}/suspend
GET    /admin/kyc-document-types
POST   /admin/vendors/{vendor}/kyc-documents/{doc}/review
```

### Catalog
```
GET    /categories                          tree, public
GET    /categories/{category}
POST   /admin/categories | PATCH | DELETE
GET    /services                             public search/browse (geo, category, price, rating filters)
GET    /services/{service}
POST   /vendor/services | PATCH | DELETE
POST   /vendor/services/{service}/media
PATCH  /vendor/services/{service}/availability
POST   /admin/services/{service}/moderate    approve/reject/feature
```

### Bookings
```
POST   /bookings                             create (slot: scheduled_at required; request: triggers quote flow)
GET    /bookings                              list, scoped by role
GET    /bookings/{booking}
PATCH  /bookings/{booking}/reschedule
POST   /bookings/{booking}/cancel
POST   /vendor/bookings/{booking}/quote        request-mode: vendor submits quote
POST   /bookings/{booking}/quote/accept | reject
POST   /vendor/bookings/{booking}/status        confirm/start/complete
GET    /services/{service}/availability         computed open slots for a date range
```

### Payments & Wallet
```
POST   /bookings/{booking}/pay                initiate payment (gateway param)
POST   /webhooks/payments/{gateway}            provider callbacks (Stripe/PayPal), signature-verified, no auth middleware
GET    /transactions                            scoped list
GET    /invoices/{invoice}                       + PDF download
POST   /transactions/{transaction}/refund
GET    /vendor/wallet
GET    /vendor/wallet/ledger
POST   /vendor/payouts                            request payout
GET    /admin/payouts | POST /admin/payouts/{id}/approve|reject
GET    /admin/payment-gateways | PATCH             enable/configure adapters
```

### Subscriptions
```
GET    /subscription-plans                       public, for pricing page
GET    /admin/subscription-plans | POST | PATCH | DELETE
GET    /admin/plan-features | POST | PATCH
GET    /vendor/subscription                        current plan + usage counters
POST   /vendor/subscription/subscribe
POST   /vendor/subscription/change-plan
POST   /vendor/subscription/cancel
```

### Reviews
```
POST   /bookings/{booking}/review
GET    /vendors/{vendor}/reviews
POST   /vendor/reviews/{review}/reply
POST   /admin/reviews/{review}/moderate
```

### Messaging
```
GET    /conversations
GET    /conversations/{conversation}/messages
POST   /conversations/{conversation}/messages
```
Delivered over Laravel Echo/WebSockets (Reverb or Pusher-free-tier-compatible driver) for real-time; REST above covers history + fallback send.

### Search & Location
```
GET    /search                                  unified service search (query, geo, filters) → search_logs
GET    /geocode                                  proxies configured map provider (Nominatim default)
GET    /addresses | POST | PATCH | DELETE          user's saved addresses
```

### Admin Platform
```
GET/PATCH /admin/settings/{group}                site, map, mail, payment, seo, booking
GET/POST/PATCH /admin/cms-pages
GET/POST/PATCH /admin/legal-documents
GET/POST/PATCH /admin/languages | /admin/currencies | /admin/tax-rules
GET/POST/PATCH /admin/notification-templates
GET       /admin/activity-logs
GET       /admin/reports/{type}                   revenue, bookings, vendor-performance, exports
GET       /admin/staff | POST | PATCH               staff accounts + role assignment
GET/POST  /admin/roles                              role + permission management
```

## 3. Webhooks (inbound)

| Source | Endpoint | Notes |
|---|---|---|
| Stripe | `/webhooks/payments/stripe` | signature verified via `Stripe-Signature` header, queued processing |
| PayPal | `/webhooks/payments/paypal` | signature/cert verification per PayPal SDK |

All webhook handlers: verify signature → enqueue a job → return 200 immediately. Business logic (marking transaction success, crediting wallet) happens in the queued job, not inline, so a slow DB never causes the provider to retry/duplicate.
