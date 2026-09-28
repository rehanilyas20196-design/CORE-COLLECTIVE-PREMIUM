# Docker Guide — Core Collective

Runs the whole product in two containers with one command:

```
┌────────────┐   browser   ┌─────────────┐   HTTP   ┌────────────────┐   Supabase REST   ┌──────────────┐
│  you       │ ──────────▶ │   web        │ ───────▶ │  backend        │ ────────────────▶ │  Supabase    │
│ localhost  │   :3000     │  Next.js 14  │  :3001   │  NestJS API     │                   │  PostgreSQL  │
└────────────┘             │  (port 3000) │          │  (port 3001)    │                   │  (hosted)    │
                           └─────────────┘          └────────────────┘  JSON API is proxied  └──────────────┘
                                                            ▲           through Next.js
```

- **web** — the Next.js app. The browser only ever talks to `localhost:3000`.
  All `/api/*` calls are proxied server-side by `src/app/api/[...catchall]/route.js`
  to the backend over the internal Docker network. The browser never sees the
  backend hostname.
- **backend** — the NestJS API (`dist/main.js`), speaking to your existing
  **hosted Supabase** project. There is no local database; Postgres stays in
  Supabase's cloud.
- Requests that go from `web` to `backend` use Docker DNS, so the hostname
  `backend` (not `localhost`) is correct everywhere inside the compose network.

---

## 1. Prerequisites

| Tool | Minimum | Check it |
|---|---|---|
| Docker Desktop | 4.x with WSL2 backend | `docker version` |
| Docker Compose | v2 | `docker compose version` |
| Your `.env` | — | `type .env` (already in the repo root, git-ignored) |

On Windows, Docker Desktop must be set to **WSL 2 based engine**
(Settings → General → "Use the WSL 2 based engine"). Any modern version warns
at install if this is wrong.

Make sure **no local process is already using ports 3000/3001**
(`netstat -ano | findstr ":3000 :3001"`), and stop the existing /  the
development servers first:

```powershell
# stop local `npm run dev` runtimes if any (Ctrl+C there) — the ports belong to Docker now
```

---

## 2. Environment

`docker compose` reads the `.env` file in the project root automatically.
Validate that all variables Docker actually **requires** are filled in:

| Variable                     | Required for | Why |
|------------------------------|--------------|-----|
| `SUPABASE_URL`               | backend      | NestJS talks directly to Supabase REST |
| `SUPABASE_ANON_KEY`          | backend      | public client |
| `SUPABASE_SERVICE_ROLE_KEY`  | backend + web | **admin client**. Backend drops all privileged calls (signup auto-confirm, admin bootstrap) if this is missing — set it |
| `NEXT_PUBLIC_SUPABASE_URL`   | web build    | inlined into the browser bundle at build time |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web build | inlined into the browser bundle at build time |
| `NEXT_PUBLIC_BACKEND_URL`    | web          | **server-side only** — see note below |
| `PASSWORD_PEPPER`            | backend      | password hashing |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | backend  | bootstraps the admin login; fails closed if `ADMIN_PASSWORD` is unset |
| `FRONTEND_URL`               | backend      | CORS allowlist (same-origin proxy makes this less critical) |

Everything else (`PADDLE_*`, `NEXT_PUBLIC_GEMINI_API_KEY`, …) is optional and
the stack runs without it (those features degrade).

> **Why `NEXT_PUBLIC_BACKEND_URL=http://backend:3001`?**
> Next.js inlines every `NEXT_PUBLIC_*` into the client bundle at build time,
> but the proxy in `src/app/api/[...catchall]/route.js` runs **on the server**.
> The only consumer of this URL runs inside the container, where `backend`
> resolves via Docker DNS. `http://localhost:3001` would be wrong here (it
> would point at the *web* container itself).

---

## 3. Run it (production/optimized)

```powershell
# from the repo root (D:\Core)
cd D:\Core

docker compose up -d --build
```

Wait for the "started" output, then check health:

```powershell
docker compose ps
# NAME          IMAGE                     STATUS
# core-backend  core-collective-backend   Up (healthy)   0.0.0.0:3001->3001/tcp
# core-web      core-collective-web       Up (healthy)   0.0.0.0:3000->3000/tcp

# quick smoke tests
(Invoke-WebRequest http://localhost:3000/api/health).Content      # {"status":"ok"}
(Invoke-WebRequest http://localhost:3000/api/categories).Content  # JSON or []
(Invoke-WebRequest http://localhost:3000).StatusCode              # 200
```

Open **http://localhost:3000**.

The containers only join the compose network — they are **not** on the host
network, so nothing inside talks to anything outside the compose file
(nothing to configure in Windows Firewall).

---

## 4. Development mode with hot reload

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

- The `backend` service is rebuilt to the `builder` stage and runs
  `nest start --watch`; edits to `backend/src/**` reload automatically.
- The `web` service runs `next dev`; edits to `src/`, `public/`, and
  `next.config.js` hot-reload.
- Both use **polling** (env vars in the override) because Docker Desktop's
  bind-mounts do not reliably propagate `inotify`/`CHOKIDAR` events on Windows.
  Edits are picked up within ~1s.
- `node_modules`/`.next` stay **inside the image** (anonymous volumes) — a host
  bind-mount there would shadow them with your Windows install and break
  native (musl) binaries such as `sharp`/`@parcel/watcher`.

