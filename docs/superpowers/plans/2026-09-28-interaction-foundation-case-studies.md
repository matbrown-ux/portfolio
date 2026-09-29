# Interaction Foundation + Case Study System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared interaction layer (motion tokens, contextual cursor, magnetic CTAs, text reveals, count-ups, curtain-aware entrances) and use it to rebuild the case study pages around a 10-second hero, chapters with a progress rail, a scroll-driven product walkthrough, and new MDX modules.

**Architecture:** Pure logic lives in small `.ts` modules with unit tests; `.tsx` components only wire that logic to the DOM. GSAP (via `src/lib/gsap.ts`) owns everything scroll- or timeline-driven, Motion (`motion/react`) owns pointer- and state-driven behavior, and no element is animated by both. Case study MDX gets a new component registry; the page uses a CSS grid "width system" so modules can break out of the reading column.

**Tech Stack:** React 18, Vite 5, vite-react-ssg, TypeScript, Tailwind CSS v4, GSAP 3 + @gsap/react, motion 11, MDX 3, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-09-28-interaction-foundation-case-studies-design.md`

## Global Constraints

- This is a Vite + vite-react-ssg project, not Next.js. No `"use client"`, no `next/*`.
- No em dashes (`—`) in any visible copy: page text, MDX, captions, alt text, frontmatter, component strings.
- MDX comments are `{/* ... */}`, never `<!-- -->`.
- Never fabricate metrics or results. Metric placeholders stay `"00"` with a `TODO` comment. `result` is either a fact the user supplied or exactly `RESULT_PLACEHOLDER`.
- Colors only from brand tokens: `directors-black`, `secondary-dark`, `vermilion`, `vermilion-hover`, `cream`, `muted-prose`, `border-line`.
- No `transform` hover lifts on dark cards. GSAP tweens that move or scale dark surfaces use `force3D: false`.
- Every animation has a complete static fallback under `prefers-reduced-motion`.
- Import GSAP only through `src/lib/gsap.ts`. Any new GSAP subpath import must be added to `ssr.noExternal` in `vite.config.ts`.
- TDD: every source change starts with a failing test, and every commit that stages source also stages a test. Never `--no-verify`. No `Test-Exempt` trailers without the user's explicit approval.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Commands: `npx vitest run <path>` for a single file, `npm run test:run` for all, `npm run typecheck`, `npm run build`.

## Review Focus

1. **Duplicate chapter titles** in one MDX file (e.g. two `<Chapter title="Overview">`): each must get a distinct anchor id (`overview`, `overview-2`) and a distinct rail link. Pinned in Task 8.
2. **A Walkthrough with zero or one step:** zero renders nothing; one step renders its frame and text without dividing by zero or indexing out of range. Pinned in Task 10.
3. **Metric strings with separators, decimals, prefixes, or no number** (`1,200+`, `3.5x`, `$120k`, `#1`, `N/A`, `00`): numbers count up keeping their format; `#1`, `00`, and non-numeric values render as is. Pinned in Task 6.
4. **Headings with apostrophes, slashes, and ampersands** (`'Aiwi Waffles`, `UX/UI Engineering & SEO`): the accessible heading name is exactly the source string, and chapter slugs are clean (`aiwi-waffles`, `ux-ui-engineering-and-seo`). Pinned in Tasks 5 and 8.
5. **Media that fails to load** (404 image, missing video source, no `src` at all): a labeled "Capture coming soon" frame at the same aspect ratio replaces it, with no layout shift. Pinned in Task 9.

## Spec notes (decisions made while planning)

- **Hero order:** the spec lists a full-viewport cover and the at-a-glance strip as one hero, and also requires the 10-second read to be visible before scrolling. Both can't hold with a full-viewport cover on top, so the headline and glance strip come first (above the fold) and the full-bleed cover follows immediately.
- **Chapter rail breakpoint:** the rail shows at `xl+` (not `lg+`). At `lg`, `wide` modules would sit directly on top of the rail. Below `xl`, the top progress bar with the chapter name is used.
- **"Pinned" Walkthrough:** implemented with CSS `position: sticky` for the frame and a ScrollTrigger for step state, not ScrollTrigger `pin`. It gives the same effect with no pin-spacer layout shifts.

---

## File Map

**Create**
- `src/lib/motion.ts` (+ test): motion tokens
- `src/lib/entrance.ts` (+ test): `remainingDelay`
- `src/hooks/useMediaQuery.ts` (+ test)
- `src/test/matchMedia.ts`: test helper
- `src/components/interaction/useScrollReveal.ts`
- `src/components/interaction/cursorState.ts` (+ test), `Cursor.tsx` (+ test)
- `src/components/interaction/magnetic.ts` (+ test), `Magnetic.tsx` (+ test)
- `src/components/interaction/splitText.ts` (+ test), `RevealText.tsx` (+ test)
- `src/components/interaction/countUp.ts` (+ test), `CountUp.tsx` (+ test)
- `src/components/mdx/case-study/width.ts` (+ test)
- `src/components/mdx/case-study/chapters.ts` (+ test), `ChapterContext.tsx`, `Chapter.tsx`, `ChapterNav.tsx` (+ test `Chapter.test.tsx`)
- `src/components/mdx/case-study/CaptureMedia.tsx`, `DeviceFrame.tsx`, `Hotspot.tsx` (+ test `CaptureMedia.test.tsx`)
- `src/components/mdx/case-study/walkthrough.ts` (+ test), `Walkthrough.tsx` (+ test)
- `src/components/mdx/case-study/gallery.ts` (+ test), `Gallery.tsx` (+ test)
- `src/components/mdx/case-study/beforeAfter.ts` (+ test), `BeforeAfter.tsx` (+ test)
- `src/components/mdx/case-study/Outcome.tsx`, `PullQuote.tsx` (+ test `Outcome.test.tsx`)
- `src/components/mdx/case-study/index.ts`: module registry
- `src/components/work/NextProject.tsx` (+ test)
- `src/components/work/CaseStudyHero.tsx`
- `src/pages/WorkDetail.test.tsx`
- `public/images/case-studies/<slug>/og.png` (x3)

**Modify**
- `src/test/setup.ts`: IntersectionObserver stub + default matchMedia
- `src/styles/globals.css`: motion CSS vars, `cs-grid` width system, chapter styles
- `src/components/animations/FadeIn.tsx`, `StaggerList.tsx`, `src/components/mdx/Metrics.tsx`, `caseStudyMdx.tsx`: import eases from `motion.ts`
- `src/components/work/covers/useCoverReveal.ts`: built on `useScrollReveal`
- `src/layouts/DefaultLayout.tsx`: mount `<Cursor />`
- `src/types/content.ts`, `src/lib/content.ts`, `src/lib/content.test.ts`: `year`, `result`, `client`, `ogImage`, validation
- `src/layouts/CaseStudyLayout.tsx`, `src/pages/WorkDetail.tsx`
- `src/content/case-studies/*.mdx` (x3)
- `MEMORY.md`, `CLAUDE.md` (content pipeline line)

---

### Task 1: Motion tokens + test environment

**Files:**
- Create: `src/lib/motion.ts`, `src/lib/motion.test.ts`, `src/test/matchMedia.ts`
- Modify: `src/test/setup.ts`, `src/styles/globals.css` (the `@theme` block), `src/components/animations/FadeIn.tsx`, `src/components/animations/StaggerList.tsx`, `src/components/mdx/Metrics.tsx`, `src/components/mdx/caseStudyMdx.tsx`

**Interfaces:**
- Produces: `BezierTuple`, `EASE.outQuint`, `EASE.inOut`, `GSAP_EASE.out | inOut | reveal`, `DURATION.fast | base | slow | reveal`, `SPRING.cursor | magnetic`, `toCssBezier(e)`. Test helper `installMatchMedia(matches: Record<string, boolean>)`, constants `REDUCED_QUERY`, `FINE_POINTER_QUERY`, `DESKTOP_QUERY`.

- [ ] **Step 1: Write the failing test**

`src/lib/motion.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { EASE, DURATION, SPRING, GSAP_EASE, toCssBezier } from './motion'

const css = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8')

describe('motion tokens', () => {
  it('keeps the house ease', () => {
    expect(EASE.outQuint).toEqual([0.16, 1, 0.3, 1])
  })

  it('formats a bezier tuple as CSS', () => {
    expect(toCssBezier([0.16, 1, 0.3, 1])).toBe('cubic-bezier(0.16, 1, 0.3, 1)')
  })

  it('mirrors every ease and duration as a CSS variable in globals.css', () => {
    expect(css).toContain(`--ease-out-quint: ${toCssBezier(EASE.outQuint)};`)
    expect(css).toContain(`--ease-in-out: ${toCssBezier(EASE.inOut)};`)
    for (const [name, seconds] of Object.entries(DURATION)) {
      expect(css).toContain(`--duration-${name}: ${Math.round(seconds * 1000)}ms;`)
    }
  })

  it('exposes spring presets and GSAP ease names', () => {
    expect(SPRING.cursor.stiffness).toBeGreaterThan(SPRING.magnetic.stiffness)
    expect(GSAP_EASE.reveal).toBe('power4.out')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/motion.test.ts`
Expected: FAIL, cannot resolve `./motion`.

- [ ] **Step 3: Implement tokens and CSS vars**

`src/lib/motion.ts`:

```ts
/**
 * Motion tokens: the single source for eases, durations, and springs.
 * Motion (framer) takes the bezier tuples and springs; GSAP takes the
 * GSAP_EASE strings. Eases and durations are mirrored as CSS variables in
 * globals.css (a test enforces parity).
 */
export type BezierTuple = [number, number, number, number]

export const EASE: { outQuint: BezierTuple; inOut: BezierTuple } = {
  outQuint: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
}

export const GSAP_EASE = {
  out: 'expo.out',
  inOut: 'power2.inOut',
  reveal: 'power4.out',
} as const

/** Seconds. */
export const DURATION = {
  fast: 0.2,
  base: 0.5,
  slow: 0.9,
  reveal: 1.1,
} as const

export const SPRING = {
  cursor: { stiffness: 500, damping: 40, mass: 0.4 },
  magnetic: { stiffness: 180, damping: 14, mass: 0.3 },
} as const

export function toCssBezier(e: readonly number[]): string {
  return `cubic-bezier(${e.join(', ')})`
}
```

In `src/styles/globals.css`, replace the `/* Easing */` lines inside `@theme` with:

```css
  /* Easing + duration (mirrored from src/lib/motion.ts; parity is tested) */
  --ease-out-quint: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 200ms;
  --duration-base: 500ms;
  --duration-slow: 900ms;
  --duration-reveal: 1100ms;
```

- [ ] **Step 4: Add the test environment helpers**

`src/test/matchMedia.ts`:

```ts
export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
export const FINE_POINTER_QUERY = '(pointer: fine)'
export const DESKTOP_QUERY = '(min-width: 768px)'

/** Install a window.matchMedia where only the listed queries match. */
export function installMatchMedia(matches: Record<string, boolean>) {
  const impl = (query: string) => ({
    matches: matches[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: impl })
}
```

`src/test/setup.ts` (full file):

```ts
import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'
import { installMatchMedia } from './matchMedia'

// jsdom has no IntersectionObserver; Motion's whileInView/useInView need one.
class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
if (!('IntersectionObserver' in window)) {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub,
  })
}

// Default: no media query matches (coarse pointer, mobile width, and
// "no-preference" false, so GSAP matchMedia animations stay off and every
// component renders its static final state). Tests opt in per case.
beforeEach(() => installMatchMedia({}))
```

- [ ] **Step 5: Replace local ease copies with the token**

In each file, delete the local `EASE` constant (or inline tuple) and import the token:

- `src/components/animations/FadeIn.tsx`: add `import { EASE } from '../../lib/motion'`; change `ease: [0.16, 1, 0.3, 1]` to `ease: EASE.outQuint`.
- `src/components/animations/StaggerList.tsx`: same import; `ease: EASE.outQuint`.
- `src/components/mdx/Metrics.tsx`: remove `const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]`, add `import { EASE } from '../../lib/motion'`, change `ease: EASE` to `ease: EASE.outQuint`.
- `src/components/mdx/caseStudyMdx.tsx`: same as Metrics.

- [ ] **Step 6: Run tests and typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: all tests PASS (including the 13 existing), no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/motion.ts src/lib/motion.test.ts src/test src/styles/globals.css src/components/animations src/components/mdx/Metrics.tsx src/components/mdx/caseStudyMdx.tsx
git commit -m "feat: motion tokens with CSS parity + shared test env

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Curtain-aware scroll reveal

Closes the known gap where above-the-fold animations play hidden behind `PageCurtain`.

**Files:**
- Create: `src/lib/entrance.ts`, `src/lib/entrance.test.ts`, `src/components/interaction/useScrollReveal.ts`
- Modify: `src/components/work/covers/useCoverReveal.ts`

**Interfaces:**
- Consumes: `useEntranceDelay()` from `src/components/PageCurtain.tsx` (returns seconds, 0 on direct load, 1.2 after a transition).
- Produces:
  - `remainingDelay(entranceDelay: number, mountedAtMs: number, nowMs: number): number` (seconds, never negative)
  - `useScrollReveal<T extends HTMLElement>(build: (el: T) => gsap.core.Animation | void, options?: { start?: string; deps?: unknown[] }): RefObject<T>`. `build` returns an animation; the hook pauses it at 0, plays it once on scroll-in, and waits out any remaining curtain delay. Runs only under `(prefers-reduced-motion: no-preference)`.

- [ ] **Step 1: Write the failing test**

`src/lib/entrance.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { remainingDelay } from './entrance'

describe('remainingDelay', () => {
  it('waits the full delay when triggered at mount', () => {
    expect(remainingDelay(1.2, 1000, 1000)).toBeCloseTo(1.2)
  })

  it('waits only what is left of the delay', () => {
    expect(remainingDelay(1.2, 1000, 1500)).toBeCloseTo(0.7)
  })

  it('never goes negative once the curtain has cleared', () => {
    expect(remainingDelay(1.2, 1000, 9000)).toBe(0)
  })

  it('is zero on a direct load', () => {
    expect(remainingDelay(0, 1000, 1000)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/entrance.test.ts`
