# ---------- builder ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# sharing=locked is required: `builder` and `prod-deps` run in parallel and
# would otherwise race on the same cacache, producing ENOENT / "File exists"
# rename failures.
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---------- prod deps ----------
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev && npm cache clean --force

# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

USER nestjs
EXPOSE 3001

# Matches the `backend` healthcheck in docker-compose.yml.
# /api/health is served by AppController; the global 'api' prefix comes from
# app.setGlobalPrefix('api') in src/main.ts.
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1

# `node` directly rather than an npm script: no extra PID layer, so SIGTERM
# (from tini, via compose `init: true`) reaches NestJS and it closes cleanly.
CMD ["node", "dist/main.js"]
