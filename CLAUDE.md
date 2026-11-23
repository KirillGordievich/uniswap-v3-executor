# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Global Rules

- Use pnpm (never npm or yarn). Node >= 20 (`.nvmrc`: 20).
- No `console.*` — use `Logger` from `@libs/logger` (Pino, printf-style: `logger.info('pool %s', addr)`; use `logger.child({...})` for scoped loggers).
- No `any` — use `unknown` or generics. All functions/methods need explicit return types (enforced by ESLint).
- Do not access `process.env` outside `main.ts` bootstrap files — use `ConfigService` (`getOrThrow` for required vars, read in the constructor into `private readonly` fields).
- Do not rely on DB defaults for inserts — always pass the property explicitly.
- All financial math via `decimal.js` or `bigint`, never native floats. On-chain amounts are `bigint` (wei); human-unit amounts are `Decimal`. Rounding: down for amounts received, up for amounts paid.
- No raw SQL unless explicitly approved; multi-step writes use `db.$transaction()`.

## Commands

```bash
make install                      # gitleaks into .bin/ + pnpm install (also installs husky hooks) + pnpm prisma generate
cp .env.example .env
pnpm prisma migrate dev           # needs Postgres; `pnpm docker:up` starts one (plus both services)

pnpm dev:api                      # nest start --watch, port 3000, Swagger at /docs
pnpm dev:syncer                   # gRPC on SYNCER_PORT (50051); connects to Postgres + RPC on startup
pnpm build                        # pnpm -r build (each app: nest build)

pnpm lint                         # eslint apps/ libs/ (type-aware, uses root tsconfig.json)
pnpm lint:fix
pnpm typecheck                    # tsc --noEmit for both apps
pnpm format
make check                        # lint + typecheck + test (what the pre-commit hook runs)
make secrets                      # gitleaks on staged changes (uses .bin/gitleaks, downloads it if missing)

pnpm test                         # root jest: apps/** and libs/** *.test.ts, excluding libs/math/contracts
pnpm test -- apps/api/test/token.test.ts          # single file
pnpm test -- -t 'returns 401'                      # single test by name
pnpm test:cov
pnpm test:math                    # Hardhat: compiles Solidity mocks, checks libs/math against them
```

`pnpm test` needs no DB, RPC, or running services. API tests mock `DatabaseService`, `Logger` and the `SYNCER_PACKAGE` gRPC client (see `apps/api/test/setup.ts`). The syncer tests mock `SyncerService`.

A husky `pre-commit` hook (`.husky/pre-commit`, installed by the `prepare` script on `pnpm install`) runs `make secrets` then `make check`. The Makefile falls back to `corepack pnpm` when `pnpm` is not on PATH. gitleaks is pinned by `GITLEAKS_VERSION` in the Makefile and installed by `scripts/install-gitleaks.sh` (checksum-verified).

`pnpm test:math` uses its own `libs/math/contracts/jest.config.ts`, and its global setup runs `hre.run('compile')`. `hardhat` and `@nomiclabs/hardhat-ethers` are **not** in `package.json` or the lockfile, so install them before running it.

## Repository Layout

