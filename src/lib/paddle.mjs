// Pure Paddle helpers shared by the server (API routes) and the client
// (Paddle.js). No dependencies so they can be unit-tested with `node --test`.
//
// Reference: https://developer.paddle.com
//  - Non-catalog items: https://developer.paddle.com/build/transactions/bill-create-custom-items-prices-products
//  - Client-side tokens: https://developer.paddle.com/paddle-js/about/client-side-tokens
//  - Create transaction: https://developer.paddle.com/api-reference/transactions/create-transaction

export const PADDLE_ENVIRONMENTS = ['sandbox', 'production'];

// Sandbox client-side tokens start with test_, live ones with live_,
// followed by exactly 27 alphanumeric characters.
export const CLIENT_TOKEN_PATTERN = /^(test|live)_[a-zA-Z0-9]{27}$/;

/** Resolve the Paddle environment from an explicit value, else the API key prefix. */
export function resolvePaddleEnvironment({ paddleEnv, apiKey } = {}) {
  const explicit = String(paddleEnv ?? '').trim().toLowerCase();
  if (PADDLE_ENVIRONMENTS.includes(explicit)) return explicit;
  const key = String(apiKey ?? '').trim();
  if (key.startsWith('pdl_live_')) return 'production';
  return 'sandbox';
}

/** Pick the API key for the environment, preferring the dedicated per-env keys. */
export function pickApiKey({ environment, sandboxKey, liveKey, fallbackKey } = {}) {
  const chosen = environment === 'production' ? liveKey || fallbackKey : sandboxKey || fallbackKey;
  return String(chosen ?? '').trim();
}

/**
 * Guard against the classic misconfiguration of pointing the app at a live key
 * while PADDLE_ENV says sandbox (or vice-versa).
 */
export function validateApiKeyForEnvironment(apiKey, environment) {
  const key = String(apiKey ?? '').trim();
  if (!key) {
    throw new Error(
      `Paddle ${environment} API key is missing. Set PADDLE_${environment === 'production' ? 'LIVE' : 'SANDBOX'}_API_KEY (or PADDLE_API_KEY).`
    );
  }
  if (key.startsWith('pdl_sdbx_') && environment !== 'sandbox') {
    throw new Error('PADDLE_ENV is "production" but the configured Paddle API key is a sandbox key (pdl_sdbx_).');
  }
  if (key.startsWith('pdl_live_') && environment !== 'production') {
    throw new Error('PADDLE_ENV is "sandbox" but the configured Paddle API key is a live key (pdl_live_).');
  }
  if (!key.startsWith('pdl_')) {
    throw new Error('The configured Paddle API key has an unrecognized format (expected a pdl_sdbx_ or pdl_live_ key).');
  }
  return true;
}

/**
 * Validate a Paddle.js client-side token against the environment it will be
 * used in. Throws an actionable error instead of letting Paddle.js fail with an
 * opaque 400 from the checkout service.
 */
export function validateClientToken(token, environment) {
  const value = String(token ?? '').trim();
  const target = environment === 'production' ? 'production' : 'sandbox';
  const expectedPrefix = target === 'production' ? 'live_' : 'test_';
  const envVar = target === 'production' ? 'NEXT_PUBLIC_PADDLE_LIVE_CLIENT_TOKEN' : 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN';

  if (!value) {
    throw new Error(
      `Paddle.js client-side token is missing for the ${target} environment. Create one in Paddle > Developer tools > Authentication > Client-side tokens and set ${envVar}.`
    );
  }
  if (value.startsWith('pdl_')) {
    throw new Error(
      `Paddle.js is configured with a Paddle API key, which must never be used in the browser. Set ${envVar} to a client-side token (${expectedPrefix}...).`
    );
  }
  const match = value.match(CLIENT_TOKEN_PATTERN);
  if (!match) {
    throw new Error(`Invalid Paddle client-side token format for ${envVar} (expected ${expectedPrefix} followed by 27 characters).`);
  }
  const kind = match[1];
  if (target === 'sandbox' && kind !== 'test') {
    throw new Error(
      `A live Paddle client-side token (live_) cannot be used in the sandbox environment. Set ${envVar} to a sandbox token (test_).`
    );
  }
  if (target === 'production' && kind !== 'live') {
    throw new Error(
      `A sandbox Paddle client-side token (test_) cannot be used in production. Set ${envVar} to a live token (live_).`
    );
  }
  return kind;
}