Expected: FAIL, cannot resolve `./entrance`.

- [ ] **Step 3: Implement**

`src/lib/entrance.ts`:

```ts
/**
 * Seconds an entrance animation should still wait so it plays after the page
 * curtain lifts. An element that scrolls in long after navigation waits 0.
 */
export function remainingDelay(entranceDelay: number, mountedAtMs: number, nowMs: number): number {
  const elapsed = (nowMs - mountedAtMs) / 1000
  return Math.max(0, entranceDelay - elapsed)
}
```

`src/components/interaction/useScrollReveal.ts`:

```ts
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useEntranceDelay } from '../PageCurtain'
import { remainingDelay } from '../../lib/entrance'

interface ScrollRevealOptions {
  start?: string
  deps?: unknown[]
}

/**
 * Plays a GSAP animation once when the element scrolls into view, and never
 * while the page curtain still covers it. `build` should create the animation
 * with from()/fromTo() so its hidden start state renders before first paint.
 * Reduced-motion users never run `build`, so they see the final state.
 */
export function useScrollReveal<T extends HTMLElement>(
  build: (el: T) => gsap.core.Animation | void,
  { start = 'top 85%', deps = [] }: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null)
  const entranceDelay = useEntranceDelay()

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mountedAt = performance.now()
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const anim = build(el)
        if (!anim) return
        anim.pause(0)
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => {
            const wait = remainingDelay(entranceDelay, mountedAt, performance.now())
            if (wait > 0) gsap.delayedCall(wait, () => anim.play())
            else anim.play()
          },
        })
      })
    },
    { scope: ref, dependencies: [entranceDelay, start, ...deps] }
  )

  return ref
}
```

Replace the body of `useCoverReveal` in `src/components/work/covers/useCoverReveal.ts` (keep the `CoverBuild` type, its doc comment, and `drawStroke` unchanged):

```ts
import { gsap } from '../../../lib/gsap'
import { useScrollReveal } from '../../interaction/useScrollReveal'

// ...CoverBuild type + comment unchanged...

/**
 * Shared scaffolding for the animated work covers: plays the bespoke timeline
 * once on scroll-in, after the page curtain has lifted. Reduced-motion users
 * see the full static cover. Returns the wrapper ref to attach.
 */
export function useCoverReveal(build: CoverBuild) {
  return useScrollReveal<HTMLDivElement>(
    (el) => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', force3D: false } })
      build(tl, el)
      return tl
    },
    { start: 'top 80%' }
  )
}
```

(`drawStroke` still imports `gsap` from the same module; remove the now-unused `useRef`, `ScrollTrigger`, `useGSAP` imports.)

- [ ] **Step 4: Run tests and typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/entrance.ts src/lib/entrance.test.ts src/components/interaction/useScrollReveal.ts src/components/work/covers/useCoverReveal.ts
git commit -m "feat: curtain-aware scroll reveal; covers wait for the curtain

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: useMediaQuery + contextual Cursor

**Files:**
- Create: `src/hooks/useMediaQuery.ts`, `src/hooks/useMediaQuery.test.ts`, `src/components/interaction/cursorState.ts`, `src/components/interaction/cursorState.test.ts`, `src/components/interaction/Cursor.tsx`, `src/components/interaction/Cursor.test.tsx`
- Modify: `src/layouts/DefaultLayout.tsx`

**Interfaces:**
- Consumes: `SPRING.cursor` (Task 1), `useReducedMotion` (existing), `installMatchMedia`, `FINE_POINTER_QUERY` (Task 1).
- Produces: `useMediaQuery(query: string): boolean` (SSR/hydration safe, `false` on the server). `type CursorMode = 'default' | 'view' | 'drag' | 'visit' | 'hidden'`, `resolveCursorState(target: Element | null): CursorMode`, `CURSOR_LABELS`. Components opt in with `data-cursor="view" | "drag" | "visit"`.

- [ ] **Step 1: Write the failing tests**

`src/hooks/useMediaQuery.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'
import { installMatchMedia, FINE_POINTER_QUERY } from '../test/matchMedia'

describe('useMediaQuery', () => {
  it('is true when the query matches', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    expect(renderHook(() => useMediaQuery(FINE_POINTER_QUERY)).result.current).toBe(true)
  })

  it('is false when it does not', () => {
    expect(renderHook(() => useMediaQuery(FINE_POINTER_QUERY)).result.current).toBe(false)
  })
})
```

`src/components/interaction/cursorState.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { resolveCursorState } from './cursorState'

function dom(html: string) {
  const root = document.createElement('div')
  root.innerHTML = html
  document.body.appendChild(root)
  return root
}

describe('resolveCursorState', () => {
  it('is default with no target', () => {
    expect(resolveCursorState(null)).toBe('default')
  })

  it('reads the nearest data-cursor ancestor', () => {
    const root = dom('<a data-cursor="view"><div data-cursor="drag"><span id="t">x</span></div></a>')
    expect(resolveCursorState(root.querySelector('#t'))).toBe('drag')
  })

  it('ignores unknown values', () => {
    const root = dom('<div data-cursor="spin"><span id="t">x</span></div>')
    expect(resolveCursorState(root.querySelector('#t'))).toBe('default')
  })

  it('hides over form fields, even inside a data-cursor region', () => {
    const root = dom('<div data-cursor="view"><input id="t" /></div>')
    expect(resolveCursorState(root.querySelector('#t'))).toBe('hidden')
  })
})
```

`src/components/interaction/Cursor.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Cursor } from './Cursor'
import { installMatchMedia, FINE_POINTER_QUERY } from '../../test/matchMedia'

describe('Cursor', () => {
  it('renders nothing on touch / coarse pointers', () => {
    render(<Cursor />)
    expect(screen.queryByTestId('cursor')).toBeNull()
  })

  it('shows a labeled pill over a data-cursor region on fine pointers', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    render(
      <>
        <Cursor />
        <a data-cursor="view" href="#x">
          <span>card</span>
        </a>
      </>
    )
    fireEvent.pointerMove(screen.getByText('card'))
    expect(screen.getByTestId('cursor')).toHaveAttribute('data-mode', 'view')
    expect(screen.getByText('View')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/hooks/useMediaQuery.test.ts src/components/interaction`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`src/hooks/useMediaQuery.ts`:

```ts
import { useCallback, useSyncExternalStore } from 'react'

/**
 * Live media-query match. Returns false on the server and during hydration
 * (React uses the server snapshot), then the real value, so prerendered HTML
 * never mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query]
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
```

`src/components/interaction/cursorState.ts`:

```ts
export type CursorMode = 'default' | 'view' | 'drag' | 'visit' | 'hidden'
type LabeledMode = 'view' | 'drag' | 'visit'

export const CURSOR_LABELS: Record<LabeledMode, string> = {
  view: 'View',
  drag: 'Drag',
  visit: 'Visit',
}

const FORM_FIELDS = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'

/** Cursor mode for the element under the pointer. Form fields always hide it. */
export function resolveCursorState(target: Element | null): CursorMode {
  if (!target) return 'default'
  if (target.closest(FORM_FIELDS)) return 'hidden'
  const value = target.closest('[data-cursor]')?.getAttribute('data-cursor')
  return value === 'view' || value === 'drag' || value === 'visit' ? value : 'default'
}

export function cursorLabel(mode: CursorMode): string | null {
  return mode === 'view' || mode === 'drag' || mode === 'visit' ? CURSOR_LABELS[mode] : null
}
```

`src/components/interaction/Cursor.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SPRING } from '../../lib/motion'
import { resolveCursorState, cursorLabel, type CursorMode } from './cursorState'

/**
 * Contextual cursor: a small vermilion ring that follows the pointer and grows
 * into a labeled pill over `data-cursor` regions. Fine pointers only; the
 * native cursor stays visible. Reduced motion: no spring trailing.
 */
export function Cursor() {
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = useReducedMotion()
  const [mode, setMode] = useState<CursorMode>('default')
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, SPRING.cursor)
  const springY = useSpring(y, SPRING.cursor)

  useEffect(() => {
    if (!fine) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      setMode(resolveCursorState(e.target as Element | null))
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [fine, x, y])

  if (!fine) return null
  const label = cursorLabel(mode)
  const shown = visible && mode !== 'hidden'

  return (
    <motion.div
      aria-hidden="true"
      data-testid="cursor"
      data-mode={mode}
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ x: reduced ? x : springX, y: reduced ? y : springY, opacity: shown ? 1 : 0 }}
    >
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-vermilion transition-[width,height,background-color] duration-200 ${
          label ? 'h-16 w-16 bg-vermilion text-cream' : 'h-6 w-6'
        }`}
      >
        {label && <span className="text-[0.65rem] font-semibold uppercase tracking-[0.15em]">{label}</span>}
      </div>
    </motion.div>
  )
}
```

In `src/layouts/DefaultLayout.tsx`, add `import { Cursor } from '../components/interaction/Cursor'` and render `<Cursor />` as the last child of the outer `div` (after `<Footer />`).

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run src/hooks src/components/interaction && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMediaQuery.ts src/hooks/useMediaQuery.test.ts src/components/interaction/cursorState.ts src/components/interaction/cursorState.test.ts src/components/interaction/Cursor.tsx src/components/interaction/Cursor.test.tsx src/layouts/DefaultLayout.tsx
git commit -m "feat: contextual cursor + SSR-safe useMediaQuery

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Magnetic CTAs

**Files:**
- Create: `src/components/interaction/magnetic.ts`, `magnetic.test.ts`, `Magnetic.tsx`, `Magnetic.test.tsx` (all in `src/components/interaction/`)

**Interfaces:**
- Consumes: `SPRING.magnetic`, `useMediaQuery`, `useReducedMotion`.
- Produces: `magneticOffset(pointer: Point, box: Box, strength?: number, max?: number): Point`; `<Magnetic strength? max? className?>{child}</Magnetic>`, whose wrapper has `data-magnetic="on" | "off"`.

- [ ] **Step 1: Write the failing tests**

`magnetic.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { magneticOffset } from './magnetic'

const box = { left: 100, top: 100, width: 200, height: 50 } // center (200, 125)

describe('magneticOffset', () => {
  it('is zero at the center', () => {
    expect(magneticOffset({ x: 200, y: 125 }, box)).toEqual({ x: 0, y: 0 })
  })

  it('pulls toward the pointer by strength', () => {
    expect(magneticOffset({ x: 220, y: 135 }, box, 0.5)).toEqual({ x: 10, y: 5 })
  })

  it('clamps to max', () => {
    expect(magneticOffset({ x: 300, y: 25 }, box, 0.5, 12)).toEqual({ x: 12, y: -12 })
  })

  it('does nothing at zero strength', () => {
    expect(magneticOffset({ x: 300, y: 150 }, box, 0)).toEqual({ x: 0, y: 0 })
  })
})
```

`Magnetic.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Magnetic } from './Magnetic'
import { installMatchMedia, FINE_POINTER_QUERY, REDUCED_QUERY } from '../../test/matchMedia'

describe('Magnetic', () => {
  it('is off on coarse pointers and still renders the child', () => {
    render(<Magnetic><button>Go</button></Magnetic>)
    expect(screen.getByRole('button', { name: 'Go' }).parentElement).toHaveAttribute('data-magnetic', 'off')
  })

  it('is on for fine pointers', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    render(<Magnetic><button>Go</button></Magnetic>)
    expect(screen.getByRole('button').parentElement).toHaveAttribute('data-magnetic', 'on')
  })

  it('is off under reduced motion', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_QUERY]: true })
    render(<Magnetic><button>Go</button></Magnetic>)
    expect(screen.getByRole('button').parentElement).toHaveAttribute('data-magnetic', 'off')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/interaction/magnetic.test.ts src/components/interaction/Magnetic.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`magnetic.ts`:

```ts
export interface Point {
  x: number
  y: number
}
export interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** Offset (px) pulling an element toward the pointer, clamped to ±max. */
export function magneticOffset(pointer: Point, box: Box, strength = 0.35, max = 12): Point {
  const cx = box.left + box.width / 2
  const cy = box.top + box.height / 2
  const clamp = (v: number) => Math.max(-max, Math.min(max, v)) + 0 // + 0 normalizes -0
  return { x: clamp((pointer.x - cx) * strength), y: clamp((pointer.y - cy) * strength) }
}
```

`Magnetic.tsx`:

```tsx
import type { ReactNode, PointerEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { SPRING } from '../../lib/motion'
import { magneticOffset } from './magnetic'

interface MagneticProps {
  children: ReactNode
  strength?: number
  max?: number
  className?: string
}

/** Springs its child toward the pointer. Fine pointers only; off under reduced motion. */
export function Magnetic({ children, strength = 0.35, max = 12, className = 'inline-block' }: MagneticProps) {
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING.magnetic)
  const sy = useSpring(y, SPRING.magnetic)

  if (!fine || reduced) {
    return (
      <span data-magnetic="off" className={className}>
        {children}
      </span>
    )
  }

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    const offset = magneticOffset({ x: e.clientX, y: e.clientY }, e.currentTarget.getBoundingClientRect(), strength, max)
    x.set(offset.x)
    y.set(offset.y)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span data-magnetic="on" className={className} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </motion.span>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/interaction && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/interaction/magnetic.ts src/components/interaction/magnetic.test.ts src/components/interaction/Magnetic.tsx src/components/interaction/Magnetic.test.tsx
git commit -m "feat: magnetic CTA wrapper

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: RevealText

**Files:**
- Create: `src/components/interaction/splitText.ts`, `splitText.test.ts`, `RevealText.tsx`, `RevealText.test.tsx`

**Interfaces:**
- Consumes: `useScrollReveal` (Task 2), `DURATION.reveal`, `GSAP_EASE.reveal`.
- Produces: `splitWords(text: string): string[]`; `<RevealText as?: 'h1'|'h2'|'h3'|'p'|'blockquote' text: string className? style? id? />`. Always renders the same DOM (SSR-safe): an `sr-only` copy of `text` plus `aria-hidden` word spans carrying `data-word`.

- [ ] **Step 1: Write the failing tests**

`splitText.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { splitWords } from './splitText'

