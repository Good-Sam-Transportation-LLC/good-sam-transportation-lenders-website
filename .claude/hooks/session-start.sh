#!/usr/bin/env bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

if [ -z "${CLAUDE_PROJECT_DIR:-}" ]; then
  echo "Error: CLAUDE_PROJECT_DIR is not set." >&2
  exit 1
fi

if [ ! -d "$CLAUDE_PROJECT_DIR" ]; then
  echo "Error: CLAUDE_PROJECT_DIR '$CLAUDE_PROJECT_DIR' does not exist or is not a directory." >&2
  exit 1
fi

cd "$CLAUDE_PROJECT_DIR"

# Skip install if node_modules is already up to date with package-lock.json
if [ -f "node_modules/.package-lock.json" ] && \
   [ "node_modules/.package-lock.json" -nt "package-lock.json" ]; then
  echo "node_modules is up to date, skipping npm ci"
  exit 0
fi

# Install npm dependencies using lockfile for deterministic installs
npm ci --no-audit --no-fund
