// End-to-end sandbox check for Paddle.js checkout.
//
// 1. Creates a draft transaction with the real server module (src/lib/payments.js).
// 2. Serves a harness page that initializes Paddle.js with a sandbox client-side
//    token and opens Checkout, mirroring the app's real `settings`
//    (src/components/checkout/PaddleCheckout.jsx).
// 3. Drives headless Chrome over the DevTools Protocol and reports the raw
//    Paddle.js events, including checkout.error `code` / `detail`, plus the raw
//    response body from the failing checkout-service call.
//
// The client-side token is sourced from NEXT_PUBLIC_PADDLE_CLIENT_TOKEN or, if
// absent, from the deployed bundle (client-side tokens are public by design).
// It is never printed in full.
//
// Usage:
//   node scripts/paddle-checkout-e2e.mjs [--settings full|none|no-frame|urls|display]
//   PADDLE_E2E_SETTINGS=no-frame node scripts/paddle-checkout-e2e.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
// Random port per run: a fixed port can be hijacked by a leftover headless
// Chrome from a previous run, which would silently report the wrong page.
const DEBUG_PORT = 9000 + Math.floor(Math.random() * 900);

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const settingsMode = argValue('--settings') || process.env.PADDLE_E2E_SETTINGS || 'full';

const deployedUrl =
  argValue('--url') || 'https://buy-allproduts-corecollective.vercel.app/checkout';
const siteOrigin = deployedUrl.replace(/\/checkout.*$/, '');

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

const TOKEN_RE = /(test|live)_[A-Za-z0-9]{27}/;

function tokenFromLocal() {
  const t = (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '').trim();
  return /^test_[A-Za-z0-9]{27}$/.test(t) ? t : null;
}

