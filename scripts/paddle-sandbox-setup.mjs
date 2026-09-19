// Ensures a Paddle Sandbox client-side token exists and is stored in .env.local.
// Prints only non-secret metadata (id/name/status/prefix). Never prints the token.
//
// Usage: node scripts/paddle-sandbox-setup.mjs [--force-new]
import { readFileSync, writeFileSync } from 'node:fs';

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

const env = { ...loadEnv(), ...process.env };
const key = (env.PADDLE_SANDBOX_API_KEY || env.PADDLE_API_KEY || '').trim();
if (!key) throw new Error('No PADDLE_SANDBOX_API_KEY / PADDLE_API_KEY set.');

const envName = (env.PADDLE_ENV || '').trim() || (key.startsWith('pdl_sdbx_') ? 'sandbox' : 'production');
if (envName !== 'sandbox') throw new Error(`Refusing to create sandbox tokens while PADDLE_ENV=${envName}.`);

const base = 'https://sandbox-api.paddle.com';
const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const forceNew = process.argv.includes('--force-new');

async function api(method, path, body) {
  const res = await fetch(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
}

const existing = (env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '').trim();
const isValidTestToken = /^test_[A-Za-z0-9]{27}$/.test(existing);

let token = null;
let source = null;

if (isValidTestToken && !forceNew) {
  token = existing;
  source = '.env.local';
} else {
  // Reuse an active sandbox client-side token if the API returns one.
  const list = await api('GET', '/client-tokens');
  const active = (list.json?.data || []).find((t) => t.status === 'active' && /^test_/.test(t.token || ''));
  if (active) {
    token = active.token;
    source = `existing token ${active.id}`;
    console.log(`GET /client-tokens -> ${list.status}; reusing active token ${active.id} (${active.name || 'unnamed'})`);
  } else {
    const created = await api('POST', '/client-tokens', {
      name: 'Core Collective sandbox checkout',
      description: 'Created by scripts/paddle-sandbox-setup.mjs to verify sandbox checkout end to end.',
    });
    if (created.status >= 300 || !created.json?.data?.token) {
      throw new Error(`POST /client-tokens failed (${created.status}): ${created.text.slice(0, 300)}`);
    }
    token = created.json.data.token;
    source = `created token ${created.json.data.id}`;
    console.log(`POST /client-tokens -> ${created.status}; created ${created.json.data.id}`);
  }
}

if (!/^test_[A-Za-z0-9]{27}$/.test(token)) {
  throw new Error('Obtained value is not a valid sandbox client-side token (expected ^test_[A-Za-z0-9]{27}$).');
}

// Write into .env.local, replacing the existing key if present.
const envPath = '.env.local';
const original = readFileSync(envPath, 'utf8');
const eol = original.includes('\r\n') ? '\r\n' : '\n';
const lines = original.split(/\r?\n/);
let found = false;
const next = lines.map((line) => {
  if (/^\s*NEXT_PUBLIC_PADDLE_CLIENT_TOKEN\s*=/.test(line)) {
    found = true;
    return `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=${token}`;
  }
  return line;
});
if (!found) next.push(`NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=${token}`);
writeFileSync(envPath, next.join(eol));

console.log(`client token source: ${source}`);
console.log(`client token: test_${'*'.repeat(27)} (written to .env.local, value not displayed)`);
console.log('Restart the dev server so NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is picked up.');
