# Portfolio Website Implementation Plan

## Context

Building a portfolio site at `about.foreach.in` (rawwar.github.io) using Astro SSG. The repo is currently a blank slate — just a one-line `index.html`. The design was brainstormed iteratively with visual mockups and is captured in `docs/superpowers/specs/2026-04-25-portfolio-design.md`.

Three pages: About Me (homepage), TIL (grid + scroll views with timeline), and Want to Learn (Gargantua black hole canvas with orbiting star topics).

## Step 1: Scaffold Astro project

- Initialize Astro in the repo root (overwriting existing `index.html`)
- Configure for static output (GitHub Pages)
- Add JetBrains Mono font (Google Fonts or self-hosted)
- Update `.gitignore` for Astro (`node_modules/`, `dist/`, `.astro/`, `.superpowers/`)
- Preserve `CNAME` file in `public/`
- **Files:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `public/CNAME`

## Step 2: Global styles + design tokens

- Create CSS custom properties for the full color palette (`#1d1d2c`, `#262638`, `#3a3a50`, `#ffb32d`, `#bb92f3`, etc.)
- Base styles: JetBrains Mono font, background, text colors, box-sizing reset
- Card hover glow mixin/class (reused across all pages)
- **Files:** `src/styles/global.css`

## Step 3: Base layout + Navbar component

- `BaseLayout.astro` — html head (font, meta, global CSS), slot for content
- `Navbar.astro` — logo, nav links (About, TIL, Want to Learn), search button, GitHub button
- Active link highlighting based on current path
- **Files:** `src/layouts/BaseLayout.astro`, `src/components/Navbar.astro`

## Step 4: Sidebar layout + component

- `SidebarLayout.astro` — extends BaseLayout, adds 240px sidebar + main content area
- `Sidebar.astro` — accepts items prop, renders with active state (gold highlight)
- **Files:** `src/layouts/SidebarLayout.astro`, `src/components/Sidebar.astro`

## Step 5: About Me page (homepage)

- Hero intro paragraph
- "What I Work With" — 2-column card grid with SVG stroke icons in `#bb92f3`
- "Recent TILs" — 3-column card grid (pulls from TIL content collection, empty initially)
- Sidebar: section nav (About Me, Experience, Skills, Projects, Contact)
- **User contribution opportunity:** The intro text and "What I Work With" card content — this is personal content only you can write
- **Files:** `src/pages/index.astro`, `src/components/Card.astro`

## Step 6: Content collections setup

- Define TIL collection schema: `title`, `date`, `tags` (array), `description`
- Define Want to Learn collection schema: `title`, `description`, `tag`
- Config in `src/content.config.ts`
- **Files:** `src/content.config.ts`, `src/content/til/.gitkeep`, `src/content/want-to-learn/.gitkeep`

## Step 7: TIL page — Grid View

- `src/pages/til/index.astro` — default grid view
- `TilCard.astro` component — tag badge, title, description, date, hover glow
- Responsive grid: `repeat(auto-fill, minmax(280px, 1fr))`
- Sidebar: topic filters with counts (derived from content collection tags)
- `ViewToggle.astro` — Grid/Scroll toggle button in page header
- **Files:** `src/pages/til/index.astro`, `src/components/TilCard.astro`, `src/components/ViewToggle.astro`

## Step 8: TIL page — Scroll View + Timeline

- Scroll view layout: no sidebar, centered article reader (max-width 720px)
- `TimelineScroller.astro` — client-side interactive component (`client:load`)
  - Draggable horizontal track with date ticks
  - Center needle with purple glow
  - Purple dots on dates with entries
  - Snap to nearest date on release
  - "Today" button with smooth scroll
  - Edge fade gradients
  - Prev/next arrow buttons
- Selecting a date filters to show that day's article
- `[slug].astro` — individual TIL article page (for direct links / SEO)
- **Files:** `src/components/TimelineScroller.astro`, `src/components/ScrollView.astro`, `src/pages/til/[slug].astro`

## Step 9: Want to Learn page — Black Hole Canvas

- Full-screen canvas page, no sidebar
- `BlackHoleCanvas.astro` — client-side canvas component (`client:load`)
  - Gargantua black hole: event horizon, Einstein ring, lensed arcs, multi-layered accretion disk with Doppler variation
  - Orbiting stars from content collection data
  - Freeze all movement on hover
  - Tooltip component (glass panel, purple border, backdrop blur)
  - Background star field (200+ tiny twinkling stars)
- Page label bottom-left
- **Files:** `src/pages/want-to-learn.astro`, `src/components/BlackHoleCanvas.astro`, `src/components/StarTooltip.astro`

## Step 10: GitHub Actions deployment

- Workflow: on push to main → build Astro → deploy to GitHub Pages
- Use official `withastro/action@v3` or standard Node build + `actions/deploy-pages`
- Ensure CNAME is preserved in build output
- **Files:** `.github/workflows/deploy.yml`

## Step 11: Cleanup + verification

- Remove old `index.html` (replaced by Astro)
- Update `README.md` with project info
- Add `.superpowers/` to `.gitignore`
- Run full verification:
  1. `npm run dev` — all three pages render
  2. About page: card grids, hover glow, sidebar
  3. TIL page: grid/scroll toggle, timeline drag + snap, today button
  4. Want to Learn: stars orbit, freeze on hover, tooltips, black hole renders
  5. Responsive: normal, ultrawide, mobile
  6. `npm run build` — succeeds
  7. Deploy and verify at about.foreach.in

## Key Files Reference

| File | Purpose |
|------|---------|
| `docs/superpowers/specs/2026-04-25-portfolio-design.md` | Full design spec with colors, layout, behavior |
| `.superpowers/brainstorm/*/content/*.html` | Visual mockups (reference only, not deployed) |
