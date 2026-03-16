# GitHub Copilot Integration Setup

This repository is configured for GitHub Copilot code review and SWE agent. Follow these steps to enable them.

## 1. Enable Copilot Code Review (Automatic PR Reviews)

Copilot code review is a repository setting, not a GitHub Action.

### Steps:
1. Go to **Repository Settings** > **Rules** > **Rulesets**
2. Click **New ruleset** > **New branch ruleset**
3. Name it "Main branch protection"
4. Under **Target branches**, add `main`
5. Under **Branch rules**, check **Require a pull request before merging**
6. Check **Require review from Code owners**
7. Check **Automatically request Copilot code review**
8. Optionally check **Review new pushes** for re-review on force pushes
9. Click **Create**

### Custom Instructions:
Copilot uses `.github/copilot-instructions.md` to customize its review behavior. This file is already configured with focus areas for security, React, TypeScript, accessibility, testing, and performance.

## 2. Enable Copilot SWE Agent (Automated Issue Resolution)

The Copilot coding agent can automatically work on issues assigned to `@copilot`.

### Prerequisites:
- GitHub Copilot Enterprise or Copilot Pro+ subscription
- Repository must allow GitHub Actions

### Steps:
1. Go to **Repository Settings** > **Copilot** > **Coding agent**
2. Enable the coding agent for this repository
3. The environment is configured via `.github/copilot-setup-steps.yml`

### Usage:
- Assign any issue to `@copilot` to trigger the agent
- Copilot will create a draft PR with the fix
- Review the PR as you would any human contribution
- The agent runs lint, typecheck, and tests before submitting

## 3. What's Configured

| File | Purpose |
|------|---------|
| `.github/copilot-instructions.md` | Custom review instructions (security, React, a11y, testing) |
| `.github/copilot-setup-steps.yml` | SWE agent environment setup (Node 20, npm ci, lint, test) |
| `.github/COPILOT_SETUP.md` | This setup guide |

## 3.5 Autonomous Autofix Behavior

This repository is configured so Copilot operates **fully autonomously** — no human in the loop.

### How It Works:
1. Copilot reviews every PR automatically (via repo settings)
2. For every issue found, Copilot posts a comment with a `suggestion` block containing the fix
3. The `copilot-autofix.yml` workflow detects Copilot's suggestion comments
4. The workflow automatically applies each suggestion and commits it to the PR branch
5. No human approval is needed — suggestions are applied immediately

### Configuration Files:
- `.github/copilot-instructions.md` — instructs Copilot to always provide fixable suggestions, never advisory-only comments
- `.github/workflows/copilot-autofix.yml` — auto-applies Copilot suggestions via GitHub API
- `.github/copilot-setup-steps.yml` — SWE agent environment for issue resolution

### Repository Settings Required:
1. Go to **Repository Settings** > **Rules** > **Rulesets**
2. Enable **Automatically request Copilot code review** for the `main` branch
3. The autofix workflow runs automatically — no additional settings needed

## 4. How It Works in CI

- **On every PR**: Copilot automatically reviews code (if enabled in settings)
- **On issue assignment**: Copilot SWE agent creates a PR (if enabled)
- **On every commit**: Existing CI runs lint, typecheck, test, security audit, build
- **CodeQL**: Scans every commit for security vulnerabilities

## 5. Automatic Test Generation

Every fix applied by Copilot or Codex automatically generates corresponding tests.

### Workflow: `.github/workflows/auto-test-generation.yml`
- Triggers on push when the commit is from a bot (copilot, codex, github-actions)
- Finds changed source files missing `__tests__/` test files
- Uses Codex CLI to generate comprehensive test suites
- Commits the generated tests to the branch

### Script: `.github/scripts/generate-test-stubs.sh`
- Generates test stub files for source files missing tests
- Creates React component tests (TSX) or module tests (TS)
- Follows the `__tests__/ComponentName.test.tsx` convention
- Can be run locally: `bash .github/scripts/generate-test-stubs.sh src/components/MyComponent.tsx`

## 6. Workflow Self-Healing

### Auto-Fix (`.github/workflows/workflow-autofix.yml`)
- Triggers when any monitored workflow fails (`workflow_run` event)
- Downloads error logs from the failed run
- Uses Codex CLI to diagnose and fix the issue
- Commits the fix and pushes automatically

### Auto-Test (`.github/workflows/workflow-test-runner.yml`)
- Triggers when `.github/workflows/*.yml` files change
- Runs `generate-workflow-tests.sh` to create test files for new workflows
- Runs `npm test` to verify all workflow tests pass
- Commits new test files automatically
