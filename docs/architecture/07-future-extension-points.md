# Future Extension Points

These are deliberately **not built now**. This document exists so the current architecture doesn't accidentally foreclose them — each entry says what hook already exists today and what would plug into it later.

## AI Features

| Future feature | Hook already in place | What plugs in later |
|---|---|---|
| AI Chatbot (support) | `Messaging` module's `conversations`/`messages` tables are provider-agnostic; a `sender_id` could be a bot user | A "bot" `users` row + an `AiReplyListener` on `MessageSent` event |
| AI Recommendations | `search_logs` + `bookings` + `reviews` already capture the behavioral data needed | A recommendation service reading this data, surfaced via a new `/recommendations` endpoint — no schema change needed |
| AI Search | `Search` module is already a query layer, not tightly coupled to SQL `LIKE` | Swap/augment with a vector search or Meilisearch driver behind the same `SearchService` interface |
| AI Description/SEO Generator | `services.description`, `categories.seo_meta` are plain text/json fields | An admin "Generate with AI" button calling an LLM, writing into the same fields — no new columns |
| AI Analytics | `Reporting` module already aggregates from transactional tables | Additional report `type` values computed by an AI-assisted service, same `report_exports` table |

**Guiding rule:** any AI feature should be introduced as a new Service/Action behind an interface (`RecommendationEngineInterface`, etc.) with a null/rule-based default implementation, so it's optional and swappable — never a hard dependency baked into a controller.

## White-Labeling & Licensing

- Current design is single-instance/multi-vendor (see [00-overview.md](00-overview.md) decision #1). White-labeling later means: a `brands`/`tenants` config layer (logo, colors, domain, default language) sitting above the existing `settings` table — most `settings` rows would gain an optional `tenant_id` scope column rather than requiring a schema rewrite.
- Licensing (e.g. selling this codebase as a product to other companies) is orthogonal to the SaaS marketplace itself — it would live as a separate "installer/license-check" concern, not something the marketplace schema needs to anticipate today.

## Future Countries / Languages / Currencies

Already first-class today, not deferred: `languages`, `currencies`, `tax_rules`, `translations` tables exist from launch (see [01-database-schema.md](01-database-schema.md) §14). Adding a country is a data operation (seed a currency, tax rule, language), not a code change.

## Future Payment Gateways

The `payment_gateways` table + adapter pattern (see [00-overview.md](00-overview.md) decision #5) means a new gateway is: implement `PaymentGatewayAdapterInterface`, register it with `PaymentGatewayManager`, add a config row. No changes to `Booking`/`Transaction` domain logic.

## Future APIs (third-party integrations, public API for partners)

The `/api/v1` versioning convention and Sanctum token auth already support this. A future "Partner API" would be a new route group (`/api/partners/v1`) with its own rate-limit tier and scoped tokens (Sanctum abilities), reusing the same underlying Services.

## Future Mobile Apps

The Flutter app's `features/` structure (see [03-folder-structure.md](03-folder-structure.md)) and the fact that all business logic lives server-side behind REST means a second mobile app (e.g. a dedicated vendor-only app, or a partner-branded app) is a new Flutter project consuming the same API — no backend change required.
