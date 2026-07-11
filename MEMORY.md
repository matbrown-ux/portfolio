# Project Memory — Mathew Brown Portfolio

> Read this at the start of every session to understand what the project is and what has been built.
> Keep it updated as work progresses.

## What this is

A personal portfolio site for **Mathew Brown** — a freelance UX/UI engineer, SEO/AEO specialist, and agentic-workflow developer. Dark, editorial, design-forward aesthetic. Domain: `matbrown.io`. Email: `mat@matbrown.io`.

## Tech stack

- **React + Vite** with **vite-react-ssg** (static site generation / prerender at build)
- **TypeScript**
- **Tailwind CSS v4** (tokens defined via `@theme` in `src/styles/globals.css`, plus `@tailwindcss/typography`)
- **motion** (Framer Motion) for animation (the established library, used site-wide)
- **GSAP** + **@gsap/react** (`useGSAP`) for scroll/timeline experiments, currently sandboxed to `/lab`
- **react-router-dom** for routing (`src/router.tsx`)
- **MDX** (`@mdx-js/react`) for case study + blog content
- **vite-react-ssg `Head`** for SEO (`src/components/SEO.tsx`) — titles, meta, and JSON-LD are **prerendered** into each page's static HTML. (react-helmet-async is no longer the SEO path.)
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
| `charcoal` | `#2a2a2a` | outline-button hover fill |

Easing tokens: `--ease-out-quint` (reveals) and `--ease-in-out-cubic` (symmetric hover, e.g. the button border draw).

Design language: big bold display type (clamp sizing, tight tracking), uppercase tracked "eyebrow" labels, vermilion numbered sections (`01`, `02`…), generous spacing, alternating left/centered section alignment.

## Architecture / key files

