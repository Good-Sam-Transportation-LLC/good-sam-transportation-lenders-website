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

## 4. How It Works in CI

- **On every PR**: Copilot automatically reviews code (if enabled in settings)
- **On issue assignment**: Copilot SWE agent creates a PR (if enabled)
- **On every commit**: Existing CI runs lint, typecheck, test, security audit, build
- **CodeQL**: Scans every commit for security vulnerabilities
