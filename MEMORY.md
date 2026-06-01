# Project Memory — Mathew Brown Portfolio

> Read this at the start of every session to understand what the project is and what has been built.
> Keep it updated as work progresses.

## What this is

A personal portfolio site for **Mathew Brown** — a freelance UX/UI engineer, SEO/AEO specialist, and agentic-workflow developer. Dark, editorial, design-forward aesthetic. Domain: `matbrown.io`. Email: `mat@matbrown.io`.

## Tech stack

- **React + Vite** with **vite-react-ssg** (static site generation / prerender at build)
- **TypeScript**
- **Tailwind CSS v4** (tokens defined via `@theme` in `src/styles/globals.css`, plus `@tailwindcss/typography`)
- **motion** (Framer Motion) for animation
- **react-router-dom** for routing (`src/router.tsx`)
- **MDX** (`@mdx-js/react`) for case study + blog content
- **react-helmet-async** for SEO (`src/components/SEO.tsx`)
- **Netlify Forms** for the contact form
- Font: **Poppins**

### Commands
- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — `vite-react-ssg build` (static prerender)
- `npm run preview` — preview production build
- `npm run test` / `npm run test:run` — Vitest
- `npm run typecheck` — `tsc --noEmit`

## Brand tokens (from `src/styles/globals.css` `@theme`)

| Token | Value | Use |
|-------|-------|-----|
| `directors-black` | `#090909` | page background |
| `secondary-dark` | `#0e0e0e` | panels / cards |
| `vermilion` | `#f86343` | accent |
| `vermilion-hover` | `#f9764a` | accent hover |
| `cream` | `#f5f0e8` | primary text |
| `muted-prose` | `#7a7060` | secondary text |
| `border-line` | `#1c1c1c` | borders / dividers |

Design language: big bold display type (clamp sizing, tight tracking), uppercase tracked "eyebrow" labels, vermilion numbered sections (`01`, `02`…), generous spacing, alternating left/centered section alignment.

## Architecture / key files

- `src/router.tsx` — routes (Home, About, Services, Work, Work detail, Blog, Blog pillar, Blog article, Contact, 404)
- `src/layouts/DefaultLayout.tsx` — Navbar + `<Outlet>` + Footer; wraps routes in `AnimatePresence`
- `src/lib/content.ts` — content pipeline via `import.meta.glob` over `src/content/**`. **Case studies are sorted by `date` descending.** Helpers: `getCaseStudies`, `getCaseStudyBySlug`, `getNextCaseStudy`, `getBlogPillars`, `getBlogArticles`, etc.
- `src/types/content.ts` — frontmatter interfaces (`CaseStudyFrontmatter`, `BlogPillarFrontmatter`, `BlogArticleFrontmatter`)
- `src/content/case-studies/*.mdx` — case studies
- `src/content/blog/<pillar>/index.mdx` — blog pillar landing pages; articles are `src/content/blog/<pillar>/<article>.mdx`
- `src/components/animations/` — `FadeIn`, `StaggerList`/`StaggerItem`, `PageTransition`
- `src/components/mdx/` — MDX components: `ImageCarousel`, `BeforeAfterSlider`, `AnnotatedImage`, `VideoPlayer`, `Metrics`, plus `caseStudyMdx.tsx` (scroll-animated h2/h3/p/ul/ol/blockquote, case-study only)
- `src/components/ui/` — `Button`, `Card`, `Tag`
- `public/images/` — hand-built SVG cover art + placeholder mockups

## Content

### Case studies (`src/content/case-studies/`)
1. **Vamp Network** — Creative Director; creator-management platform; React/Vite/Supabase/APIs; custom dashboard + internal AI flows. Live: vampnetwork.com
2. **The Booking Flow** — Founder & Lead Developer; lead-capture SaaS for trades; React/Vite/Supabase/n8n/Google OAuth. Live: thebookingflow.com
3. **'Aiwi Waffles** — Lead Designer & Developer; brand identity + Shopify storefront; **Google Business Profile / local SEO got the storefront ranking #1 for multiple keywords, driving tourist foot traffic.** Live: aiwiwaffles.com

Each case study has: cover image, SEO `headline`, project-meta grid (`role`/`services`/`stack` frontmatter), `liveUrl`, numbered animated sections, a pull quote, an `<ImageCarousel>` (placeholder screens), and a `<Metrics>` block.

### Blog pillars (9 total, card layout with cover images)
- **UX/UI:** UX/UI Design, Design Systems
- **SEO/AEO:** Technical SEO, Answer Engine Optimization
- **AI Workflows:** Agentic Workflows, AI Automation
- **Brand Development:** Brand Identity, Brand Strategy
- **SaaS Development:** SaaS Development

Pillars render alphabetically by directory name. Only UX/UI Design currently has an article (`button-states-that-convert`).

## Build log (work completed)

- **Mobile menu drawer** — added padding so content isn't flush to edges.
- **Content cleanup** — removed redundant name from hero eyebrow; removed em dashes from all visible copy site-wide.
- **Section scroll animations** — `FadeIn` and per-item `StaggerItem` reveal at ~15% scroll offset; respect reduced motion.
- **Case study pages** — built 3 real case studies; date-sorted; SEO headlines; meta grids; numbered sections (`.case-study-prose` CSS counter); pull quotes; image carousels; metrics blocks; "Next project" link.
- **Cover art** — hand-built on-brand SVGs (1600×900, 16:9) for all case studies and blog pillars; placeholder UI mockups (`placeholder-screen-1/2.svg`) and brand mockups (`placeholder-brand-1/2.svg`).
- **SEO headings** — keyword-led `h1`/`h2` across Home, About, Work, Blog, and case studies.
- **Homepage** — added section `h2`s; centered the Work section; removed the "Ready to start" CTA (footer CTA replaces it); 2-sentence hero body copy.
- **About** — Skills section as cards with vermilion accent; centered heading + columns.
- **Blog** — pillars converted from list to card layout; expanded to 9 pillars.
- **Card hover** — redesigned to a `top`-based lift + vermilion border/glow to avoid a GPU compositing artifact (verified in-browser).
- **Scroll restoration** — `PageTransition` resets scroll to top before paint (`useLayoutEffect`, isomorphic) on every route change, including case-study → next-project navigation, so there's no bottom-of-page flash.
- **Responsive fix** — the case study project-meta grid stacks to one column on mobile and goes 3-across at `sm`+ (`grid-cols-1 sm:grid-cols-3`).
- **Footer** — full redesign: contact CTA band (availability indicator, email, button), link columns (Pages/Writing/Connect with vermilion labels), bottom bar with back-to-top.
- **Contact form** — added Company input + Budget select; everything required except Message; custom select caret with padding; vermilion `*` on required labels. Posts to Netlify.
- **Work/Services polish** — fixed card image cropping on Work; removed trailing bottom border on Services.
- **Config** — disabled the Vercel Claude Code plugin in `~/.claude/settings.json` (takes effect next session).

## Outstanding TODOs

- **Metrics numbers** — all `<Metrics>` blocks use `"00"` placeholders (each has a TODO comment). 'Aiwi's `#1` ranking is real; the rest need real figures.
- **Real screenshots/photos** — case study `<ImageCarousel>`s use placeholders; swap `src` for real assets in `public/images/`.
- **Meta `<title>` tags** — page-level SEO titles (e.g. `<SEO title="Work" />`) are still thin/keyword-light; only the visible `h1`s were made keyword-focused.
- **Cover images as `og:image`** — covers are SVG, which some social platforms don't render for previews; consider raster (PNG/WebP) versions for sharing.
- Blog pillars (8 of 9) have no articles yet.
