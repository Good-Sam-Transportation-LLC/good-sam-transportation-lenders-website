# CLAUDE.md — Golden Chariot Growth

This file provides guidance for AI assistants working in this repository.

---

## Project Overview

**Good Sam Transportation** investor relations website. A modern, single-page React application that serves as a pitch/investor portal for a luxury ground transportation company. The site showcases financial metrics, fleet details, market opportunity, and investment terms to attract capital partners for fleet expansion.

Built with the [Lovable](https://lovable.dev) platform, but fully standard Vite + React + TypeScript code.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.3.1 |
| Language | TypeScript 5.8.3 |
| Build Tool | Vite 5.4.19 (with SWC) |
| Styling | Tailwind CSS 3.4.17 |
| UI Primitives | shadcn/ui (Radix UI) |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Routing | React Router DOM v6 |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Playwright |
| Linter | ESLint 9 (TypeScript rules) |
| Package Manager | npm (also has bun lockfile for Lovable platform) |

---

## Project Structure

```
/
├── src/
│   ├── components/          # All React components
│   │   ├── ui/              # shadcn/ui primitives (~60 components, generated)
│   │   ├── HeroSection.tsx  # Landing hero with key metrics
│   │   ├── FinancialsSection.tsx  # Charts + unit economics
│   │   ├── MarketSection.tsx      # Market opportunity + competitive advantages
│   │   ├── FleetSection.tsx       # Fleet inventory table
│   │   ├── InvestmentSection.tsx  # Use of funds + risk mitigation
│   │   ├── ContactSection.tsx     # Investor inquiry form
│   │   ├── SiteHeader.tsx         # Fixed nav with mobile menu
│   │   ├── SiteFooter.tsx         # Footer branding
│   │   ├── Ticker.tsx             # Scrolling metrics ticker
│   │   └── NavLink.tsx            # Anchor-linked nav item
│   ├── pages/
│   │   ├── Index.tsx        # Main page — composes all sections
│   │   └── NotFound.tsx     # 404 page
│   ├── hooks/
│   │   ├── use-mobile.tsx   # Returns boolean for <768px screens
│   │   └── use-toast.ts     # shadcn toast hook
│   ├── lib/
│   │   ├── utils.ts         # cn() class-merging utility
│   │   └── motion.ts        # Framer Motion animation presets
│   ├── test/
│   │   ├── setup.ts         # Vitest setup (jsdom + matchMedia mock)
│   │   └── example.test.ts  # Example test
│   ├── App.tsx              # Root: Router, QueryClient, Toast providers
│   ├── main.tsx             # ReactDOM.createRoot entry point
│   ├── index.css            # Global styles, CSS variables, utility classes
│   └── vite-env.d.ts        # Vite type shims
├── public/                  # Static assets
├── index.html               # HTML entry point
├── package.json
├── vite.config.ts           # Vite config: port 8080, @ alias, SWC, lovable-tagger
├── tailwind.config.ts       # Theme: gold accents, dark mode, custom fonts
├── tsconfig.json            # Path alias @ → src/
├── vitest.config.ts         # Test config: jsdom, globals, @ alias
├── playwright.config.ts     # E2E config via lovable-agent-playwright-config
├── eslint.config.js         # ESLint: TS rules + react-hooks + react-refresh
├── components.json          # shadcn/ui CLI config
└── postcss.config.js
```

---

## Development Commands

```bash
# Start dev server (localhost:8080)
npm run dev

# Production build → dist/
npm run build

# Development build (includes debug info)
npm run build:dev

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Run unit tests once
npm test

# Run unit tests in watch mode
npm run test:watch
```

---

## Architecture & Conventions

### Component Patterns

**Section components** are the main building blocks. Each one:
- Lives in `src/components/`
- Contains its own local data arrays (metrics, tables, etc.)
- Uses Framer Motion for entrance animations
- Exports a default function component

```tsx
// Typical section pattern
const data = [{ id: 1, label: "Example", value: "$100K" }];

const MySection = () => (
  <section id="my-section" className="py-20 ...">
    <div className="section-container">
      <motion.h2 {...fadeUpAnimateProps(0.1)}>Title</motion.h2>
      {data.map((item) => (
        <motion.div key={item.id} {...fadeUpProps(0.2)}>
          {item.label}: {item.value}
        </motion.div>
      ))}
    </div>
  </section>
);

export default MySection;
```

**Pages** (`src/pages/`) simply compose section components:

```tsx
// Index.tsx pattern
const Index = () => (
  <div>
    <SiteHeader />
    <HeroSection />
    <FinancialsSection />
    {/* etc. */}
    <SiteFooter />
  </div>
);
```

### Naming Conventions

- **Components**: PascalCase (`HeroSection`, `SiteHeader`)
- **Hooks**: camelCase prefixed with `use` (`useIsMobile`, `useToast`)
- **Utilities/functions**: camelCase (`cn`, `fadeUp`, `fadeUpAnimate`)
- **Local data arrays**: camelCase (`metrics`, `vehicles`, `advantages`)
- **CSS classes/IDs**: kebab-case (`glass-card`, `section-container`)

### Import Alias

Use `@/` for all imports from `src/`:

```ts
import { cn } from "@/lib/utils";
import { fadeUpProps } from "@/lib/motion";
import { Button } from "@/components/ui/button";
```

### TypeScript

- Non-strict mode: `strictNullChecks: false`, `noImplicitAny: false`
- `skipLibCheck: true`
- Prefer interfaces for prop types
- Use `satisfies` for type validation without explicit annotations where helpful

---

## Animation System

All animations use utilities from `src/lib/motion.ts`.

**Props-spread helpers** (pass all motion props via spread — use these for standalone animated elements):

```ts
// Scroll-triggered (fires when element enters viewport)
<motion.div {...fadeUpProps(delay)}>

// Mount animation (fires immediately on render)
<motion.div {...fadeUpAnimateProps(delay)}>
```

**Variants objects** (use with a parent `staggerContainer` for staggered children):

```tsx
<motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
  <motion.p variants={fadeUp}>...</motion.p>
  <motion.h2 variants={fadeUp}>...</motion.h2>
</motion.div>
```

Both helpers accept an optional `delay` (seconds). The easing curve is `[0.16, 1, 0.3, 1]` throughout the app — do not change this for consistency.

Scroll-triggered animations use `viewport: { once: true, margin: "-60px" }` — they fire once and don't repeat.

---

## Styling System

### Tailwind Configuration

- **Dark mode**: `class` strategy (toggle `.dark` on `<html>`)
- **Fonts**: `Inter` (sans-serif body), `Instrument Serif` (serif headings), `IBM Plex Mono` (data/numbers)
- **Custom color**: `gold` (`hsl(43 72% 52%)`) — used for accents, borders, highlights

### CSS Variables (`src/index.css`)

Core palette colors are HSL CSS variables. Key ones include:
- `--background`: dark blue-gray `220 20% 4%`
- `--foreground`: near-white `210 40% 96%`
- `--primary` / `--primary-foreground`
- `--gold`: `43 72% 52%` (golden accent)
- `--surface`: slightly lighter than background
- Glass/shadow tokens (e.g., `--glass-bg`, `--glass-border`, `--shadow-card`) use `rgba(...)` for alpha-blended effects.
### Utility Classes

Defined in `src/index.css` — use these instead of repeating utility combinations:

| Class | Purpose |
|---|---|
| `.section-container` | Max-width wrapper with responsive horizontal padding |
| `.glass-card` | Dark frosted-glass card with blur and border |
| `.glass-card-gold` | Glass card with gold border variant |
| `.data-mono` | Monospace font with tabular numbers for metrics |
| `.text-gold-gradient` | Golden gradient text effect |
| `.ticker-scroll` | Infinite horizontal scroll animation |

---

## Testing

### Unit Tests (Vitest)

- Test files: `src/**/*.{test,spec}.{ts,tsx}`
- Environment: jsdom (DOM simulation)
- Globals: `describe`, `it`, `expect`, `beforeEach`, etc. available without imports
- Setup: `src/test/setup.ts` — mocks `window.matchMedia`

Write tests alongside source files or in `src/test/`:

```ts
import { render, screen } from "@testing-library/react";
import MyComponent from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders expected content", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

- Config: `playwright.config.ts` (extends Lovable's base config)
- Import test fixture from `lovable-agent-playwright-config`

---

## Key Files Reference

| File | Purpose |
|---|---|
| `src/App.tsx` | Root — sets up Router, QueryClientProvider, TooltipProvider, shadcn Toaster, and Sonner toaster |
| `src/pages/Index.tsx` | Main page — assembles all sections |
| `src/index.css` | Global styles, CSS custom properties, utility classes |
| `src/lib/utils.ts` | `cn()` — Tailwind class merging helper |
| `src/lib/motion.ts` | `fadeUpProps()`, `fadeUpAnimateProps()` — scroll/mount animation prop helpers; `fadeUp`, `staggerContainer` — Variants objects for staggered animations |
| `src/hooks/use-mobile.tsx` | `useIsMobile()` — responsive breakpoint hook |
| `tailwind.config.ts` | Theme tokens, custom colors, fonts, animations |
| `vite.config.ts` | Build config: port 8080, `@` alias, SWC, lovable-tagger |
| `components.json` | shadcn/ui CLI config (path aliases, style settings) |

---

## shadcn/ui Components

All UI primitives live in `src/components/ui/`. These are **generated files** — do not hand-edit them unless necessary. To add new shadcn components, use the CLI:

```bash
npx shadcn@latest add <component-name>
```

Existing components include: Button, Card, Dialog, Form, Input, Select, Tabs, Table, Toast, Tooltip, Badge, Separator, Sheet, Accordion, and many more.

---

## Git Workflow

- **Commit style**: Short imperative phrases, present tense. Examples:
  - `Reduce funding target under 500K`
  - `Implement investorSite groundwork`
  - `Add fleet section with vehicle table`
- **Main branch**: `main`
- **Feature branches**: Descriptive names off `main`
