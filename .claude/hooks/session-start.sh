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

cd "$CLAUDE_PROJECT_DIR"

# Install npm dependencies using lockfile for deterministic installs
npm ci --no-audit --no-fund
