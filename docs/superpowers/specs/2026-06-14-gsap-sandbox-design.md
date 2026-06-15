# GSAP Sandbox — Design

**Date:** 2026-06-14
**Status:** Approved
**Author:** Mathew Brown (with Claude)

## Goal

Bring GSAP into the portfolio as an experimentation sandbox. The intent is exploration, not a specific shipped effect yet: wire GSAP up cleanly, give it a safe place to play, and keep the existing Framer Motion (`motion`) animations untouched.

## Constraints (from CLAUDE.md / project context)

- **SSR/prerender safety.** The stack is `vite-react-ssg`, which prerenders routes to static HTML in a Node environment at build time. GSAP DOM work must never run during prerender (no `window`/`document` access server-side).
- **Respect `prefers-reduced-motion`.** All animation must honor reduced-motion, consistent with the existing `useReducedMotion` rule.
- **No transform-based lifts on dark cards.** Animating `transform` on dark surfaces (the `Card` component) triggers a GPU compositing black-bar artifact on some hardware. Demo animations must keep animated transforms off dark `Card` surfaces.
- **Brand tokens only.** Dark editorial palette: `directors-black`, `secondary-dark`, `vermilion`, `cream`, `muted-prose`, `border-line`. Vermilion is the single accent.
- **No em dashes in visible copy.**

## Approach

Use **`gsap` + `@gsap/react`** (the official `useGSAP()` hook).

`useGSAP()` runs animations inside a client-only layout effect, so they never fire during prerender; it auto-cleans every tween and ScrollTrigger on unmount; and it scopes selectors to a ref. This is the cleanest fit for an SSG + React 18 codebase and removes the SSR `window` problem and manual-cleanup boilerplate.

Rejected alternatives:
- Plain `gsap` + manual `useLayoutEffect`/cleanup: hand-rolls the SSR guards and cleanup that `@gsap/react` provides.
- Wrapping GSAP in the existing `FadeIn`/`StaggerItem` component pattern: premature abstraction for a sandbox.

## Components / changes

### 1. Dependencies
Add `gsap` and `@gsap/react` as runtime dependencies. GSAP is fully free, including ScrollTrigger and all plugins.

### 2. `src/lib/gsap.ts` — SSR-safe registration
A small module that registers `useGSAP` and `ScrollTrigger` with `gsap`, guarded so registration only runs in the browser (`typeof window !== 'undefined'`). All GSAP usage imports through this module so plugin registration happens once and consistently. Re-exports `gsap` and `useGSAP` for convenience.

### 3. `/lab` route
- New route added to `src/router.tsx`, rendered inside `DefaultLayout` (navbar + footer stay, so the sandbox feels like a real page).
- **Not** linked anywhere in the nav.
- SEO set to `noindex` (via the existing `SEO` component / a robots meta) so the prerendered page is not indexed.
- Lives at a path like `/lab`.

### 4. First demo (on the `/lab` page)
A minimal demo that proves the wiring end to end:
- A **scroll-scrubbed progress indicator** driven by GSAP ScrollTrigger.
- A small **pinned text reveal** section.
- On-brand styling (dark background, vermilion accent).
- Reduced-motion handled via `gsap.matchMedia()` keyed on `(prefers-reduced-motion: no-preference)`; reduced-motion users get the static end state.
- Animated transforms kept **off** dark `Card` surfaces, with an inline comment noting that constraint so future experiments respect it.

## Out of scope

- No changes to existing Framer Motion animations.
- No nav link to `/lab`.
- No production-facing page or content.
- No reusable GSAP component abstraction yet (that can come once specific effects are chosen).

## Success criteria

- `npm run dev` serves `/lab` and the demo animates correctly in the browser.
- `npm run build` (vite-react-ssg prerender) completes without errors; no SSR `window`/`document` crashes.
- `npm run typecheck` passes.
- Reduced-motion preference yields no animation (static end state).
- Existing pages and Framer Motion animations are unaffected.
