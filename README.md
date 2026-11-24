# Uniswap v3 Executor

NestJS monorepo for real-time Uniswap v3 pool syncing and swap estimation.

## Architecture

| Service | Transport | Description |
|---------|-----------|-------------|
| **API** | REST (port 3000) | Token management, swap estimates, Swagger docs |
| **Syncer** | gRPC (port 50051) | On-chain pool sync, tick tracking, path finding |

```
apps/
  api/              REST API (NestJS + Swagger)
  syncer/            gRPC microservice (pool sync + math)
libs/
  core/              Domain logic (address, converters, ticks, path)
  math/              Uniswap v3 math (swap, liquidity, sqrt-price)
  database/          Prisma ORM (PostgreSQL)
  ethers/            FallbackProvider (multi-RPC)
  logger/            Pino structured logging
  abi/               Contract ABIs (ERC20, Pool, Router)
  grpc/              Proto definitions + client module
```

## Stack

TypeScript, NestJS 11, Prisma 6, ethers.js 5, gRPC, PostgreSQL, Docker, Jest

## Setup

```bash
make install                  # deps, git hooks, Prisma client, gitleaks (into .bin/)
cp .env.example .env          # edit .env with your values
make migrate                  # apply migrations (needs Postgres: pnpm docker:up)

# Development
pnpm dev:api
pnpm dev:syncer

# Production
pnpm build
pnpm start:api
pnpm start:syncer
```

## Docker

```bash
pnpm docker:up                # postgres + services
pnpm docker:down
```

## Tests

```bash
pnpm test                     # all tests (150)
pnpm test:math                # hardhat math verification (needs hardhat + @nomiclabs/hardhat-ethers installed)
pnpm test:cov                 # coverage
```

## Make commands

| Command | Description |
|---------|-------------|
| `make install` | `pnpm install` (also installs the husky git hooks), `pnpm prisma generate`, and the pinned gitleaks into `.bin/` |
| `make check` | Lint + typecheck + tests |
| `make lint` / `make typecheck` / `make test` | Each step on its own |
| `make secrets` | Scan staged changes for secrets with gitleaks (downloads it if missing) |
| `make migrate` | Apply pending migrations (`prisma migrate deploy`, safe for any environment) |
| `make migrate-new name=add_x` | Create a migration from `schema.prisma` changes and apply it (local DB only; prompts for the name if omitted) |
| `make migrate-status` | Show applied and pending migrations |
| `make gitleaks` | Download the pinned gitleaks into `.bin/` (no-op if already there) |

Every `git commit` runs `make secrets` and then `make check`; the commit is blocked if either fails. The Makefile uses `corepack pnpm` when `pnpm` is not on PATH.

## API

Swagger UI available at `http://localhost:3000/docs` after starting the API.

All endpoints require `x-api-key` header (except `/health`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Liveness probe |
| GET | `/v1/tokens` | List tokens |
| GET | `/v1/tokens/:address` | Get token by address |
| GET | `/v1/estimates/buy` | Estimate buy swap |
| GET | `/v1/estimates/sell` | Estimate sell swap |

## License

UNLICENSED
