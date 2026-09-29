# Work Index + Home Selected Work: Design

Date: 2026-09-29
Status: Draft, awaiting review
Scope: Sub-project 3 of the portfolio semi-redesign.
Base: branch `feat/interaction-case-studies` (unmerged; this work depends on its interaction foundation). Build on a new branch `feat/work-index` created from it.

## Context

Sub-projects 1 and 2 (interaction foundation + case study system) are built on `feat/interaction-case-studies`. The `/work` index is still a plain stacked list (number, 256px animated cover, tags, title, summary) that uses none of the new interaction layer, and the Home "Selected work" section is a separate three-card grid with the old static covers and a `FadeIn` heading.

Remaining roadmap after this: 4 (site-wide pass: Home hero, About, Services, Contact), 5 (launch hardening).

## Goals and audience

- **Audience: freelance clients.** Interaction builds trust and leads to contact; the visitor stays in control.
- **Portfolio size: 3 to 5 case studies** for the next 6 to 12 months. No filtering, search, or pagination. The design must make a small, strong body of work feel substantial.
- One shared project-listing system with two presentations: a full **showcase on `/work`** and a condensed **editorial index on Home**.

## Non-goals

- No filters, tags-as-navigation, or search (YAGNI at 3 to 5 projects).
- No changes to the case study pages, the Home hero, or other Home sections (sub-project 4).
- No fix for `/work/<slug>` prerendering or head tags (sub-project 5).
- No new animation libraries or smooth scroll.

## Constraints (carried from the project rules and sub-projects 1 and 2)

- No em dashes in visible copy. Never fabricate results or metrics; `result` renders as stored (the two placeholder strings stay until the owner supplies real outcomes).
- Brand tokens only; vermilion is the single accent.
- No `transform` hover lifts or transform-driven motion on dark surfaces; `force3D: false` on any GSAP tween of a dark surface; prefer `top`, `clip-path`, `opacity`.
- Every animation has a complete static fallback under `prefers-reduced-motion`.
- Library ownership: GSAP (via `src/lib/gsap.ts`) owns scroll-linked behaviour; Motion owns pointer/state-driven behaviour. No element is animated by both.
- Logic modules have basenames distinct from components (macOS case-insensitive import collision).
- Decorative cover art is hidden from assistive tech; link accessible names carry title + result only.
- Keyword-led headings: page `h1` and section `h2`s keep their keyword copy.

---

## Part 1: Shared pieces (`src/components/work/`)

### `ProjectMeta`
- Renders `Role · Year` (either part omitted if missing) and, optionally, the result line.
- Props: `frontmatter: CaseStudyFrontmatter`, `showResult?: boolean` (default true), `resultId?: string` (id on the result element, for `aria-labelledby`), `className?`.
- The separator is a middle dot (`·`), never an em dash.

### `ProjectCover`
- Renders a case study's cover for listings: `variant: 'animated' | 'static'`.
  - `animated`: the slug's animated inline-SVG cover from `getCoverComponent(slug)` (plays its reveal once on scroll-in via the existing curtain-aware hook), falling back to the static image.
  - `static`: `<img src={frontmatter.coverImage} alt="">` (used where a GSAP reveal would misbehave, e.g. the floating preview, and for small thumbnails).
- Always wrapped in an `aria-hidden="true"` element; images use `alt=""`.

### Logic module: `src/components/work/projectListing.ts` (pure, unit-tested)
- `projectNumber(index: number, total: number): string` → `"01 / 03"` (two-digit, zero-padded; totals of 10+ render as-is).
- `showcaseMode(desktop: boolean, reduced: boolean): 'stack' | 'cards'` → `'stack'` only when `desktop && !reduced`.
- `previewPosition(pointer: {x, y}, size: {w, h}, viewport: {w, h}, offset = 24): {x, y}` → pointer + offset, flipped left/up when the card would overflow the right/bottom edge, clamped to stay fully on-screen.

### Accessible naming rule
Listing links (panels and rows) use `aria-labelledby="<titleId> <resultId>"` so the accessible name is exactly the title followed by the result, regardless of the other content inside the link (numbers, tags, "View case study", covers). Ids are derived from the slug (e.g. `work-<slug>-title`, `work-<slug>-result`; Home uses a `home-` prefix to avoid duplicate ids if both ever render on one page).

