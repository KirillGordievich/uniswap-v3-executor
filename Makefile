# Falls back to corepack when pnpm is not on PATH (version pinned by "packageManager" in package.json).
PNPM ?= $(shell command -v pnpm >/dev/null 2>&1 && echo pnpm || echo corepack pnpm)

# gitleaks is a Go binary, not an npm package: pinned here and installed into .bin/ (gitignored)
GITLEAKS_VERSION := 8.28.0
GITLEAKS := .bin/gitleaks

.PHONY: install gitleaks check lint typecheck test secrets

## install: dependencies + git hooks (husky, via the "prepare" script) + Prisma client + gitleaks
install: gitleaks
	$(PNPM) install
	$(PNPM) prisma generate

## gitleaks: download the pinned gitleaks into .bin/ (no-op if already there)
gitleaks:
	@sh scripts/install-gitleaks.sh $(GITLEAKS_VERSION) .bin

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
