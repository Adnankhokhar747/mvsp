# Core UI/UX Flows

Design language: large spacing, rounded corners, minimal chrome, dark mode parity, skeleton loaders on every list/detail view, explicit empty and error states on every screen that fetches data (never a bare blank screen). Reference points: Stripe/Linear (admin density + clarity), Airbnb/Urban Company (discovery + booking warmth), Fiverr (vendor storefront).

## 1. Vendor onboarding & approval

```mermaid
flowchart TD
    A[Register as Vendor] --> B[Verify email/phone OTP]
    B --> C[Business Profile Form\nname, category, address, service area]
    C --> D[Upload KYC Documents\nadmin-configured required docs]
    D --> E[Status: Pending Approval]
    E --> F{Admin/KYC Reviewer\ndecision}
    F -->|Approve| G[Status: Approved]
    F -->|Reject| H[Status: Rejected\nreason shown, resubmit allowed]
    G --> I[Choose Subscription Plan\nFree tier available]
    I --> J[Vendor Dashboard unlocked]
    J --> K[Create first Service]
    H --> C
```

UX notes: the pending-approval screen shows a progress tracker (Profile ✓ → KYC ✓ → Review → Approved), not a dead-end "please wait." Rejection always carries a specific, admin-written reason field, never a generic "denied."

## 2. Customer booking — slot-based service (e.g. salon, tutor)

```mermaid
flowchart TD
    A[Browse/Search Services\nmap + list toggle] --> B[Service Detail Page]
    B --> C[Select Package/Variant]
    C --> D[Select Date]
    D --> E[Available Slots\ncomputed from service_availability\nminus existing bookings]
    E --> F[Select Slot + Staff optional]
    F --> G[Confirm Address\nif at-customer-location]
    G --> H[Review Summary + Price]
    H --> I[Choose Payment Method]
    I --> J[Pay]
    J --> K[Booking Confirmed]
    K --> L[Invoice generated]
    K --> M[Notification to Vendor]
    N[Booking Completed by Vendor] --> O[Customer prompted to Review]
```

Edge state: if the selected slot is taken between page-load and submit (race condition), the API returns `409` and the UI re-fetches availability inline rather than showing a dead error page — see [validation & edge cases](06-validation-and-edge-cases.md#booking-slot-race).

## 3. Customer booking — request/quote-based service (e.g. construction, consultant)

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant V as Vendor

    C->>S: Submit booking request (description, preferred dates, budget hint)
    S->>V: Notify: new quote request
    V->>S: Submit quote (price, duration, message)
    S->>C: Notify: quote received
    alt Customer accepts
        C->>S: Accept quote
        S->>C: Proceed to payment
        C->>S: Pay
        S->>V: Notify: booking confirmed
    else Customer rejects
        C->>S: Reject quote
        S->>V: Notify: quote rejected
    else Quote expires
        S->>V: Notify: quote expired
        S->>C: Notify: request closed
    end
```

## 4. Payment flow (gateway-agnostic)

```mermaid
flowchart TD
    A[Booking ready to pay] --> B{Enabled gateways\nadmin-configured}
    B -->|Stripe| C1[Stripe Elements/Checkout]
    B -->|PayPal| C2[PayPal redirect/SDK]
    B -->|Bank Transfer| C3[Show bank details + upload proof]
    B -->|Cash| C4[Mark as Cash on Delivery]
    C1 --> D[Webhook confirms payment]
    C2 --> D
    C3 --> E[Manual admin/vendor confirmation]
    C4 --> F[Confirmed on service completion]
    D --> G[Transaction: success]
    E --> G
    F --> G
    G --> H[Wallet credited\nminus commission]
    G --> I[Invoice issued]
```

## 5. Admin dashboard information architecture

```
Admin Shell (persistent sidebar, top bar with global search + notifications)
├── Overview (KPI cards: GMV, active vendors, bookings today, pending approvals)
├── Vendors (list → detail tabs: Profile | KYC | Services | Bookings | Financials)
├── Catalog (Categories tree editor with attribute-schema builder)
├── Bookings (all-bookings table, dispute queue)
├── Payments (transactions, refunds, payout approval queue, gateway config)
├── Subscriptions (plans + feature matrix editor, vendor subscription list)
├── Reviews (moderation queue)
├── Reports (revenue, vendor performance, exports)
├── Settings (general, map provider, mail, tax, languages/currencies, legal, notification templates)
├── Staff & Roles
└── Activity Log
```

## 6. Vendor dashboard information architecture

```
Vendor Shell (own-scope only, plan-usage banner if near a limit)
├── Overview (bookings today, revenue this month, rating, plan usage bars)
├── Services (list, create/edit with attribute form generated from category schema)
├── Bookings (calendar view for slot-based, kanban/queue for request-based quotes)
├── Wallet (balance, ledger, request payout)
├── Reviews (view + reply)
├── Staff (invite/manage vendor staff, if plan allows)
├── Messages (if plan allows chat)
└── Subscription (current plan, usage, upgrade)
```

## 7. Empty/error/loading state rules (applies to every screen above)

- **Loading:** skeleton matching the eventual layout (never a spinner-only screen for list/detail views).
- **Empty:** an illustration/icon + one-sentence explanation + a primary action (e.g. "No services yet — Create your first service").
- **Error:** what happened in plain language + a retry action; validation errors surface inline on the specific field, never only as a toast.
