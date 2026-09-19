# Paddle checkout

## Approach: non-catalog items (no product sync)

We do **not** mirror our 1,000+ product catalog into Paddle. Every order line is
billed as a **non-catalog item**: the checkout API creates a draft transaction
with an inline price and inline product (`buildTransactionItems` in
`src/lib/paddle.mjs`), then Paddle.js opens the checkout by `transactionId`.

This is Paddle's supported approach for stores that "manage your product catalog
outside of Paddle" or have "lots of items, or where item prices may change a
lot". See:

- Bill for non-catalog items: https://developer.paddle.com/build/transactions/bill-create-custom-items-prices-products
- Create a transaction: https://developer.paddle.com/api-reference/transactions/create-transaction

Product eligibility / catalog requirements for a non-catalog item:

- `quantity` (1–1000), max **100 line items** per transaction.
- `price.description` (2–500 chars) and `price.name` (1–150 chars).
- `price.unit_price.amount`: integer **string in the lowest denomination** (cents), `currency_code: "USD"`.
- `price.product.tax_category` (e.g. `standard` for physical goods).
- A **default payment link** must be set on the account and checkouts must be enabled.

Because nothing is written to Paddle's catalog, there is no backfill script and
no ongoing product sync to maintain. Prices always come from our database at
checkout time, so a price change needs no Paddle-side update.

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `PADDLE_ENV` | `sandbox` or `production` — the single switch for the whole integration. |
| `PADDLE_SANDBOX_API_KEY` | Sandbox API key (`pdl_sdbx_...`). Preferred over the legacy `PADDLE_API_KEY`. |
| `PADDLE_LIVE_API_KEY` | Live API key (`pdl_live_...`). Kept separate; unused until going live. |
| `PADDLE_API_KEY` | Legacy fallback for either environment. |
| `NEXT_PUBLIC_PADDLE_ENV` | Mirrors `PADDLE_ENV` for the browser (fail-fast token validation). |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Sandbox client-side token (`test_...`). |
| `NEXT_PUBLIC_PADDLE_LIVE_CLIENT_TOKEN` | Live client-side token (`live_...`). |
| `PADDLE_WEBHOOK_SECRET` | Webhook signing secret; required to mark orders paid. |

API keys are **never** sent to the browser. Only client-side tokens are public.

## Sandbox dashboard setup

1. **Sandbox dashboard**: https://sandbox-vendors.paddle.com
2. **Developer tools → Authentication → Client-side tokens → New client-side token.**
   Copy the `test_...` value into `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`.
   (The API key cannot manage client tokens; this step is dashboard-only.)
3. **Checkout → Checkout settings → Default payment link**: set a sandbox URL
   (e.g. `https://buy-allproduts-corecollective.vercel.app`). Sandbox allows any
   domain; production requires an **approved** domain.
4. Finish onboarding so checkouts are enabled for the account.

Sandbox test card: `4242 4242 4242 4242`, any future expiry, CVC `100`.

## Commands

```bash
npm test                          # unit tests for src/lib/paddle.mjs
node scripts/paddle-diagnose.mjs  # config + real sandbox transaction probe (no secrets printed)
node scripts/paddle-sandbox-setup.mjs  # store a sandbox client token in .env.local (needs client_token permission)
```

## Going live

1. Set `PADDLE_ENV=production`, `NEXT_PUBLIC_PADDLE_ENV=production`.
2. Set `PADDLE_LIVE_API_KEY` and `NEXT_PUBLIC_PADDLE_LIVE_CLIENT_TOKEN`.
3. Approve the production domain in Paddle and set the production default payment link.
4. Configure the production webhook and `PADDLE_WEBHOOK_SECRET`.
