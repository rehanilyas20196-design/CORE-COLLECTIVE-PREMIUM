import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePaddleEnvironment,
  pickApiKey,
  validateApiKeyForEnvironment,
  validateClientToken,
  clientTokenForEnvironment,
  buildTransactionItems,
  summarizePaddleError,
} from './paddle.mjs';

const SANDBOX_KEY = 'pdl_sdbx_' + 'a'.repeat(60);
const LIVE_KEY = 'pdl_live_' + 'b'.repeat(60);
const SANDBOX_TOKEN = 'test_' + 'c'.repeat(27);
const LIVE_TOKEN = 'live_' + 'd'.repeat(27);

test('resolvePaddleEnvironment prefers an explicit PADDLE_ENV', () => {
  assert.equal(resolvePaddleEnvironment({ paddleEnv: 'sandbox', apiKey: LIVE_KEY }), 'sandbox');
  assert.equal(resolvePaddleEnvironment({ paddleEnv: 'production', apiKey: SANDBOX_KEY }), 'production');
  assert.equal(resolvePaddleEnvironment({ paddleEnv: 'PRODUCTION' }), 'production');
});

test('resolvePaddleEnvironment falls back to the API key prefix, then sandbox', () => {
  assert.equal(resolvePaddleEnvironment({ apiKey: SANDBOX_KEY }), 'sandbox');
  assert.equal(resolvePaddleEnvironment({ apiKey: LIVE_KEY }), 'production');
  assert.equal(resolvePaddleEnvironment({}), 'sandbox');
});

test('pickApiKey selects the per-environment key with a legacy fallback', () => {
  assert.equal(pickApiKey({ environment: 'sandbox', sandboxKey: SANDBOX_KEY, liveKey: LIVE_KEY }), SANDBOX_KEY);
  assert.equal(pickApiKey({ environment: 'production', sandboxKey: SANDBOX_KEY, liveKey: LIVE_KEY }), LIVE_KEY);
  assert.equal(pickApiKey({ environment: 'sandbox', fallbackKey: SANDBOX_KEY }), SANDBOX_KEY);
  assert.equal(pickApiKey({ environment: 'sandbox' }), '');
});

test('validateApiKeyForEnvironment rejects missing and mismatched keys', () => {
  assert.equal(validateApiKeyForEnvironment(SANDBOX_KEY, 'sandbox'), true);
  assert.equal(validateApiKeyForEnvironment(LIVE_KEY, 'production'), true);
  assert.throws(() => validateApiKeyForEnvironment('', 'sandbox'), /missing/i);
  assert.throws(() => validateApiKeyForEnvironment(SANDBOX_KEY, 'production'), /sandbox key/i);
  assert.throws(() => validateApiKeyForEnvironment(LIVE_KEY, 'sandbox'), /live key/i);
  assert.throws(() => validateApiKeyForEnvironment('not-a-paddle-key', 'sandbox'), /unrecognized format/i);
});

test('validateClientToken accepts correctly-scoped tokens', () => {
  assert.equal(validateClientToken(SANDBOX_TOKEN, 'sandbox'), 'test');
  assert.equal(validateClientToken(LIVE_TOKEN, 'production'), 'live');
});

test('validateClientToken rejects missing token, API keys, wrong format and env mismatch', () => {
  assert.throws(() => validateClientToken('', 'sandbox'), /missing/i);
  assert.throws(() => validateClientToken(SANDBOX_KEY, 'sandbox'), /never be used in the browser/i);
  assert.throws(() => validateClientToken('test_short', 'sandbox'), /format/i);
  assert.throws(() => validateClientToken(LIVE_TOKEN, 'sandbox'), /live Paddle client-side token/i);
  assert.throws(() => validateClientToken(SANDBOX_TOKEN, 'production'), /sandbox Paddle client-side token/i);
});

test('clientTokenForEnvironment never falls back across environments', () => {
  assert.equal(clientTokenForEnvironment('sandbox', { sandboxToken: SANDBOX_TOKEN, liveToken: LIVE_TOKEN }), SANDBOX_TOKEN);
  assert.equal(clientTokenForEnvironment('production', { sandboxToken: SANDBOX_TOKEN, liveToken: LIVE_TOKEN }), LIVE_TOKEN);
  // In production, a legacy sandbox token is returned so validation can produce
  // a clear error rather than silently failing inside Paddle.js.
  assert.equal(clientTokenForEnvironment('production', { legacyToken: SANDBOX_TOKEN }), SANDBOX_TOKEN);
});

test('buildTransactionItems builds non-catalog price + product items', () => {
  const items = buildTransactionItems([
    {
      product_id: 42,
      name: 'Running Shorts',
      description: 'Lightweight training shorts',
      image_url: 'https://example.com/shorts.jpg',
      price: 7.22,
      quantity: 2,
    },
  ]);

  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 2);
  assert.equal(items[0].price.unit_price.amount, '722');
  assert.equal(items[0].price.unit_price.currency_code, 'USD');
  assert.equal(items[0].price.name, 'Running Shorts');
  assert.equal(items[0].price.description, 'Running Shorts');
  assert.equal(items[0].price.product.tax_category, 'standard');
  assert.equal(items[0].price.product.image_url, 'https://example.com/shorts.jpg');
  assert.equal(items[0].price.product.description, 'Lightweight training shorts');
});

test('buildTransactionItems clamps quantity, rounds cents and omits empty fields', () => {
  const items = buildTransactionItems([
    { product_id: 1, name: 'A', price: 0.01, quantity: 0 },
    { product_id: 2, name: 'B', price: 10, quantity: 5000 },
  ]);
  assert.equal(items[0].quantity, 1);
  assert.equal(items[0].price.unit_price.amount, '1');
  assert.equal(items[1].quantity, 1000);
  assert.equal(items[1].price.unit_price.amount, '1000');
  assert.equal('image_url' in items[0].price.product, false);
  assert.equal('description' in items[0].price.product, false);
});

test('buildTransactionItems enforces description min length and name max length', () => {
  const longName = 'x'.repeat(200);
  const items = buildTransactionItems([{ product_id: 9, name: longName, price: 1, quantity: 1 }]);
  assert.equal(items[0].price.name.length, 150);
  assert.ok(items[0].price.description.length >= 2);
  assert.ok(items[0].price.description.length <= 500);
});

test('buildTransactionItems rejects empty orders and invalid prices', () => {
  assert.throws(() => buildTransactionItems([]), /no items/i);
  assert.throws(() => buildTransactionItems([{ product_id: 1, name: 'Free', price: 0, quantity: 1 }]), /no valid price/i);
  assert.throws(() => buildTransactionItems([{ product_id: 1, name: 'Bad', price: 'abc', quantity: 1 }]), /no valid price/i);
});

test('summarizePaddleError formats code and detail', () => {
  assert.equal(
    summarizePaddleError({ error: { code: 'transaction_checkout_not_enabled', detail: 'Checkouts are not enabled.' } }),
    'transaction_checkout_not_enabled: Checkouts are not enabled.'
  );
  assert.equal(summarizePaddleError({ error: { code: 'bad_request' } }), 'bad_request');
  assert.equal(summarizePaddleError({}), '');
});
