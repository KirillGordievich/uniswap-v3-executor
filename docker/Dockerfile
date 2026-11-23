# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/ ./apps/
COPY libs/ ./libs/
COPY prisma/ ./prisma/
COPY tsconfig.json ./

RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm build

# Stage 2: API
FROM node:20-alpine AS api

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/apps/api/src/main.js"]

# Stage 3: Syncer
FROM node:20-alpine AS syncer

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/syncer/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 50051

CMD ["node", "dist/apps/syncer/src/main.js"]
