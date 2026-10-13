# Interaction Foundation + Case Study System: Design

Date: 2026-09-28
Status: Draft, awaiting review
Scope: Sub-projects 1 and 2 of the portfolio semi-redesign.

## Context

The portfolio is launchable but the case studies read like blog posts (single 3xl text column, 65vh cover, meta grid, uniform fades) and the site lacks a coherent interaction layer. This spec covers the shared interaction foundation and the new case study presentation. It is the first of five sub-projects:

1. **Interaction foundation** (this spec)
2. **Case study system** (this spec)
3. Work index redesign (future spec)
4. Site-wide pass: Home, About, Services, Contact on the new foundation (future spec)
5. Launch hardening: Helmet/SEO prerender, performance budget, a11y + reduced-motion audit, real assets, deploy (future spec)

Launch happens after all five ship. There is no hard date.

## Goals and audience

- **Primary audience: freelance clients** (founders and small businesses buying UX/UI, SEO/AEO, AI workflow, and brand work).
- Interaction exists to **build trust and lead to contact**, not to show off. The visitor is never out of control.
- Case studies must be skimmable in about 10 seconds (who, what, result) and reward a deeper read with real product captures.
- The user can supply real screenshots, screen recordings, and real metrics for all three case studies.

## Non-goals

- No rebrand. Brand tokens, Poppins, the dark editorial look, and `PageCurtain` stay.
- No smooth-scroll library (Lenis or similar). Native scroll everywhere.
- No changes to Work index, Home, About, Services, Contact, or Blog beyond what the foundation swap requires. Those belong to sub-projects 3 and 4.
- No fabricated metrics. `00` placeholders stay until the user provides real numbers.

## Direction

**Hybrid:** a tactile, pointer-driven interaction layer site-wide, plus cinematic scroll storytelling used only inside case studies.

---

## Part 1: Interaction foundation

### Library responsibility rule

| Library | Owns | Examples |
|---------|------|----------|
| **GSAP** (via `src/lib/gsap.ts`) | Anything tied to scroll position or a timeline | Pins, scrub, `PageCurtain`, sequenced reveals, `RevealText`, chapter progress, next-project clip-path |
| **Motion** (`motion/react`) | Anything tied to component state or the pointer | Hover, `Cursor`, `Magnetic`, drag (`Gallery`), layout changes |

The two libraries never animate the same element.

### Scroll

Native scroll. ScrollTrigger pins run on native scroll. No scroll-jacking outside case study pinned modules, and pinned modules are disabled below `md`.

### Motion tokens: `src/lib/motion.ts`

A single source for:

- **Eases:** `outQuint` (`[0.16, 1, 0.3, 1]`, the current house ease), `inOut`, plus GSAP-string equivalents (e.g. `"expo.out"`, `"power2.inOut"`).
- **Durations:** `fast` (0.2s), `base` (0.5s), `slow` (0.9s), `reveal` (1.1s).
- **Springs:** `cursor` (snappy follow), `magnetic` (soft pull and return).

The tokens are mirrored as CSS custom properties in `@theme` in `src/styles/globals.css` (the existing `--ease-out-quint` stays). Components that currently redeclare `EASE` locally (`FadeIn`, `Metrics`, `caseStudyMdx`, etc.) import from `motion.ts` instead.

### Primitives: `src/components/interaction/`

Each primitive keeps its logic in a sibling `.ts` module so it can be unit tested. The `.tsx` component only wires that logic to the DOM.

#### `<Cursor>`

- Mounted once in `DefaultLayout`.
- Active only when `(pointer: fine)` matches. It never renders on touch devices.
- Default state: a small vermilion ring following the pointer on the `cursor` spring. The native cursor stays visible (it is not replaced), so there is no a11y or precision loss.
- Context states come from the nearest ancestor with `data-cursor="view" | "drag" | "visit"`. The ring grows into a labeled pill ("View", "Drag", "Visit").
- Over `input`, `textarea`, `select`, and `[contenteditable]`, the ring hides.
- Reduced motion: the pill still appears for context, but position is set directly with no spring trailing.
- Logic module `cursorState.ts`: `resolveCursorState(target: Element | null): CursorState` walks ancestors for `data-cursor` and form fields. Pure and unit tested.

#### `<Magnetic>`

- Wraps a single child (primary CTAs, "Visit live site").
- Pulls the child toward the pointer within its bounds on the `magnetic` spring, then springs back on leave.
- Disabled on coarse pointers and under reduced motion (it renders the child as is).
- Logic module `magnetic.ts`: `magneticOffset(pointer, rect, strength): {x, y}`, clamped. Pure and unit tested.
- Magnetic elements are small, light-on-dark CTAs, not dark cards, so the transform-lift artifact rule does not apply. `force3D` is left off regardless.

#### `<RevealText as="h1" | "h2" | ...>`