---

## Part 2: `/work` showcase (`src/pages/Work.tsx`)

### Page structure
1. **Header**: eyebrow "Work"; `h1` "UX/UI Engineering & SEO Case Studies" via `RevealText`; a one-line intro; a small count label (e.g. "03 case studies"). Existing `SEO` title/description stay.
2. **`ProjectShowcase`**: one `ProjectPanel` per case study, sorted by `date` descending (existing `getCaseStudies()` order).
3. **Closing CTA band**: "Have a project like this in mind?" with a `Magnetic` "Start a project" `Button` to `/contact` (same pattern as `Outcome`'s CTA; extract a shared `ProjectCta` component rather than duplicating markup).
4. Empty state (no case studies): the existing "Case studies coming soon." copy.

### `ProjectPanel`
- One link to `/work/<slug>` wrapping the whole panel; `data-cursor="view"`; `aria-labelledby` per the naming rule.
- Height `calc(100svh - 4rem)` in stack mode; content-height in cards mode.
- **`lg+` layout**: two columns. Text column: `projectNumber` in vermilion mono; title at display size as `h2` (keyword-free project name is fine here; the page `h1` carries keywords); the result as the emphasized sentence (via `ProjectMeta`); `Role · Year`; tags; "View case study →". Cover column: `ProjectCover variant="animated"` at 16:9.
- **Below `lg`** (still stack mode at `md`): cover above text in a single column, both inside the panel.
- Surface: `bg-secondary-dark` with `border-line` border; hover/focus-visible adds the vermilion border + glow (no transform). Visible focus ring.

### Stacking (stack mode)
- Each panel is `position: sticky; top: 4rem` (under the navbar) with an increasing `z-index` so each later panel slides over the previous one on native scroll. The last panel is not sticky, so the CTA band scrolls in normally.
- Each covered panel darkens: a panel-level overlay element (`bg-directors-black`, `pointer-events: none`, `aria-hidden`) whose opacity is scrubbed from 0 to 0.6 by a GSAP ScrollTrigger keyed to the *next* panel's approach. Opacity only; the panel itself is not transformed.
- ScrollTriggers are created with `gsap.matchMedia()` under `(min-width: 768px) and (prefers-reduced-motion: no-preference)` and reverted on unmount/breakpoint change.

### Cards mode (below `md`, or reduced motion at any width)
- No sticky, no overlay scrub. Panels render as a vertical list of cards: cover on top, then number, title, result, meta, tags, "View case study →".
- Covers render their final static state under reduced motion (existing cover behaviour).

### Mode switching and SSR
- `showcaseMode(useMediaQuery('(min-width: 768px)'), useReducedMotion())`. `useMediaQuery` returns `false` on the server, so prerendered HTML is cards mode; desktop switches to stack mode after hydration. Call `ScrollTrigger.refresh()` once after the stack layout mounts so triggers below it measure the final layout.

---

## Part 3: Home "Selected work" (`src/pages/Home.tsx`)

### Section structure
- Eyebrow "Selected work"; `h2` "Featured UX/UI Engineering & SEO Projects" via `RevealText` (text unchanged, stays centred).
- `ProjectIndex`: the three newest case studies (`getCaseStudies().slice(0, 3)`, unchanged), left-aligned within the existing `max-w-7xl` container.
- "All work →" link to `/work` with `data-cursor="view"` (existing copy).

### `ProjectIndexRow`
- One link per row to `/work/<slug>`; `data-cursor="view"`; `aria-labelledby` per the naming rule.
- Full-width row with `border-line` rules between rows.
- Left: two-digit number (`01`) in vermilion mono; title at display size (`clamp` roughly 2rem to 4rem, tight tracking) as `h3`.
- Right (`md+`): `ProjectMeta` showing `Role · Year` with the result as one muted line.
- Hover/focus-visible: title turns vermilion; a short vermilion rule under the number grows by `width` (no transform). Visible focus ring.

### `HoverPreview` (fine pointer, motion allowed)
- A single floating 16:9 card (~420px wide) rendered once for the whole index, `position: fixed`, `pointer-events: none`, `aria-hidden`, stacked above page content but below the navbar and the cursor.
- Follows the pointer on a Motion spring (a softer preset than the cursor, added to `SPRING` in `src/lib/motion.ts`), positioned with `previewPosition` so it never leaves the viewport and sits offset from the pointer (so the "View" cursor pill stays readable).
- Shows `ProjectCover variant="static"` for the hovered row; crossfades (opacity) between projects; fades out when the pointer leaves the index.
- Motion animates only the preview's position and opacity; the preview is a light element with its own bordered frame, not a dark card surface, but no scale/rotate transforms are used.
- Hover-only enhancement: keyboard focus does not summon it (rows carry all information).

### Fallback (coarse pointer or reduced motion)
- No `HoverPreview`. Each row shows a small inline 16:9 thumbnail (`ProjectCover variant="static"`, ~160px wide at `md+`, full-width above the title below `md`).

---

## File map

**Create** (`src/components/work/`): `projectListing.ts` (+ test), `ProjectMeta.tsx`, `ProjectCover.tsx`, `ProjectCta.tsx`, `ProjectPanel.tsx`, `ProjectShowcase.tsx`, `ProjectIndexRow.tsx`, `ProjectIndex.tsx`, `HoverPreview.tsx`, with component tests.

**Modify**: `src/pages/Work.tsx`, `src/pages/Home.tsx` (Selected work section only), `src/lib/motion.ts` (+ CSS parity if a new token is mirrored), `src/components/mdx/case-study/Outcome.tsx` (use the shared `ProjectCta`), `MEMORY.md`.

## Testing

Per the tdd-kit contract, every source change starts with a failing test.

**Unit (Vitest):**
- `projectListing.ts`: `projectNumber` (padding, 10+), `showcaseMode` (all four combinations), `previewPosition` (normal offset, right-edge flip, bottom-edge flip, clamping in a viewport smaller than the card).
- `ProjectMeta`: role/year/result rendering, missing fields, middle-dot separator.
- `ProjectCover`: wrapper is `aria-hidden`; static variant uses `alt=""`; animated variant falls back to the image for unknown slugs.
- `ProjectPanel` / `ProjectShowcase`: accessible name equals "title result" and excludes cover text, number, tags; numbering and order; cards mode by default (server/jsdom), stack mode when desktop query matches and motion is allowed, cards mode under reduced motion; last panel not sticky; empty state.
- `ProjectIndexRow` / `ProjectIndex`: accessible names; inline thumbnails and no preview under coarse pointer or reduced motion; preview present and showing the hovered project's cover on fine pointer (fire `pointerenter` on a row).
- `ProjectCta` + `Outcome`: CTA still renders "Start a project" to `/contact`.
- Router tests use `src/test/TestRouter.tsx`.

**Visual (Playwright MCP browser, dev server):**
- `/work` at 1440x900: panels stack with the overlay darkening; the CTA band scrolls in after the last panel; hover glow; "View" cursor pill.
- `/work` at 390x844: cards mode, no horizontal overflow.
- Home at 1440: hover preview follows the pointer, flips at the right edge, crossfades between rows; at 390: inline thumbnails.
- Reduced-motion emulation: cards mode on `/work`, inline thumbnails on Home, no scrubbed overlay.
- Curtain navigation from Home and `/work` into a case study still works.

**Build:** `npm run typecheck`, `npm run test:run`, `npm run build`.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Sticky stacking feels like scroll-jacking | Native scroll only; no pinning with ScrollTrigger; panels sized to the viewport; last panel releases |
| Overlay scrub or covers jank on long pages | Opacity-only overlay; one ScrollTrigger per panel; covers reuse the existing once-only reveal |
| Stacked-to-sticky switch after hydration shifts trigger positions | `ScrollTrigger.refresh()` after stack mode mounts |
| Floating preview obscures content or clips at edges | Offset from pointer, edge flip + clamp via `previewPosition`, `pointer-events: none` |
| Link names polluted by panel content | `aria-labelledby` title + result; covers `aria-hidden` |
| Placeholder `result` strings shown prominently | Accepted until the owner supplies real outcomes (carried from sub-project 2) |
