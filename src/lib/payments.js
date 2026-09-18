import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

// Env values are read on every call (not captured at module load) so that
// edits to .env.local are picked up without restarting the dev server and so a
// stale module cache can never hide a newly-added variable.
function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return { url, serviceKey, anonKey };
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

export function getSupabaseAdmin() {
  const { url, serviceKey } = supabaseConfig();
  const missing = [];
  if (!url) missing.push('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
  if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length > 0) {
    throw new Error(
      `Payment server is missing environment variables: ${missing.join(' + ')}. ` +
        'Set them in .env.local for local dev, and in your deployment platform ' +
        '(e.g. Vercel project Settings > Environment Variables) for production.'
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function verifyUser(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const { url, anonKey } = supabaseConfig();
  if (!url || !anonKey) return null;
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data?.user) return null;
  return {
    id: data.user.id,
    email: data.user.email || '',
    name:
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.name ||
      data.user.email?.split('@')[0] ||
      '',
  };
}

export async function fetchProducts(productIds) {
  const ids = [...new Set(productIds.map(Number))].filter((id) => Number.isInteger(id) && id > 0);
  if (ids.length === 0) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .select('id, name, description, image_url, price, price_min, price_max, category')
    .in('id', ids);
  if (error) throw new Error(error.message);
  return data || [];
}

// Unit price is always derived from the DB row, never from the client.
export function deriveUnit(product) {
  return Math.round(Number(product.price_min || product.price || 0) * 100) / 100;
}

export async function createLocalCartOrder({ user, lines, provider, notes }) {
  const items = lines.map((l) => ({
    product_id: Number(l.product_id),
    name: l.name,
    description: l.description || '',
    image_url: l.image_url || '',
    quantity: l.quantity,
    price: l.price,
  }));

  const total = Math.round(items.reduce((sum, it) => sum + it.price * it.quantity, 0) * 100) / 100;

  const payload = {
    user_id: user?.id || null,
    user_email: user?.email || '',
    full_name: user?.name || '',
    product_id: items.map((it) => String(it.product_id)).join(','),
    total_amount: total,
    items,
    provider,
    payment_method: provider,
    payment_status: 'pending',
    status: 'pending',
  };
  if (notes) payload.notes = notes;

  const { data, error } = await getSupabaseAdmin().from('orders').insert([payload]).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Paddle (Billing API)
// ---------------------------------------------------------------------------

export function paddleConfig() {
  const key = process.env.PADDLE_API_KEY || '';
  const sandbox = key.startsWith('pdl_sdbx_') || process.env.PADDLE_ENV === 'sandbox';
  return {
    base: sandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com',
    envName: sandbox ? 'sandbox' : 'production',
    key,
  };
}

async function paddleApi(path, options = {}) {
  const cfg = paddleConfig();
  if (!cfg.key) throw new Error('Paddle is not configured (PADDLE_API_KEY)');
  const res = await fetch(`${cfg.base}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.text();
  let json = null;
  try {
    json = JSON.parse(body);
  } catch {}
  if (!res.ok) {
    throw new Error(`Paddle API ${options.method || 'GET'} ${path} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return json;
}

// Creates ONE Paddle transaction for a local order. Every cart line is sent
// as a non-catalog item (inline price/product attributes), so the ~1,000
// products in our Supabase catalog are NEVER replicated into Paddle. Paddle
// assigns ids to these custom items but keeps them out of our product
// catalog. The transaction is created as a draft (no customer_id / address_id)
// and then opened through Paddle Checkout, which captures buyer details.
export async function createPaddleTransaction(order) {
  const items = (order?.items || []).map((item) => {
    const name = String(item.name || `Product ${item.product_id}`)
      .trim()
      .slice(0, 150) || 'Product';
    const description = (name.length >= 2 ? name : `Product ${name}`).slice(0, 500);
    const amountCents = String(Math.max(0, Math.round((Number(item.price) || 0) * 100)));
    return {
      quantity: Math.min(1000, Math.max(1, Math.floor(Number(item.quantity) || 1))),
      price: {
        description,
        name,
        unit_price: { amount: amountCents, currency_code: 'USD' },
        product: {
          name,
          description: item.description ? String(item.description).slice(0, 2048) : null,
          tax_category: 'standard',
          image_url: item.image_url || '',
        },
      },
    };
  });

  if (items.length === 0) throw new Error('Order has no items to charge for.');
  if (items.length > 100) throw new Error('Too many line items for one Paddle transaction.');

  const res = await paddleApi('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      items,
      currency_code: 'USD',
      collection_mode: 'automatic',
      custom_data: { order_id: String(order.id) },
    }),
  });

  const txn = res?.data;
  if (!txn?.id) throw new Error('Paddle did not return a transaction id.');
  return { transactionId: txn.id, status: txn.status, checkoutUrl: txn.checkout?.url || null };
}

export function verifyPaddleWebhookSignature(payload, signatureHeader) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET || '';
  if (!secret || !signatureHeader) return false;

  const parts = {};
  for (const pair of signatureHeader.split(/[;,]/)) {
    const [k, ...rest] = pair.split('=');
    if (k) parts[k.trim()] = rest.join('=');
  }
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  // Replay protection: reject signatures older than 5 minutes.
  const timestamp = Number(ts);
  if (!Number.isFinite(timestamp) || Date.now() / 1000 - timestamp > 300) return false;

  const signed = `${ts}:${payload}`;
  const expected = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(h1, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Order lifecycle (webhook-driven only — the frontend never marks orders paid)
// ---------------------------------------------------------------------------

// Maps a Paddle webhook event to one of our payment states:
// pending | paid | failed | canceled | refunded
function paddleEventState(event) {
  const type = event.type;
  const status = event.data?.status;
  switch (type) {
    case 'transaction.completed':
      return 'paid';
    case 'transaction.payment_failed':
      return 'failed';
    case 'transaction.canceled':
      return status === 'refunded' ? 'refunded' : 'canceled';
    case 'transaction.expired':
      return 'canceled';
    case 'transaction.updated':
      if (status === 'refunded') return 'refunded';
      if (status === 'billed' || status === 'completed') return 'paid';
      return null;
    default:
      return null;
  }
}

function extractTransactionId(links) {
  if (!Array.isArray(links)) return null;
  const tx = links.find((l) => l.rel === 'transaction' && l.href);
  return tx ? String(tx.href.split('/').filter(Boolean).pop()) : null;
}

export async function recordPaddleEvent(event) {
  const admin = getSupabaseAdmin();
  const data = event.data || {};

  let transactionId = data.id ? String(data.id) : null;
  if (!transactionId && data.links) transactionId = extractTransactionId(data.links);

  // Adjustments are how Paddle represents refunds (action === 'refund').
  let state = paddleEventState(event);
  if (!state && (event.type.startsWith('adjustment.') || event.type === 'transaction.refunded')) {
    if (data.action === 'refund' || data.type === 'refund' || event.type === 'transaction.refunded') {
      state = 'refunded';
    }
  }
  if (!state || !transactionId) return { handled: true, ignored: true };

  const orderId = data.custom_data?.order_id ? Number(data.custom_data.order_id) : null;

  // Find the matching local order (by id first, then by provider transaction).
  let existing = null;
  if (orderId && Number.isInteger(orderId)) {
    const { data: r } = await admin
      .from('orders')
      .select('id, payment_status, status, transaction_id')
      .eq('id', orderId)
      .maybeSingle();
    existing = r || null;
  }
  if (!existing) {
    const { data: r } = await admin
      .from('orders')
      .select('id, payment_status, status, transaction_id')
      .eq('provider', 'paddle')
      .eq('transaction_id', transactionId)
      .maybeSingle();
    existing = r || null;
  }

  const patch = {
    provider: 'paddle',
    transaction_id: transactionId,
    payment_details: {
      event_type: String(event.type || '').replace('transaction.', ''),
      transaction_status: data.status || null,
      currency: data.currency_code || 'USD',
      totals: data.details?.totals || null,
      captured_at: data.captured_at || null,
    },
  };

  if (data.customer?.email) patch.user_email = data.customer.email;
  if (data.customer?.id) patch.paddle_customer_id = data.customer.id;
  if (data.subscription_id) patch.paddle_subscription_id = data.subscription_id;

  const grandTotal = data.details?.totals?.grand_total;
  if (state === 'paid' && grandTotal != null) {
    patch.total_amount = Math.round(Number(grandTotal) * 100) / 100;
  }

  if (state === 'paid') {
    patch.status = 'confirmed';
    patch.payment_status = 'paid';
  } else if (state === 'failed') {
    patch.payment_status = 'failed';
  } else if (state === 'canceled') {
    patch.payment_status = 'canceled';
  } else if (state === 'refunded') {
    patch.payment_status = 'refunded';
  }

  if (existing) {
    // Idempotency: if the order is already in this state for this transaction,
    // skip the write (Paddle retries deliveries).
    if (existing.payment_status === patch.payment_status && existing.transaction_id === transactionId) {
      return { handled: true, duplicate: true };
    }
    const { data, error } = await admin
      .from('orders')
      .update(patch)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return { handled: true, state, updated: true, orderId: data.id };
  }

  // No local order exists (e.g. webhook arrived before the checkout route wrote
  // the order, or payment came through some other channel). Only create a row
  // for a completed payment so we never lose money data.
  if (state === 'paid') {
    const base = {
      status: 'confirmed',
      payment_status: 'paid',
      ...patch,
    };
    const { data, error } = await admin
      .from('orders')
      .upsert([base], { onConflict: 'provider,transaction_id' })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return { handled: true, state, upserted: true, orderId: data.id };
  }

  return { handled: true, state, ignored: true };
}

// Decrements product stock for an order. Called ONLY after the Paddle webhook
// confirms payment (never on order creation or frontend success). Idempotent
// because the webhook route only invokes it on the transition into 'paid'.
export async function decrementStockForOrder(orderId) {
  const admin = getSupabaseAdmin();
  const { data: order, error } = await admin
    .from('orders')
    .select('items')
    .eq('id', Number(orderId))
    .maybeSingle();
  if (error || !order?.items) return { skipped: true, reason: 'no-order' };

  const items = Array.isArray(order.items) ? order.items : [];
  const updated = [];
  for (const item of items) {
    const productId = Number(item.product_id);
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (!Number.isInteger(productId) || productId <= 0) continue;

    const { data: prod } = await admin
      .from('products')
      .select('stock')
      .eq('id', productId)
      .maybeSingle();
    if (!prod) continue;

    const next = Math.max(0, Number(prod.stock || 0) - qty);
    await admin.from('products').update({ stock: next }).eq('id', productId);
    updated.push({ product_id: productId, stock: next });
  }
  return { updated };
}