async function tokenFromDeployed() {
  const page = await (await fetch(deployedUrl, { redirect: 'follow' })).text();
  const scripts = [...page.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  for (const src of scripts) {
    const body = await (await fetch(new URL(src, deployedUrl).href)).text();
    const m = body.match(TOKEN_RE);
    if (m) return m[0];
  }
  return null;
}

const token = tokenFromLocal() || (await tokenFromDeployed());
if (!token) throw new Error('No sandbox client-side token found locally or in the deployed bundle.');
console.log(`client token: ${token.slice(0, 5)}${'*'.repeat(27)} (${token.startsWith('test_') ? 'sandbox' : 'LIVE'})`);

const { createPaddleTransaction } = await import('../src/lib/payments.js');
const txn = await createPaddleTransaction({
  id: `e2e-${Date.now()}`,
  items: [
    {
      product_id: 1,
      name: 'E2E Checkout Item',
      description: 'Headless e2e check',
      image_url: 'https://example.com/e2e.png',
      price: 12.34,
      quantity: 1,
    },
  ],
});
console.log(`transaction: ${txn.transactionId} (status ${txn.status})`);

// Settings variants, to isolate which key (if any) changes the outcome.
function settingsFor(origin) {
  const all = {
    displayMode: 'overlay',
    frameTarget: 'self',
    theme: 'light',
    locale: 'en',
    successUrl: `${origin}/success?order_id=1&provider=paddle&amount=12.34`,
    failureUrl: `${origin}/checkout?cancel=1`,
  };
  switch (settingsMode) {
    case 'none':
      return null;
    case 'no-frame': {
      const { frameTarget, ...rest } = all;
      return rest;
    }
    case 'urls':
      return { successUrl: all.successUrl, failureUrl: all.failureUrl };
    case 'app-urls':
      // The exact URLs the deployed app sends (https, real site origin).
      return {
        displayMode: 'overlay',
        successUrl: `${siteOrigin}/success?order_id=1&provider=paddle&amount=12.34`,
        failureUrl: `${siteOrigin}/checkout?cancel=1`,
      };
    case 'app-urls-1500': {
      // Same, but pointing at the site root instead of a deep link.
      const o = siteOrigin.replace(/^https?:\/\//, 'https://');
      return { displayMode: 'overlay', successUrl: `${o}/success`, failureUrl: `${o}/checkout` };
    }
    case 'display':
      return { displayMode: all.displayMode, theme: all.theme, locale: all.locale };
    default:
      return all;
  }
}

// Build the harness after the port is known so successUrl/failureUrl use the
// harness's own origin, exactly like the app uses window.location.origin.
function buildHarness(origin) {
  const settings = settingsFor(origin);
  const settingsJs = settings ? `, settings: ${JSON.stringify(settings)}` : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<script async src="https://cdn.paddle.com/paddle/v2/paddle.js"></script></head>
<body><pre id="out">RESULT:{"events":[{"stage":"start"}]}</pre>
<script>
window.__events = [];
function render(){ document.getElementById('out').textContent = 'RESULT:' + JSON.stringify({ events: window.__events }); }
function push(o){ window.__events.push(o); render(); }
window.onerror = function(m){ push({ stage: 'window.onerror', message: String(m) }); };
window.addEventListener('unhandledrejection', function(e){ push({ stage: 'unhandledrejection', message: String((e.reason && e.reason.message) || e.reason) }); });
// Capture the raw response body of the checkout-service call.
var _origFetch = window.fetch;
window.fetch = function(){
  var u = arguments[0];
  var url = String((u && u.url) || u || '');
  return _origFetch.apply(this, arguments).then(function(res){
    if (url.indexOf('checkout-service') !== -1 || url.indexOf('transaction-checkout') !== -1) {
      push({ stage: 'network', url: url.split('?')[0], status: res.status });
      res.clone().text().then(function(t){ push({ stage: 'network-body', status: res.status, body: t.slice(0, 2000) }); }).catch(function(){});
    }
    return res;
  });
};
// Wait for the (non-blocking) Paddle.js CDN script before using Paddle.
function whenPaddleReady(cb){ if (window.Paddle) return cb(); var n = 0; var t = setInterval(function(){ if (window.Paddle || ++n > 150) { clearInterval(t); cb(); } }, 200); }
whenPaddleReady(function(){
  try {
    if (!window.Paddle) { push({ stage: 'threw', message: 'Paddle.js CDN script did not load' }); return; }
    Paddle.Environment.set('sandbox');
    var retried = false;
    Paddle.Initialize({ token: ${JSON.stringify(token)}, eventCallback: function(e){
      if (!e) return;
      if (e.name === 'checkout.loaded') { push({ stage: 'event', name: e.name, txn: e.data && e.data.id }); return; }
      push({ stage: 'event', name: e.name, type: e.type, code: e.code, detail: e.detail, doc: e.documentation_url });
      // Mirror the app's recovery: Paddle rejects successUrl/failureUrl on an
      // unapproved domain, so reopen once without custom redirect URLs.
      if (e.detail === 'validation.no_validation_set' && !retried) {
        retried = true;
        push({ stage: 'retrying-without-redirect-urls' });
        Paddle.Checkout.open({ transactionId: ${JSON.stringify(txn.transactionId)} });
      }
    }});
    push({ stage: 'initialized' });
    Paddle.Checkout.open({ transactionId: ${JSON.stringify(txn.transactionId)}${settingsJs} });
    push({ stage: 'open-called' });
  } catch (err) { push({ stage: 'threw', message: String((err && err.message) || err) }); }
});
setTimeout(function(){ push({ stage: 'settled' }); }, 30000);
</script></body></html>`;
}

let harness = '';
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(harness);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const harnessUrl = `http://127.0.0.1:${server.address().port}/`;
harness = buildHarness(harnessUrl);
const harnessPath = join(tmpdir(), `paddle-harness-${settingsMode}.html`);
writeFileSync(harnessPath, harness);
console.log(`settings mode: ${settingsMode}`);
console.log(`harness: ${harnessUrl}`);
console.log(`harness html written: ${harnessPath}`);

const profile = join(tmpdir(), `paddle-e2e-${Date.now()}`);
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${DEBUG_PORT}`,
    harnessUrl,
  ],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findPageTarget(expectedUrl) {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      // Prefer the target that is actually our harness page; Chrome may expose
      // an about:blank target first.
      const pages = list.filter((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      const match = pages.find((t) => t.url && t.url.startsWith(expectedUrl));
      if (match) return match;
      if (i > 10 && pages.length) return pages[0];
    } catch {}
    await sleep(500);
  }
  throw new Error('Could not connect to Chrome DevTools.');
}

let result = null;
let ws;
try {
  const target = await findPageTarget(harnessUrl);
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', () => reject(new Error('WebSocket error')), { once: true });
  });

  let idCounter = 0;
  const evaluate = (expression) =>
    new Promise((resolve, reject) => {
      const id = ++idCounter;
      const timer = setTimeout(() => reject(new Error('eval timeout')), 8000);
      const onMessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id !== id) return;
        clearTimeout(timer);
        ws.removeEventListener('message', onMessage);
        resolve(msg.result?.result?.value);
      };
      ws.addEventListener('message', onMessage);
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
    });

  const deadline = Date.now() + 60000;
  let lastEvents = null;
  while (Date.now() < deadline) {
    await sleep(1000);
    const text =
      (await evaluate('document.getElementById("out") ? document.getElementById("out").textContent : ""')) || '';
    const m = text.match(/RESULT:(\{[\s\S]*\})/);
    if (!m) continue;
    const events = JSON.parse(m[1]).events || [];
    lastEvents = events;
    const loaded = events.some((e) => e.name === 'checkout.loaded');
    const settled = events.some((e) => e.stage === 'settled');
    // Only `loaded` and the 15s `settled` marker are terminal: an error can be
    // followed by a successful retry, so never stop on an error alone.
    if (loaded || settled) {
      result = events;
      break;
    }
  }
  if (!result && lastEvents) result = lastEvents;
} finally {
  try {
    ws?.close();
  } catch {}
  try {
    spawnSync('taskkill', ['/pid', String(chrome.pid), '/f', '/t'], { stdio: 'ignore' });
  } catch {}
  server.close();
}

if (!result) {
  console.log('RESULT: inconclusive — no checkout.loaded/checkout.error event captured.');
  process.exitCode = 1;
} else {
  console.log('browser events:');
  for (const e of result) console.log('  ' + JSON.stringify(e));
  const loaded = result.some((e) => e.name === 'checkout.loaded');
  const error = result.find((e) => e.name === 'checkout.error' || e.name === 'checkout.warning');
  if (loaded) {
    console.log('RESULT: checkout.loaded — Paddle.js opened the sandbox checkout successfully.');
    process.exitCode = 0;
  } else if (error) {
    console.log(`RESULT: checkout error -> ${error.type || '?'} ${error.code || '?'}: ${error.detail || '?'}`);
    if (error.doc) console.log(`docs: ${error.doc}`);
    process.exitCode = 1;
  } else {
    console.log('RESULT: inconclusive.');
    process.exitCode = 1;
  }
}
