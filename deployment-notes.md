# Deployment Notes — Cores Collective

## Project Structure

```
CORES WORK/
├── backend/          → NestJS API server (TypeScript)
└── frontend/         → React + Vite app (JSX)
```

Both are deployed as **separate Vercel projects**.

---

## Backend Deployment (`backend/`)

### Entry Point
- **`api/index.js`** — A manually written serverless handler (plain JS) that:
  - Imports `reflect-metadata` first (required by NestJS decorators)
  - Dynamically requires `../dist/app.module` at runtime (avoids esbuild bundling issues)
  - Creates a NestJS app with Express adapter
  - Exports a standard `(req, res)` handler (not Lambda format)
  - Uses a `cachedHandler` pattern to reuse the initialized app across invocations

### Why not `api/index.ts`?
Vercel's `@vercel/node` builder uses **esbuild** to compile TypeScript. esbuild does **not** support `emitDecoratorMetadata`, which NestJS requires. So we:
1. Keep `src/` as TypeScript — compiled by `nest build` (tsc) → `dist/`
2. Keep `api/index.js` as plain JavaScript — compiled by nothing, just `require()` at runtime

### `vercel.json`
```json
{
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/api/(.*)", "dest": "/api/index.js" }]
}
```
- `builds` tells Vercel to treat `api/index.js` as a Node.js serverless function
- `routes` forwards all `/api/*` requests to it (NestJS has `setGlobalPrefix('api')`)

### Build Process
1. Vercel runs `npm run vercel-build` → `nest build` (compiles `src/` → `dist/`)
2. Vercel takes `api/index.js` and bundles it (via esbuild) into a Lambda
3. At runtime, `api/index.js` does `require(path.join(__dirname, "../dist/app.module"))` → loads the pre-compiled NestJS app

### Environment Variables (set via `vercel env add`)
| Variable | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | |
| `SUPABASE_ANON_KEY` | Supabase anon key | |
| `FRONTEND_URL` | `https://frontend-eight-pink-11.vercel.app` | Used for CORS |
| `PASSWORD_PEPPER` | `BananaSecurePepper2024!` | For password hashing |
| `SUPABASE_SERVICE_ROLE_KEY` | (your service_role key) | Required for auto-confirming users on signup. Get it from Supabase Dashboard → Project Settings → API → service_role key |

---

## Frontend Deployment (`frontend/`)

### Entry Point
- Standard Vite React app
- Built by `vite build` during `vercel-build`

### No `vercel.json` needed
Vercel auto-detects Vite projects and uses the correct settings (build command: `npm run build`, output dir: `dist`).

### Environment Variables (set via `vercel env add`)
| Variable | Value | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Must start with `VITE_` for Vite to expose to client |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | |
| `VITE_BACKEND_URL` | `https://backend-ten-lime-44.vercel.app` | API calls go here |

### CSP Update
`index.html` had `connect-src` set to `http://localhost:3000` — updated to `https://backend-ten-lime-44.vercel.app` to allow API calls in production.

---

## Key Problems Solved

### 1. esbuild + NestJS decorators
esbuild (used by `@vercel/node`) doesn't support `experimentalDecorators` / `emitDecoratorMetadata`. NestJS needs these.

**Fix:** Pre-compile NestJS with `nest build` (tsc) to `dist/`, then use a plain JS handler (`api/index.js`) that `require()`s the compiled output at runtime.

### 2. esbuild bundling + `require("../dist/...")`
When `api/index.js` had a static `require("../dist/app.module")`, esbuild tried to bundle it and failed.

**Fix:** Use dynamic `require(path.join(__dirname, "..", "dist", "app.module"))` so esbuild leaves it as a runtime require, and the `dist/` directory (deployed alongside) is resolved correctly.

### 3. ConfigModule trying to load `.env`
In production, there's no `.env` file. `ConfigModule.forRoot()` by default looks for one and logs a warning.

**Fix:** Added `ignoreEnvFile: true` in `src/app.module.ts`.

---

## Key URLs

| Service | URL |
|---|---|
| Frontend | https://frontend-eight-pink-11.vercel.app |
| Backend API | https://backend-ten-lime-44.vercel.app |
| Supabase | https://izqxsfuyibbzwdxdcmev.supabase.co |

---

## Redeploy After Changes

```bash
# Backend
cd backend
vercel --prod --yes

# Frontend
cd frontend
vercel --prod --yes
```

## Access Logs

```bash
cd backend
vercel logs --environment production
```