- A masked line or word reveal for display headings, driven by GSAP (scroll-triggered, or on mount for above-the-fold).
- **SEO safety:** renders the full heading text in the real heading element. The split spans are `aria-hidden="true"`, with an `sr-only` copy of the full text, so crawlers and screen readers get one clean string.
- Reads `useEntranceDelay()` for above-the-fold use.
- Reduced motion: renders a static heading with no split.
- Logic module `splitText.ts`: `splitWords(text): string[]`, which keeps punctuation and `&` intact. Pure and unit tested.

#### `<CountUp value="…">`

- Animates the numeric part of a metric when it scrolls into view.
- Handles prefixes and suffixes and non-numeric values: `#1`, `40%`, `12k`, `3.5x`, `$120k`. A value with no number (or `00` placeholders) renders statically.
- Reduced motion: renders the final value immediately.
- Logic module `countUp.ts`: `parseMetric(value): { prefix, number, decimals, suffix } | null` and `formatMetric(parsed, current): string`. Pure and unit tested.

### Curtain integration

Every new primitive with a mount-time animation reads `useEntranceDelay()` from `PageCurtain`. This closes the known gap where above-the-fold animations (including case study cover reveals) play hidden behind the curtain. `useCoverReveal` is updated to take the entrance delay too.

### Carried-over rules

- `force3D: false` on any GSAP tween that moves or scales a dark surface.
- No `transform` hover lifts on dark cards (use the `top` lift from `Card.tsx`).
- Every primitive has a complete, static fallback under `prefers-reduced-motion`, using `useReducedMotion` or `gsap.matchMedia()`.
- All GSAP imports go through `src/lib/gsap.ts` (SSR-safe).

---

## Part 2: Case study system

### Frontmatter additions (`src/types/content.ts`)

```ts
export interface CaseStudyFrontmatter {
  // ...existing fields
  year: string        // e.g. "2026"
  result: string      // one real sentence, the headline outcome
  client?: string     // defaults to title when omitted
  ogImage?: string    // raster social image, e.g. /images/case-studies/<slug>/og.png
}
```

`year` and `result` are required. `result` must be a fact the user supplied. For 'Aiwi Waffles it is the confirmed #1 local ranking. For Vamp Network and The Booking Flow, the user supplies the sentence before migration. Until then it holds a clearly marked placeholder string plus a TODO comment in the MDX, and the frontmatter validation test allows only that exact placeholder.

### Page anatomy (`WorkDetail.tsx` + `CaseStudyLayout.tsx`)

1. **Hero: the 10-second read**
   - Full-viewport, full-bleed animated cover (existing cover components, now entrance-delay aware).
   - Keyword `headline` as an `h1` via `RevealText`.
   - **At-a-glance strip:** Client, Role, Year, Result (visually emphasized), and a `Magnetic` "Visit live site" button (`data-cursor="visit"`).
   - `services` and `stack` move into a compact secondary meta row under the strip.
2. **Chapters**
   - New MDX component `<Chapter title="The challenge">…</Chapter>` renders a keyword `h2` with a slug `id`, wrapping that chapter's content.
   - `lg+`: a sticky **chapter rail** in the left gutter lists all chapters. The active chapter is highlighted, a vermilion line fills with progress through the article, and clicking a chapter scrolls to its anchor (native smooth scroll, instant under reduced motion).
   - Below `lg`: a thin fixed progress bar under the navbar with the current chapter's name.
   - The rail registers chapters through React context (`ChapterProvider`), not DOM scraping.
   - Logic module `chapters.ts`: `slugifyChapter(title)`, `activeChapter(offsets, scrollY, viewportH)`, `overallProgress(...)`. Pure and unit tested.
   - The existing `.case-study-prose` counter numbering (`01`, `02`…) applies to Chapter `h2`s.
3. **Width system**
   - Prose column: `max-w-[680px]`, centered (offset right on `lg+` to clear the rail).
   - Modules take `width?: "column" | "wide" | "full"` (default `wide`). `wide` is about `max-w-6xl`. `full` is edge to edge.
4. **Next project** (see below).

### MDX modules (`src/components/mdx/case-study/`)

Registered in a case-study MDX registry. The shared `MDXComponents` (used by the blog) keeps `ImageCarousel`, `Metrics`, etc. Case studies stop using them.

#### `<Walkthrough frame="browser" | "phone" steps={[…]} />` (centerpiece)

```ts
type WalkthroughStep = {
  title: string
  body: string
  src?: string          // image (WebP)
  video?: string        // muted autoplay loop (MP4/WebM)
  poster?: string
  alt: string
  hotspot?: { x: number; y: number; label: string }  // % coordinates
}
```

- **`md+`:** a two-column pinned section. The frame (default `browser`: minimal chrome with a URL pill showing the project domain; `phone` variant available) pins on one side while step text scrolls past on the other. Each step crossfades the capture and pulses its hotspot. Videos play only while their step is active and in view.
- **Below `md`:** no pin. Steps stack as cards, each with its own framed capture.
- **Reduced motion:** static stack as on mobile. Videos show their poster with native controls.
- Logic module `walkthrough.ts`: `stepForProgress(progress, stepCount)` for step indexing. Pure and unit tested.