To go back to the optimized images:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose up -d --build
```

---

## 5. Useful commands

```powershell
docker compose logs -f web        # frontend logs
docker compose logs -f backend    # API logs
docker compose restart backend    # restart one service
docker compose down               # stop and delete containers (network stays)
docker compose down -v            # + delete anonymous volumes (dev) — NOT the images
docker compose rm -sfv            # + delete the containers (if `down` misbehaves)
docker image prune -f             # reclaim space from old builds
docker compose -f docker-compose.yml -f docker-compose.dev.yml up   # ...
```

---

## 6. What changed / why it's now robust

The previous `docker-compose.yml` + Dockerfiles had several real defects that
made containers crash-loop or silently mis-behave. Fixed here:

1. **`SUPABASE_SERVICE_ROLE_KEY` was never passed to `backend`.**
   `backend/src/supabase/supabase.service.ts:13` reads it; with it missing,
   the admin Supabase client silently falls back to the anon key, so every
   privileged call (signup auto-confirm, admin bootstrap) fails at the RLS
   layer. Now wired through compose.
2. **`/api/health` didn't exist on the backend.**
   `AppController` (which serves it) was never registered in `AppModule`, so
   every healthcheck across compose and `railway.json` got a 404. Registered it
   in `backend/src/app.module.ts`.
3. **Backend crash-looped on Node 20.** `@supabase/realtime-js` throws
   "Node.js detected without native WebSocket support" unless Node ≥ 22 (native
   `WebSocket`). The Docker image uses `node:22-alpine`, but the repo's
   `.nvmrc` / `engines.node` still said 20, so local (non-Docker) runs hit the
   same crash. Aligned both to **22**.
4. **`web` had no healthcheck** and no `init`; both containers now have
   `init: true` (tini — clean SIGTERM, no zombie processes) and a healthcheck
   (`/api/health`; for `web` this is a static route in
   `src/app/api/health/route.js` that deliberately does **not** proxy to the
   backend so a broken backend can't fake a healthy frontend).
5. **Shared npm cacache between parallel build stages** produced
   `ENOENT` / `File exists` rename errors on first `docker compose build`.
   The cache mounts now use `sharing=locked` so the stages no longer race.
6. **The compose project got an explicit `name: core-collective`.**
   This is the reason an old `core-backend` container might be "orphaned":
   previously the project name defaulted to the directory name (`core`). After
   this change, `docker compose ls` shows two projects if old containers
   survive; remove the stale ones with `docker compose -p core down --remove-orphans`.

---

## 7. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Error response … The container name "/core-backend" is already in use` | Stale containers from the old `core` project. `docker compose -p core down --remove-orphans`, then `docker compose up -d`. |
| `container core-backend is unhealthy` | `/api/health` used to 404 (fixed in §6.2). If it reappears, `docker logs core-backend` and check `Mapped {/api/health, GET}` appears. |
| backend exits with `Error: Node.js detected without native WebSocket support` | You ran the backend on Node < 22 (e.g. via `.nvmrc`). Use Node 22 via `nvm use`/the Dockerfile `.nvmrc` file. |
| `docker compose build` slow on the web image | The Next.js `next build` step is CPU-bound; it is normal for it to take several minutes *first* time. Subsequent builds reuse BuildKit cache. |
| `wget: server returned error 404` inside a healthcheck | A service is ignoring its healthcheck path (see above). |
| Browser shows `Backend unavailable` | The `web → backend` proxy failed. `docker network inspect core-collective` to confirm both containers are attached; backend logs show its listen port. |
| `[::]:3000` instead of `0.0.0.0:3000` in `docker compose ps` | Normal — containers bind both IPv4 and IPv6. `localhost:3000` still works. |
| Ports already in use on host | `netstat -ano | findstr ":3000"` and kill / reconfigure; the containers cannot claim a port another process owns. |

---

## 8. Windows/Docker Desktop gotchas

- **Standalone (no WSL) vs WSL2 backend** — Docker Desktop defaults to WSL2.
  Bind-mount / file-watch behaviour is VM-based; that is why dev mode uses
  polling (§4).
- **CRLF / line endings** — keep `Dockerfile`, `docker-compose.yml`, `.env`,
  and any shell scripts at **LF**. If a file lands with CRLF, BusyBox `/bin/sh`
  may error with `not found` / `\r`: `git config core.autocrlf input` (or
  `git reflog`-free) and re-clone, or `dos2unix <file>`.
  `docker-compose.yml` itself tolerates CRLF; `.env` is parsed by compose and
  tolerates it too, but shell entrypoints do **not**.
- **`.env` has no `#`-comments-with-space** quirks — keep the format
  `KEY=value` (no quotes). `docker compose config` validates it:
  `docker compose config` (prints the merged config; warnings mention
  unset optional vars, which is fine).
- **First `npm run build` in a container after `docker compose down -v`** is
  the slowest operation in this project. Give it up to ~15–20 min on Windows
  once; subsequent builds are cached.
- **Disk space** — each image takes ~400–600 MB; keep `max-size` logging limits
  (already set) and run `docker image prune` occasionally.

---

## 9. Verifying the image internals

```powershell
# what user/setup the images ship
docker image inspect core-collective-backend --format '{{json .Config}}'

# list files, e.g. confirm the compiled NestJS dist
docker run --rm --user 0:0 --entrypoint ls core-collective-backend -la /app

# the runner image uses non-root users (nestjs/nextjs):
docker exec core-backend id
```