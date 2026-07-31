# Validation Rules & Edge Cases

Validation lives in Laravel `FormRequest` classes on the backend (source of truth) and is mirrored in React (Zod/RHF) and Flutter form validators for instant feedback — never trust the client copy alone; the API re-validates everything.

## 1. Identity & Auth

| Rule | Detail |
|---|---|
| Email | RFC valid, unique per `users.email`, verified before full account activation |
| Phone | E.164 format, unique if provided, OTP-verifiable independently of email |
| Password | Min 8 chars, at least 1 letter + 1 number (configurable via `settings.group=security`), checked against a breached-password list (`Password::defaults()->uncompromised()`) |
| OTP | 6 digits, expires in 10 min (configurable), max 5 attempts then lockout + resend cooldown |

**Edge cases:**
- Registering with an email that exists but is unverified → resend verification instead of "email taken" error.
- OTP requested repeatedly → rate-limited (`throttle:otp`), not infinite resend.
- 2FA enabled then device lost → recovery codes flow, plus admin-assisted reset with mandatory identity re-verification (logged in audit trail).

## 2. Vendor Onboarding & KYC

| Rule | Detail |
|---|---|
| Business name | Required, 2–150 chars, profanity/reserved-word filter |
| KYC documents | File type/size limits from `settings`, virus-scanned on upload (queued job) before marked `pending` review |
| Required documents | Driven by `kyc_document_types.is_required` + `applicable_country_code` — a vendor in a country with no country-specific requirement still needs the global-required set |

**Edge cases:**
- Vendor resubmits after rejection → new document row, old one kept for audit (never overwritten), reviewer sees full history.
- Vendor deletes their account mid-approval with active bookings → soft-delete only; existing confirmed bookings must complete or be explicitly cancelled/refunded first, hard block on self-delete while `bookings.status IN (confirmed, in_progress)` exist.
- Country requires a document type not yet in `kyc_document_types` → surfaces as an admin task, not a silent gap (seed data should be reviewed per launch country, not assumed complete).

## 3. Catalog

| Rule | Detail |
|---|---|
| Category attribute_schema | Each field: `key, label, type (text\|number\|select\|boolean\|date), required, options[] (for select)` — `services.attributes` validated dynamically against the parent category's schema at save time via a custom `AttributeSchemaRule` |
| Service price | > 0 unless `price_type = quote` (then null/0 allowed, quote determines final price) |
| Service media | Min 1 image required to publish (`status = active`), max count/size from plan limits |

**Edge cases:**
- Category's attribute_schema changes after services already used the old schema → old `attributes` values for existing services are preserved as-is (never force-migrated); the edit form flags removed/changed fields for the vendor to update, doesn't hard-fail on load.
- Service moved to a different category → `attributes` re-validated against new schema; fields with no match are kept under an `_unmapped` key so data isn't silently lost, vendor prompted to complete new required fields before republishing.
- Vendor exceeds plan's `max_services` limit → creation blocked with a clear upgrade prompt (`FeatureGate::limit`), not a generic 403.

## 4. Booking & Scheduling

### Booking slot race
Two customers hit "confirm" on the same slot simultaneously. Mitigation: slot availability is re-checked inside a DB transaction with a row lock (`lockForUpdate` on the relevant `service_availability`/staff-time window) at booking-creation time, not just at UI render. Loser gets `409 Conflict` with a machine-readable reason (`slot_unavailable`) so the client can silently refresh availability and re-prompt, rather than showing a raw error.

| Rule | Detail |
|---|---|
| scheduled_at | Must fall within `service_availability`, must not overlap another `confirmed`/`in_progress` booking for the same staff/resource |
| Cancellation | Allowed only outside `booking_cancellation_policies.window_hours` for full refund; inside window → partial/no refund per policy, always shown to customer *before* they confirm booking, not after they try to cancel |
| Reschedule | Creates a new booking row linked via `rescheduled_from_id`; original marked `cancelled` with reason `rescheduled` — preserves history instead of mutating the original row |
| Quote expiry | `booking_quotes.expires_at` enforced by scheduled job (`ExpireQuotes`), not just checked lazily on read, so vendor-side reports of "pending quotes" stay accurate |

**Edge cases:**
- Vendor staff member removed/deactivated while they have future confirmed bookings → bookings are not auto-cancelled; admin/vendor gets a "reassign staff" prompt for each affected booking.
- Customer requests booking outside any vendor's service area for their address → search/booking blocked at query time (service not shown as bookable), not discovered only at payment.
- Timezone mismatch (vendor and customer in different timezones) → all `scheduled_at` stored UTC, displayed in each viewer's local timezone; slot picker always shows timezone label explicitly to avoid ambiguity.

## 5. Payments & Wallet

| Rule | Detail |
|---|---|
| Amount | Always computed server-side from `service`/`service_package`/accepted `quote` price at charge time — client-submitted price is never trusted, even if UI displayed it |
| Currency | Booking's currency fixed at creation; refunds always in original transaction currency |
| Idempotency | Required header on pay/refund/payout endpoints; duplicate key within TTL returns the original result, doesn't double-process |

**Edge cases:**
- Webhook arrives before the customer's browser redirect-back confirmation → webhook is authoritative; browser-side "success" screen polls/waits for the transaction's real status rather than assuming success from the redirect alone.
- Partial refund requested exceeding remaining refundable amount → blocked server-side (`sum(refunds) <= transaction.amount`), regardless of what the admin UI form allowed client-side.
- Payout requested exceeding wallet balance (including any pending-hold from open disputes) → blocked; disputed-booking amounts are held (`wallet_ledger_entries` type `hold`) until dispute resolves.
- Currency exchange rate updates between booking creation and payment capture → the `fx_rate` snapshotted at transaction creation is used for that transaction; it is never recalculated retroactively.

## 6. Subscriptions

| Rule | Detail |
|---|---|
| Plan downgrade | Blocked if vendor's current usage exceeds the target plan's limits (e.g. 10 active services, downgrading to a 5-service plan) — must reduce usage first or the request is rejected with the specific over-limit features listed |
| Trial | One trial per vendor per plan family (tracked to prevent trial-cycling by re-registering) |
| Usage counters | Reset on `period_start`/`period_end` rollover via scheduled job, not on next read, so dashboards show correct data even if the vendor doesn't log in during rollover |

**Edge cases:**
- Subscription expires (payment failed, `past_due` → `expired`) while vendor has active bookings → existing bookings still honored/completable; only *new* service creation / plan-gated features are blocked until renewal.
- Feature flag removed from a plan vendors are actively using (e.g. `chat_enabled` turned off platform-wide for the Free plan) → existing conversations become read-only, not deleted; new messages blocked with an upgrade prompt.

## 7. Reviews

| Rule | Detail |
|---|---|
| One review per booking | Enforced by unique constraint on `reviews.booking_id`, only after `bookings.status = completed` |
| Vendor reply | One reply per review (`vendor_reply` column, not a thread) — keeps moderation simple |

**Edge cases:**
- Customer never reviews → no forced review; vendor rating simply excludes that booking, avg_rating recalculated only from submitted reviews.
- Flagged review under dispute → hidden from public view immediately on flag (status `flagged`), pending moderation, rather than staying visible until a decision is made.
