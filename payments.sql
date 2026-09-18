-- ============================================================================
-- Core Collective — Online Payments (Paddle only)
-- Run this in the Supabase SQL Editor (once).
--
-- The Supabase `products` and `orders` tables are the source of truth.
-- Paddle is used ONLY as the payment processor: at checkout we create a
-- single draft Paddle transaction whose items are non-catalog (inline
-- price/product attributes), so the ~1,000 products are NEVER replicated
-- into Paddle's catalog. The webhook matches the transaction back to our
-- order via custom_data.order_id.
--
-- 1) Adds the columns the payment system needs to the EXISTING orders table.
-- 2) Adds a unique index so the Paddle webhook can upsert a payment
--    idempotently (prevents duplicate processing on webhook retries).
-- 3) Stores the Paddle transaction / customer / subscription ids on the order.
-- ============================================================================

-- Payment provider (only 'paddle' is used end-to-end).
alter table public.orders
  add column if not exists provider text;

-- Paddle transaction id (webhook source of truth).
alter table public.orders
  add column if not exists transaction_id text;

-- Paddle-specific identifiers (populated by verified webhooks only).
alter table public.orders
  add column if not exists paddle_transaction_id text;
alter table public.orders
  add column if not exists paddle_customer_id text;
alter table public.orders
  add column if not exists paddle_subscription_id text;

-- payment_status lifecycle driven by the Paddle webhook:
--   pending -> paid | failed | canceled, paid -> refunded
-- (status text column; values validated in the application layer.)
alter table public.orders
  add column if not exists payment_status text default 'pending';

-- One payment can only appear once. Enables idempotent webhook upserts via:
-- insert ... on conflict (provider, transaction_id).
create unique index if not exists orders_provider_transaction_uidx
  on public.orders (provider, transaction_id)
  where transaction_id is not null;

-- Index for "my orders" reads by user.
create index if not exists orders_user_id_idx
  on public.orders (user_id);

comment on column public.orders.provider is 'Payment provider: paddle';
comment on column public.orders.transaction_id is 'Paddle transaction id (from verified webhook)';
comment on column public.orders.paddle_transaction_id is 'Paddle transaction id (same as transaction_id)';
comment on column public.orders.paddle_customer_id is 'Paddle customer id from the verified transaction';
comment on column public.orders.paddle_subscription_id is 'Paddle subscription id when the transaction belongs to a subscription (usually absent for one-time purchases)';
comment on column public.orders.payment_status is 'Payment state driven only by the Paddle webhook: pending | paid | failed | canceled | refunded';