#### `<Gallery images={[…]} width="wide" />`

- A horizontal strip, draggable with Motion `drag="x"` and momentum, constrained to the content bounds. `data-cursor="drag"`.
- Keyboard: focusable region, arrow keys move one item, visible focus ring.
- Captions under each item.
- Replaces `ImageCarousel` in case studies.

#### `<BeforeAfter>`

- The existing `BeforeAfterSlider` logic, restyled to the case study width system and `data-cursor="drag"`. Keyboard operable.

#### `<Outcome metrics={[…]} quote? cite? />`

- A metrics grid using `CountUp`. An optional **real** client quote with citation (renders nothing if omitted). A closing CTA: "Start a project" (`Magnetic`) linking to `/contact`.
- Replaces `Metrics` in case studies. Placeholders stay `00` with TODO comments.

#### `<PullQuote>`

- A large display quote with a `RevealText` reveal and a vermilion rule. Replaces markdown blockquotes in case studies (plain `>` blockquotes still render styled, for compatibility).

### Next project band

- A full-width section at the end of the article showing the next project's cover, title, and `result`.
- As it scrolls into view, it opens from an inset card to full-bleed via a scrubbed `clip-path` (no transform). Its cover animation plays once visible.
- The whole band is one link (`data-cursor="view"`). Clicking navigates through the normal `PageCurtain` transition.
- Reduced motion: the band renders full-bleed and static.

### Assets

- Location: `public/images/case-studies/<slug>/`.
- Captures: 2x WebP. Recordings: MP4 (H.264) + WebM, muted, short loops, with a WebP poster.
- A raster `og.png` (1200×630) per project, used as `ogImage` (fixes the SVG social-preview gap for case studies).
- **Missing asset handling:** a module whose `src`/`video` is missing or fails to load renders a labeled placeholder frame ("Capture coming soon") at the same aspect ratio, so layout never shifts and the build never blocks on assets.

### Content migration

- All three MDX files (`vamp-network`, `the-booking-flow`, `aiwi-waffles`) are restructured into `Chapter` sections with `Walkthrough`, `Gallery`, `Outcome`, and `PullQuote`.
- Copy changes only where the structure requires it. No em dashes. No invented facts or metrics.
- Placeholder captures remain until the user supplies real assets. They then drop in by path.

---

## Testing

Per the tdd-kit contract, every source change starts with a failing test.

**Unit (Vitest):**
- `motion.ts`: token shape and CSS-var parity (the ease values match `globals.css`).
- `cursorState.ts`: data-cursor resolution, nearest-ancestor precedence, form-field hide.
- `magnetic.ts`: offset math and clamping.
- `splitText.ts`: word splitting with punctuation and `&`.
- `countUp.ts`: parsing and formatting for `#1`, `40%`, `12k`, `3.5x`, `$120k`, `00`, non-numeric.
- `chapters.ts`: slugify, active chapter, progress.
- `walkthrough.ts`: step indexing at boundaries.
- `content.test.ts`: frontmatter validation requires `year` and `result` for every case study.
- Component tests (Testing Library) for reduced-motion fallbacks: `RevealText` keeps accessible heading text, `CountUp` renders the final value, `Walkthrough` renders a static stack, `Gallery` arrow-key navigation.

**Visual (`agent-browser`, system Chrome):**
- Desktop (1440) and phone (390) widths for each case study: hero strip, chapter rail and mobile progress bar, Walkthrough pin and step swaps, Gallery drag, next-project clip-path.
- Reduced-motion emulation pass.
- The curtain → hero sequence (nothing plays hidden).
- Scroll `whileInView`/ScrollTrigger elements into view before capturing.

**Build:** `npm run typecheck`, `npm run test:run`, `npm run build` (SSG prerender must pass; any new GSAP subpath imports are added to `ssr.noExternal`).

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Pinned sections jank or trap scroll on mobile | Pins only at `md+` via `gsap.matchMedia()`; stacked fallback below |
| Heavy video hurts load | Lazy load, play only when the step is active and in view, short loops, posters |
| Split-text headings hurt SEO/a11y | Real text in the heading, split spans `aria-hidden`, `sr-only` copy |
| Cursor feels gimmicky or hurts precision | Native cursor retained, fine pointers only, subtle defaults |
| GSAP + Motion fighting over an element | Enforced ownership rule; no element animated by both |
| Dark-surface GPU artifact | `force3D: false`, no transform lifts on dark cards, clip-path for the next band |

## Open items (user-supplied, not blocking the build)

- `result` sentences for Vamp Network and The Booking Flow.
- Real captures, recordings, and metrics for all three projects.
- Optional real client quotes for `Outcome`.
