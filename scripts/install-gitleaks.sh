#!/usr/bin/env sh
# Installs a pinned gitleaks release into a repo-local bin dir, verified against the release checksums.
# Usage: scripts/install-gitleaks.sh <version> <bin-dir>. No-op when that version is already installed.
set -eu

VERSION="$1"
BIN_DIR="$2"
TARGET="$BIN_DIR/gitleaks"

if [ -x "$TARGET" ] && [ "$("$TARGET" version 2>/dev/null)" = "$VERSION" ]; then
  exit 0
fi

case "$(uname -s)" in
  Linux) os=linux ;;
  Darwin) os=darwin ;;
  *) echo "install-gitleaks: unsupported OS $(uname -s)" >&2; exit 1 ;;
esac

case "$(uname -m)" in
  x86_64 | amd64) arch=x64 ;;
  aarch64 | arm64) arch=arm64 ;;
  *) echo "install-gitleaks: unsupported CPU $(uname -m)" >&2; exit 1 ;;
esac

asset="gitleaks_${VERSION}_${os}_${arch}.tar.gz"
base="https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "install-gitleaks: downloading gitleaks $VERSION ($os/$arch)"
curl -fsSL -o "$tmp/$asset" "$base/$asset"
curl -fsSL -o "$tmp/checksums.txt" "$base/gitleaks_${VERSION}_checksums.txt"

expected="$(grep " $asset\$" "$tmp/checksums.txt" | cut -d' ' -f1)"
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tmp/$asset" | cut -d' ' -f1)"
else
  actual="$(shasum -a 256 "$tmp/$asset" | cut -d' ' -f1)"
fi

if [ -z "$expected" ] || [ "$expected" != "$actual" ]; then
  echo "install-gitleaks: checksum mismatch for $asset" >&2
  exit 1
fi

tar -xzf "$tmp/$asset" -C "$tmp" gitleaks
mkdir -p "$BIN_DIR"
install -m 755 "$tmp/gitleaks" "$TARGET"
echo "install-gitleaks: installed $TARGET"
