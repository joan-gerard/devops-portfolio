# ── Stage 1: deps ─────────────────────────────────────────────────────────────
# Install all dependencies (including dev) so the builder stage has everything
# it needs to compile the app.
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: builder ──────────────────────────────────────────────────────────
# Run next build. Requires placeholder env vars so the build doesn't fail
# on missing values — same pattern as CI.
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app

ARG R2_PUBLIC_URL
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost/placeholder
ENV NEXTAUTH_SECRET=placeholder
ENV NEXTAUTH_URL=http://localhost:3000
ENV ADMIN_EMAIL=placeholder@placeholder.com
ENV ADMIN_PASSWORD_HASH=placeholder
ENV IS_PRERENDER_BUILD=true
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build:dev

# ── Stage 3: runner ───────────────────────────────────────────────────────────
# Minimal production image. Copies only the standalone output and static assets.
# Runs as a non-root user.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy the standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]