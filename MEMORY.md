# Project Memory — Mathew Brown Portfolio

> Read this at the start of every session to understand what the project is and what has been built.
> Keep it updated as work progresses.

## Astro rebuild (read first, supersedes the roadmap below)

On 2026-10-12 the owner decided to redesign the site completely and move to their preferred stack: **Astro + React islands + Tailwind v4 + GSAP**. The rebuild is a clean scaffold on `feat/astro-rebuild` (branched from `feat/site-pass` @ 0bfb10a). Everything below this section describes the old React + Vite app, which still lives on `feat/site-pass`; use it as the reference to port from, not as a description of this branch.

**What exists now (sub-project 1):** Astro 7 static output with `site: https://matbrown.io`, `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, Tailwind v4 via `@tailwindcss/vite`, `gsap` + `@gsap/react`, Vitest 5 + jsdom + Testing Library (setup in `src/test/setup.ts`), and `astro check` as `npm run typecheck`.

- **Tokens and fonts:** `src/styles/global.css` `@theme` holds `ivory`, `ink`, `vermilion`, `stone` and `line-dark`, plus the `type-display` and `type-label` utilities. Anton, Archivo and JetBrains Mono are self-hosted through Astro's font handling.
- **Layout:** `src/layouts/BaseLayout.astro` owns the head (title, description, canonical, OG, Twitter) and the inline script that sets the `js` and `reveals-ready` classes on `<html>`. Pages are `index.astro` (Home) and `404.astro`.
- **Shell:** `src/components/nav/` has `SiteHeader.astro`, `SiteFooter.astro` and the `MobileMenu.tsx` React island (with `focusTrap.ts`).
- **Home:** six sections under `src/components/home/`: `Hero`, `DisciplineStrip`, `StatementBand`, `FeaturedWork`, `AboutTeaser`, `ContactBand`.
- **Primitives:** `src/components/ui/` (`Button`, `ArrowButton`, `VerticalLabel`) and `src/components/brand/` (`Logo`, `ScriptArt`).
- **Behaviour modules in `src/lib/`:** `typewriter`, `typewriterElement`, `reveal`, `motionTokens`, `gsap`, `featuredWork`, each with a co-located test.
- **Script art:** `scripts/script-art/` (`generate.mjs`, `shape.mjs`, `svg.mjs`, `artList.mjs`, with tests) turns `src/assets/script/phrases.json` into `src/assets/script/art.json` via `npm run script-art`. The Gloss And Bloom font files stay in the git-ignored `.fonts/` folder.
- **Content:** `src/content.config.ts` defines the `caseStudies` collection (glob loader over `src/content/case-studies/*.mdx`; schema is only `title`, `date`, `tags`, optional `client`). `src/content/disciplines.ts` and `src/content/navigation.ts` are the single sources for the five disciplines and the nav links.
- **Build status:** Task 13 (final verification pass) is the remaining task on the plan. `netlify.toml` no longer has the SPA catch-all redirect.

**Kept from the old app:** the 13 MDX files in `src/content/` (3 case studies, 10 blog), everything else in `public/images/` (the blog cover SVGs and `case-studies/<slug>/og.png`), the tdd-kit, and the docs. The case study frontmatter is indexed by the `caseStudies` collection in `src/content.config.ts`, but the bodies are not rendered yet: they still use the old `<Chapter>`, `<Walkthrough>`, `<Gallery>`, `<BeforeAfter>`, `<Outcome>`, `<PullQuote>` components, which do not exist here. The `coverImage` frontmatter lines and the three case study cover SVGs were removed. The blog MDX is not wired to any collection.

**Removed from this branch (recover from `feat/site-pass`):** the old React components, pages and router, the old `src/lib/` modules (`src/lib/` now holds the new rebuild modules), `src/types/content.ts`, `motion`, `react-router-dom`, `react-helmet-async`, `vite-react-ssg`. `src/content/disciplines.ts` was ported back with new first-person blurbs (and has its test).

**Design direction (approved 2026-10-12):** full brutalist on a light ground. Ivory `#f4f0e6` background, ink `#0c0c0c`, vermilion `#f86343` as the single accent in large solid blocks, black-and-white cut-out portraits tinted by vermilion `multiply` blocks, Anton display type, Archivo body, JetBrains Mono labels, and Gloss And Bloom brush script used sparingly as SVG artwork (the repo is public, so the purchased font files stay in a git-ignored `.fonts/` folder and are never committed). The owner's references are in `/Users/operationhq/Documents/02-PERSONAL/PORTFOLIO-REFERENCES`; the logo source is `/Users/operationhq/Documents/02-PERSONAL/logo-initials.svg`. All copy is first person and goes through the `humanizer` skill (guardrails in `CLAUDE.md` section 2). Design and motion skills to use are in `CLAUDE.md` section 8.

**Rebuild roadmap:** five sub-projects, each with its own spec, plan and build.

| # | Sub-project | Spec | Status |
|---|-------------|------|--------|
| 1 | Design foundation + Home | `docs/superpowers/specs/2026-10-12-design-foundation-home-design.md` (reference image in `docs/superpowers/specs/assets/`) | Built; awaiting owner review |
| 2 | Work: content collections, Work index, case study template | none yet | Not started |
| 3 | Services, About, Contact | none yet | Not started |
| 4 | Blog | none yet | Not started |
| 5 | SEO/AEO layer and launch | none yet | Not started |

**Owner inputs still needed for sub-project 1:** approval of the drafted Home copy (table in the spec), new images or video for the three project tiles (the old case study cover SVGs were removed), confirmation of "Available 2026", and a check that the font licence allows outlined artwork. Items the build ledger marks for the owner to confirm: the word "memorable" overlaps the top of "average" in the statement band at all widths (deepest at 390); the Home hero word is slightly smaller than the mockup between 1024 and 1279 (about 150px vs 169px glyph height at 1440); the statement band's right half is empty at 1024; the featured work tile order follows the case study dates (Vamp Network, The Booking Flow, 'Aiwi Waffles), so reorder by editing `date`; tile numbers are ink on stone and vermilion tiles because small vermilion text is only allowed on ink.

## Redesign roadmap and where we are (old Vite app, historical)

The site is mid-way through a 5-part semi-redesign focused on high-end UX and interaction design. Audience: freelance clients; interaction must build trust and lead to contact, and the visitor stays in control. Each sub-project gets its own spec, then plan, then a subagent-driven build (fresh implementer + task reviewer per task, final whole-branch review on the strongest model, one fix wave). Nothing is merged or pushed yet; the owner chose "keep as-is" after each branch.

| # | Sub-project | Branch (stacked) | Spec / plan | Status |
|---|-------------|------------------|-------------|--------|
| 1+2 | Interaction foundation + case study system | `feat/interaction-case-studies` (from `main` @ 6387ede) | `docs/superpowers/specs/2026-09-28-interaction-foundation-case-studies-design.md`, `docs/superpowers/plans/2026-09-28-interaction-foundation-case-studies.md` | Built, reviewed, fixed. Not merged. |
| 3 | Work index + Home "Selected work" | `feat/work-index` (from `feat/interaction-case-studies`) | `docs/superpowers/specs/2026-09-29-work-index-design.md`, `docs/superpowers/plans/2026-09-29-work-index.md` | Built, reviewed, fixed. Not merged. |
| 4 | Site-wide pass: Home hero + "What I do", About, Services, Contact, navbar, mobile menu, footer | `feat/site-pass` (from `feat/work-index`; spec committed as 5080f4b) | `docs/superpowers/specs/2026-09-29-site-pass-design.md`, `docs/superpowers/plans/2026-09-29-site-pass.md` | Built, reviewed, fixed (15 tasks + final review fix wave). Not merged. |
| 5 | Launch hardening | not started | none yet | See "Launch hardening backlog" below. |

**Sub-project 4 status:** done on `feat/site-pass` (final review "with fixes"; one fix wave applied and re-reviewed clean). Next: owner decides merge/keep, then sub-project 5. Give every implementer the rules below.

### Rules every implementer must follow (learned the hard way)

- Commit trailer is always `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, whatever model writes the commit.
- Never add a `Test-Exempt:` trailer (needs the owner's explicit approval). If the TDD hook refuses an amend, stage the test file with it. Prefer new commits over amends.
- Logic modules must not share a basename with a component case-insensitively (macOS: `./Magnetic` resolved to `magnetic.ts`). Use names like `magneticOffset.ts`, `metricFormat.ts`, `galleryNav.ts`.
- `RevealText` and `CountUp` render ONE copy of their text (no sr-only duplicate), so crawlers don't index headings twice.
- `useGSAP` with `dependencies` must pass `revertOnUpdate: true`, or ScrollTriggers accumulate.
- Router tests use `src/test/TestRouter.tsx` (MemoryRouter with v7 future flags); test output must be pristine.
- Don't kill dev servers by name (`pkill vite`); the owner keeps one on port 5180. Don't commit `.playwright-mcp/`. `agent-browser` is NOT installed; use the Playwright MCP tools for browser checks.
- Don't write "--no-verify" literally in shell heredocs: the tdd-kit Claude hook blocks any command containing it.

### Owner inputs still needed

- Real one-sentence `result` for Vamp Network and The Booking Flow (both show "Result pending: headline outcome to be supplied").
- Real screenshots/recordings and metrics for all three case studies (`00` placeholders; only 'Aiwi's `#1` is real).
- Review of drafted copy in sub-project 4: Brand Development and SaaS Development discipline copy, the hero rotator lines, and the four new keyword `h1`s (all in the site-pass spec).
- Design call: placement of the hero rotator's pause button (at 1440 it sits after the reserved longest-line width, so it floats right of short lines).

### Launch hardening backlog (sub-project 5)

- SSG prerenders only 7 routes: `/work/<slug>` and blog pillar/article routes are not prerendered.
- `react-helmet-async` head tags are client-only; `og:image` is relative and there is no `twitter:image` (raster OG PNGs already exist per case study).
- Deferred polish: `/work` panel focus-scroll also fires on mouse-click focus (guard with `:focus-visible`); em dashes remain in 8 blog pillar descriptions and the blog breadcrumb separator; placeholder `result` strings are shown prominently until replaced.
- Site-pass deferred minors: Contact errors clear only on blur; uncontrolled project-type select ignores a `?service` change on the same mounted page; Contact SEO description lists three disciplines; duplicate nav item lists in Navbar and MobileMenu; rotator swap takes ~1.0s (spec ~0.6s) and reserves height by character count; bloom durations in PortraitMedia are literals, not tokens; several test gaps (hidden-tab rotator pause, reduced-motion scroll, blur-clears-error, dialog unmount).
- Performance, accessibility, and reduced-motion audit; swap in real assets; deploy.

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
- `src/layouts/DefaultLayout.tsx` — Navbar + `<PageCurtain>` (renders the routed page + the global page transition) + Footer.
- `src/lib/content.ts` — content pipeline via `import.meta.glob` over `src/content/**`. **Case studies are sorted by `date` descending.** Helpers: `getCaseStudies`, `getCaseStudyBySlug`, `getNextCaseStudy`, `getBlogPillars`, `getBlogArticles`, etc.
- `src/types/content.ts` — frontmatter interfaces (`CaseStudyFrontmatter`, `BlogPillarFrontmatter`, `BlogArticleFrontmatter`)
- `src/content/case-studies/*.mdx` — case studies
- `src/content/blog/<pillar>/index.mdx` — blog pillar landing pages; articles are `src/content/blog/<pillar>/<article>.mdx`
- `src/components/animations/` — `FadeIn`, `StaggerList`/`StaggerItem`. `PageTransition` is now a **pass-through** (no-op wrapper kept so pages don't need edits); the global transition + scroll reset live in `PageCurtain`.
- `src/components/PageCurtain.tsx` — **global page transition** (the "curtain"). Renders the routed page via `useOutlet` (frozen during cover so the content swap is hidden) plus two GSAP panels (vermilion diagonal + directors-black) that slide down to cover, swap content + reset scroll at full cover, then lift to reveal. Replaced the Framer fade + `AnimatePresence`. Panels are `h-[130vh]` (taller than viewport so the diagonal sweeps but the bottom stays covered), ~2s, `power2.inOut`, reduced-motion = instant swap. Exposes `useEntranceDelay()` and owns scroll reset.
- `src/lib/gsap.ts` — **single, browser-guarded** GSAP plugin-registration point (`typeof window` guard for SSR); re-exports `gsap`, `ScrollTrigger`, `useGSAP`. Import GSAP through this, not directly.
- `src/components/work/` — project listing components. `ProjectShowcase`/`ProjectPanel` (`/work`: CSS sticky stacking with a GSAP-scrubbed overlay opacity; cards fallback on mobile, reduced motion and prerender). `ProjectIndex`/`ProjectIndexRow`/`HoverPreview` (Home selected work: editorial rows, pointer-following preview built from static covers, `previewPosition` edge flip, `SPRING.preview`; inline thumbnails on touch and reduced motion). Shared `ProjectMeta`, `ProjectCover`, `ProjectCta`; `projectListing.ts` holds numbering (`projectNumber`), `showcaseMode`, `STACK_QUERY`, `previewPosition` (flips at the right AND bottom edges), the id helpers and `caseStudyCountLabel`. Test fixture: `src/test/caseStudyFixture.ts`.
- `src/components/work/covers/` — animated inline-SVG case-study covers: one component per project (`VampNetworkCover`, `TheBookingFlowCover`, `AiwiWafflesCover`), a shared `useCoverReveal` hook (scroll-in reveal, reduced-motion gated, SSR-safe), `CoverChip` (centered category pills), and `index.ts` (slug→component map; falls back to the static `<img>` cover). Used on the `/work` cards and the case-study hero (`WorkDetail`).
- `src/pages/Lab.tsx` + `/lab` route — GSAP sandbox (noindex, not linked in nav). Holds a hero-load-animation prototype (image grows+fades, then circle), a scroll-scrub progress bar, and a character-reveal scroll demo. `gsap.matchMedia()` reduced-motion gating; progress bar `z-[70]` above the `z-[60]` navbar.
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
- **Interaction foundation** — `src/lib/motion.ts` (shared durations, eases, springs for both GSAP and Motion) and `src/components/interaction/`: `Cursor` (contextual pill over `data-cursor` regions: View, Drag, Visit; fine pointers only), `Magnetic`, `RevealText`, `CountUp`, `useScrollReveal`. Ownership rule: **GSAP owns scroll-driven and timeline work** (reveals, ScrollTrigger scrubs, the curtain); **Motion owns pointer-driven work** (drag, springs, cursor, magnetic). `useScrollReveal` is curtain-aware (waits for `useEntranceDelay()`) and reduced-motion gated (final state, no reveal).
- **Case study system** — `CaseStudyHero` (keyword h1, summary, at-a-glance strip: client, role, year, result, then Visit live site, all above the fold at 1440x900), body from `<Chapter>` sections (`src/components/mdx/case-study/`) with `<Walkthrough>` (pinned device frame + scrolling steps at md+, stacked on mobile or reduced motion), `<Gallery>` (drag + arrow keys), `<BeforeAfter>` (keyboard slider), `<Outcome>`, `<PullQuote>`. `ChapterNav` is a sticky rail in the left gutter at 1440px+ (`min-[1440px]`; at 1280-1407 it overlapped wide modules) and a thin fixed progress bar with the chapter name below 1440px. At 390px the hero Visit button sits below the fold on phones (by design). Width system: `.cs-grid` in `globals.css` (`column` / `wide` / `full`); the `.cs-layer` sits above the rail but passes clicks through empty gutters. `NextProject` band at the end (scrubbed clip-path reveal to full bleed, click runs the curtain). Raster 1200x630 OG PNGs per case study in `public/images/case-studies/<slug>/og.png`, wired via `ogImage` frontmatter (rendered from the SVG covers with headless Chrome).
- **Visual verification pass (task 17)** — verified in a real browser at 1440x900, 1600x900, 390x844 and with reduced motion. Fixed two defects: the hero's Visit button sat below the fold on Vamp Network (tightened hero spacing and h1 size), and the Gallery could not be dragged (the track `ul` was as wide as the viewport, so drag constraints had no travel; fixed with `w-max`).
- **Build rulings** — logic modules have distinct basenames from components (e.g. `chapters.ts` next to `Chapter.tsx`, `galleryNav.ts`, `sliderPosition.ts`) because macOS is case-insensitive and same-basename imports collide. `RevealText` and `CountUp` render one copy of their text (no sr-only duplicate) so crawlers and screen readers see it once. Router-dependent tests use `src/test/TestRouter.tsx`. Implementer commits carry the `Co-Authored-By: Claude Opus 5.5` trailer and never `Test-Exempt`.
- **Work index + Home selected work** — `/work` is now a stacked showcase: `ProjectShowcase`/`ProjectPanel` use CSS `position: sticky` for the stacking, a GSAP-scrubbed overlay `opacity` darkens covered panels, and it falls back to plain cards on mobile, under reduced motion and in prerender; `ScrollTrigger.refresh()` runs after the stack mounts. Home selected work is an editorial `ProjectIndex` (`ProjectIndexRow`, `HoverPreview`): the floating preview uses static covers, flips left near the right edge (`previewPosition`), moves with `SPRING.preview`, and is replaced by inline thumbnails on touch and reduced motion. Keyboard focus never summons the preview. Shared `ProjectMeta`/`ProjectCover`/`ProjectCta`; listing links use `aria-labelledby` on title + result ids; `src/test/caseStudyFixture.ts` is the shared test fixture. Stack mode only when `STACK_QUERY` matches (`(min-width: 1024px) and (min-height: 700px)`), so short or narrow windows get cards. In stack mode each panel is preceded by a zero-height non-sticky `[data-panel-anchor]`; the overlay ScrollTriggers use the next anchor as trigger, and focusing a non-last panel scrolls the window to its anchor position minus 64px (a stuck panel is "in view" while covered, so the browser would not scroll it). Verified in a browser at 1440x900, 1280x720, 900x700 (cards), 844x390 (cards), 390x844, resize 390 to 1440 and back, reduced motion, and Shift+Tab through the panels.
- **Site-wide pass (sub-project 4)** — `src/content/disciplines.ts` is the single source for the five disciplines (UX/UI Engineering, SEO/AEO, Agentic Workflows, Brand Development, SaaS Development; Brand/SaaS copy awaits owner review), used by Home "What I do" (five linked cards, 5/3/2/1 columns, each to `/services#<slug>`), Services, About skills and the Contact select. Keyword `h1`s per page (Home "UX/UI Engineer, SEO Specialist & AI Workflow Developer", About, Services, Contact "Hire a UX/UI Engineer & SEO Specialist"). `PortraitMedia` (Home hero + About): GSAP bloom of image then circle (curtain-aware, `force3D: false`) plus Motion pointer parallax on the OUTER circle wrapper only (fine pointer, not reduced motion); Tailwind v4 `translate-*` uses the CSS `translate` property, so it composes with Motion's `transform` and the circle keeps its centering. `DisciplineRotator` (masked slide, aria-hidden with one sr-only sentence, pauses on hidden tab, static under reduced motion) reserves the height of its longest line (invisible sizer in the same grid cell) so a wrapping line never shifts the hero. `DisciplineIndex` + `ProofCard` on Services: one row open at a time, hash deep links (`/services#<slug>`), collapsed panels stay in the DOM but `inert`; the panel has a `-mx-6 px-6` + `pt-4` gutter inside its `overflow-hidden` so the proof card glow/focus ring are not clipped. Contact: inline validation (blur + submit, focuses first invalid field) and `?service=` preselect. `Reveal` (curtain-aware block reveal). Navbar: `layoutId` gliding underline + Contact CTA (filled on `/contact`). Full-screen, keyboard-safe mobile menu (focus trap incl. toggle, Escape returns focus, scroll lock/restore, logo + X stay above the overlay via `relative z-[56]`). Footer on the interaction system (RevealText heading capped at `max-w-[15ch]` for two lines, magnetic CTA, back-to-top honours reduced motion). Skip link + focusable `main` + `scroll-padding-top: 64px`.
- **Site-wide pass browser verification (task 15)** — verified with Playwright at 1440x900, 1024x768, 390x844 (touch context) and reduced motion; built site checked via `vite preview`. Fixed: rotator height shift on wrap; proof card glow/ring clipped by the panel; `/services#<slug>` never scrolled (Motion's keyframe measurement of a `height: auto` panel restores the pre-measure scroll, cancelling a scroll started earlier: the row now scrolls in `onAnimationComplete`); `?service=` preselect lost on the prerendered Contact page (hydration keeps the server's `defaultValue`: now applied in an effect via a ref); footer heading wrapped to three lines at 12ch.

## Known characteristics / gotchas

- **Astro rebuild: load reveals flashed visible before animating.** Elements marked `data-reveal-on="load"` painted at full opacity for a frame or two before GSAP set their start state. Fix, in three parts: CSS `html.js:not(.reveals-ready) [data-reveal-on="load"]` holds them hidden (only when JavaScript has run and motion is allowed); the inline head script in `BaseLayout.astro` adds `js` to `<html>` and adds `reveals-ready` after 3 seconds as a failsafe; and the reveal tweens in `src/lib/reveal.ts` use `lazy: false` so GSAP writes the start state synchronously. A code comment is the only guard for `lazy: false` (jsdom cannot detect it).
- **Astro rebuild: `initReveals` cleanup must revert, not kill.** Killing the tweens leaves elements at their hidden start state. Cleanup reverts them so nothing stays hidden.
- **Astro rebuild: self-hosted fonts are hashed.** Astro emits the font files under `dist/_astro/fonts/` with a hashed family name, so grepping `dist/index.html` for the literal "Anton" fails. Verify by checking that the font files exist in `dist/` and that a `font-family` rule is present.
- **Astro rebuild: `dist/index.html` is one minified line.** `grep -c` counts lines, so it always returns 1. Count matches with `grep -o ... | wc -l`.
- **Astro rebuild: the mobile menu panel needs `overflow-y-auto`.** The body scroll is locked while the menu is open, so on a short viewport the last links and the call to action were unreachable. The panel (`#mobile-menu`) now scrolls on its own.
- **Astro rebuild: logical padding swaps axes under `writing-mode: vertical-rl`.** Tailwind 4's `px` and `py` are logical properties, so on the rotated vertical label they applied to the wrong axis and the label sat hard against the bottom edge. Use physical utilities such as `pt-10` there; after the 180 degree rotation it becomes the visual bottom inset.
- **GSAP `force3D: false` when animating dark elements.** GSAP's default (`force3D: "auto"`) promotes the element to a 3D GPU layer during a transform tween, which on some Chrome/GPU combos paints a dark element on a dark background as a solid black rectangle until the tween ends and the layer is dropped. Set `force3D: false` on tweens that move/scale dark surfaces (hero circle, curtain panels). Same root cause as the dark-`Card` hover-lift artifact noted in CLAUDE.md.
- **GSAP ScrollTrigger restores scroll on route change.** It remembers the window scroll position and restores it on its post-navigation refresh, landing SPA navigation at the previous scroll (e.g. case-study → next-project at the bottom). Fix: call `ScrollTrigger.clearScrollMemory()` before `scrollTo(0,0)` (done in `PageCurtain`).
- **Entrance animations + the curtain.** Because the curtain swaps content while covered, a new page's mount-time entrance animations would play hidden behind it. Solved for everything built on `useScrollReveal` (covers, `RevealText`, `CountUp`, case study modules): it reads `useEntranceDelay()` and holds its animation until the curtain has lifted (verified: after a click from a case study to the next, the h1 words stay masked until about 1.2s after the swap, then reveal). Any new above-the-fold mount animation should go through `useScrollReveal` or consume `useEntranceDelay()` itself.
- **`react-helmet-async` SEO meta is client-side only.** It is NOT collected into the prerendered HTML for ANY page (titles, descriptions, og tags, and the new `/lab` `noindex` all inject on mount in the browser, not at build). vite-react-ssg is not wired to extract Helmet output during prerender. Prerendered `<title>` is just the static `Mathew Brown` from `index.html`. This is a meaningful SEO/AEO gap for a prerender-focused site and is worth addressing separately (e.g. wire Helmet into the SSG head, or move to vite-react-ssg's `Head`/route `entry` metadata). Not GSAP-related.
- **`useGSAP` with `dependencies` only reverts its context on unmount unless `revertOnUpdate: true`** — without it, ScrollTriggers accumulate on dependency change.
- **Motion `height: 'auto'` animations reset scroll while measuring.** Motion's keyframe resolver records `scrollY`, measures, then `window.scrollTo(0, recorded)`, which cancels any smooth scroll started just before. Scroll to a disclosure after it opens (`onAnimationComplete`), not in the same tick as opening it.
- **Uncontrolled form defaults and prerender.** Prerendered HTML has no query string, and hydration keeps the server DOM's `defaultValue`/`selected`. Apply URL-derived defaults in an effect after mount (see Contact `?service=`).

## Outstanding TODOs

- **Metrics numbers** — all `<Metrics>` blocks use `"00"` placeholders (each has a TODO comment). 'Aiwi's `#1` ranking is real; the rest need real figures.
- **Real screenshots/photos** — Walkthrough and Gallery steps use placeholder captures; add real captures per case study folder (`public/images/case-studies/<slug>/`).
- **Real `result` sentences** — Vamp Network and The Booking Flow still carry the placeholder `result` (each has a TODO in the MDX); needs a fact supplied by Mat.
- **SSG does not prerender `/work/<slug>` routes** — `npm run build` output lacks the case study pages. Belongs to the later launch-hardening sub-project. Related: the Walkthrough renders stacked in prerender and swaps to the pinned layout after hydration; if `/work/<slug>` is ever prerendered, call `ScrollTrigger.refresh()` after the Pinned layout mounts so triggers below it are not offset.
- **Meta `<title>` tags** — page-level SEO titles (e.g. `<SEO title="Work" />`) are still thin/keyword-light; only the visible `h1`s were made keyword-focused.
- **Cover images as `og:image`** — raster OG assets are in place for case studies (`public/images/case-studies/<slug>/og.png`); still need absolute URLs, `twitter:image`, and a prerendered head (launch hardening, sub-project 5). Blog pillar covers are still SVG.
- Blog pillars (8 of 9) have no articles yet.
- **Owner review of drafted site-pass copy** — Brand Development and SaaS Development discipline copy in `src/content/disciplines.ts`, and the hero rotator lines + sr sentence in `DisciplineRotator.tsx` / `Home.tsx` (marked `TODO: owner review`).
- **Favicon** — `/favicon.ico` 404s (no favicon in `public/`); add one in launch hardening.
