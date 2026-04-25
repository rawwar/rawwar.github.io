# Portfolio Website Design Spec

**Domain:** about.foreach.in (rawwar.github.io)
**Tech stack:** Astro SSG, deployed to GitHub Pages
**Font:** JetBrains Mono (Nerd Font) — entire site
**Date:** 2026-04-25

## Color Palette

| Token         | Hex       | Usage                                      |
|---------------|-----------|---------------------------------------------|
| bg            | `#1d1d2c` | Page background                             |
| card-surface  | `#262638` | Cards, elevated surfaces                    |
| border        | `#3a3a50` | Card borders, dividers                      |
| gold          | `#ffb32d` | Active nav, sidebar highlight, CTAs, code   |
| purple        | `#bb92f3` | Icons, hover glow, tags, timeline, stars    |
| text-primary  | `#e2e8f0` | Headings, sidebar items                     |
| text-body     | `#a0aec0` | Body text, descriptions                     |
| text-muted    | `#718096` | Card descriptions                           |
| text-dim      | `#555`    | Dates, counts                               |

## Layout (Astronomer docs-inspired)

### Top Navbar
- Left: logo (`KALYAN`, 800 weight, letter-spacing 1.5px), nav links (About, TIL, Want to Learn)
- Right: search button (outline), GitHub button (gold outline)
- Border-bottom: `#2a2a3d`

### Left Sidebar (contextual, 240px)
- About page: section nav (About Me, Experience, Skills, Projects, Contact)
- TIL page (grid view): topic filters with counts (python (12), kafka (5), etc.)
- TIL page (scroll view): **no sidebar**
- Want to Learn page: **no sidebar** (full-screen canvas)
- Active item: gold text + `rgba(255, 179, 45, 0.13)` background
- Font size: 0.95em, white text (`#e2e8f0`)

## Pages

### 1. About Me (homepage)

- **Hero:** Short intro paragraph (max-width 640px)
- **"What I Work With":** 2-column card grid with SVG stroke icons in `#bb92f3`
  - Cards: `#262638` bg, `#3a3a50` border, 12px radius, 28px padding
  - Hover: `#bb92f3` border + `box-shadow: 0 0 20px rgba(187, 146, 243, 0.15), 0 0 4px rgba(187, 146, 243, 0.3)`
- **"Recent TILs":** 3-column card grid linking to TIL entries

### 2. TIL (Today I Learned)

Two view modes toggled by a Grid/Scroll button in the page header.

#### Grid View (default)
- Sidebar with topic filters + counts
- Responsive card grid: `repeat(auto-fill, minmax(280px, 1fr))`
  - Adapts from 2 cols (normal) to 4+ cols (ultrawide)
- Each card: tag badge (top), title, short description, date
- Same hover glow as About page cards
- No dummy/placeholder articles — starts empty, populated from content collection

#### Scroll View (timeline mode)
- **No sidebar** — full-width layout
- Centered single-article reader (max-width 720px)
- Full article content: date, title, tag, body with code blocks
- Prev/next arrow buttons for quick navigation
- **Timeline scroller** fixed at bottom:
  - Horizontal draggable track with date ticks
  - Center needle (purple glow) marks current position
  - Purple glowing dots on dates with TIL entries
  - Dim ticks for empty days
  - **Snaps to nearest date** on drag release
  - Selecting a date loads that day's article
  - Edge fade gradients (left/right) for compass feel
  - `<- past` / `future ->` labels
  - **"Today" button** (crosshair icon, top-right of timeline bar): smooth-scrolls to current date

### 3. Want to Learn

Full-screen interactive canvas page. No sidebar.

- **Background:** Deep space (`#0a0a14`) with 200+ tiny twinkling background stars
- **Stars:** Each represents a topic to learn
  - Orbit the central black hole at varying distances, speeds, and eccentricities
  - Twinkle with varying alpha
  - Purple glow (`#bb92f3`) halo around each
  - **On hover:** star enlarges, brighter glow, shows tooltip
  - **All orbital movement freezes** when any star is hovered (prevents chasing)
  - Larger hitbox (28px) for comfortable targeting

- **Tooltip (on hover):**
  - Dark glass panel (`rgba(26, 26, 46, 0.95)`) with `#bb92f3` border
  - Shows: title, description, tag
  - Backdrop blur, purple box shadow
  - Repositions to stay within viewport

- **Black Hole (Gargantua-inspired):**
  - True black event horizon (52px radius)
  - Einstein ring — thin bright photon ring shimmering around the event horizon
  - Gravitationally lensed arcs — bright golden-white bands curving over top, dimmer under bottom
  - Multi-layered accretion disk (tilted elliptical, scaleY 0.28):
    - 4 density layers from hot inner (white-gold) to cool outer (dark orange)
    - Doppler brightness variation (simulated spinning)
    - Hot white inner edge
    - Disk renders in two halves (back half behind event horizon, front half in front) for depth
  - Subtle animation: shimmer, hotspot rotation, flicker

- **Page label:** Bottom-left corner, title + subtitle

- **Data source:** Content collection of "want to learn" items, each with title, description, tag

## Content Architecture (Astro)

```
src/
  content/
    til/           # Markdown files, one per TIL entry
      YYYY-MM-DD-slug.md   # frontmatter: title, date, tags, description
    want-to-learn/  # Markdown or JSON for star items
      topic-slug.md         # frontmatter: title, description, tag
  layouts/
    BaseLayout.astro        # Nav, font loading, global styles
    SidebarLayout.astro     # BaseLayout + sidebar
  pages/
    index.astro             # About Me (homepage)
    til/
      index.astro           # TIL grid + scroll views
      [slug].astro          # Individual TIL article
    want-to-learn.astro     # Black hole canvas page
  components/
    Navbar.astro
    Sidebar.astro
    TilCard.astro
    ViewToggle.astro
    TimelineScroller.astro  # Client-side interactive component
    BlackHoleCanvas.astro   # Client-side canvas component
    StarTooltip.astro
```

## Deployment

- Astro builds static HTML/CSS/JS
- GitHub Actions workflow: on push to main, build with Astro, deploy to GitHub Pages
- CNAME preserved: `about.foreach.in`
- `.superpowers/` added to `.gitignore`

## Verification Plan

1. `npm run dev` — local dev server, check all three pages render
2. About page: card grid responsive, hover glow works, sidebar navigation
3. TIL page: grid/scroll toggle works, timeline scroller drags and snaps, "today" button
4. Want to Learn: stars orbit, freeze on hover, tooltips show, black hole renders with accretion disk
5. Responsive: test normal monitor, ultrawide (4+ cols), and mobile (1 col, no sidebar)
6. Build: `npm run build` succeeds, preview static output
7. Deploy: push to main, GitHub Actions builds and deploys, verify at about.foreach.in