- `src/router.tsx` — routes (Home, About, Services, Work, Work detail, Blog, Blog pillar, Blog article, Contact, 404)
- `src/layouts/DefaultLayout.tsx` — Navbar + `<PageCurtain>` (renders the routed page + the global page transition) + Footer.
- `src/lib/content.ts` — content pipeline via `import.meta.glob` over `src/content/**`. **Case studies are sorted by `date` descending.** Helpers: `getCaseStudies`, `getCaseStudyBySlug`, `getNextCaseStudy`, `getBlogPillars`, `getBlogArticles`, etc.
- `src/types/content.ts` — frontmatter interfaces (`CaseStudyFrontmatter`, `BlogPillarFrontmatter`, `BlogArticleFrontmatter`)
- `src/content/case-studies/*.mdx` — case studies
- `src/content/blog/<pillar>/index.mdx` — blog pillar landing pages; articles are `src/content/blog/<pillar>/<article>.mdx`
- `src/components/animations/` — `FadeIn`, `StaggerList`/`StaggerItem`. `PageTransition` is now a **pass-through** (no-op wrapper kept so pages don't need edits); the global transition + scroll reset live in `PageCurtain`.
- `src/components/PageCurtain.tsx` — **global page transition** (the "curtain"). Renders the routed page via `useOutlet` (frozen during cover so the content swap is hidden) plus two GSAP panels (vermilion diagonal + directors-black) that slide down to cover, swap content + reset scroll at full cover, then lift to reveal. Replaced the Framer fade + `AnimatePresence`. Panels are `h-[130vh]` (taller than viewport so the diagonal sweeps but the bottom stays covered), ~2s, `power2.inOut`, reduced-motion = instant swap. Exposes `useEntranceDelay()` and owns scroll reset.
- `src/lib/gsap.ts` — **single, browser-guarded** GSAP plugin-registration point (`typeof window` guard for SSR); re-exports `gsap`, `ScrollTrigger`, `useGSAP`. Import GSAP through this, not directly.
- `src/components/work/covers/` — animated inline-SVG case-study covers: one component per project (`VampNetworkCover`, `TheBookingFlowCover`, `AiwiWafflesCover`), a shared `useCoverReveal` hook (scroll-in reveal, reduced-motion gated, SSR-safe), `CoverChip` (centered category pills), and `index.ts` (slug→component map; falls back to the static `<img>` cover). Used on the `/work` cards and the case-study hero (`WorkDetail`).
- `src/pages/Lab.tsx` + `/lab` route — GSAP sandbox (noindex, not linked in nav). Holds a hero-load-animation prototype (image grows+fades, then circle), a scroll-scrub progress bar, and a character-reveal scroll demo. `gsap.matchMedia()` reduced-motion gating; progress bar `z-[70]` above the `z-[60]` navbar.
- `src/components/mdx/` — MDX components: `ImageCarousel`, `BeforeAfterSlider`, `AnnotatedImage`, `VideoPlayer`, `Metrics`, plus `caseStudyMdx.tsx` (scroll-animated h2/h3/p/ul/ol/blockquote, case-study only)
- `src/components/ui/` — `Button`, `Card`, `Tag`
- `public/images/` — hand-built SVG cover art + placeholder mockups

## Content

### Case studies (`src/content/case-studies/`)
1. **Vamp Network** — Creative Director; creator-management platform; React/Vite/Supabase/APIs; marketing site with a **custom form funnel** feeding a custom dashboard (leads) + internal AI flows. Live: vampnetwork.com
2. **The Booking Flow** — Founder & Lead Developer; lead-capture SaaS for trades; **Astro + React Islands** (chosen for technical SEO/AEO) / Supabase / n8n / Google OAuth; underwent a full **brand redesign** (logo, palette, typography, messaging). Live: thebookingflow.com
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
- **Scroll restoration** — now owned by `PageCurtain`: it resets scroll (`window.scrollTo(0,0)` + `ScrollTrigger.clearScrollMemory()`) at the covered content swap, so navigation (including case-study → next-project) lands on the hero. (Superseded the old `PageTransition`-on-mount reset.)
- **Responsive fix** — the case study project-meta grid stacks to one column on mobile and goes 3-across at `sm`+ (`grid-cols-1 sm:grid-cols-3`).
- **Footer** — full redesign: contact CTA band (availability indicator, email, button), link columns (Pages/Writing/Connect with vermilion labels), bottom bar with back-to-top.
- **Contact form** — added Company input + Budget select; everything required except Message; custom select caret with padding; vermilion `*` on required labels. Posts to Netlify.
- **Work/Services polish** — fixed card image cropping on Work; removed trailing bottom border on Services.
- **Config** — disabled the Vercel Claude Code plugin in `~/.claude/settings.json` (takes effect next session).
- **GSAP sandbox** — added `gsap` + `@gsap/react`; SSR-safe registration module (`src/lib/gsap.ts`); `noindex` prop on `SEO`; `/lab` sandbox page + route with a scroll-scrub + pinned-reveal demo (reduced-motion aware). Verified end-to-end in-browser (scrub 0→1, reveals to opacity 1, reduced-motion static, bar above navbar). Spec/plan in `docs/superpowers/`.
- **SSG build fix** — `npm run build` was **already broken before this work** (`react-helmet-async` named-export failure in the Node ESM SSR bundle). Fixed via `ssr.noExternal: ['react-helmet-async', 'gsap', '@gsap/react']` in `vite.config.ts`. GSAP's subpath imports need the same treatment, so this config is required for the build to pass.
- **Hero load animation** — homepage hero image grows + fades in, then the circle blooms behind it (GSAP `useGSAP`, `force3D: false`). Made the hero full-height (`min-h-[calc(100svh-4rem)]`), bottom-anchored the circle + image (fixed a tall-viewport gap), enlarged the image and stacked the CTAs full-width on mobile. Prototyped in `/lab`, then ported to `Home.tsx`; typewriter h1 + Framer text fades kept.
- **Animated work covers** — converted the 3 case-study cover SVGs to inline React components with tailored GSAP reveals (Vamp: chart builds; Booking Flow: pipeline flows; 'Aiwi: waffle mark assembles), playing once on scroll-in (reduced-motion safe) on the `/work` cards and the case-study hero. Centered the category-pill text (`CoverChip`).
- **Page transition (curtain)** — replaced the Framer fade with a GSAP curtain inspired by thebookingflow.com (reverse-engineered from the live DOM; that site is also Vite+React, minified, no source map). Vermilion-diagonal + directors-black panels slide down to cover, swap content while covered, then lift to reveal. ~2s, `power2.inOut`, reduced-motion = instant swap.
- **Hero-after-reveal timing** — pages mount while covered, so entrance animations would play behind the curtain. `PageCurtain` provides an entrance delay via context (`useEntranceDelay()`): 0 on direct load, ~1.2s after a transition. `Home` applies it to the hero GSAP + text fades so the hero plays as the curtain clears.

### Productized Services offer + prerendered SEO (branch `feat/services-offer-seo`, PR #1, pushed)
- **Services page** (`src/pages/Services.tsx`) — productized SEO/AEO offer: one-time **Foundation Sprint** (from $3,000) + 3-tier **Growth Retainer** (Maintain $1,750 / Growth $3,000 / Dominate $5,500), framed as AEO-optimized *assets* (depth + speed, not raw volume). Advertised retainer floor + Offer JSON-LD `minPrice` reconciled to **$1,750**. Supporting disciplines (UX/UI, AI automation, software builds). Standalone one-pager: `public/offer/index.html` + PDF in `public/`.
- **Prerendered SEO** — `SEO.tsx` uses vite-react-ssg `Head`; `src/lib/seo.ts` has `Person` / `WebSite` / `Service`+`Offer` JSON-LD builders. Keyword-led per-page `<title>`s on every page (Home, About, Services, Work, Blog, Contact).
- **Prerender dynamic routes** — `vite.config.ts` `ssgOptions.includedRoutes` enumerates `/work/:slug` + `/blog/*` from the filesystem, so every case study / blog page prerenders. Build now emits **21 HTML pages** (was 8). New MDX auto-prerenders on the next build (a blog folder needs `index.mdx` to get a pillar page).
- **About client-work sections** — SEO/AEO + UX/UI narrative sections grounded in case-study facts only, linking to the studies. Awaiting aggregated client data to enrich.
- **Outline button restyle** — vermilion **bottom border that draws into a full frame on hover** via one ease-in-out `clip-path` overlay (`.btn-outline-draw` in globals.css). Buttons full-width on mobile, auto at `md`+; footer CTA width matched to the email above it.
- **Em dashes removed site-wide** — including JSX/CSS comments, cover SVGs (`CASE STUDY / 0X`), and the visible blog breadcrumb separator. **Gotcha:** MDX frontmatter values that contain a colon must be quoted (unquoted `: ` breaks the YAML parser and fails the build).
- **Build health** — fixed 3 pre-existing TS errors (`caseStudyMdx`, `WorkDetail`, `useReducedMotion.test`); `typecheck` and `build` are green.

## Known characteristics / gotchas

- **GSAP `force3D: false` when animating dark elements.** GSAP's default (`force3D: "auto"`) promotes the element to a 3D GPU layer during a transform tween, which on some Chrome/GPU combos paints a dark element on a dark background as a solid black rectangle until the tween ends and the layer is dropped. Set `force3D: false` on tweens that move/scale dark surfaces (hero circle, curtain panels). Same root cause as the dark-`Card` hover-lift artifact noted in CLAUDE.md.
- **GSAP ScrollTrigger restores scroll on route change.** It remembers the window scroll position and restores it on its post-navigation refresh, landing SPA navigation at the previous scroll (e.g. case-study → next-project at the bottom). Fix: call `ScrollTrigger.clearScrollMemory()` before `scrollTo(0,0)` (done in `PageCurtain`).
- **Entrance animations + the curtain.** Because the curtain swaps content while covered, a new page's mount-time entrance animations play hidden behind it. Use `useEntranceDelay()` from `PageCurtain` to delay them until the reveal completes (it is 0 on a direct load). Currently only `Home`'s hero consumes it; the case-study cover reveals and other above-the-fold mount animations still play under the curtain (could be extended the same way).
- **SEO meta is now prerendered (RESOLVED).** `SEO.tsx` was moved off `react-helmet-async` to vite-react-ssg's `Head`, so titles/descriptions/og/JSON-LD are baked into each page's static HTML at build. Dynamic `/work/:slug` + `/blog/*` routes also prerender now (see `ssgOptions.includedRoutes`). The old "prerendered `<title>` is just static Mathew Brown" gap is closed.

## Outstanding TODOs

- **Metrics numbers** — all `<Metrics>` blocks use `"00"` placeholders (each has a TODO comment). 'Aiwi's `#1` ranking is real; the rest need real figures.
- **Real screenshots/photos** — case study `<ImageCarousel>`s use placeholders; swap `src` for real assets in `public/images/`.
- **Cover images as `og:image`** — covers are SVG, which some social platforms don't render for previews; consider raster (PNG/WebP) versions for sharing.
- Blog pillars (8 of 9) have no articles yet.
- **About client-work sections** — currently case-study facts only; Mathew is aggregating additional client data/projects/metrics to weave in (and an optional third AI-automation section).
- **PR #1 open** (`feat/services-offer-seo` → `main`): https://github.com/matbrown-ux/portfolio/pull/1 — awaiting review/merge.

_(Done this session: keyword-led per-page `<title>`s, prerendered SEO/JSON-LD, and dynamic-route prerendering. The old "thin titles" TODO is closed.)_
