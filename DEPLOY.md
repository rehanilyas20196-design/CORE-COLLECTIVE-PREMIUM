# Core Collective — Deployment Guide

## Architecture
- **Web app**: Next.js 14 (App Router) — root of this repo
- **Backend**: NestJS (TypeScript) — `backend/` dir
- **Database**: Supabase (hosted PostgreSQL) + Auth + RLS
- **Auth**: Supabase Auth + Cloudflare Turnstile (see `backend/src/auth`)
- **Payments**: Paddle (checkout / webhooks)
- **AI Chatbot**: Google Gemini
- **Deployment (primary)**: Vercel — web app (Next.js) + backend (Vercel Functions)
- **Deployment (self-hosted)**: Docker — see `DOCKER.md`

---

## Prerequisites
- Node.js **22+** (backend uses native `WebSocket`, required by
  `@supabase/realtime-js` — see `backend/.nvmrc`)
- Vercel CLI (`npm i -g vercel`)
- Supabase project + anon + service_role keys
- Google Gemini API key
- Cloudflare Turnstile site + secret keys
- Paddle sandbox/live credentials (client token, API key, webhook secret)

---

## Option A — Docker (recommended for self-hosting)

One-file local/production stack. See **`DOCKER.md`** for the full guide.

```bash
docker compose up -d --build     # http://localhost:3000 (web), :3001 (API)
# dev mode with hot reload:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

- `docker-compose.yml` — prod-optimized images (multistage Dockerfiles)
- `Dockerfile` + `backend/Dockerfile` — `node:22-alpine`, non-root users,
  healthchecks, `init: true` (tini)
- Secrets come from the git-ignored `.env` in the repo root; `NEXT_PUBLIC_*`
  values are injected as **build args** (Next.js inlines them at build time).

---

## Option B — Vercel (production)

### Backend (`backend/`)
NestJS is compiled with `nest build` (tsc) to `dist/`, then served serverless
from `api/index.js` — a plain-JS handler that `require()`s the compiled module.
esbuild (used by `@vercel/node`) cannot emit NestJS decorator metadata, so the
`.ts` sources are never bundled directly.

```bash
cd backend
npm install
npm run build
vercel --prod
```

Env vars (Vercel dashboard or `vercel env add`, see `backend/.env.example`):

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (admin client; signup auto-confirm) |
| `FRONTEND_URL` | comma-separated CORS allowlist |
| `PASSWORD_PEPPER` | pepper for password hashing |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin bootstrap credentials |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret |

### Web (Next.js, repo root)

```bash
vercel --prod
```

`vercel.json` just declares `"framework": "nextjs"`. In Vercel's dashboard set:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_BACKEND_URL` (the deployed backend URL, e.g.
`https://your-backend.vercel.app` — server-side proxy only),
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`,
`NEXT_PUBLIC_GEMINI_API_KEY`.

The web app proxies `/api/*` to the backend via
`src/app/api/[...catchall]/route.js`, so the browser only ever talks to the
Next.js origin.

---

## Local development (no Docker)

```bash
# backend
cd backend
npm install
npm run start:dev        # http://localhost:3001 (uses backend/.env)

# web — from repo root
npm install
npm run dev              # http://localhost:3000
```

---

## Paddle (payments)

Sandbox vs live is toggled by `PADDLE_ENV` (sandbox/live) with the matching
client token / API key / webhook secret. Quick checks and e2e helpers live in
`scripts/` (`paddle-sandbox-setup.mjs`, `paddle-diagnose.mjs`,
`paddle-checkout-e2e.mjs`).

---

## Key URLs
| Service | URL |
|---|---|
| Frontend (local Docker) | http://localhost:3000 |
| Backend API (local Docker) | http://localhost:3001 |
| Health checks | `/api/health` on both |

---

## Troubleshooting
- **Backend exits immediately** with *"Node.js detected without native
  WebSocket support"* → you're on Node 20; use Node 22 (`nvm use`, or the
  Docker image which is already 22).
- **Browser shows `Backend unavailable`** → the `/api/*` proxy can't reach the
  backend; check CORS / `NEXT_PUBLIC_BACKEND_URL` / logs.
- Anything Docker-specific → `DOCKER.md`.