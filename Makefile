# Falls back to corepack when pnpm is not on PATH (version pinned by "packageManager" in package.json).
PNPM ?= $(shell command -v pnpm >/dev/null 2>&1 && echo pnpm || echo corepack pnpm)

# gitleaks is a Go binary, not an npm package: pinned here and installed into .bin/ (gitignored)
GITLEAKS_VERSION := 8.28.0
GITLEAKS := .bin/gitleaks

.PHONY: install gitleaks check lint typecheck test secrets migrate migrate-new migrate-status

## install: dependencies + git hooks (husky, via the "prepare" script) + Prisma client + gitleaks
install: gitleaks
	$(PNPM) install
	$(PNPM) prisma generate

## gitleaks: download the pinned gitleaks into .bin/ (no-op if already there)
gitleaks:
	@sh scripts/install-gitleaks.sh $(GITLEAKS_VERSION) .bin

## migrate: apply pending migrations from prisma/migrations (DATABASE_URL from .env)
migrate:
	$(PNPM) prisma migrate deploy

## migrate-new: create a migration from schema.prisma changes and apply it (local dev DB only:
## `migrate dev` may offer to reset the DB on drift). `make migrate-new name=add_x`, or prompts for the name.
migrate-new:
	@name="$(name)"; \
	if [ -z "$$name" ]; then read -p "Migration name: " name; fi; \
	test -n "$$name" || { echo "migration name is required" >&2; exit 1; }; \
	$(PNPM) prisma migrate dev --name "$$name"

## migrate-status: which migrations are applied / pending
migrate-status:
	$(PNPM) prisma migrate status

## check: lint + typecheck + unit tests (run by the pre-commit hook)
check: lint typecheck test

lint:
	$(PNPM) lint

typecheck:
	$(PNPM) typecheck

test:
	$(PNPM) test

## secrets: scan staged changes for secrets (run by the pre-commit hook; fetches gitleaks on first run)
secrets: gitleaks
	$(GITLEAKS) git --pre-commit --staged --redact --verbose
