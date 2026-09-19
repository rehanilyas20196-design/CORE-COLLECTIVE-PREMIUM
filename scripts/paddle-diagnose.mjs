// Paddle sandbox diagnostic. Exercises the REAL server module
// (src/lib/payments.js) against the Paddle sandbox and never prints secrets.
//
// Usage: node scripts/paddle-diagnose.mjs
import { readFileSync } from 'node:fs';

function loadEnv(path = '.env.local') {
  const out = {};
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      out[m[1]] = v;
    }
  } catch {}
  return out;
}

const env = loadEnv();
for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v;

function keyKind(k) {
  if (k.startsWith('pdl_sdbx_')) return 'pdl_sdbx_ (sandbox)';
  if (k.startsWith('pdl_live_')) return 'pdl_live_ (production)';
  return k ? 'unrecognized prefix' : 'missing';
}
function tokenKind(t) {
  if (t.startsWith('test_')) return 'test_ (sandbox client token)';
  if (t.startsWith('live_')) return 'live_ (production client token)';
  if (t.startsWith('pdl_')) return 'API key used as client token (WRONG)';
  return t ? 'unrecognized prefix' : 'MISSING';
}

const { paddleConfig, createPaddleTransaction } = await import('../src/lib/payments.js');

const clientToken = (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '').trim();
console.log('=== Paddle configuration ===');
const cfg = paddleConfig();
console.log(`environment: ${cfg.envName}`);
console.log(`base URL: ${cfg.base}`);
console.log(`API key: ${keyKind(cfg.key)} len=${cfg.key.length}`);
console.log(`client token: ${tokenKind(clientToken)} len=${clientToken.length}`);
console.log(`live client token: ${process.env.NEXT_PUBLIC_PADDLE_LIVE_CLIENT_TOKEN ? 'set' : 'not set'}`);
console.log(`webhook secret: ${process.env.PADDLE_WEBHOOK_SECRET?.trim() ? 'set' : 'MISSING'}`);
console.log(`NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL ?? '(unset)'}`);
console.log('');

async function get(path) {
  const res = await fetch(`${cfg.base}${path}`, { headers: { Authorization: `Bearer ${cfg.key}` } });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json };
}

const products = await get('/products?per_page=1');
console.log(`GET /products -> ${products.status} (catalog products returned: ${products.json?.data?.length ?? '?'})`);

// Exercise the real createPaddleTransaction (non-catalog inline item).
const order = {
  id: `diagnostic-${Date.now()}`,
  items: [
    {
      product_id: 1,
      name: 'Diagnostic Test Item',
      description: 'Paddle sandbox connectivity check',
      image_url: 'https://example.com/diagnostic.png',
      price: 7.22,
      quantity: 1,
    },
  ],
};
try {
  const txn = await createPaddleTransaction(order);
  console.log(`POST /transactions -> ${txn.status}`);
  console.log(`  transaction id: ${txn.transactionId}`);
  console.log(`  checkout.url: ${txn.checkoutUrl ?? '(none)'}`);
  const full = await get(`/transactions/${txn.transactionId}`);
  const price = full.json?.data?.items?.[0]?.price;
  console.log(`GET /transactions/{id} -> ${full.status}`);
  console.log(`  price type: ${price?.type ?? '?'}  product_id: ${price?.product_id ?? '?'}`);
  console.log(`  unit_price: ${price?.unit_price?.amount ?? '?'} ${price?.unit_price?.currency_code ?? '?'}`);
  console.log(`  grand_total: ${full.json?.data?.details?.totals?.grand_total ?? '?'}`);
} catch (err) {
  console.log(`POST /transactions -> FAILED: ${err.message}`);
  if (err.paddleError) console.log('  paddle error:', JSON.stringify(err.paddleError));
  process.exitCode = 1;
}
