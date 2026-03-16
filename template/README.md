# Vite + React + TypeScript Project Template

A production-ready template with comprehensive CI/CD, testing, linting, and build quality checks.

## What's Included

### CI/CD Pipeline (`.github/workflows/ci.yml`)

5-job pipeline that runs on every commit and PR:

| Job | Trigger | Purpose |
|-----|---------|---------|
| `lint-and-typecheck` | push + PR | ESLint + TypeScript type checking |
| `test` | push + PR | Vitest unit tests |
| `security` | push + PR | `npm audit --audit-level=high` |
| `test-coverage-check` | PR only | Verify new files have tests |
| `build` | push + PR | Production build + build verification tests |

### Code Scanning (`.github/workflows/codeql.yml`)

- GitHub CodeQL security analysis on every commit + weekly
- Scans JavaScript/TypeScript for vulnerabilities

### Dependency Management (`.github/dependabot.yml`)

- Weekly npm dependency updates
- Weekly GitHub Actions version updates

### Linting (`eslint.config.js`)

Comprehensive ESLint 9 flat config with:
- React hooks and refresh rules
- JSX accessibility (jsx-a11y) — 11 rules
- TypeScript strict rules (unused vars, no-any, consistent imports)
- Code quality (no-console, no-debugger, prefer-const, eqeqeq)
- Relaxed rules for generated shadcn/ui components

### Testing Infrastructure

- **Vitest** with jsdom environment and Testing Library
- **DOM mocks**: IntersectionObserver, ResizeObserver, matchMedia
- **`renderWithProviders()`** helper for components needing React Query + Router
- **ESLint rule tests** — verify linter catches violations
- **CI pipeline tests** — verify workflow YAML structure
- **Code scanning tests** — verify CodeQL + Dependabot config
- **Build config tests** — verify Vite, TypeScript, package.json settings
- **Build verification tests** — verify dist/ output (sizes, HTML, minification)
- **Coverage check tests** — verify PR test coverage script

### PR Test Coverage Check (`.github/scripts/check-test-coverage.sh`)

Enforces that every new/changed source file has a corresponding test file:
- `src/components/Foo.tsx` → `src/components/__tests__/Foo.test.tsx`
- `src/hooks/use-bar.ts` → `src/hooks/__tests__/use-bar.test.ts`
- `src/lib/baz.ts` → `src/lib/__tests__/baz.test.ts`
- `src/pages/Page.tsx` → `src/pages/__tests__/Page.test.tsx`

## Quick Start

```bash
# From this template directory:
./setup.sh my-new-project

# Or manually:
cd my-new-project
npm install
npm run dev
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server (port 8080) |
| `npm run build` | Production build → dist/ |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:build` | Run build verification tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run typecheck` | TypeScript type check |

## Adding Components

Use shadcn/ui CLI to add UI primitives:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

## Test Conventions

- Test files go in `__tests__/` next to the source
- Use `renderWithProviders()` from `src/test/test-utils.tsx`
- Mock Framer Motion with the Proxy pattern if using animations
- Every new file must have a test (enforced by PR check)