/**
 * Choose the client-side token for the active environment. Never falls back
 * across environments, so a mismatch surfaces as a clear validation error.
 */
export function clientTokenForEnvironment(environment, { sandboxToken, liveToken, legacyToken } = {}) {
  if (environment === 'production') return String(liveToken || legacyToken || '').trim();
  return String(sandboxToken || legacyToken || '').trim();
}

/**
 * Build the `items` array for `POST /transactions`.
 *
 * We bill every product as a non-catalog item (inline price + inline product)
 * so we never have to mirror our 1,000+ product catalog into Paddle. Paddle's
 * docs recommend exactly this for stores that "manage your product catalog
 * outside of Paddle" or have "lots of items". A non-catalog price/product only
 * requires: quantity, price.description (2-500), price.name (1-150),
 * price.unit_price.amount (integer string, lowest denomination) and
 * price.product.tax_category.
 */
export function buildTransactionItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order has no items to charge for.');
  }
  return items.map((item) => {
    const name = String(item.name || `Product ${item.product_id}`).trim().slice(0, 150) || 'Product';
    const description = (name.length >= 2 ? name : `Product ${name}`).slice(0, 500);

    const priceNumber = Number(item.price) || 0;
    const amount = Math.round(priceNumber * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Product "${name}" has no valid price to charge (got ${JSON.stringify(item.price)}).`);
    }

    const product = {
      name,
      tax_category: item.tax_category || 'standard',
    };
    if (item.description) product.description = String(item.description).slice(0, 2048);
    if (item.image_url) product.image_url = String(item.image_url);

    return {
      quantity: Math.min(1000, Math.max(1, Math.floor(Number(item.quantity) || 1))),
      price: {
        description,
        name,
        unit_price: { amount: String(amount), currency_code: 'USD' },
        product,
      },
    };
  });
}

/**
 * Paddle's checkout service rejects `settings.successUrl` / `settings.failureUrl`
 * with this error when the redirect domain is not approved for the account:
 *
 *   { name: 'checkout.error', type: 'api_error', code: 'validation',
 *     detail: 'validation.no_validation_set' }
 *
 * Approve the domain in Paddle > Checkout > Website approval (and use the same
 * domain as the default payment link) to use custom redirect URLs.
 */
export function isRedirectUrlConfigError(event) {
  const detail = String(event?.detail ?? '').trim().toLowerCase();
  return detail === 'validation.no_validation_set';
}

/** Actionable explanation for `validation.no_validation_set`. */
export function redirectUrlConfigMessage() {
  return (
    'Paddle rejected the checkout redirect URLs (validation.no_validation_set because the ' +
    'domain serving successUrl/failureUrl is not approved for this Paddle account). ' +
    'Approve it in Paddle > Checkout > Website approval and set the same domain as the ' +
    'default payment link. Checkout was reopened without custom redirect URLs so the ' +
    'purchase can still complete.'
  );
}

/**
 * Normalize a Paddle.js checkout error event into a stable shape. Kept separate
 * from presentation so the console log and the UI show identical fields.
 */
export function describeCheckoutError(event) {
  return {
    name: event?.name ? String(event.name) : null,
    type: event?.type ? String(event.type) : null,
    code: event?.code ? String(event.code) : null,
    detail: event?.detail ? String(event.detail) : null,
    documentation_url: event?.documentation_url ? String(event.documentation_url) : null,
  };
}

/** Turn a Paddle API error payload into a single developer-friendly line. */
export function summarizePaddleError(payload) {
  const error = payload?.error;
  if (!error) return '';
  const code = error.code ? String(error.code) : '';
  const detail = error.detail ? String(error.detail) : '';
  const message = error.message ? String(error.message) : '';
  const parts = [code, detail || message].filter(Boolean);
  return parts.join(': ');
}
