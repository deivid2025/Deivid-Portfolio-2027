# Multi-stage build for minimal production image
# Stage 1: Install deps
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: Build
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bunx prisma generate
RUN bun run build

# Stage 3: Production — minimal image
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy only what's needed for production (standalone output)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy the prisma CLI so we can run `prisma db push` on startup without
# needing to download it (the standalone output only includes runtime
# deps, not dev tools like the prisma CLI).
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Create data dir for SQLite
RUN mkdir -p /app/data

ENV DATABASE_URL=file:/app/data/portfolio.db

EXPOSE 3000

# Run prisma db push to apply schema changes (creates/migrates tables
# like Visitor on a fresh DB or an existing one) before starting the
# Next.js server. Uses `;` instead of `&&` so even if the migration
# fails (e.g. DB locked), the server still starts — we'd rather have a
# running app with a stale schema than a 502.
CMD ["sh", "-c", "bunx prisma db push --accept-data-loss --skip-generate 2>&1; bun server.js"]
