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
pnpm install
cp .env.example .env          # edit .env with your values
pnpm prisma generate
pnpm prisma migrate dev

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
pnpm test:math                # hardhat math verification
pnpm test:cov                 # coverage
```

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
