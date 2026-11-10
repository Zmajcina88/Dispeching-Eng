# Payment launch checklist — Dispatch English Coach

Status: **NOT LIVE.** The public app shows a disabled price preview only. No payment data is collected.

## Product
- Free placement test + lesson 1.
- One-time purchase **USD 19.99** for **30 days**, not a recurring subscription. No automatic charges.
- Renewals are separate user-initiated purchases.
- Progress survives expiration and renewal.
- Define whether renewal adds 30 days to the existing expiration or starts at purchase; recommended: extend from max(now, current expiry).
- Define clear refund policy and local tax/accounting treatment before launch.

## Accounts and authorization (must implement before enabling checkout)
1. Set up managed authentication and database (e.g. Supabase Auth + Postgres) under the business owner's account.
2. Store users, verified purchase transactions, entitlements (expires_at UTC), and progress server-side. Use row-level security.
3. Never use localStorage to decide premium access. Move premium lesson data to authenticated server endpoints; current index.html bundles all lesson text, so hiding buttons is **not security**.
4. Server must validate access on every premium content/AI request; never trust a browser timestamp. For offline access, use only a limited signed offline entitlement with a defined expiration and understand that strong revocation while offline is impossible.
5. Provide account deletion, privacy notice, terms, support contact, and appropriate consent.

## Paddle
1. Register and pass seller/business verification: https://www.paddle.com/
2. Create **one-time** digital product "Dispatch English Coach — 30-day access", price USD 19.99, **no billing interval**.
3. Configure checkout domain and public-facing policies. Test sandbox before live mode.
4. Create server-side checkout/transaction linked to authenticated user ID; do not let client choose price or account ID.
5. Validate webhook signature using the exact raw request body and Paddle signing secret. Accept paid/completed transactions only after validation.
6. Check transaction's expected product/price, currency, amount and status. Idempotency: transaction ID unique in database. Handle refunds/chargebacks and reconciliation.
7. In a DB transaction, grant/extend 30 days of entitlement on a verified purchase. Never grant based on success redirect or browser callback.
8. Keep API keys and webhook secrets in server-side environment variables, never in GitHub or public JavaScript.
9. Test: first purchase, renewal, duplicate webhook, delayed webhook, refund, expired access, user on second device, failed checkout, offline expiry.
10. Only then enable purchase button.

## Required owner-controlled accounts/secrets
- Paddle seller approval, verified business identity, payout details, Paddle sandbox/live API credentials and webhook signing secret.
- Auth/database project with production keys and admin control.
- Netlify environment configuration for server-side functions.
- Business/legal review: Serbian business registration activity, tax treatment, invoices, privacy, terms, refund handling.

## Current limitations
- No live checkout, account system, secure paywall, payment webhook, or synchronized progress exists yet.
- AI requires Netlify OPENAI_API_KEY and COACH_ACCESS_CODE, and usage budgeting/abuse controls.
- Existing app is a prototype, not ready to charge users.