- `apps/api` is the REST API (Express). `apps/syncer` is a gRPC-only microservice. They are the only pnpm workspace packages (`pnpm-workspace.yaml` covers `apps/*` only). All dependencies are declared in the root `package.json`.
- `libs/*` are **not** packages. They are plain source folders imported as `@libs/<name>` through `tsconfig.json` `paths` and compiled into each app (each app's `tsconfig.json` includes `../../libs/**/src`). **Adding a new lib means adding aliases in both `tsconfig.json` `paths` and `jest.config.ts` `moduleNameMapper`.** Add them to `libs/math/contracts/jest.config.ts` too if math tests import it.
- `nest build` output lands in `apps/<app>/dist/apps/<app>/src/main.js`, because the rootDir is the repo root. Nest CLI rewrites the `@libs/*` aliases to relative requires at build time; this relies on `"baseUrl": "."` in the root `tsconfig.json`, so don't remove it.
- Don't resolve repo files from `process.cwd()`: `pnpm --filter` scripts run with cwd `apps/<app>/`, but Docker runs from `/app`.
  - The proto path is `SYNCER_PROTO_PATH` from `@libs/grpc`, which is resolved from `__dirname`. Each app's `nest-cli.json` `assets` entry copies the proto to `dist/libs/grpc/proto/`.
  - Both apps load `.env` from `['.env', '../../.env']`, so the repo-root `.env` is found from either working directory.

## Architecture

### Data flow

The API serves token reads directly from Postgres via Prisma. Estimates are proxied over gRPC to the syncer (`EstimateService` → `SyncerService.EstimateBuy/EstimateSell`). The API has no estimation logic.

The syncer is stateful and in-memory. On startup (`SyncerService.onModuleInit`) it loads all tokens and all `enabled` pools from Postgres and builds a graph. Then it syncs every pool from chain at a single block number and subscribes to pool events. The syncer **never writes to the DB**. `AddToken`/`AddPool` only load rows that must already exist in the DB (and both pool tokens must already be added).

### Syncer internals (`apps/syncer/src`)

- **`DigrammaService`**: a cytoscape graph in which tokens are nodes and pools are edges. Both are keyed by lowercase `0x` address, as produced by `normalizeAddress` in `@libs/core`; checksummed addresses will not match. A pool's `token0` is always the lower address (`compareTokens`).
  - Path finding: `aStar` finds the minimum hop count. A layered relaxation over all pools within that many hops then keeps the best quantity per token. Parallel pools (fee tiers) compete, but only paths with the minimal hop count are considered.
- **`PoolService`**: one instance per pool, created with `new`, not by Nest DI.
  - `sync()` reads `slot0` and `liquidity`. It then reads initialized ticks through the Uniswap TickLens contract (`getPopulatedTicksInWord`) over a window of `SYNCER_POOL_TICK_RANGE_SIZE * tickSpacing` around the current tick.
  - It listens to `Mint`, `Burn` and `Swap` events. On a `Swap` into a new tick it fetches the missing tick ranges.
  - Reorg handling: before each mutation the current `TickBookService` is cloned into an `LVC` (last-value cache, size `SYNCER_POOL_LVC_SIZE`) keyed by block number. A `removed` event rolls back to the highest cached state, or does a full resync if the cache is empty.
- **`TickBookService`**: pool state (`tick`, `sqrtPrice`, `liquidity`, `blockNumber`, synced `tickRange`) plus a red-black tree of `tick → liquidityNet/Gross`.
- **`CalcService`**: after every state change, `PoolService.recalc()` builds two new instances, one per swap direction (`calc0`: token0→token1, `calc1`: token1→token0). Each replays the Uniswap v3 swap loop off-chain using `@libs/math`. It throws `InsufficientLiquidityError` when the swap runs past the synced tick window.

### Buy/Sell semantics (easy to get backwards)

- `EstimateBuy` / `PlanBuy`: `quantity` is the **sell** amount (exact input). Returns the buy amount.
- `EstimateSell` / `PlanSell`: `quantity` is the **buy** amount (exact output). Returns the sell amount.
- `quantity` is in human units (decimals applied inside `CalcService`). `Plan*` returns integer base units (sell amount rounded up, buy amount rounded down) plus the encoded path.

### `@libs/math` and `@libs/core`

- `libs/math` is a bigint port of the Uniswap v3 Solidity libraries (TickMath, SqrtPriceMath, SwapMath, LiquidityMath, plus EVM-width casting/overflow). Its correctness is checked against the original Solidity through the mock contracts and on-chain fixtures in `libs/math/contracts/test/`. Any change to it must keep `pnpm test:math` passing.
- `libs/core` holds the domain helpers used everywhere: addresses and hex/Buffer converters, tick compression and tick words, fee ↔ tick spacing, `IntRange`, `LVC`, path encoding, calldata. It also holds the error classes (`createErrorClass` in `errors.ts`, codes `UNI3_ERR_*`) and `validate()`, which turns a class-validator env class into a `ConfigModule` validator (each app has an `env.config.ts`).

### gRPC contract

`libs/grpc/proto/syncer.proto` is the single source of truth, but **there is no codegen**. The TS request/response shapes are hand-written in `apps/syncer/src/syncer.controller.ts` and in the API client interfaces (e.g. `ISyncerService` in `estimate.service.ts`). When you change the proto, update both sides. proto-loader converts `snake_case` fields to camelCase. Over the wire, addresses are hex strings, and decimals/bigints are strings. The syncer controller wraps service errors in `RpcException` with `@grpc/grpc-js` `status` codes.

### Database

Prisma schema at `prisma/schema.prisma`; generated client in `node_modules`.

- Addresses are stored as `Bytes`. Convert them with `hexToBuffer`/`bufferToHex` from `@libs/core`. Prisma's `Bytes` type sometimes requires an `as unknown as Uint8Array<ArrayBuffer>` cast.
- Amounts are stored as `@db.Decimal`.
- Every entity has a UUID `id` and `createdAt`; mutable entities also have `updatedAt`.
- The `Order`, `Transaction`, `OrderTransaction` and `TransferTransaction` tables exist in the schema, but no code uses them yet. The order-execution side is not implemented.

`EthersService` (`@libs/ethers`) builds a `FallbackProvider` from the `ETHERS_<NAME>_*` env vars, where `<NAME>` is one of ANKR, GETBLOCK, LLAMANODES or NOWNODES. At least one provider must be enabled.

## API Module Conventions (`apps/api/src/app/<feature>/`)

Layout: `dto/` (with `index.ts`), `interfaces/` (with `index.ts`), `<feature>.module.ts`, `.controller.ts`, `.service.ts`, `index.ts` barrel that exports only what other modules need.

- **Controller**: `@Controller('v1/<route>')`, `@ApiTags`, `@ApiSecurity('api-key')`, and class-level `@ApiBadRequestResponse`/`@ApiUnauthorizedResponse`/`@ApiNotFoundResponse` using the DTOs in `common/dto/error.dto.ts`. Put `@UseGuards(ApiKeyGuard)` on every endpoint except `/health`. `ApiKeyGuard` compares the `x-api-key` header to `API_KEY`. Responses are always mapped through `ResponseDTO.create(...)`.
- **Service**: inject only what is needed (`DatabaseService`, `Logger`, ...). Use a private `baseSelect(): Prisma.<Model>Select` and a private `prepareForResponse()` that converts `Bytes` addresses to hex.
- **DTOs**: `@Exclude()` on the class, and `@Expose()` + class-validator decorators + `@ApiProperty()` on every field. Response DTOs extend the base DTO and define:
  ```ts
  static create(this: void, input: unknown): XResponseDTO {
    return plainToInstance(XResponseDTO, input, { strategy: 'excludeAll' });
  }
  ```
  The global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted` + `transform`, so undeclared query/body fields return 400.
- **Interfaces**: `IEntity` / `IEntityDB` for DB shapes, `IEntityResponse` for service return shapes (addresses as hex strings).
- **Errors**: controllers currently throw Nest built-in exceptions (e.g. `NotFoundException`). Each feature defines its own `<Feature>ErrorCode` enum when it needs codes.

## Naming

- Interfaces: `I` prefix (`IToken`).
- DTOs: `...DTO` suffix (`TokenResponseDTO`).
- Enum types and members: PascalCase.
- Global primitive constants: `UPPER_CASE`.
- Files: `kebab-case.<type>.ts`. Folders: kebab-case.
- Unused args: prefix with `_`.

## Lint/Format Specifics

- Max line length is 150.
- A blank line is required before every `return` (`padding-line-between-statements`).
- `simple-import-sort` is on with its default groups: all packages (including `@libs/*`) sorted alphabetically in one block, then relative imports. Run `pnpm lint:fix` rather than ordering by hand.
- Prettier: single quotes, trailing commas, semicolons, `arrowParens: always`.

## Testing Conventions

- Jest only, no sinon. Use `jest.fn()` / `jest.spyOn()` and typed mocks (`as unknown as jest.Mocked<T>`), not `any`.
- HTTP tests use Supertest against a Nest app built by `createTestApp()`. Never hit real RPC or a real chain; stub `EthersService` and the gRPC client.
- Test through public APIs, not private methods.
- For tests that touch a real DB: use unique values for unique columns, clean up only the rows the test created (in `afterAll`, reverse dependency order), and never use `deleteMany({})`. For 404 cases use the UUID `99999999-9999-4999-a999-999999999999`.
