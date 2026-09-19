// End-to-end sandbox check for Paddle.js checkout.
//
// 1. Creates a draft transaction with the real server module.
// 2. Serves a harness page that initializes Paddle.js with a sandbox client-side
//    token and opens Checkout by transactionId.
// 3. Drives headless Chrome over the DevTools Protocol and reports the Paddle.js
//    events (checkout.loaded / checkout.error with code + detail).
//
// The client-side token is sourced from NEXT_PUBLIC_PADDLE_CLIENT_TOKEN or, if
// absent, from the deployed bundle (client-side tokens are public). It is never
// printed.
//
// Usage: node scripts/paddle-checkout-e2e.mjs [--url <deployed-checkout-url>]
import { readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9333;

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

const argIndex = process.argv.indexOf('--url');
const deployedUrl = argIndex !== -1 ? process.argv[argIndex + 1] : 'https://buy-allproduts-corecollective.vercel.app/checkout';

const env = loadEnv();
for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v;

const TOKEN_RE = /(test|live)_[A-Za-z0-9]{27}/;

async function tokenFromLocal() {
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

const token = (await tokenFromLocal()) || (await tokenFromDeployed());
if (!token) throw new Error('No sandbox client-side token found locally or in the deployed bundle.');
console.log(`client token: ${token.slice(0, 5)}${'*'.repeat(27)} (${token.startsWith('test_') ? 'sandbox' : 'LIVE'})`);

const { createPaddleTransaction } = await import('../src/lib/payments.js');
const txn = await createPaddleTransaction({
  id: `e2e-${Date.now()}`,
  items: [{ product_id: 1, name: 'E2E Checkout Item', description: 'Headless e2e check', image_url: 'https://example.com/e2e.png', price: 12.34, quantity: 1 }],
});
console.log(`transaction: ${txn.transactionId} (status ${txn.status})`);

const harness = `<!doctype html><html><head><meta charset="utf-8">
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script></head>
<body><pre id="out">RESULT:{"events":[{"stage":"start"}]}</pre>
<script>
window.__events = [];
function render(){ document.getElementById('out').textContent = 'RESULT:' + JSON.stringify({ events: window.__events }); }
function push(o){ window.__events.push(o); render(); }
window.onerror = function(m){ push({ stage: 'window.onerror', message: String(m) }); };
try {
  Paddle.Environment.set('sandbox');
  Paddle.Initialize({ token: ${JSON.stringify(token)}, eventCallback: function(e){
    if (!e) return;
    if (e.name === 'checkout.loaded') push({ stage: 'event', name: e.name, txn: e.data && e.data.id });
    else if (e.name === 'checkout.error' || e.name === 'checkout.warning' || e.name === 'checkout.payment.error') push({ stage: 'event', name: e.name, code: e.code, detail: e.detail, doc: e.documentation_url });
  }});
  push({ stage: 'initialized' });
  Paddle.Checkout.open({ transactionId: ${JSON.stringify(txn.transactionId)} });
  push({ stage: 'open-called' });
} catch (err) { push({ stage: 'threw', message: String((err && err.message) || err) }); }
setTimeout(function(){ push({ stage: 'settled' }); }, 20000);
</script></body></html>`;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(harness);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const harnessUrl = `http://127.0.0.1:${server.address().port}/`;
console.log(`harness: ${harnessUrl}`);

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

async function findPageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch {}
    await sleep(500);
  }
  throw new Error('Could not connect to Chrome DevTools.');
}

let result = null;
let ws;
try {
  const target = await findPageTarget();
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

  const deadline = Date.now() + 40000;
  while (Date.now() < deadline) {
    await sleep(1000);
    const text = (await evaluate('document.getElementById("out") ? document.getElementById("out").textContent : ""')) || '';
    const m = text.match(/RESULT:(\{[\s\S]*\})/);
    if (m) {
      const parsed = JSON.parse(m[1]);
      const events = parsed.events || [];
      const loaded = events.some((e) => e.name === 'checkout.loaded');
      const errored = events.some((e) => e.name === 'checkout.error' || e.name === 'checkout.warning');
      if (loaded || errored) {
        result = events;
        break;
      }
    }
  }
} finally {
  try { ws?.close(); } catch {}
  try { spawnSync('taskkill', ['/pid', String(chrome.pid), '/f', '/t'], { stdio: 'ignore' }); } catch {}
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
    console.log(`RESULT: checkout error -> ${error.code || '?'}: ${error.detail || '?'}`);
    if (error.doc) console.log(`docs: ${error.doc}`);
    process.exitCode = 1;
  } else {
    console.log('RESULT: inconclusive.');
    process.exitCode = 1;
  }
}
