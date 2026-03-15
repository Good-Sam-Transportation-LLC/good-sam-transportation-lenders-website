

## Situation

The entire investor website from the previous conversation did not persist. The codebase is a blank Vite + React + Tailwind + shadcn project. We need to build the full Good Sam Transportation investor portal from scratch, now including the revenue growth chart.

## Plan

### 1. Design System Setup
- Update `tailwind.config.ts` with custom colors: midnight navy (`#0a1628`), charcoal, gold (`#c9a84c`), slate tones
- Update `src/index.css` with dark investor-grade palette as defaults, import Google Fonts (Instrument Serif for headings, Inter for body, IBM Plex Mono for financial data)

### 2. Utility Module
- Create `src/lib/motion.ts` with reusable Framer Motion animation variants (fadeUp, stagger, container)

### 3. Core Sections (each as a component in `src/components/`)
- **SiteHeader.tsx** — Fixed nav with logo, section links, gold "Request Pitch Deck" CTA
- **HeroSection.tsx** — Full-viewport hero with $200K ARR headline, LA market, luxury positioning
- **Ticker.tsx** — Horizontal scrolling metrics bar (28% Net Margin, 85% Retention, 92% Utilization, $185K Fleet Value)
- **MarketSection.tsx** — LA luxury transportation TAM, growth stats, competitive positioning
- **FinancialsSection.tsx** — Unit economics cards, per-vehicle yield, payback period, margin breakdown
- **RevenueChartSection.tsx** — **NEW**: Area/line chart using Recharts showing:
  - Historical: Q1-Q4 2025 quarterly revenue (~$50K/quarter trending to $200K annual)
  - Projected: Q1-Q4 2026 post-funding trajectory scaling to ~$600K-$800K ARR
  - Styled with gold gradient fill for projections, dashed line separator between actual/projected
  - Uses the existing `recharts` dependency and shadcn chart components
- **FleetSection.tsx** — Asset table (Escalade, S 580, Navigator), total $185K valuation
- **InvestmentSection.tsx** — $500K capital ask with allocation breakdown (70% fleet, 20% tech, 10% marketing)
- **ContactSection.tsx** — Investor inquiry form with pitch deck / P&L request checkboxes
- **SiteFooter.tsx** — Minimal footer with legal links

### 4. Page Composition
- Update `src/pages/Index.tsx` to import and render all sections in order
- Single-page scrolling layout with section anchors

### 5. Dependencies
- Add `framer-motion` for scroll animations

### Technical Details
- Revenue chart uses Recharts `AreaChart` with two `Area` series (actual vs projected) and a `ReferenceLine` at the current quarter boundary
- Chart data is hardcoded based on the $200K ARR figure, with projections modeled on 3x growth from fleet expansion ($500K capital → 4-5 additional vehicles)
- Dark theme by default (no toggle needed) — all CSS variables set to the midnight/gold palette
- Responsive: mobile-first with breakpoints at `md` and `lg`