describe('splitWords', () => {
  it('keeps slashes and ampersands as their own tokens', () => {
    expect(splitWords('UX/UI Engineering & SEO')).toEqual(['UX/UI', 'Engineering', '&', 'SEO'])
  })

  it('keeps leading apostrophes', () => {
    expect(splitWords("'Aiwi Waffles")).toEqual(["'Aiwi", 'Waffles'])
  })

  it('collapses whitespace', () => {
    expect(splitWords('  A \n  B  ')).toEqual(['A', 'B'])
  })

  it('returns nothing for empty text', () => {
    expect(splitWords('   ')).toEqual([])
  })
})
```

`RevealText.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RevealText } from './RevealText'

describe('RevealText', () => {
  it('exposes the exact source string as the heading name', () => {
    render(<RevealText as="h1" text="UX/UI Engineering & SEO for 'Aiwi Waffles" />)
    expect(screen.getByRole('heading', { level: 1, name: "UX/UI Engineering & SEO for 'Aiwi Waffles" })).toBeInTheDocument()
  })

  it('hides the split words from assistive tech', () => {
    const { container } = render(<RevealText as="h2" text="Two words" />)
    const words = container.querySelectorAll('[data-word]')
    expect(words).toHaveLength(2)
    expect(words[0].closest('[aria-hidden="true"]')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/interaction/splitText.test.ts src/components/interaction/RevealText.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`splitText.ts`:

```ts
/** Split display text into words for a masked reveal. Punctuation stays attached. */
export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}
```

`RevealText.tsx`:

```tsx
import { Fragment, type CSSProperties } from 'react'
import { gsap } from '../../lib/gsap'
import { DURATION, GSAP_EASE } from '../../lib/motion'
import { useScrollReveal } from './useScrollReveal'
import { splitWords } from './splitText'

type RevealTag = 'h1' | 'h2' | 'h3' | 'p' | 'blockquote'

interface RevealTextProps {
  as?: RevealTag
  text: string
  className?: string
  style?: CSSProperties
  id?: string
}

/**
 * Masked word-by-word reveal for display text. The real element holds an
 * sr-only copy of the full string (crawlers and screen readers get one clean
 * string); the split words are aria-hidden. Same DOM on server and client.
 */
export function RevealText({ as: Tag = 'h2', text, className, style, id }: RevealTextProps) {
  const ref = useScrollReveal<HTMLElement>(
    (el) =>
      gsap.from(el.querySelectorAll('[data-word]'), {
        yPercent: 110,
        duration: DURATION.reveal,
        ease: GSAP_EASE.reveal,
        stagger: 0.06,
        force3D: false,
      }),
    { deps: [text] }
  )
  const words = splitWords(text)

  return (
    <Tag ref={ref as never} id={id} className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/interaction && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/interaction/splitText.ts src/components/interaction/splitText.test.ts src/components/interaction/RevealText.tsx src/components/interaction/RevealText.test.tsx
git commit -m "feat: SEO-safe masked RevealText

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: CountUp

**Files:**
- Create: `src/components/interaction/countUp.ts`, `countUp.test.ts`, `CountUp.tsx`, `CountUp.test.tsx`

**Interfaces:**
- Consumes: `useScrollReveal`, `DURATION.slow`, `GSAP_EASE.out`.
- Produces: `ParsedMetric`, `parseMetric(raw: string): ParsedMetric | null`, `formatMetric(p: ParsedMetric, current: number): string`, `shouldAnimate(p: ParsedMetric | null): p is ParsedMetric`; `<CountUp value: string className? />`.

- [ ] **Step 1: Write the failing tests**

`countUp.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseMetric, formatMetric, shouldAnimate } from './countUp'

describe('parseMetric', () => {
  it.each([
    ['40%', { prefix: '', value: 40, decimals: 0, suffix: '%', grouped: false }],
    ['$120k', { prefix: '$', value: 120, decimals: 0, suffix: 'k', grouped: false }],
    ['3.5x', { prefix: '', value: 3.5, decimals: 1, suffix: 'x', grouped: false }],
    ['1,200+', { prefix: '', value: 1200, decimals: 0, suffix: '+', grouped: true }],
    ['#1', { prefix: '#', value: 1, decimals: 0, suffix: '', grouped: false }],
  ])('parses %s', (raw, expected) => {
    expect(parseMetric(raw)).toEqual(expected)
  })

  it.each(['00', '0', 'N/A', ''])('returns null for %j', (raw) => {
    expect(parseMetric(raw)).toBeNull()
  })
})

describe('formatMetric', () => {
  it('keeps grouping, decimals, and affixes', () => {
    expect(formatMetric(parseMetric('1,200+')!, 600)).toBe('600+')
    expect(formatMetric(parseMetric('1,200+')!, 1200)).toBe('1,200+')
    expect(formatMetric(parseMetric('3.5x')!, 1.2)).toBe('1.2x')
    expect(formatMetric(parseMetric('$120k')!, 60.4)).toBe('$60k')
  })
})

describe('shouldAnimate', () => {
  it('skips ranks and placeholders', () => {
    expect(shouldAnimate(parseMetric('#1'))).toBe(false)
    expect(shouldAnimate(parseMetric('00'))).toBe(false)
    expect(shouldAnimate(parseMetric('40%'))).toBe(true)
  })
})
```

`CountUp.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountUp } from './CountUp'

describe('CountUp', () => {
  it('renders the final value statically without motion', () => {
    render(<CountUp value="1,200+" />)
    expect(screen.getAllByText('1,200+').length).toBeGreaterThan(0)
  })

  it('renders placeholders as is', () => {
    render(<CountUp value="00" />)
    expect(screen.getAllByText('00').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/interaction/countUp.test.ts src/components/interaction/CountUp.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`countUp.ts`:

```ts
export interface ParsedMetric {
  prefix: string
  value: number
  decimals: number
  suffix: string
  grouped: boolean
}

const METRIC = /^(\D*?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(.*)$/

/** Split a metric string into prefix, number, and suffix. Null when there is no real number. */
export function parseMetric(raw: string): ParsedMetric | null {
  const match = raw.trim().match(METRIC)
  if (!match) return null
  const [, prefix, int, frac = '', suffix] = match
  if (/^0+$/.test(int) && !frac) return null
  return {
    prefix,
    value: Number(int.replace(/,/g, '') + (frac ? `.${frac}` : '')),
    decimals: frac.length,
    suffix,
    grouped: int.includes(','),
  }
}

export function formatMetric(p: ParsedMetric, current: number): string {
  const n = current.toLocaleString('en-US', {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
    useGrouping: p.grouped,
  })
  return `${p.prefix}${n}${p.suffix}`
}

/** Counting 0 → 1 reads as noise ("#0"), so ranks and tiny values stay static. */
export function shouldAnimate(p: ParsedMetric | null): p is ParsedMetric {
  return p !== null && p.value > 1
}
```

`CountUp.tsx`:

```tsx
import { gsap } from '../../lib/gsap'
import { DURATION, GSAP_EASE } from '../../lib/motion'
import { useScrollReveal } from './useScrollReveal'
import { parseMetric, formatMetric, shouldAnimate } from './countUp'

/** Counts a metric up on scroll-in, keeping its format. Screen readers get the final value. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useScrollReveal<HTMLSpanElement>(
    (el) => {
      const parsed = parseMetric(value)
      if (!shouldAnimate(parsed)) return
      const state = { n: 0 }
      return gsap.to(state, {
        n: parsed.value,
        duration: DURATION.slow * 1.6,
        ease: GSAP_EASE.out,
        onStart: () => {
          el.textContent = formatMetric(parsed, 0)
        },
        onUpdate: () => {
          el.textContent = formatMetric(parsed, state.n)
        },
        onComplete: () => {
          el.textContent = value
        },
      })
    },
    { deps: [value] }
  )

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" ref={ref}>
        {value}
      </span>
    </span>
  )
}
```

Note: the visible span shows the final value until the count starts (no zero flash before scroll-in, and a correct value if JS fails).

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/interaction && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/interaction/countUp.ts src/components/interaction/countUp.test.ts src/components/interaction/CountUp.tsx src/components/interaction/CountUp.test.tsx
git commit -m "feat: format-preserving CountUp

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Case study frontmatter (`year`, `result`, `client`, `ogImage`) + validation

**Files:**
- Modify: `src/types/content.ts`, `src/lib/content.ts`, `src/lib/content.test.ts`, `src/content/case-studies/vamp-network.mdx`, `the-booking-flow.mdx`, `aiwi-waffles.mdx` (frontmatter only)

**Interfaces:**
- Produces: `CaseStudyFrontmatter.year: string`, `.result: string`, `.client?: string`, `.ogImage?: string`; `RESULT_PLACEHOLDER`; `validateCaseStudyFrontmatter(fm: Partial<CaseStudyFrontmatter>): string[]` (empty array = valid).

- [ ] **Step 1: Write the failing test**

Append to `src/lib/content.test.ts` (and add `getCaseStudies, validateCaseStudyFrontmatter, RESULT_PLACEHOLDER` to its import from `./content`):

```ts
const valid = {
  title: 'X',
  slug: 'x',
  summary: 'S',
  tags: [],
  coverImage: '/c.svg',
  date: '2026-01-01',
  year: '2026',
  result: 'Ranked #1 for local search.',
}

describe('validateCaseStudyFrontmatter', () => {
  it('accepts complete frontmatter', () => {
    expect(validateCaseStudyFrontmatter(valid)).toEqual([])
  })

  it('accepts the exact result placeholder', () => {
    expect(validateCaseStudyFrontmatter({ ...valid, result: RESULT_PLACEHOLDER })).toEqual([])
  })

  it('requires year and result', () => {
    const { year, result, ...rest } = valid
    expect(validateCaseStudyFrontmatter(rest)).toEqual(['missing year', 'missing result'])
  })

  it('rejects a non 4-digit year and em dashes in result', () => {
    expect(validateCaseStudyFrontmatter({ ...valid, year: '26', result: 'Fast — cheap' })).toEqual([
      'year must be a 4-digit string',
      'result contains an em dash',
    ])
  })
})

describe('case study content', () => {
  it.each(getCaseStudies().map((cs) => [cs.slug, cs.frontmatter] as const))('%s has valid frontmatter', (_slug, fm) => {
    expect(validateCaseStudyFrontmatter(fm)).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/content.test.ts`
Expected: FAIL, `validateCaseStudyFrontmatter` is not exported.

- [ ] **Step 3: Implement**

`src/types/content.ts`: add to `CaseStudyFrontmatter`:

```ts
  /** 4-digit year shown in the case study hero. */
  year: string
  /** One real sentence: the headline outcome. Exactly RESULT_PLACEHOLDER until supplied. */
  result: string
  /** Client name; defaults to title. */
  client?: string
  /** Raster social image (1200x630), e.g. /images/case-studies/<slug>/og.png */
  ogImage?: string
```

`src/lib/content.ts`: add (import `CaseStudyFrontmatter` from `../types/content`):

```ts
/** The only non-factual `result` allowed; replace with a real outcome before launch. */
export const RESULT_PLACEHOLDER = 'Result pending: headline outcome to be supplied'

const REQUIRED_FIELDS = ['title', 'slug', 'summary', 'coverImage', 'date', 'year', 'result'] as const

export function validateCaseStudyFrontmatter(fm: Partial<CaseStudyFrontmatter>): string[] {
  const errors: string[] = []
  for (const key of REQUIRED_FIELDS) {
    const value = fm[key]
    if (typeof value !== 'string' || value.trim() === '') errors.push(`missing ${key}`)
  }
  if (fm.year && !/^\d{4}$/.test(fm.year)) errors.push('year must be a 4-digit string')
  if (fm.result && fm.result.includes('—')) errors.push('result contains an em dash')
  return errors
}
```

Frontmatter additions (add after `date`, keep everything else):

- `vamp-network.mdx`: `year: "2026"` and `result: "Result pending: headline outcome to be supplied"`
- `the-booking-flow.mdx`: `year: "2026"` and `result: "Result pending: headline outcome to be supplied"`
- `aiwi-waffles.mdx`: `year: "2025"` and `result: "Ranked #1 on Google for multiple local keywords, driving tourist foot traffic into the store."`

In the two placeholder files, add directly under the closing `---`:

```mdx
{/* TODO: replace `result` with a real one-sentence headline outcome supplied by Mat. */}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run src/lib/content.test.ts && npm run typecheck`
Expected: PASS (3 content cases, 4 validator cases).

- [ ] **Step 5: Commit**

```bash
git add src/types/content.ts src/lib/content.ts src/lib/content.test.ts src/content/case-studies
git commit -m "feat: case study year/result frontmatter with validation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Chapters, chapter rail, width system

**Files:**
- Create in `src/components/mdx/case-study/`: `width.ts`, `width.test.ts`, `chapters.ts`, `chapters.test.ts`, `ChapterContext.tsx`, `Chapter.tsx`, `ChapterNav.tsx`, `Chapter.test.tsx`
- Modify: `src/styles/globals.css` (case study section)

**Interfaces:**
- Consumes: `RevealText` (Task 5), `useReducedMotion`, `ScrollTrigger`/`useGSAP` from `src/lib/gsap.ts`.
- Produces:
  - `type ModuleWidth = 'column' | 'wide' | 'full'`, `widthClass(w: ModuleWidth): string`
  - `slugifyChapter(title: string): string`, `uniqueSlug(base: string, taken: ReadonlySet<string>): string`, `activeChapter(tops: number[], scrollY: number, viewportH: number): number` (-1 before the first chapter)
  - `ChapterProvider`, `useChapters(): ChapterEntry[]`, `useChapterRegistry(): ChapterRegistry | null`, `ChapterEntry = { id: string; title: string; el: HTMLElement }`
  - `<Chapter title id?>` renders `<section class="chapter cs-grid" id>` with a `RevealText` `h2`
  - `<ChapterNav articleRef />`: the `xl+` rail (`nav[aria-label="Case study chapters"]`) plus the below-`xl` progress bar. Renders nothing with zero chapters.
  - CSS classes: `cs-grid`, `cs-wide`, `cs-full`, `cs-layer`

- [ ] **Step 1: Write the failing tests**

`width.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { widthClass } from './width'

describe('widthClass', () => {
  it('maps widths to grid classes', () => {
    expect(widthClass('column')).toBe('')
    expect(widthClass('wide')).toBe('cs-wide')
    expect(widthClass('full')).toBe('cs-full')
  })
})
```

`chapters.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { slugifyChapter, uniqueSlug, activeChapter } from './chapters'

describe('slugifyChapter', () => {
  it.each([
    ['The challenge', 'the-challenge'],
    ["'Aiwi Waffles", 'aiwi-waffles'],
    ['UX/UI Engineering & SEO', 'ux-ui-engineering-and-seo'],
    ['Café outcome', 'cafe-outcome'],
    ['!!!', 'chapter'],
  ])('%s -> %s', (title, slug) => {
    expect(slugifyChapter(title)).toBe(slug)
  })
})

describe('uniqueSlug', () => {
  it('suffixes duplicates', () => {
    expect(uniqueSlug('overview', new Set())).toBe('overview')
    expect(uniqueSlug('overview', new Set(['overview']))).toBe('overview-2')
    expect(uniqueSlug('overview', new Set(['overview', 'overview-2']))).toBe('overview-3')
  })
})

describe('activeChapter', () => {
  const tops = [1000, 2000, 3000]
  it('is -1 before the first chapter', () => {
    expect(activeChapter(tops, 0, 1000)).toBe(-1)
  })
  it('activates a chapter once its top passes 35% of the viewport', () => {
    expect(activeChapter(tops, 650, 1000)).toBe(0)
    expect(activeChapter(tops, 1700, 1000)).toBe(1)
    expect(activeChapter(tops, 9000, 1000)).toBe(2)
  })
  it('handles no chapters', () => {
    expect(activeChapter([], 500, 1000)).toBe(-1)
  })
})
```

`Chapter.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import { ChapterProvider } from './ChapterContext'
import { Chapter } from './Chapter'
import { ChapterNav } from './ChapterNav'

function Article({ titles }: { titles: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <ChapterProvider>
      <div ref={ref}>
        <ChapterNav articleRef={ref} />
        {titles.map((t, i) => (
          <Chapter key={i} title={t}>
            <p>body {i}</p>
          </Chapter>
        ))}
      </div>
    </ChapterProvider>
  )
}

describe('Chapter + ChapterNav', () => {
  it('renders keyword h2s and a rail link per chapter', () => {
    render(<Article titles={['The challenge', 'The approach']} />)
    expect(screen.getByRole('heading', { level: 2, name: 'The challenge' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Case study chapters' })
    expect(nav.querySelectorAll('a')).toHaveLength(2)
    expect(nav.querySelector('a')).toHaveAttribute('href', '#the-challenge')
  })

  it('gives duplicate titles distinct anchors', () => {
    const { container } = render(<Article titles={['Overview', 'Overview']} />)
    const ids = [...container.querySelectorAll('section.chapter')].map((s) => s.id)
    expect(ids).toEqual(['overview', 'overview-2'])
    const hrefs = [...screen.getByRole('navigation', { name: 'Case study chapters' }).querySelectorAll('a')].map((a) =>
      a.getAttribute('href')
    )
    expect(hrefs).toEqual(['#overview', '#overview-2'])
  })

  it('renders no rail without chapters', () => {
    render(<Article titles={[]} />)
    expect(screen.queryByRole('navigation', { name: 'Case study chapters' })).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/mdx/case-study`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement pure modules**

`width.ts`:

```ts
export type ModuleWidth = 'column' | 'wide' | 'full'

const WIDTH_CLASS: Record<ModuleWidth, string> = { column: '', wide: 'cs-wide', full: 'cs-full' }

/** Grid-column class for a case study module (see .cs-grid in globals.css). */
export function widthClass(width: ModuleWidth): string {
  return WIDTH_CLASS[width]
}
```

`chapters.ts`:

```ts
export function slugifyChapter(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'chapter'
}

export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

/** Index of the chapter whose top has passed 35% down the viewport; -1 before the first. */
export function activeChapter(tops: number[], scrollY: number, viewportH: number): number {
  const line = scrollY + viewportH * 0.35
  let active = -1
  tops.forEach((top, i) => {
    if (top <= line) active = i
  })
  return active
}
```

- [ ] **Step 4: Implement context, Chapter, ChapterNav**

`ChapterContext.tsx`:

```tsx
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { uniqueSlug } from './chapters'

export interface ChapterEntry {
  id: string
  title: string
  el: HTMLElement
}

export interface ChapterRegistry {
  /** Registers a chapter and returns its unique id (dedupes repeated titles). */
  register(base: string, title: string, el: HTMLElement): string
  unregister(id: string): void
}

// Split contexts: the registry is stable, so registering never re-runs Chapter effects.
const RegistryContext = createContext<ChapterRegistry | null>(null)
const ChaptersContext = createContext<ChapterEntry[]>([])

function byDocumentOrder(a: ChapterEntry, b: ChapterEntry) {
  return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
}

export function ChapterProvider({ children }: { children: ReactNode }) {
  const [chapters, setChapters] = useState<ChapterEntry[]>([])
  const taken = useRef(new Set<string>())

  const register = useCallback((base: string, title: string, el: HTMLElement) => {
    const id = uniqueSlug(base, taken.current)
    taken.current.add(id)
    setChapters((prev) => [...prev, { id, title, el }].sort(byDocumentOrder))
    return id
  }, [])

  const unregister = useCallback((id: string) => {
    taken.current.delete(id)
    setChapters((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const registry = useMemo(() => ({ register, unregister }), [register, unregister])

  return (
    <RegistryContext.Provider value={registry}>
      <ChaptersContext.Provider value={chapters}>{children}</ChaptersContext.Provider>
    </RegistryContext.Provider>
  )
}

export const useChapterRegistry = () => useContext(RegistryContext)
export const useChapters = () => useContext(ChaptersContext)
```

`Chapter.tsx`:

```tsx
import { useEffect, useRef, type ReactNode } from 'react'
import { RevealText } from '../../interaction/RevealText'
import { useChapterRegistry } from './ChapterContext'
import { slugifyChapter } from './chapters'

interface ChapterProps {
  title: string
  /** Override the anchor id (defaults to a slug of the title). */
  id?: string
  children: ReactNode
}

/**
 * A case study chapter: keyword h2 + content on the case study grid. The id is
 * rendered from the title (so prerendered anchors work) and corrected after
 * registration if another chapter already took it.
 */
export function Chapter({ title, id, children }: ChapterProps) {
  const base = id ?? slugifyChapter(title)
  const ref = useRef<HTMLElement>(null)
  const registry = useChapterRegistry()

  useEffect(() => {
    const el = ref.current
    if (!el || !registry) return
    const assigned = registry.register(base, title, el)
    el.id = assigned
    return () => registry.unregister(assigned)
  }, [base, title, registry])

  return (
    <section ref={ref} id={base} className="chapter cs-grid scroll-mt-28">
      <RevealText as="h2" text={title} />
      {children}
    </section>
  )
}
```

`ChapterNav.tsx`:

```tsx
import { useRef, useState, type RefObject, type MouseEvent } from 'react'
import { ScrollTrigger, useGSAP } from '../../../lib/gsap'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useChapters } from './ChapterContext'
import { activeChapter } from './chapters'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Chapter progress UI. xl+: sticky rail in the left gutter (numbers, titles,
 * vermilion progress line). Below xl: thin fixed progress bar under the navbar
 * with the current chapter name. Scroll state comes from one ScrollTrigger.
 */
export function ChapterNav({ articleRef }: { articleRef: RefObject<HTMLElement> }) {
  const chapters = useChapters()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(-1)
  const railFill = useRef<HTMLSpanElement>(null)
  const barFill = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const article = articleRef.current
      if (!article || chapters.length === 0) return
      const update = (progress: number) => {
        const pct = `${Math.round(progress * 1000) / 10}%`
        if (railFill.current) railFill.current.style.height = pct
        if (barFill.current) barFill.current.style.width = pct
        const tops = chapters.map((c) => c.el.getBoundingClientRect().top + window.scrollY)
        setActive(activeChapter(tops, window.scrollY, window.innerHeight))
      }
      ScrollTrigger.create({
        trigger: article,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      })
    },
    { dependencies: [chapters] }
  )

  if (chapters.length === 0) return null

  const jump = (e: MouseEvent<HTMLAnchorElement>, el: HTMLElement, id: string) => {
    e.preventDefault()
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <>
      <nav aria-label="Case study chapters" className="absolute inset-y-0 left-8 hidden w-40 xl:block">
        <div className="sticky top-32">
          <div className="relative pl-5">
            <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-border-line" />
            <span ref={railFill} aria-hidden="true" className="absolute left-0 top-0 w-px bg-vermilion" style={{ height: '0%' }} />
            <ol className="space-y-4">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    onClick={(e) => jump(e, c.el, c.id)}
                    aria-current={i === active ? 'location' : undefined}
                    className={`group flex gap-3 text-xs leading-snug transition-colors duration-200 ${
                      i === active ? 'text-cream' : 'text-muted-prose hover:text-cream'
                    }`}
                  >
                    <span className={`font-mono ${i === active ? 'text-vermilion' : ''}`}>{pad(i + 1)}</span>
                    <span>{c.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </nav>

      <div aria-hidden="true" className={`fixed inset-x-0 top-16 z-[55] xl:hidden ${active < 0 ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <div className="flex h-8 items-center gap-3 border-b border-border-line bg-directors-black/90 px-6 text-[0.7rem] uppercase tracking-[0.15em] text-muted-prose backdrop-blur">
          <span className="font-mono text-vermilion">{pad(Math.max(active, 0) + 1)}</span>
          <span className="truncate text-cream">{chapters[Math.max(active, 0)]?.title}</span>
        </div>
        <span ref={barFill} className="block h-px bg-vermilion" style={{ width: '0%' }} />
      </div>
    </>
  )
}
```

- [ ] **Step 5: Add the width system and chapter CSS**

In `src/styles/globals.css`, replace the rules `.case-study-prose h2 { counter-increment... margin-top: 4rem; }` and `.case-study-prose h2:first-child { margin-top: 0; }` with the block below (keep `.case-study-prose { counter-reset }`, the `h2::before` counter rule, and the blockquote rules):

```css
.case-study-prose h2 {
  counter-increment: cs-section;
  margin-top: 0;
}

/* Case study width system: prose sits in `content`; modules opt into `wide`
   or `full` (see src/components/mdx/case-study/width.ts). Chapters span the
   full grid and redefine it, so their children use the same columns. */
.cs-grid {
  --cs-content: 680px;
  --cs-wide: 64rem;
  display: grid;
  grid-template-columns:
    [full-start] minmax(1.5rem, 1fr)
    [wide-start] minmax(0, calc((var(--cs-wide) - var(--cs-content)) / 2))
    [content-start] min(var(--cs-content), 100% - 3rem) [content-end]
    minmax(0, calc((var(--cs-wide) - var(--cs-content)) / 2)) [wide-end]
    minmax(1.5rem, 1fr) [full-end];
}
.cs-grid > * { grid-column: content; }
.cs-grid > .cs-wide { grid-column: wide; }
.cs-grid > .cs-full,
.cs-grid > .chapter { grid-column: full; }

.case-study-prose .chapter + .chapter { margin-top: 7rem; }

/* The content layer sits above the chapter rail (so wide modules cover it
   while passing) but lets clicks through its empty gutters to the rail. */
.cs-layer,
.cs-layer .chapter { pointer-events: none; }
.cs-layer > :not(.chapter),
.cs-layer .chapter > * { pointer-events: auto; }
```

- [ ] **Step 6: Run tests and typecheck**

Run: `npx vitest run src/components/mdx/case-study && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/mdx/case-study src/styles/globals.css
git commit -m "feat: case study chapters, progress rail, and width system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: CaptureMedia, DeviceFrame, Hotspot

**Files:**
- Create in `src/components/mdx/case-study/`: `CaptureMedia.tsx`, `DeviceFrame.tsx`, `Hotspot.tsx`, `CaptureMedia.test.tsx`

**Interfaces:**
- Consumes: `useReducedMotion`, `useInView` from `motion/react`.
- Produces:
  - `<CaptureMedia src? video? videoWebm? poster? alt aspect active? />`: image or muted looping video. Video plays only while `active` and in view (never autoplays under reduced motion; shows native controls instead). Missing or failed media renders a `role="img"` placeholder labeled `"<alt> (capture coming soon)"` with the same `aspect-ratio`.
  - `type FrameKind = 'browser' | 'phone'`, `FRAME_ASPECT: Record<FrameKind, string>` (`'16 / 10'`, `'9 / 19.5'`), `<DeviceFrame kind? url? children />`
  - `<Hotspot x y label />` (x/y are percentages)

- [ ] **Step 1: Write the failing test**

`CaptureMedia.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CaptureMedia } from './CaptureMedia'
import { DeviceFrame } from './DeviceFrame'

describe('CaptureMedia', () => {
  it('renders the image with alt text', () => {
    render(<CaptureMedia src="/a.webp" alt="Dashboard" aspect="16 / 10" />)
    expect(screen.getByRole('img', { name: 'Dashboard' })).toHaveAttribute('src', '/a.webp')
  })

  it('shows a same-aspect placeholder when there is no media', () => {
    render(<CaptureMedia alt="Dashboard" aspect="16 / 10" />)
    const ph = screen.getByRole('img', { name: 'Dashboard (capture coming soon)' })
    expect(ph).toHaveStyle({ aspectRatio: '16 / 10' })
  })

  it('swaps to the placeholder when the image fails', () => {
    render(<CaptureMedia src="/missing.webp" alt="Dashboard" aspect="16 / 10" />)
    fireEvent.error(screen.getByRole('img', { name: 'Dashboard' }))
    expect(screen.getByRole('img', { name: 'Dashboard (capture coming soon)' })).toBeInTheDocument()
  })

  it('swaps to the placeholder when the video source fails', () => {
    const { container } = render(<CaptureMedia video="/missing.mp4" alt="Flow" aspect="16 / 10" />)
    fireEvent.error(container.querySelector('source:last-of-type')!)
    expect(screen.getByRole('img', { name: 'Flow (capture coming soon)' })).toBeInTheDocument()
  })
})

describe('DeviceFrame', () => {
  it('shows the URL pill in the browser frame', () => {
    render(<DeviceFrame url="vampnetwork.com"><div /></DeviceFrame>)
    expect(screen.getByText('vampnetwork.com')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/mdx/case-study/CaptureMedia.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`CaptureMedia.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'

interface CaptureMediaProps {
  src?: string
  video?: string
  videoWebm?: string
  poster?: string
  alt: string
  aspect: string
  /** Walkthrough passes false for inactive steps so their video pauses. */
  active?: boolean
}

/** A product capture (image or muted loop) with a layout-stable fallback. */
export function CaptureMedia({ src, video, videoWebm, poster, alt, aspect, active = true }: CaptureMediaProps) {
  const [failed, setFailed] = useState(false)
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inView = useInView(wrapRef, { amount: 0.4 })

  useEffect(() => {
    const v = videoRef.current
    if (!v || reduced) return
    if (active && inView) Promise.resolve(v.play?.()).catch(() => {})
    else v.pause?.()
  }, [active, inView, reduced])

  const media = 'block h-full w-full object-cover object-top'

  let content
  if (failed || (!src && !video)) {
    content = (
      <div
        role="img"
        aria-label={`${alt} (capture coming soon)`}
        className="flex h-full w-full items-center justify-center bg-secondary-dark text-xs uppercase tracking-[0.2em] text-muted-prose"
        style={{ aspectRatio: aspect }}
      >
        Capture coming soon
      </div>
    )
  } else if (video) {
    content = (
      <video
        ref={videoRef}
        className={media}
        style={{ aspectRatio: aspect }}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        controls={reduced}
        aria-label={alt}
      >
        {videoWebm && <source src={videoWebm} type="video/webm" />}
        <source src={video} type="video/mp4" onError={() => setFailed(true)} />
      </video>
    )
  } else {
    content = (
      <img
        src={src}
        alt={alt}
        className={media}
        style={{ aspectRatio: aspect }}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div ref={wrapRef} className="h-full w-full">
      {content}
    </div>
  )
}
```

`DeviceFrame.tsx`:

```tsx
import type { ReactNode } from 'react'

export type FrameKind = 'browser' | 'phone'

export const FRAME_ASPECT: Record<FrameKind, string> = {
  browser: '16 / 10',
  phone: '9 / 19.5',
}

/** Minimal browser chrome (default) or phone bezel around a capture. */
export function DeviceFrame({ kind = 'browser', url, children }: { kind?: FrameKind; url?: string; children: ReactNode }) {
  if (kind === 'phone') {
    return (
      <div className="mx-auto w-full max-w-[320px] rounded-[2.5rem] border border-border-line bg-secondary-dark p-2.5 shadow-[0_40px_120px_-40px] shadow-vermilion/25">
        <div className="overflow-hidden rounded-[2rem] bg-directors-black">{children}</div>
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border-line bg-secondary-dark shadow-[0_40px_120px_-40px] shadow-vermilion/25">
      <div className="flex items-center gap-3 border-b border-border-line px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-border-line" />
          ))}
        </span>
        {url && <span className="mx-auto rounded-full bg-directors-black px-4 py-1 text-[0.7rem] tracking-wide text-muted-prose">{url}</span>}
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
```

`Hotspot.tsx`:

```tsx
/** Pulsing vermilion marker with a label, positioned in % over a capture. */
export function Hotspot({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <span className="pointer-events-none absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <span className="relative flex h-3 w-3 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vermilion opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-vermilion" />
      </span>
      <span className="absolute left-4 top-0 -translate-y-1/2 whitespace-nowrap bg-directors-black/90 px-2 py-1 text-[0.7rem] text-cream">
        {label}
      </span>
    </span>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/mdx/case-study && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/case-study/CaptureMedia.tsx src/components/mdx/case-study/DeviceFrame.tsx src/components/mdx/case-study/Hotspot.tsx src/components/mdx/case-study/CaptureMedia.test.tsx
git commit -m "feat: capture media with layout-stable fallback, device frames, hotspots

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Walkthrough

**Files:**
- Create in `src/components/mdx/case-study/`: `walkthrough.ts`, `walkthrough.test.ts`, `Walkthrough.tsx`, `Walkthrough.test.tsx`

**Interfaces:**
- Consumes: `CaptureMedia`, `DeviceFrame`, `FRAME_ASPECT`, `FrameKind`, `Hotspot` (Task 9); `widthClass`, `ModuleWidth` (Task 8); `useMediaQuery` (Task 3); `DESKTOP_QUERY`/`REDUCED_QUERY` (test helper).
- Produces: `stepForProgress(progress: number, count: number): number`; `WalkthroughStep`; `<Walkthrough steps frame? url? width? />`. Root carries `data-walkthrough="pinned" | "stacked"`; the active pinned step has `aria-current="step"`.

- [ ] **Step 1: Write the failing tests**

`walkthrough.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { stepForProgress } from './walkthrough'

describe('stepForProgress', () => {
  it('maps progress to evenly sized steps', () => {
    expect(stepForProgress(0, 3)).toBe(0)
    expect(stepForProgress(0.34, 3)).toBe(1)
    expect(stepForProgress(0.5, 2)).toBe(1)
  })
  it('keeps the last step at the end', () => {
    expect(stepForProgress(0.999, 3)).toBe(2)
    expect(stepForProgress(1, 3)).toBe(2)
  })
  it('clamps out-of-range progress', () => {
    expect(stepForProgress(-0.2, 3)).toBe(0)
    expect(stepForProgress(1.5, 3)).toBe(2)
  })
  it('handles one and zero steps', () => {
    expect(stepForProgress(0.7, 1)).toBe(0)
    expect(stepForProgress(0.7, 0)).toBe(-1)
  })
})
```

`Walkthrough.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Walkthrough } from './Walkthrough'
import { installMatchMedia, DESKTOP_QUERY, REDUCED_QUERY } from '../../../test/matchMedia'

const steps = [
  { title: 'Pipeline', body: 'Every lead in one place.', alt: 'Pipeline view' },
  { title: 'Sources', body: 'Where leads come from.', alt: 'Sources view', hotspot: { x: 40, y: 30, label: 'Angi' } },
]

describe('Walkthrough', () => {
  it('stacks steps on mobile', () => {
    const { container } = render(<Walkthrough steps={steps} url="thebookingflow.com" />)
    expect(container.querySelector('[data-walkthrough="stacked"]')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Pipeline' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sources' })).toBeInTheDocument()
  })

  it('pins on desktop with the first step active', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true })
    const { container } = render(<Walkthrough steps={steps} />)
    expect(container.querySelector('[data-walkthrough="pinned"]')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Pipeline' }).closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('stacks on desktop under reduced motion', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true, [REDUCED_QUERY]: true })
    const { container } = render(<Walkthrough steps={steps} />)
    expect(container.querySelector('[data-walkthrough="stacked"]')).not.toBeNull()
  })

  it('renders a single step', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true })
    render(<Walkthrough steps={[steps[0]]} />)
    expect(screen.getByRole('heading', { name: 'Pipeline' })).toBeInTheDocument()
  })

  it('renders nothing with no steps', () => {
    const { container } = render(<Walkthrough steps={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/mdx/case-study/walkthrough.test.ts src/components/mdx/case-study/Walkthrough.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`walkthrough.ts`:

```ts
/** Which of `count` equal scroll segments `progress` (0..1) falls in. -1 with no steps. */
export function stepForProgress(progress: number, count: number): number {
  if (count <= 0) return -1
  const p = Math.min(1, Math.max(0, progress))
  return Math.min(count - 1, Math.floor(p * count))
}
```

`Walkthrough.tsx`:

```tsx
import { useRef, useState } from 'react'
import { ScrollTrigger, useGSAP } from '../../../lib/gsap'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CaptureMedia } from './CaptureMedia'
import { DeviceFrame, FRAME_ASPECT, type FrameKind } from './DeviceFrame'
import { Hotspot } from './Hotspot'
import { widthClass, type ModuleWidth } from './width'
import { stepForProgress } from './walkthrough'

export interface WalkthroughStep {
  title: string
  body: string
  src?: string
  video?: string
  videoWebm?: string
  poster?: string
  alt: string
  hotspot?: { x: number; y: number; label: string }
}

interface WalkthroughProps {
  steps: WalkthroughStep[]
  frame?: FrameKind
  /** Domain shown in the browser frame's URL pill. */
  url?: string
  width?: ModuleWidth
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Scroll-driven product walkthrough. md+ (motion allowed): the device frame
 * sticks while step text scrolls past; each step swaps the capture. Mobile or
 * reduced motion: a static stack of framed steps.
 */
export function Walkthrough({ steps, frame = 'browser', url, width = 'wide' }: WalkthroughProps) {
  const desktop = useMediaQuery('(min-width: 768px)')
  const reduced = useReducedMotion()
  if (steps.length === 0) return null
  const props = { steps, frame, url }
  return (
    <div className={`not-prose my-20 ${widthClass(width)}`}>
      {desktop && !reduced ? <Pinned {...props} /> : <Stacked {...props} />}
    </div>
  )
}

type InnerProps = { steps: WalkthroughStep[]; frame: FrameKind; url?: string }

function StepText({ step, index, total, active }: { step: WalkthroughStep; index: number; total: number; active: boolean }) {
  return (
    <>
      <p className={`font-mono text-xs tracking-[0.2em] ${active ? 'text-vermilion' : 'text-muted-prose'}`}>
        {pad(index + 1)} / {pad(total)}
      </p>
      <h3 className={`mt-3 text-2xl font-semibold tracking-tight transition-colors duration-300 ${active ? 'text-cream' : 'text-muted-prose'}`}>
        {step.title}
      </h3>
      <p className="mt-4 leading-relaxed text-muted-prose">{step.body}</p>
    </>
  )
}

function Screen({ step, frame, active }: { step: WalkthroughStep; frame: FrameKind; active: boolean }) {
  return (
    <>
      <CaptureMedia {...step} aspect={FRAME_ASPECT[frame]} active={active} />
      {step.hotspot && active && <Hotspot {...step.hotspot} />}
    </>
  )
}

function Pinned({ steps, frame, url }: InnerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      if (!ref.current) return
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) => setActive(stepForProgress(self.progress, steps.length)),
      })
    },
    { scope: ref, dependencies: [steps.length] }
  )

  return (
    <div ref={ref} data-walkthrough="pinned" className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-20">
      <ol>
        {steps.map((step, i) => (
          <li key={i} aria-current={i === active ? 'step' : undefined} className="flex min-h-[70vh] flex-col justify-center">
            <StepText step={step} index={i} total={steps.length} active={i === active} />
          </li>
        ))}
      </ol>
      <div>
        <div className="sticky top-[20vh]">
          <DeviceFrame kind={frame} url={url}>
            <div className="relative" style={{ aspectRatio: FRAME_ASPECT[frame] }}>
              {steps.map((step, i) => (
                <div
                  key={i}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Screen step={step} frame={frame} active={i === active} />
                </div>
              ))}
            </div>
          </DeviceFrame>
        </div>
      </div>
    </div>
  )
}

function Stacked({ steps, frame, url }: InnerProps) {
  return (
    <ol data-walkthrough="stacked" className="space-y-16">
      {steps.map((step, i) => (
        <li key={i}>
          <StepText step={step} index={i} total={steps.length} active />
          <div className="mt-6">
            <DeviceFrame kind={frame} url={url}>
              <div className="relative" style={{ aspectRatio: FRAME_ASPECT[frame] }}>
                <Screen step={step} frame={frame} active />
              </div>
            </DeviceFrame>
          </div>
        </li>
      ))}
    </ol>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/mdx/case-study && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/case-study/walkthrough.ts src/components/mdx/case-study/walkthrough.test.ts src/components/mdx/case-study/Walkthrough.tsx src/components/mdx/case-study/Walkthrough.test.tsx
git commit -m "feat: scroll-driven Walkthrough module (browser/phone frames)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Gallery

**Files:**
- Create in `src/components/mdx/case-study/`: `gallery.ts`, `gallery.test.ts`, `Gallery.tsx`, `Gallery.test.tsx`

**Interfaces:**
- Consumes: `CaptureMedia` (Task 9), `widthClass` (Task 8), `SPRING.magnetic` (Task 1), `useReducedMotion`.
- Produces: `nextIndex(current, key, count)`, `clampShift(offsetLeft, trackWidth, viewportWidth)`, `nearestIndex(offsets, shift)`; `<Gallery images width? />` where `GalleryImage = { src?: string; alt: string; caption?: string }`.

- [ ] **Step 1: Write the failing tests**

`gallery.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { nextIndex, clampShift, nearestIndex } from './gallery'

describe('nextIndex', () => {
  it('moves with arrows and clamps at the ends', () => {
    expect(nextIndex(0, 'ArrowRight', 3)).toBe(1)
    expect(nextIndex(2, 'ArrowRight', 3)).toBe(2)
    expect(nextIndex(0, 'ArrowLeft', 3)).toBe(0)
  })
  it('jumps with Home/End and ignores other keys', () => {
    expect(nextIndex(1, 'Home', 3)).toBe(0)
    expect(nextIndex(1, 'End', 3)).toBe(2)
    expect(nextIndex(1, 'a', 3)).toBe(1)
  })
  it('is -1 when empty', () => {
    expect(nextIndex(0, 'ArrowRight', 0)).toBe(-1)
  })
})

describe('clampShift', () => {
  it('never scrolls past the last item', () => {
    expect(clampShift(0, 3000, 1000)).toBe(0)
    expect(clampShift(900, 3000, 1000)).toBe(900)
    expect(clampShift(2500, 3000, 1000)).toBe(2000)
    expect(clampShift(500, 800, 1000)).toBe(0)
  })
})

describe('nearestIndex', () => {
  it('finds the item closest to the shift', () => {
    expect(nearestIndex([0, 800, 1600], 700)).toBe(1)
    expect(nearestIndex([0, 800, 1600], 100)).toBe(0)
    expect(nearestIndex([], 100)).toBe(0)
  })
})
```

`Gallery.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Gallery } from './Gallery'

const images = [
  { src: '/a.webp', alt: 'A', caption: 'First' },
  { src: '/b.webp', alt: 'B', caption: 'Second' },
  { src: '/c.webp', alt: 'C', caption: 'Third' },
]

describe('Gallery', () => {
  it('renders every image with its caption', () => {
    render(<Gallery images={images} />)
    expect(screen.getByRole('img', { name: 'B' })).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('moves with arrow keys and clamps at the end', () => {
    render(<Gallery images={images} />)
    const region = screen.getByRole('region', { name: 'Project gallery' })
    expect(screen.getByText('01 / 03')).toBeInTheDocument()
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(screen.getByText('02 / 03')).toBeInTheDocument()
    fireEvent.keyDown(region, { key: 'End' })
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(screen.getByText('03 / 03')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/mdx/case-study/gallery.test.ts src/components/mdx/case-study/Gallery.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`gallery.ts`:

```ts
export function nextIndex(current: number, key: string, count: number): number {
  if (count <= 0) return -1
  switch (key) {
    case 'ArrowRight':
      return Math.min(count - 1, current + 1)
    case 'ArrowLeft':
      return Math.max(0, current - 1)
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return current
  }
}

/** Positive track shift (px) that brings an item to the left edge without overscrolling. */
export function clampShift(offsetLeft: number, trackWidth: number, viewportWidth: number): number {
  return Math.min(offsetLeft, Math.max(0, trackWidth - viewportWidth))
}

export function nearestIndex(offsets: number[], shift: number): number {
  let best = 0
  offsets.forEach((o, i) => {
    if (Math.abs(o - shift) < Math.abs(offsets[best] - shift)) best = i
  })
  return best
}
```

`Gallery.tsx`:

```tsx
import { useRef, useState, type KeyboardEvent } from 'react'
import { animate, motion, useMotionValue } from 'motion/react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { SPRING } from '../../../lib/motion'
import { CaptureMedia } from './CaptureMedia'
import { widthClass, type ModuleWidth } from './width'
import { nextIndex, clampShift, nearestIndex } from './gallery'

export interface GalleryImage {
  src?: string
  alt: string
  caption?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Draggable horizontal strip of captures, with arrow-key and button navigation. */
export function Gallery({ images, width = 'wide' }: { images: GalleryImage[]; width?: ModuleWidth }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)
  const x = useMotionValue(0)
  const reduced = useReducedMotion()

  if (images.length === 0) return null

  const items = () => [...(trackRef.current?.children ?? [])] as HTMLElement[]

  const goTo = (i: number) => {
    setIndex(i)
    const track = trackRef.current
    const viewport = viewportRef.current
    const item = items()[i]
    if (!track || !viewport || !item) return
    const target = -clampShift(item.offsetLeft, track.scrollWidth, viewport.clientWidth)
    if (reduced) x.set(target)
    else animate(x, target, { type: 'spring', ...SPRING.magnetic })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = nextIndex(index, e.key, images.length)
    if (next === index) return
    e.preventDefault()
    goTo(next)
  }

  const onDragEnd = () => setIndex(nearestIndex(items().map((el) => el.offsetLeft), -x.get()))

  return (
    <div className={`not-prose my-16 ${widthClass(width)}`}>
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Project gallery"
        tabIndex={0}
        onKeyDown={onKeyDown}
        data-cursor="drag"
        className="overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-vermilion"
      >
        <motion.ul
          ref={trackRef}
          drag="x"
          dragConstraints={viewportRef}
          dragElastic={0.08}
          onDragEnd={onDragEnd}
          style={{ x }}
          className="flex cursor-grab gap-6 active:cursor-grabbing"
        >
          {images.map((img, i) => (
            <li key={i} className="w-[80vw] max-w-[56rem] shrink-0">
              <figure>
                <div className="overflow-hidden rounded-lg border border-border-line bg-secondary-dark">
                  <CaptureMedia src={img.src} alt={img.alt} aspect="16 / 10" />
                </div>
                {img.caption && <figcaption className="mt-3 text-sm text-muted-prose">{img.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </motion.ul>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.2em] text-muted-prose">
          {pad(index + 1)} / {pad(images.length)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous image"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            className="border border-border-line px-4 py-2 text-cream transition-colors duration-200 hover:border-vermilion disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next image"
            disabled={index === images.length - 1}
            onClick={() => goTo(index + 1)}
            className="border border-border-line px-4 py-2 text-cream transition-colors duration-200 hover:border-vermilion disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
```

Note: hooks are all called before the early `return null`; keep that order.

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/mdx/case-study && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/case-study/gallery.ts src/components/mdx/case-study/gallery.test.ts src/components/mdx/case-study/Gallery.tsx src/components/mdx/case-study/Gallery.test.tsx
git commit -m "feat: draggable, keyboard-operable Gallery

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: BeforeAfter

**Files:**
- Create in `src/components/mdx/case-study/`: `beforeAfter.ts`, `beforeAfter.test.ts`, `BeforeAfter.tsx`, `BeforeAfter.test.tsx`

**Interfaces:**
- Consumes: `CaptureMedia`, `widthClass`.
- Produces: `stepPosition(pos: number, key: string, step?: number): number`, `positionFromPointer(clientX: number, rect: { left: number; width: number }): number`; `<BeforeAfter before after aspect? width? />` with `before/after: { src?: string; alt: string }`, rendered as `role="slider"`.

- [ ] **Step 1: Write the failing tests**

`beforeAfter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { stepPosition, positionFromPointer } from './beforeAfter'

describe('stepPosition', () => {
  it('steps with arrows and clamps', () => {
    expect(stepPosition(50, 'ArrowRight')).toBe(55)
    expect(stepPosition(50, 'ArrowLeft')).toBe(45)
    expect(stepPosition(98, 'ArrowRight')).toBe(100)
    expect(stepPosition(2, 'ArrowLeft')).toBe(0)
  })
  it('jumps with Home/End and ignores other keys', () => {
    expect(stepPosition(50, 'Home')).toBe(0)
    expect(stepPosition(50, 'End')).toBe(100)
    expect(stepPosition(50, 'x')).toBe(50)
  })
})

describe('positionFromPointer', () => {
  it('maps pointer x to a clamped percentage', () => {
    expect(positionFromPointer(150, { left: 100, width: 200 })).toBe(25)
    expect(positionFromPointer(0, { left: 100, width: 200 })).toBe(0)
    expect(positionFromPointer(999, { left: 100, width: 200 })).toBe(100)
  })
  it('handles a zero-width box', () => {
    expect(positionFromPointer(150, { left: 100, width: 0 })).toBe(50)
  })
})
```

`BeforeAfter.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BeforeAfter } from './BeforeAfter'

describe('BeforeAfter', () => {
  it('is a keyboard-operable slider', () => {
    render(<BeforeAfter before={{ src: '/b.webp', alt: 'Old' }} after={{ src: '/a.webp', alt: 'New' }} />)
    const slider = screen.getByRole('slider', { name: 'Before and after comparison' })
    expect(slider).toHaveAttribute('aria-valuenow', '50')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute('aria-valuenow', '55')
    fireEvent.keyDown(slider, { key: 'End' })
    expect(slider).toHaveAttribute('aria-valuenow', '100')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/mdx/case-study/beforeAfter.test.ts src/components/mdx/case-study/BeforeAfter.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`beforeAfter.ts`:

```ts
const clamp = (v: number) => Math.max(0, Math.min(100, v))

export function stepPosition(pos: number, key: string, step = 5): number {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return clamp(pos + step)
    case 'ArrowLeft':
    case 'ArrowDown':
      return clamp(pos - step)
    case 'Home':
      return 0
    case 'End':
      return 100
    default:
      return pos
  }
}

export function positionFromPointer(clientX: number, rect: { left: number; width: number }): number {
  if (rect.width <= 0) return 50
  return clamp(((clientX - rect.left) / rect.width) * 100)
}
```

`BeforeAfter.tsx`:

```tsx
import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import { CaptureMedia } from './CaptureMedia'
import { widthClass, type ModuleWidth } from './width'
import { stepPosition, positionFromPointer } from './beforeAfter'

interface Shot {
  src?: string
  alt: string
}

interface BeforeAfterProps {
  before: Shot
  after: Shot
  aspect?: string
  width?: ModuleWidth
}

/** Before/after reveal. Mouse follows on hover, touch/pen drags, keyboard steps. */
export function BeforeAfter({ before, after, aspect = '16 / 10', width = 'wide' }: BeforeAfterProps) {
  const [pos, setPos] = useState(50)

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' && e.buttons === 0) return
    setPos(positionFromPointer(e.clientX, e.currentTarget.getBoundingClientRect()))
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = stepPosition(pos, e.key)
    if (next === pos) return
    e.preventDefault()
    setPos(next)
  }

  return (
    <div className={`not-prose my-16 ${widthClass(width)}`}>
      <div
        role="slider"
        aria-label="Before and after comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        data-cursor="drag"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onKeyDown={onKeyDown}
        className="relative touch-pan-y select-none overflow-hidden rounded-lg border border-border-line bg-secondary-dark outline-none focus-visible:ring-2 focus-visible:ring-vermilion"
        style={{ aspectRatio: aspect }}
      >
        <div className="absolute inset-0">
          <CaptureMedia {...after} aspect={aspect} />
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <CaptureMedia {...before} aspect={aspect} />
        </div>
        <div aria-hidden="true" className="absolute inset-y-0 w-px bg-vermilion" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-vermilion text-sm text-cream">
            ⟷
          </span>
        </div>
        <span aria-hidden="true" className="absolute bottom-3 left-3 bg-directors-black/80 px-2 py-1 text-xs uppercase tracking-widest text-cream">
          Before
        </span>
        <span aria-hidden="true" className="absolute bottom-3 right-3 bg-directors-black/80 px-2 py-1 text-xs uppercase tracking-widest text-cream">
          After
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/mdx/case-study && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/case-study/beforeAfter.ts src/components/mdx/case-study/beforeAfter.test.ts src/components/mdx/case-study/BeforeAfter.tsx src/components/mdx/case-study/BeforeAfter.test.tsx
git commit -m "feat: keyboard-operable BeforeAfter slider

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Outcome, PullQuote, and the case study MDX registry

**Files:**
- Create in `src/components/mdx/case-study/`: `Outcome.tsx`, `PullQuote.tsx`, `Outcome.test.tsx`, `index.ts`
- Modify: `src/components/mdx/caseStudyMdx.tsx`

**Interfaces:**
- Consumes: `CountUp` (Task 6), `Magnetic` (Task 4), `RevealText` (Task 5), `Button` (existing), `widthClass`; all module components from Tasks 8 to 12.
- Produces: `<Outcome metrics quote? cite? width? />`, `<PullQuote text cite? />`, `CaseStudyModules` (`Chapter`, `Walkthrough`, `Gallery`, `BeforeAfter`, `Outcome`, `PullQuote`), and an updated `CaseStudyMDXComponents` that spreads `CaseStudyModules` and no longer overrides `h2`.

- [ ] **Step 1: Write the failing test**

`Outcome.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Outcome } from './Outcome'
import { PullQuote } from './PullQuote'
import { CaseStudyMDXComponents } from '../caseStudyMdx'

const metrics = [
  { value: '#1', label: 'Google local ranking' },
  { value: '00', label: 'Keywords ranked #1' },
]

describe('Outcome', () => {
  it('shows metric values and labels, and a contact CTA', () => {
    render(<Outcome metrics={metrics} />, { wrapper: MemoryRouter })
    expect(screen.getAllByText('#1').length).toBeGreaterThan(0)
    expect(screen.getByText('Keywords ranked #1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '/contact')
  })

  it('renders a quote only when one is given', () => {
    const { rerender } = render(<Outcome metrics={metrics} />, { wrapper: MemoryRouter })
    expect(screen.queryByRole('blockquote')).toBeNull()
    rerender(<Outcome metrics={metrics} quote="Great work." cite="Owner" />)
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })
})

describe('PullQuote', () => {
  it('renders the quote text', () => {
    render(<PullQuote text="One brand, cohesive everywhere." />)
    expect(screen.getByText('One brand, cohesive everywhere.', { selector: '.sr-only' })).toBeInTheDocument()
  })
})

describe('CaseStudyMDXComponents', () => {
  it('registers the case study modules', () => {
    for (const name of ['Chapter', 'Walkthrough', 'Gallery', 'BeforeAfter', 'Outcome', 'PullQuote']) {
      expect(CaseStudyMDXComponents).toHaveProperty(name)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/mdx/case-study/Outcome.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`Outcome.tsx`:

```tsx
import { CountUp } from '../../interaction/CountUp'
import { Magnetic } from '../../interaction/Magnetic'
import { Button } from '../../ui/Button'
import { widthClass, type ModuleWidth } from './width'

interface OutcomeProps {
  metrics: { value: string; label: string }[]
  /** Only a real client quote. Omit rather than invent one. */
  quote?: string
  cite?: string
  width?: ModuleWidth
}

/** Closing results block: counted-up metrics, optional real quote, contact CTA. */
export function Outcome({ metrics, quote, cite, width = 'wide' }: OutcomeProps) {
  return (
    <div className={`not-prose my-16 ${widthClass(width)}`}>
      <dl className="grid grid-cols-1 gap-px border border-border-line bg-border-line sm:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col bg-secondary-dark p-8 lg:p-10">
            <span aria-hidden="true" className="mb-5 block h-0.5 w-8 bg-vermilion" />
            <dt className="order-2 mt-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">{m.label}</dt>
            <dd className="order-1 font-bold leading-none tracking-tight text-cream" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', letterSpacing: '-0.03em' }}>
              <CountUp value={m.value} />
            </dd>
          </div>
        ))}
      </dl>

      {quote && (
        <figure className="mt-16 max-w-3xl">
          <blockquote className="text-2xl font-medium leading-snug text-cream">&ldquo;{quote}&rdquo;</blockquote>
          {cite && <figcaption className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-prose">{cite}</figcaption>}
        </figure>
      )}

      <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-border-line pt-10 sm:flex-row sm:items-center">
        <p className="text-2xl font-semibold tracking-tight text-cream">Have a project like this in mind?</p>
        <Magnetic>
          <Button href="/contact">Start a project</Button>
        </Magnetic>
      </div>
    </div>
  )
}
```

`PullQuote.tsx`:

```tsx
import { RevealText } from '../../interaction/RevealText'
import { widthClass, type ModuleWidth } from './width'

/** Large display quote with a word reveal. `cite` only for real attributions. */
export function PullQuote({ text, cite, width = 'column' }: { text: string; cite?: string; width?: ModuleWidth }) {
  return (
    <figure className={`not-prose my-20 ${widthClass(width)}`}>
      <span aria-hidden="true" className="mb-8 block h-px w-12 bg-vermilion" />
      <RevealText
        as="blockquote"
        text={text}
        className="font-semibold leading-tight tracking-tight text-cream"
        style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}
      />
      {cite && <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-prose">{cite}</figcaption>}
    </figure>
  )
}
```

`index.ts`:

```ts
import { Chapter } from './Chapter'
import { Walkthrough } from './Walkthrough'
import { Gallery } from './Gallery'
import { BeforeAfter } from './BeforeAfter'
import { Outcome } from './Outcome'
import { PullQuote } from './PullQuote'

/** MDX components available inside case study files. */
export const CaseStudyModules = { Chapter, Walkthrough, Gallery, BeforeAfter, Outcome, PullQuote }

export { ChapterProvider } from './ChapterContext'
export { ChapterNav } from './ChapterNav'
```

`src/components/mdx/caseStudyMdx.tsx`: add `import { CaseStudyModules } from './case-study'` and change the export to:

```ts
export const CaseStudyMDXComponents = {
  ...MDXComponents,
  ...CaseStudyModules,
  // h2s come from <Chapter>; a stray markdown `##` renders as a plain h2.
  h3: reveal('h3'),
  p: reveal('p'),
  ul: reveal('ul'),
  ol: reveal('ol'),
  blockquote: reveal('blockquote'),
}
```

Also change the `reveal` tag union to `'h3' | 'p' | 'ul' | 'ol' | 'blockquote'`.

- [ ] **Step 4: Run tests**

Run: `npm run test:run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/case-study/Outcome.tsx src/components/mdx/case-study/PullQuote.tsx src/components/mdx/case-study/Outcome.test.tsx src/components/mdx/case-study/index.ts src/components/mdx/caseStudyMdx.tsx
git commit -m "feat: Outcome + PullQuote modules and case study MDX registry

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Next project band

**Files:**
- Create: `src/components/work/NextProject.tsx`, `src/components/work/NextProject.test.tsx`

**Interfaces:**
- Consumes: `CaseStudy` type, `getCoverComponent(slug)`, `gsap`/`useGSAP` from `src/lib/gsap.ts`.
- Produces: `<NextProject caseStudy: CaseStudy />`: a single link to `/work/<slug>` with `data-cursor="view"`; its media opens from an inset card to full-bleed via scrubbed `clip-path` (motion allowed only).

- [ ] **Step 1: Write the failing test**

`NextProject.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NextProject } from './NextProject'
import type { CaseStudy } from '../../types/content'

const cs: CaseStudy = {
  slug: 'no-cover',
  Component: () => null,
  frontmatter: {
    title: 'Next Thing',
    slug: 'no-cover',
    summary: 's',
    tags: [],
    coverImage: '/images/x.svg',
    date: '2026-01-01',
    year: '2026',
    result: 'A real result.',
  },
}

describe('NextProject', () => {
  it('links to the next case study with its title and result', () => {
    render(<NextProject caseStudy={cs} />, { wrapper: MemoryRouter })
    const link = screen.getByRole('link', { name: /Next Thing/ })
    expect(link).toHaveAttribute('href', '/work/no-cover')
    expect(link).toHaveAttribute('data-cursor', 'view')
    expect(screen.getByText('A real result.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Next Thing' })).toHaveAttribute('src', '/images/x.svg')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/work/NextProject.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`NextProject.tsx`:

```tsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, useGSAP } from '../../lib/gsap'
import { getCoverComponent } from './covers'
import type { CaseStudy } from '../../types/content'

/**
 * End-of-article band for the next case study. Its cover opens from an inset
 * card to full-bleed as it scrolls in (scrubbed clip-path, no transform, so no
 * dark-surface GPU artifact). Clicking navigates through the normal curtain.
 */
export function NextProject({ caseStudy }: { caseStudy: CaseStudy }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const { frontmatter: fm, slug } = caseStudy
  const Cover = getCoverComponent(slug)

  useGSAP(
    () => {
      const link = ref.current
      const media = link?.querySelector('[data-next-media]')
      if (!link || !media) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          media,
          { clipPath: 'inset(10% 8% 10% 8% round 12px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            ease: 'none',
            scrollTrigger: { trigger: link, start: 'top bottom', end: 'center center', scrub: true },
          }
        )
      })
    },
    { scope: ref }
  )

  return (
    <Link ref={ref} to={`/work/${slug}`} data-cursor="view" className="group block border-t border-border-line pt-16">
      <div className="mx-auto mb-10 flex max-w-6xl items-end justify-between gap-6 px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Next project</p>
          <h2
            className="mt-4 font-bold leading-none text-cream transition-colors duration-200 group-hover:text-vermilion"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}
          >
            {fm.title}
          </h2>
          <p className="mt-4 max-w-xl text-muted-prose">{fm.result}</p>
        </div>
        <span aria-hidden="true" className="text-4xl text-vermilion transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </div>
      <div data-next-media className="aspect-video max-h-[90svh] w-full overflow-hidden bg-secondary-dark">
        {Cover ? (
          <Cover />
        ) : (
          <img src={fm.coverImage} alt={fm.title} className="h-full w-full object-cover" loading="lazy" width={1600} height={900} />
        )}
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/work && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/NextProject.tsx src/components/work/NextProject.test.tsx
git commit -m "feat: next-project band with scrubbed clip-path reveal

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Hero, layout, and WorkDetail

**Files:**
- Create: `src/components/work/CaseStudyHero.tsx`, `src/pages/WorkDetail.test.tsx`
- Modify: `src/layouts/CaseStudyLayout.tsx`, `src/pages/WorkDetail.tsx`

**Interfaces:**
- Consumes: `RevealText`, `Magnetic`, `Tag`, `Button`, `ChapterProvider`, `ChapterNav`, `NextProject`, `CaseStudyMDXComponents`, `getCaseStudyBySlug`, `getNextCaseStudy`, `getCoverComponent`.
- Produces: `<CaseStudyHero frontmatter cover />`; `<CaseStudyLayout hero after? children />` (wraps everything in `ChapterProvider`, renders `ChapterNav`, and puts MDX in `.case-study-prose prose prose-lg max-w-none cs-grid cs-layer relative z-10`). `WorkDetail` keys the layout by slug so chapter state resets between case studies.

- [ ] **Step 1: Write the failing test**

`src/pages/WorkDetail.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { WorkDetail } from './WorkDetail'

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/work/:slug" element={<WorkDetail />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('WorkDetail', () => {
  it('shows the 10-second read in the hero', () => {
    renderAt('/work/aiwi-waffles')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Brand Identity & Shopify UX/UI Design for a Food & Beverage Brand' })
    ).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(screen.getByText(/Ranked #1 on Google for multiple local keywords/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visit live site/ })).toHaveAttribute('href', 'https://aiwiwaffles.com')
  })

  it('ends with the next project band', () => {
    renderAt('/work/aiwi-waffles')
    expect(screen.getByText('Next project')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/WorkDetail.test.tsx`
Expected: FAIL: the year `2025` and the result are not rendered by the current page (it shows `date` and has no result).

- [ ] **Step 3: Implement the hero**

`src/components/work/CaseStudyHero.tsx`:

```tsx
import type { ReactNode } from 'react'
import { RevealText } from '../interaction/RevealText'
import { Magnetic } from '../interaction/Magnetic'
import { Tag } from '../ui/Tag'
import { Button } from '../ui/Button'
import type { CaseStudyFrontmatter } from '../../types/content'

function Glance({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <dt className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">{label}</dt>
      <dd className="text-sm leading-relaxed text-cream">{value}</dd>
    </div>
  )
}

/**
 * The 10-second read: keyword headline, summary, and the at-a-glance strip
 * (client, role, year, result) above the fold, then the full-bleed cover.
 */
export function CaseStudyHero({ frontmatter: fm, cover }: { frontmatter: CaseStudyFrontmatter; cover?: ReactNode }) {
  const meta = [...(fm.services ?? []), ...(fm.stack ?? [])]
  return (
    <header>
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-16 md:pt-24">
        <div className="mb-8 flex flex-wrap gap-2">
          {fm.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
        <RevealText
          as="h1"
          text={fm.headline || fm.title}
          className="max-w-5xl font-bold leading-[1.05] text-cream"
          style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)', letterSpacing: '-0.03em' }}
        />
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-prose">{fm.summary}</p>

        <dl className="mt-12 grid grid-cols-2 gap-8 border-y border-border-line py-8 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,2fr)]">
          <Glance label="Client" value={fm.client ?? fm.title} />
          <Glance label="Role" value={fm.role} />
          <Glance label="Year" value={fm.year} />
          <div className="col-span-2 md:col-span-1">
            <dt className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Result</dt>
            <dd className="text-lg font-semibold leading-snug text-cream">{fm.result}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
          {meta.length > 0 && <p className="text-xs uppercase tracking-[0.15em] text-muted-prose">{meta.join(' · ')}</p>}
          {fm.liveUrl && (
            <div data-cursor="visit">
              <Magnetic>
                <Button href={fm.liveUrl} external>
                  Visit live site <span aria-hidden="true">↗</span>
                </Button>
              </Magnetic>
            </div>
          )}
        </div>
      </div>
      {cover && <div className="aspect-video max-h-[85svh] w-full overflow-hidden bg-secondary-dark">{cover}</div>}
    </header>
  )
}
```

- [ ] **Step 4: Implement layout and page**

`src/layouts/CaseStudyLayout.tsx` (full file):

```tsx
import { useRef, type ReactNode } from 'react'
import { ChapterProvider, ChapterNav } from '../components/mdx/case-study'

interface CaseStudyLayoutProps {
  hero: ReactNode
  children: ReactNode
  /** Rendered after the article body (the next-project band). */
  after?: ReactNode
}

export function CaseStudyLayout({ hero, children, after }: CaseStudyLayoutProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  return (
    <ChapterProvider>
      <article>
        {hero}
        <div ref={bodyRef} className="relative pb-24 pt-20">
          <ChapterNav articleRef={bodyRef} />
          <div className="case-study-prose prose prose-lg cs-grid cs-layer relative z-10 max-w-none">{children}</div>
        </div>
        {after}
      </article>
    </ChapterProvider>
  )
}
```

`src/pages/WorkDetail.tsx` (full file):

```tsx
import { useParams, Navigate } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { CaseStudyLayout } from '../layouts/CaseStudyLayout'
import { CaseStudyHero } from '../components/work/CaseStudyHero'
import { NextProject } from '../components/work/NextProject'
import { CaseStudyMDXComponents } from '../components/mdx/caseStudyMdx'
import { getCaseStudyBySlug, getNextCaseStudy } from '../lib/content'
import { getCoverComponent } from '../components/work/covers'

export function WorkDetail() {
  const { slug } = useParams<{ slug: string }>()
  const cs = getCaseStudyBySlug(slug!)

  if (!cs) return <Navigate to="/work" replace />

  const { frontmatter, Component } = cs
  const next = getNextCaseStudy(slug!)
  const Cover = getCoverComponent(slug!)
  const cover = Cover ? (
    <Cover />
  ) : frontmatter.coverImage ? (
    <img src={frontmatter.coverImage} alt={frontmatter.title} className="h-full w-full object-cover" width={1600} height={900} />
  ) : undefined

  return (
    <PageTransition>
      <SEO
        title={frontmatter.title}
        description={frontmatter.summary}
        ogImage={frontmatter.ogImage ?? frontmatter.coverImage}
        type="article"
      />
      <CaseStudyLayout
        key={slug}
        hero={<CaseStudyHero frontmatter={frontmatter} cover={cover} />}
        after={next && <NextProject caseStudy={next} />}
      >
        <MDXProvider components={CaseStudyMDXComponents}>
          <Component />
        </MDXProvider>
      </CaseStudyLayout>
    </PageTransition>
  )
}
```

- [ ] **Step 5: Run tests**

Run: `npm run test:run && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/work/CaseStudyHero.tsx src/pages/WorkDetail.tsx src/pages/WorkDetail.test.tsx src/layouts/CaseStudyLayout.tsx
git commit -m "feat: case study hero with at-a-glance strip, chapter layout, next band

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Migrate the three case studies

**Files:**
- Modify: `src/content/case-studies/vamp-network.mdx`, `the-booking-flow.mdx`, `aiwi-waffles.mdx` (body only; frontmatter was done in Task 7)
- Modify: `src/pages/WorkDetail.test.tsx` (add a test)

**Interfaces:**
- Consumes: MDX components `Chapter`, `Walkthrough`, `Gallery`, `Outcome`, `PullQuote`.

MDX rule: markdown inside a JSX block needs a blank line after the opening tag and before the closing tag.

- [ ] **Step 1: Write the failing test**

Append to `src/pages/WorkDetail.test.tsx`:

```tsx
describe('migrated case studies', () => {
  it.each(['vamp-network', 'the-booking-flow', 'aiwi-waffles'])('%s is built from chapters with an outcome', (slug) => {
    const { container } = renderAt(`/work/${slug}`)
    expect(container.querySelectorAll('section.chapter').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByRole('link', { name: 'Start a project' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/WorkDetail.test.tsx`
Expected: FAIL, 0 `section.chapter` elements (the files still use `##`).

- [ ] **Step 3: Rewrite `vamp-network.mdx` body**

Keep the frontmatter and the result TODO comment from Task 7. Replace everything below them with:

```mdx
<Chapter title="Overview">

I serve as Creative Director for Vamp Network, a platform connecting creators, managers, and brands. The role spans UX/UI engineering, graphic design, SEO/AEO, and partnering directly with the CEO to build internal AI agentic flows that help the business scale.

Rather than stitching together off-the-shelf tools, I custom built the product end to end: a public-facing site and a backend dashboard that operations runs on every day.

<PullQuote text="A platform built around how the business actually operates: creators, managers, brands, and campaign data in one place." />

</Chapter>

<Chapter title="The challenge">

Vamp Network needed more than a marketing presence. The business runs on relationships and performance data across three distinct audiences (creators, managers, and brands) and on social media campaigns whose results have to be tracked and acted on quickly.

Off-the-shelf tooling couldn't model those relationships or surface campaign analytics the way the team needed. And as the business grew, the manual work of coordinating creators and reporting on campaigns threatened to become the bottleneck.

</Chapter>

<Chapter title="The approach">

I designed and built the platform on React and Vite with a Supabase database, wired to multiple external APIs for data sourcing.

{/* TODO: replace placeholder captures with real screenshots or recordings in /images/case-studies/vamp-network/. */}
<Walkthrough
  url="vampnetwork.com"
  steps={[
    { title: "Creator, manager, and brand management", body: "A custom backend dashboard to manage creators, managers, and brands in one place.", src: "/images/placeholder-screen-1.svg", alt: "Vamp Network creator management dashboard" },
    { title: "Campaign performance analytics", body: "Performance analytics for social media campaigns, surfaced where the team makes decisions.", src: "/images/placeholder-screen-2.svg", alt: "Vamp Network campaign analytics view" },
  ]}
/>

The work covered several fronts:

- **Product design and engineering.** A custom backend dashboard to manage creators, managers, and brands, with performance analytics for social media campaigns surfaced where the team makes decisions.
- **Brand and graphic design.** Visual identity and design work carried across the product and marketing surfaces.
- **SEO/AEO.** Technical and content optimization to make the platform discoverable in both traditional search and AI answer engines.
- **AI agentic workflows.** Working alongside the CEO to design and implement internal AI flows that automate repetitive operational work and let the team scale without scaling headcount at the same rate.

</Chapter>

<Chapter title="The outcome">

Vamp Network runs on a platform built specifically for how the business actually operates, with creators, managers, brands, and campaign analytics all managed in one place, and AI flows absorbing operational work that would otherwise require more hands.

{/* TODO: replace the "00" values below with real numbers, and adjust the labels to match. */}
<Outcome
  metrics={[
    { value: "00", label: "Creators managed" },
    { value: "00", label: "Campaigns tracked" },
    { value: "00", label: "Hours saved / week" },
  ]}
/>

</Chapter>
```

- [ ] **Step 4: Rewrite `the-booking-flow.mdx` body**

```mdx
<Chapter title="Overview">

The Booking Flow is my own SaaS, focused on lead capture for service-based businesses like roofing, contracting, HVAC, electrical, and plumbing. As the founder, I own the whole stack of work: UX/UI design and engineering, graphic design, brand development, SEO/AEO, and the digital marketing strategy behind it.

</Chapter>

<Chapter title="The challenge">

Service businesses live and die by leads, but the leads arrive scattered across sources like Angi and Thumbtack, and the work of capturing, routing, and following up on them is manual and easy to drop. A missed or slow lead is lost revenue.

The product needed to capture every lead automatically, show owners exactly where their leads come from, and stay simple enough for non-technical trades businesses to actually use.

<PullQuote text="Every inbound lead captured automatically, every source accounted for." />

</Chapter>

<Chapter title="The approach">

I built The Booking Flow on React and Vite with a Supabase database, fronted by a marketing site and backed by a dashboard owners use to monitor their lead pipeline.

{/* TODO: add real captures (src or video) for each step in /images/case-studies/the-booking-flow/. */}
<Walkthrough
  url="thebookingflow.com"
  steps={[
    { title: "Lead pipeline dashboard", body: "A backend dashboard where owners track and manage every lead in their pipeline.", src: "/images/placeholder-screen-1.svg", alt: "The Booking Flow lead pipeline dashboard" },
    { title: "Lead source attribution", body: "The backend is wired to external APIs to track where leads originate, namely Angi and Thumbtack, so owners can see which channels actually produce.", src: "/images/placeholder-screen-2.svg", alt: "The Booking Flow lead source attribution view" },
    { title: "Automated AI lead capture", body: "A complete n8n AI flow handles all lead capture automatically, so no inbound lead slips through.", alt: "The Booking Flow n8n lead capture flow" },
  ]}
/>

Key pieces:

- **Branding and identity.** Full brand development and graphic design, establishing the product's look and voice from scratch.
- **Marketing site and product UI.** A front-facing marketing website to convert visitors, plus a backend dashboard to track and manage the lead pipeline.
- **Authentication.** Google OAuth for a frictionless login.
- **AI lead capture.** A complete n8n AI flow that handles all lead capture automatically, so no inbound lead slips through.
- **Source attribution.** The backend is wired to external APIs to track where leads originate, namely Angi and Thumbtack, so owners can see which channels actually produce.
- **SEO/AEO and marketing strategy.** Search and answer-engine optimization plus the broader digital marketing strategy and its implementation.

</Chapter>

<Chapter title="The outcome">

The Booking Flow gives service businesses a single place to capture leads automatically and see their pipeline and lead sources at a glance, replacing scattered manual follow-up with an automated flow.

{/* TODO: replace the "00" values below with real numbers, and adjust the labels to match. */}
<Outcome
  metrics={[
    { value: "00", label: "Leads captured" },
    { value: "00", label: "Businesses onboarded" },
    { value: "00", label: "Conversion lift" },
  ]}
/>

</Chapter>
```

- [ ] **Step 5: Rewrite `aiwi-waffles.mdx` body**

```mdx
<Chapter title="Overview">

For 'Aiwi Waffles I was the lead UX/UI designer and developer, and the SEO/AEO expert. The engagement started with brand and identity and has grown into an ongoing partnership with the owner to scale the business through digital channels.

</Chapter>

<Chapter title="The challenge">

'Aiwi Waffles needed a complete identity that worked everywhere the business shows up: a physical store, a food truck, an online storefront, and a merch line. The brand had to feel cohesive across all of those surfaces while supporting a business actively looking to grow beyond its current footprint.

<PullQuote text="One brand, cohesive from the storefront to the food truck to the merch line." />

</Chapter>

<Chapter title="The approach">

I designed the full brand from the ground up and built the storefront on Shopify.

{/* TODO: replace placeholder images with real storefront screenshots and brand/merch photos in /images/case-studies/aiwi-waffles/. */}
<Gallery
  images={[
    { src: "/images/placeholder-brand-1.svg", alt: "'Aiwi Waffles Shopify storefront", caption: "Shopify storefront" },
    { src: "/images/placeholder-brand-2.svg", alt: "'Aiwi Waffles brand and merch line", caption: "Brand identity and merch line" },
  ]}
/>

The work included:

- **Brand identity.** Logo, brand messaging, and a cohesive visual system.
- **Signage.** Physical signage designed for both the store and the food truck.
- **E-commerce.** A Shopify storefront for the business.
- **Merch.** I designed the merchandise line offered on the site.
- **SEO/AEO.** Search and answer-engine optimization to grow the brand's online visibility.
- **Local SEO & Google Business Profile.** Optimized the Google Business Profile and local search presence so the storefront ranks #1 on Google for multiple keywords, turning online searches into walk-in customers.

</Chapter>

<Chapter title="The outcome">

'Aiwi Waffles has a unified brand that carries across its store, food truck, online shop, and merch line, and a digital foundation built to scale.

The standout win came from local SEO. By optimizing the Google Business Profile, the storefront now ranks #1 on Google for multiple keywords, driving a steady stream of tourist foot traffic into the store.

<PullQuote text="Optimizing the Google Business Profile took the storefront to #1 for multiple local searches, turning online visibility into foot traffic through the door." />

That scaling work is ongoing. We're currently planning to offer frozen waffles online, and I'm directly involved in the logistics for manufacturing and distribution, helping take the brand from a local presence into a retail product.

{/* TODO: "#1" is real. Replace the "00" values with real numbers (how many keywords, foot-traffic figure) and adjust labels to match. */}
<Outcome
  metrics={[
    { value: "#1", label: "Google local ranking" },
    { value: "00", label: "Keywords ranked #1" },
    { value: "00", label: "Storefront foot traffic" },
  ]}
/>

</Chapter>
```

- [ ] **Step 6: Run tests, typecheck, and build**

Run: `npm run test:run && npm run typecheck && npm run build`
Expected: all PASS; the SSG build prerenders `/work/*` without errors. If the build fails on a GSAP subpath import in SSR, add that specifier to `ssr.noExternal` in `vite.config.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/content/case-studies src/pages/WorkDetail.test.tsx
git commit -m "content: migrate case studies to chapters, walkthroughs, and outcomes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: OG images, visual verification, docs

**Files:**
- Create: `public/images/case-studies/{vamp-network,the-booking-flow,aiwi-waffles}/og.png`
- Modify: the three MDX frontmatters (`ogImage`), `MEMORY.md`, `CLAUDE.md` (section 5)

- [ ] **Step 1: Render raster OG images (1200x630) from the SVG covers with headless Chrome**

For each slug, write a wrapper page into the scratchpad and screenshot it:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for slug in vamp-network the-booking-flow aiwi-waffles; do
  mkdir -p "public/images/case-studies/$slug"
  cat > "$SCRATCH/og-$slug.html" <<EOF
<!doctype html><html><body style="margin:0;background:#090909">
<img src="file://$PWD/public/images/$slug-cover.svg" style="display:block;width:1200px;height:630px;object-fit:cover">
</body></html>
EOF
  "$CHROME" --headless=new --hide-scrollbars --window-size=1200,630 \
    --screenshot="$PWD/public/images/case-studies/$slug/og.png" "file://$SCRATCH/og-$slug.html"
done
```

(`$SCRATCH` is the session scratchpad directory.) Open each PNG with the Read tool and confirm it shows the cover with no blank or white area.

- [ ] **Step 2: Point frontmatter at the OG images**

Add to each case study frontmatter: `ogImage: "/images/case-studies/<slug>/og.png"` (with the real slug).

- [ ] **Step 3: Visual verification with agent-browser**

Start the dev server (`npm run dev`, background). Using `agent-browser` with `--executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` (check `agent-browser --help` for exact subcommands), for each `/work/<slug>` at 1440x900 and 390x844:

1. Hero: headline, glance strip (Client, Role, Year, Result), and "Visit live site" visible without scrolling at 1440x900.
2. Scroll into the approach chapter: at 1440 the Walkthrough frame sticks while steps change (screenshot two different steps); at 390 the steps stack.
3. At 1440 the chapter rail is **not** shown; at a 1536+ width it is shown with the active chapter highlighted. At 390, the top progress bar shows the current chapter name after the hero.
4. 'Aiwi: the Gallery drags, and Arrow keys move it after Tab focus.
5. Scroll to the end: the next-project band opens to full-bleed; clicking it runs the curtain and lands on the next case study's hero, with the headline revealing after the curtain lifts (not behind it).
6. Hover the next band, the Gallery, and "Visit live site" at 1440: the cursor pill reads View, Drag, Visit. (Work index cards get `data-cursor` in sub-project 3.)
7. Emulate `prefers-reduced-motion: reduce`: everything renders fully, Walkthrough stacks, and there are no reveals.

Scroll each `whileInView`/ScrollTrigger element into view before capturing. Fix any defect found (with a failing test first where it is logic), then clean up: delete temp screenshots and scratch HTML, and run `agent-browser close`.

- [ ] **Step 4: Update docs**

- `CLAUDE.md` section 5, first bullet: add `year`, `result` (required) and optional `client`, `ogImage` to the frontmatter list, plus: "Case study bodies are built from `<Chapter>` sections with `<Walkthrough>`, `<Gallery>`, `<BeforeAfter>`, `<Outcome>`, and `<PullQuote>` (see `src/components/mdx/case-study/`)."
- `MEMORY.md`: add build-log entries for the interaction foundation (`src/lib/motion.ts`, `src/components/interaction/`, the GSAP vs Motion ownership rule, curtain-aware `useScrollReveal`) and the case study system (hero, chapters + rail at `xl+`, width system `cs-grid`, modules, next band, OG PNGs). Update the "Entrance animations + the curtain" gotcha: it is now solved for everything built on `useScrollReveal` (covers, RevealText, CountUp). Update Outstanding TODOs: real `result` sentences for Vamp Network and The Booking Flow, real captures per case study folder.

- [ ] **Step 5: Final checks and commit**

Run: `npm run test:run && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add public/images/case-studies src/content/case-studies MEMORY.md CLAUDE.md
git commit -m "content: raster OG images for case studies; document the new system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
