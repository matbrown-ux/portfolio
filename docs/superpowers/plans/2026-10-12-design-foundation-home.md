# Design Foundation + Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the brutalist design system, the site shell and the complete Home page on the Astro scaffold.

**Architecture:** Every Home section is a static `.astro` component styled with Tailwind v4 tokens. Behaviour lives in small tested TypeScript modules (typewriter, scroll reveals, featured-work selection) wired in by one-line `<script>` tags. The only React island is the mobile menu, hydrated on small screens only. The purchased script font never enters the repo: a local generator turns fixed phrases into SVG files.

**Tech Stack:** Astro 7 (static), Tailwind CSS 4, React 19 (one island), GSAP 3 + ScrollTrigger, Vitest 5 + jsdom + Testing Library, fontkit (dev only).

**Spec:** `docs/superpowers/specs/2026-10-12-design-foundation-home-design.md`. Visual reference: `docs/superpowers/specs/assets/2026-10-12-home-approved.jpeg`. Read both before starting any task.

## Global Constraints

- Work on branch `feat/astro-rebuild`. Do not push.
- **TDD kit:** every `.ts`, `.tsx`, `.mjs` under `src/` or `scripts/` gets a failing test first (use the superpowers test-driven-development skill). The pre-commit hook refuses source without a test. Never add a `Test-Exempt:` trailer. Never use `--no-verify`, `-n`, or change `core.hooksPath`.
- `.astro`, `.css`, `.mdx`, `.md`, `.json`, images and `*.config.*` are content: no unit test, verified by `npm run typecheck`, `npm run build` and the browser.
- Keep logic out of `.astro` frontmatter. Anything with a branch or a calculation goes in a `.ts` file.
- Logic modules must not share a basename with a component case-insensitively (macOS).
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Colours: ivory `#f4f0e6`, ink `#0c0c0c`, vermilion `#f86343`, stone `#e4dfd3`. No other colours.
- Small vermilion text (numbers, labels) appears only on ink. Text on a vermilion fill is ink.
- Type: Anton (display), Archivo (body), JetBrains Mono (labels). Gloss And Bloom only as generated SVG.
- **Never commit a `.ttf`, `.otf`, `.woff` or `.woff2` of Gloss And Bloom.** The repo is public.
- Animation is GSAP only; do not install or import `motion`. Tweens on ink surfaces use `force3D: false`.
- All motion respects `prefers-reduced-motion`. No element is hidden unless JavaScript has run and motion is allowed.
- Copy: first person, no em or en dashes, wording exactly as in the spec's "Home copy" table. Do not invent copy or metrics.
- Design skills (load before any `.astro` styling task): `industrial-brutalist-ui` leads, then `high-end-visual-design`, then `frontend-design` + `design-taste-frontend`; `impeccable` for easing and timing. The spec's locked decisions override any skill default.
- Do not kill dev servers by process name. Start your own with `npx astro dev --port 4321` and stop that one.
- Browser checks use the Playwright MCP tools. Screenshots go under `.playwright-mcp/` (git-ignored after Task 1).

## Review Focus

1. **Fewer or more than three case studies.** A person adding or removing a case study expects Home to show up to three, newest first, without a crash or an empty hole. Pinned in Task 6.
2. **A script phrase using a character the Alternates cut lacks** (it has no `0` or `9`). A person adding "since 2019" expects the generator to fall back to Regular or fail with the character named, not emit a blank glyph. Pinned in Task 5.
3. **Unsafe values in `phrases.json`** (a name like `../x`, a non-hex colour, a duplicate name). A person editing the list expects a clear error, not a file written outside the folder or broken SVG. Pinned in Task 5.
4. **Empty or malformed `data-words`.** A person editing the hero expects the prerendered word to stay put, not vanish or throw. Pinned in Task 3.
5. **Widening the window while the mobile menu is open.** A person rotating a tablet expects the page to scroll again. Pinned in Task 8.

---

### Task 1: Foundation: ignore rules, local fonts, web fonts, tokens, assets

**Files:**
- Modify: `.gitignore`, `astro.config.mjs`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`
- Modify: `src/content/case-studies/vamp-network.mdx`, `the-booking-flow.mdx`, `aiwi-waffles.mdx` (remove one frontmatter line each)
- Create: `src/assets/logo/mb-mark.svg`, `src/assets/portraits/hero.png`, `src/assets/portraits/about.png` (moved)
- Delete: `public/images/vamp-network-cover.svg`, `public/images/the-booking-flow-cover.svg`, `public/images/aiwi-waffles-cover.svg`
- Local only, not committed: `.fonts/`

**Interfaces:**
- Produces: Tailwind colour utilities `bg-ivory`, `text-ink`, `bg-vermilion`, `bg-stone`, `border-line-dark`; font utilities `font-display`, `font-sans`, `font-mono`; custom utilities `type-display` and `type-label`; the `.caret` class; `src/assets/logo/mb-mark.svg` (single path, `fill="currentColor"`, `viewBox="0 0 369 278"`); portrait files at the paths above.

- [ ] **Step 1: Ignore the local-only folders**

Append to `.gitignore`:

```
# Purchased fonts (local only, the repo is public: never commit)
.fonts/

# Playwright MCP output
.playwright-mcp/
```

- [ ] **Step 2: Put the purchased fonts in `.fonts/`**

```bash
mkdir -p .fonts
cp /Users/operationhq/Downloads/Gloss_And_Bloom.ttf /Users/operationhq/Downloads/Gloss_And_Bloom_Alternates.ttf /Users/operationhq/Downloads/Gloss_And_Bloom_Extras.ttf .fonts/
git status --short
```

Expected: `git status` does not list `.fonts/`. If the source files are missing from Downloads, stop and ask the owner for them.

- [ ] **Step 3: Configure the web fonts**

Replace `astro.config.mjs` with:

```js
// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://matbrown.io',
  integrations: [react(), mdx(), sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Anton',
      cssVariable: '--font-anton',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Impact', 'Arial Narrow', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
```

If `astro check` rejects an option name, the authoritative types are in `node_modules/astro/dist/assets/fonts/types.d.ts` and the guide is https://docs.astro.build/en/guides/fonts/.

- [ ] **Step 4: Write the tokens**

Replace `src/styles/global.css` with:

```css
@import "tailwindcss";

@theme inline {
  --font-display: var(--font-anton);
  --font-sans: var(--font-archivo);
  --font-mono: var(--font-jetbrains-mono);
}

@theme {
  --color-ivory: #f4f0e6;
  --color-ink: #0c0c0c;
  --color-vermilion: #f86343;
  --color-stone: #e4dfd3;
  --color-line-dark: rgb(244 240 230 / 0.16);
}

@layer base {
  html {
    scroll-padding-top: 5rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }

  body {
    background: var(--color-ivory);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  :focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
}

/* Anton, uppercase, tight. Size is set per use with a text-[clamp(...)] class. */
@utility type-display {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 0.98;
  text-transform: uppercase;
}

/* Small tracked monospace label: nav, numbers, tile metadata, buttons. */
@utility type-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.6;
  text-transform: uppercase;
}

.caret {
  display: inline-block;
  width: 0.09em;
  height: 0.72em;
  margin-left: 0.04em;
  background: var(--color-vermilion);
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
```

- [ ] **Step 5: Load the fonts in the layout**

In `src/layouts/BaseLayout.astro`, add to the frontmatter after the CSS import:

```astro
import { Font } from 'astro:assets'
```

and add inside `<head>`, directly after the viewport meta:

```astro
    <Font cssVariable="--font-anton" preload />
    <Font cssVariable="--font-archivo" preload />
    <Font cssVariable="--font-jetbrains-mono" />
```

- [ ] **Step 6: Extract the logo mark**

```bash
mkdir -p src/assets/logo
node --input-type=module - <<'EOF'
import { readFileSync, writeFileSync } from 'node:fs'
const source = readFileSync('/Users/operationhq/Documents/02-PERSONAL/logo-initials.svg', 'utf8')
const match = source.match(/<g id="Layer_2">[\s\S]*?<path class="st1" d="([^"]+)"/)
if (!match) throw new Error('Layer_2 mark path not found in logo-initials.svg')
writeFileSync(
  'src/assets/logo/mb-mark.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 369 278"><path fill="currentColor" fill-rule="evenodd" d="${match[1]}"/></svg>\n`,
)
EOF
grep -c "rect" src/assets/logo/mb-mark.svg
```

Expected: `0` (no background rectangle).

- [ ] **Step 7: Move the portraits and remove the old covers**

```bash
mkdir -p src/assets/portraits
git mv public/images/hero-image.png src/assets/portraits/hero.png
git mv public/images/about-hero-image.png src/assets/portraits/about.png
git rm -q public/images/vamp-network-cover.svg public/images/the-booking-flow-cover.svg public/images/aiwi-waffles-cover.svg
sed -i '' '/^coverImage:/d' src/content/case-studies/vamp-network.mdx src/content/case-studies/the-booking-flow.mdx src/content/case-studies/aiwi-waffles.mdx
grep -c "coverImage" src/content/case-studies/*.mdx
```

Expected: each file reports `0`.

- [ ] **Step 8: Verify**

```bash
npm run typecheck && npm run build && grep -o "font-family:[^;]*Anton[^;]*" dist/index.html | head -1 && ls dist/_astro | grep -c "woff2"
```

Expected: 0 errors, the build completes, an Anton `font-family` declaration is printed, and the woff2 count is at least 3.

- [ ] **Step 9: Commit**

```bash
git add .gitignore astro.config.mjs src/styles/global.css src/layouts/BaseLayout.astro src/assets src/content/case-studies public/images
git commit -m "feat: add brutalist tokens, web fonts, logo mark and portrait assets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Motion tokens, reduced-motion check and the GSAP entry point

**Files:**
- Create: `src/test/matchMedia.ts`, `src/lib/motionTokens.ts`, `src/lib/motionTokens.test.ts`, `src/lib/gsap.ts`, `src/lib/gsap.test.ts`
- Modify: `src/test/setup.ts`

**Interfaces:**
- Produces:
  - `src/test/matchMedia.ts`: `REDUCED_QUERY: string`, `DESKTOP_QUERY: string`, `installMatchMedia(matches: Record<string, boolean>): void`, `changeMatchMedia(matches: Record<string, boolean>): void`
  - `src/lib/motionTokens.ts`: `DURATION: { fast: number; base: number; slow: number }`, `EASE: { out: string; inOut: string; wipe: string }`, `STAGGER: number`, `REDUCED_MOTION_QUERY: string`, `prefersReducedMotion(): boolean`
  - `src/lib/gsap.ts`: named exports `gsap`, `ScrollTrigger`

- [ ] **Step 1: Add the matchMedia test double**

jsdom has no `matchMedia`. Create `src/test/matchMedia.ts`:

```ts
export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
export const DESKTOP_QUERY = '(min-width: 768px)'

type Listener = (e: { matches: boolean; media: string }) => void

let current: Record<string, boolean> = {}
const listeners = new Map<string, Set<Listener>>()

function listenersFor(query: string) {
  let set = listeners.get(query)
  if (!set) {
    set = new Set()
    listeners.set(query, set)
  }
  return set
}

/** Install a window.matchMedia where only the listed queries match. */
export function installMatchMedia(matches: Record<string, boolean>) {
  current = { ...matches }
  listeners.clear()
  const impl = (query: string) => ({
    get matches() {
      return current[query] ?? false
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, fn: Listener) => listenersFor(query).add(fn),
    removeEventListener: (_type: string, fn: Listener) => listenersFor(query).delete(fn),
    addListener: (fn: Listener) => listenersFor(query).add(fn),
    removeListener: (fn: Listener) => listenersFor(query).delete(fn),
    dispatchEvent: () => false,
  })
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: impl })
}

/** Change which queries match and fire the change listeners of every query that flipped. */
export function changeMatchMedia(matches: Record<string, boolean>) {
  const previous = current
  current = { ...matches }
  const queries = new Set([...Object.keys(previous), ...Object.keys(current), ...listeners.keys()])
  for (const query of queries) {
    const now = current[query] ?? false
    if ((previous[query] ?? false) === now) continue
    for (const fn of [...listenersFor(query)]) fn({ matches: now, media: query })
  }
}
```

Replace `src/test/setup.ts` with:

```ts
import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'
import { installMatchMedia } from './matchMedia'

// Default: no media query matches, so motion is allowed and the viewport is "mobile".
// Installed at module load too, because GSAP's ScrollTrigger calls matchMedia on import.
installMatchMedia({})
beforeEach(() => installMatchMedia({}))
```

- [ ] **Step 2: Write the failing tests**

`src/lib/motionTokens.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { DURATION, EASE, prefersReducedMotion, REDUCED_MOTION_QUERY, STAGGER } from './motionTokens'

describe('motion tokens', () => {
  it('orders durations from fast to slow, in seconds', () => {
    expect(DURATION.fast).toBeLessThan(DURATION.base)
    expect(DURATION.base).toBeLessThan(DURATION.slow)
    expect(DURATION.slow).toBeLessThanOrEqual(1.2)
  })

  it('names GSAP eases as strings', () => {
    for (const ease of Object.values(EASE)) expect(ease).toMatch(/^[a-z0-9]+\.(out|inOut|in)$/)
  })

  it('keeps the stagger short', () => {
    expect(STAGGER).toBeGreaterThan(0)
    expect(STAGGER).toBeLessThan(DURATION.fast)
  })
})

describe('prefersReducedMotion', () => {
  it('uses the standard media query', () => {
    expect(REDUCED_MOTION_QUERY).toBe(REDUCED_QUERY)
  })

  it('is false when the query does not match', () => {
    expect(prefersReducedMotion()).toBe(false)
  })

  it('is true when the query matches', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    expect(prefersReducedMotion()).toBe(true)
  })
})
```

`src/lib/gsap.test.ts`:

```ts
import { afterAll, expect, it } from 'vitest'
import { gsap, ScrollTrigger } from './gsap'

// ScrollTrigger and the GSAP ticker keep timers alive after a file's tests finish.
afterAll(() => {
  ScrollTrigger.killAll()
  ScrollTrigger.disable()
  gsap.ticker.sleep()
})

it('exports gsap with ScrollTrigger registered', () => {
  expect(typeof gsap.to).toBe('function')
  expect(typeof ScrollTrigger.create).toBe('function')
  expect(ScrollTrigger.version).toBe(gsap.version)
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/lib/motionTokens.test.ts src/lib/gsap.test.ts`
Expected: FAIL, both files cannot resolve `./motionTokens` and `./gsap`.

- [ ] **Step 4: Choose the values with `impeccable`, then implement**

Load the `impeccable` skill and confirm or adjust the numbers below for a brutalist site (fast, decisive, no bounce). Keep whatever you choose inside the test's bounds.

`src/lib/motionTokens.ts`:

```ts
/** Seconds. The only place durations and eases are defined; import these, never hardcode. */
export const DURATION = { fast: 0.2, base: 0.5, slow: 0.9 } as const

/** GSAP ease names. */
export const EASE = { out: 'power3.out', inOut: 'power2.inOut', wipe: 'expo.out' } as const

/** Seconds between items that reveal as a group. */
export const STAGGER = 0.08

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  )
}
```

`src/lib/gsap.ts`:

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Single registration point. Guarded so importing this during the static build is safe.
if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/motionTokens.test.ts src/lib/gsap.test.ts`
Expected: PASS, 7 tests, no warnings in the output.

- [ ] **Step 6: Commit**

```bash
git add src/test src/lib/motionTokens.ts src/lib/motionTokens.test.ts src/lib/gsap.ts src/lib/gsap.test.ts
git commit -m "feat: add motion tokens, reduced-motion check and the GSAP entry point

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Typewriter

**Files:**
- Create: `src/lib/typewriter.ts`, `src/lib/typewriter.test.ts`, `src/lib/typewriterElement.ts`, `src/lib/typewriterElement.test.ts`

**Interfaces:**
- Consumes: `prefersReducedMotion()` from `src/lib/motionTokens.ts`; `installMatchMedia`, `REDUCED_QUERY` from `src/test/matchMedia.ts`.
- Produces:
  - `src/lib/typewriter.ts`: `type TypewriterPhase = 'typing' | 'deleting'`; `interface TypewriterState { text: string; wordIndex: number; phase: TypewriterPhase }`; `interface TypewriterTiming { type: number; erase: number; hold: number; gap: number }` (milliseconds); `DEFAULT_TIMING`; `parseWords(value: string | undefined): string[]`; `initialTypewriterState(words: string[]): TypewriterState`; `nextTypewriterFrame(state, words, timing?): { state: TypewriterState; delay: number }`
  - `src/lib/typewriterElement.ts`: `startTypewriter(el: HTMLElement, words: string[], options?: { timing?: TypewriterTiming; startDelay?: number }): { stop(): void }`

The page is prerendered with the first word already in place. The typewriter starts from that full word, holds, deletes it, then types the next. `delay` is how long to wait before showing the returned state.

- [ ] **Step 1: Write the failing test for the pure step**

`src/lib/typewriter.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_TIMING, initialTypewriterState, nextTypewriterFrame, parseWords } from './typewriter'

const words = ['ux', 'ai']
const t = DEFAULT_TIMING

describe('parseWords', () => {
  it('splits on commas and trims', () => {
    expect(parseWords('ux, ui ,seo,ai')).toEqual(['ux', 'ui', 'seo', 'ai'])
  })

  it('drops empty entries and handles missing input', () => {
    expect(parseWords(' , ,')).toEqual([])
    expect(parseWords('')).toEqual([])
    expect(parseWords(undefined)).toEqual([])
  })
})

describe('initialTypewriterState', () => {
  it('starts with the first word fully typed', () => {
    expect(initialTypewriterState(words)).toEqual({ text: 'ux', wordIndex: 0, phase: 'typing' })
  })

  it('is empty for an empty list', () => {
    expect(initialTypewriterState([])).toEqual({ text: '', wordIndex: 0, phase: 'typing' })
  })
})

describe('nextTypewriterFrame', () => {
  it('holds a finished word, then starts deleting', () => {
    expect(nextTypewriterFrame({ text: 'ux', wordIndex: 0, phase: 'typing' }, words)).toEqual({
      state: { text: 'u', wordIndex: 0, phase: 'deleting' },
      delay: t.hold,
    })
  })

  it('deletes one character at a time', () => {
    expect(nextTypewriterFrame({ text: 'u', wordIndex: 0, phase: 'deleting' }, words)).toEqual({
      state: { text: '', wordIndex: 0, phase: 'deleting' },
      delay: t.erase,
    })
  })

  it('moves to the next word after a gap', () => {
    expect(nextTypewriterFrame({ text: '', wordIndex: 0, phase: 'deleting' }, words)).toEqual({
      state: { text: 'a', wordIndex: 1, phase: 'typing' },
      delay: t.gap,
    })
  })

  it('types one character at a time', () => {
    expect(nextTypewriterFrame({ text: 'a', wordIndex: 1, phase: 'typing' }, words)).toEqual({
      state: { text: 'ai', wordIndex: 1, phase: 'typing' },
      delay: t.type,
    })
  })

  it('wraps from the last word to the first', () => {
    expect(nextTypewriterFrame({ text: '', wordIndex: 1, phase: 'deleting' }, words).state).toEqual({
      text: 'u',
      wordIndex: 0,
      phase: 'typing',
    })
  })

  it('cycles a single word', () => {
    expect(nextTypewriterFrame({ text: '', wordIndex: 0, phase: 'deleting' }, ['seo']).state).toEqual({
      text: 's',
      wordIndex: 0,
      phase: 'typing',
    })
  })

  it('returns the state unchanged for an empty list', () => {
    const state = { text: '', wordIndex: 0, phase: 'typing' as const }
    expect(nextTypewriterFrame(state, [])).toEqual({ state, delay: t.hold })
  })

  it('honours custom timing', () => {
    const timing = { type: 1, erase: 2, hold: 3, gap: 4 }
    expect(nextTypewriterFrame({ text: 'ux', wordIndex: 0, phase: 'typing' }, words, timing).delay).toBe(3)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/typewriter.test.ts`
Expected: FAIL, cannot resolve `./typewriter`.

- [ ] **Step 3: Implement the pure step**

`src/lib/typewriter.ts`:

```ts
export type TypewriterPhase = 'typing' | 'deleting'

export interface TypewriterState {
  text: string
  wordIndex: number
  phase: TypewriterPhase
}

/** Milliseconds. */
export interface TypewriterTiming {
  type: number
  erase: number
  hold: number
  gap: number
}

export const DEFAULT_TIMING: TypewriterTiming = { type: 90, erase: 45, hold: 2200, gap: 200 }

/** Parse a comma-separated data attribute into words. */
export function parseWords(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean)
}

/** The page is prerendered with the first word in place, so start from it fully typed. */
export function initialTypewriterState(words: string[]): TypewriterState {
  return { text: words[0] ?? '', wordIndex: 0, phase: 'typing' }
}

/** The next state to show, and how long to wait before showing it. */
export function nextTypewriterFrame(
  state: TypewriterState,
  words: string[],
  timing: TypewriterTiming = DEFAULT_TIMING,
): { state: TypewriterState; delay: number } {
  if (words.length === 0) return { state, delay: timing.hold }

  const word = words[state.wordIndex % words.length]

  if (state.phase === 'typing') {
    if (state.text.length < word.length) {
      return { state: { ...state, text: word.slice(0, state.text.length + 1) }, delay: timing.type }
    }
    return { state: { ...state, text: state.text.slice(0, -1), phase: 'deleting' }, delay: timing.hold }
  }

  if (state.text.length > 0) {
    return { state: { ...state, text: state.text.slice(0, -1) }, delay: timing.erase }
  }

  const wordIndex = (state.wordIndex + 1) % words.length
  return { state: { text: words[wordIndex].slice(0, 1), wordIndex, phase: 'typing' }, delay: timing.gap }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/typewriter.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 5: Write the failing test for the element binding**

`src/lib/typewriterElement.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { startTypewriter } from './typewriterElement'

const timing = { type: 10, erase: 10, hold: 100, gap: 10 }

function element(text = 'ux') {
  const el = document.createElement('span')
  el.textContent = text
  return el
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('startTypewriter', () => {
  it('leaves the prerendered word in place until the hold ends', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing })
    vi.advanceTimersByTime(99)
    expect(el.textContent).toBe('ux')
  })

  it('deletes the word, then types the next one', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing })
    vi.advanceTimersByTime(100)
    expect(el.textContent).toBe('u')
    vi.advanceTimersByTime(10)
    expect(el.textContent).toBe('')
    vi.advanceTimersByTime(10)
    expect(el.textContent).toBe('a')
    vi.advanceTimersByTime(10)
    expect(el.textContent).toBe('ai')
  })

  it('waits for the start delay before the first hold', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing, startDelay: 500 })
    vi.advanceTimersByTime(599)
    expect(el.textContent).toBe('ux')
    vi.advanceTimersByTime(1)
    expect(el.textContent).toBe('u')
  })

  it('stops when asked', () => {
    const el = element()
    const handle = startTypewriter(el, ['ux', 'ai'], { timing })
    handle.stop()
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('ux')
  })

  it('shows the first word and never types under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const el = element('stale')
    startTypewriter(el, ['ux', 'ai'], { timing })
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('ux')
  })

  it('leaves the prerendered text alone when there are no words', () => {
    const el = element('ux')
    startTypewriter(el, [], { timing })
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('ux')
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/lib/typewriterElement.test.ts`
Expected: FAIL, cannot resolve `./typewriterElement`.

- [ ] **Step 7: Implement the element binding**

`src/lib/typewriterElement.ts`:

```ts
import { prefersReducedMotion } from './motionTokens'
import { DEFAULT_TIMING, initialTypewriterState, nextTypewriterFrame, type TypewriterTiming } from './typewriter'

export interface TypewriterOptions {
  timing?: TypewriterTiming
  /** Milliseconds to wait before the first hold begins. */
  startDelay?: number
}

const idle = { stop() {} }

/** Cycle `words` through `el`. The element should already contain the first word. */
export function startTypewriter(el: HTMLElement, words: string[], options: TypewriterOptions = {}): { stop(): void } {
  if (words.length === 0) return idle

  if (prefersReducedMotion()) {
    el.textContent = words[0]
    return idle
  }

  const timing = options.timing ?? DEFAULT_TIMING
  let state = initialTypewriterState(words)
  let timer: ReturnType<typeof setTimeout>
  let stopped = false
  el.textContent = state.text

  const schedule = () => {
    const frame = nextTypewriterFrame(state, words, timing)
    timer = setTimeout(() => {
      if (stopped) return
      state = frame.state
      el.textContent = state.text
      schedule()
    }, frame.delay)
  }

  timer = setTimeout(schedule, options.startDelay ?? 0)

  return {
    stop() {
      stopped = true
      clearTimeout(timer)
    },
  }
}
```

- [ ] **Step 8: Run both test files to verify they pass**

Run: `npx vitest run src/lib/typewriter.test.ts src/lib/typewriterElement.test.ts`
Expected: PASS, 18 tests.

- [ ] **Step 9: Commit**

```bash
git add src/lib/typewriter.ts src/lib/typewriter.test.ts src/lib/typewriterElement.ts src/lib/typewriterElement.test.ts
git commit -m "feat: add the hero typewriter as a tested state step and element binding

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Scroll and load reveals

**Files:**
- Create: `src/lib/reveal.ts`, `src/lib/reveal.test.ts`

**Interfaces:**
- Consumes: `DURATION`, `EASE`, `prefersReducedMotion` from `src/lib/motionTokens.ts`; `gsap`, `ScrollTrigger` from `src/lib/gsap.ts`.
- Produces: `type RevealKind = 'rise' | 'wipe' | 'fade'`; `parseReveal(el: HTMLElement): { kind: RevealKind; delay: number; onLoad: boolean } | null`; `revealTween(kind: RevealKind): { from: gsap.TweenVars; to: gsap.TweenVars }`; `initReveals(root?: ParentNode): () => void`.

**Markup contract used by every later task:**
- `data-reveal="rise"` (fade up), `"wipe"` (clip in from the left) or `"fade"`.
- `data-reveal-delay="0.2"`: optional, seconds.
- `data-reveal-on="load"`: optional; plays on page load. Without it the element reveals once when it scrolls into view.

- [ ] **Step 1: Write the failing test**

`src/lib/reveal.test.ts`:

```ts
import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { gsap, ScrollTrigger } from './gsap'
import { initReveals, parseReveal, revealTween } from './reveal'

afterEach(() => {
  document.body.innerHTML = ''
})

afterAll(() => {
  ScrollTrigger.killAll()
  ScrollTrigger.disable()
  gsap.ticker.sleep()
})

function el(attrs: Record<string, string>) {
  const node = document.createElement('div')
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  document.body.append(node)
  return node
}

describe('parseReveal', () => {
  it('reads kind, delay and trigger', () => {
    expect(parseReveal(el({ 'data-reveal': 'wipe', 'data-reveal-delay': '0.25', 'data-reveal-on': 'load' }))).toEqual({
      kind: 'wipe',
      delay: 0.25,
      onLoad: true,
    })
  })

  it('defaults to no delay and a scroll trigger', () => {
    expect(parseReveal(el({ 'data-reveal': 'rise' }))).toEqual({ kind: 'rise', delay: 0, onLoad: false })
  })

  it('treats a bad or negative delay as zero', () => {
    expect(parseReveal(el({ 'data-reveal': 'fade', 'data-reveal-delay': 'soon' }))?.delay).toBe(0)
    expect(parseReveal(el({ 'data-reveal': 'fade', 'data-reveal-delay': '-1' }))?.delay).toBe(0)
  })

  it('ignores unknown kinds and missing attributes', () => {
    expect(parseReveal(el({ 'data-reveal': 'spin' }))).toBeNull()
    expect(parseReveal(el({}))).toBeNull()
  })
})

describe('revealTween', () => {
  it('wipes with a clip path from the left', () => {
    expect(revealTween('wipe')).toEqual({
      from: { clipPath: 'inset(0% 100% 0% 0%)' },
      to: { clipPath: 'inset(0% 0% 0% 0%)' },
    })
  })

  it('rises and fades with autoAlpha', () => {
    expect(revealTween('rise').from).toEqual({ autoAlpha: 0, y: 32 })
    expect(revealTween('fade').from).toEqual({ autoAlpha: 0 })
  })
})

describe('initReveals', () => {
  it('hides a load reveal at its start state when motion is allowed', () => {
    const node = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    cleanup()
  })

  it('touches nothing under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const node = el({ 'data-reveal': 'rise', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(node.getAttribute('style')).toBeNull()
    cleanup()
  })

  it('skips elements with an unknown kind', () => {
    const node = el({ 'data-reveal': 'spin', 'data-reveal-on': 'load' })
    initReveals()()
    expect(node.getAttribute('style')).toBeNull()
  })

  it('only looks inside the given root', () => {
    const outside = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const root = document.createElement('section')
    document.body.append(root)
    initReveals(root)()
    expect(outside.getAttribute('style')).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/reveal.test.ts`
Expected: FAIL, cannot resolve `./reveal`.

- [ ] **Step 3: Implement**

`src/lib/reveal.ts`:

```ts
import { gsap } from './gsap'
import { DURATION, EASE, prefersReducedMotion } from './motionTokens'

export type RevealKind = 'rise' | 'wipe' | 'fade'

const KINDS: readonly RevealKind[] = ['rise', 'wipe', 'fade']

export interface RevealConfig {
  kind: RevealKind
  /** Seconds. */
  delay: number
  onLoad: boolean
}

export function parseReveal(el: HTMLElement): RevealConfig | null {
  const kind = el.dataset.reveal as RevealKind | undefined
  if (!kind || !KINDS.includes(kind)) return null
  const delay = Number(el.dataset.revealDelay)
  return {
    kind,
    delay: Number.isFinite(delay) && delay > 0 ? delay : 0,
    onLoad: el.dataset.revealOn === 'load',
  }
}

export function revealTween(kind: RevealKind): { from: gsap.TweenVars; to: gsap.TweenVars } {
  if (kind === 'wipe') {
    return { from: { clipPath: 'inset(0% 100% 0% 0%)' }, to: { clipPath: 'inset(0% 0% 0% 0%)' } }
  }
  if (kind === 'rise') return { from: { autoAlpha: 0, y: 32 }, to: { autoAlpha: 1, y: 0 } }
  return { from: { autoAlpha: 0 }, to: { autoAlpha: 1 } }
}

/**
 * Animate every [data-reveal] element under `root`. Elements stay fully visible
 * unless this runs and motion is allowed, so nothing is hidden without JavaScript.
 * Returns a cleanup function.
 */
export function initReveals(root: ParentNode = document): () => void {
  if (prefersReducedMotion()) return () => {}

  const tweens: gsap.core.Tween[] = []
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const config = parseReveal(el)
    if (!config) return
    const { from, to } = revealTween(config.kind)
    tweens.push(
      gsap.fromTo(el, from, {
        ...to,
        duration: DURATION.slow,
        ease: config.kind === 'wipe' ? EASE.wipe : EASE.out,
        delay: config.delay,
        force3D: false,
        clearProps: config.kind === 'wipe' ? 'clipPath' : 'transform',
        scrollTrigger: config.onLoad ? undefined : { trigger: el, start: 'top 85%', once: true },
      }),
    )
  })

  return () => {
    for (const tween of tweens) {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/reveal.test.ts`
Expected: PASS, 10 tests, no warnings in the output.

- [ ] **Step 5: Commit**

```bash
git add src/lib/reveal.ts src/lib/reveal.test.ts
git commit -m "feat: add data-attribute reveals driven by GSAP

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Script artwork generator

**Files:**
- Create: `scripts/script-art/artList.mjs`, `scripts/script-art/artList.test.mjs`, `scripts/script-art/shape.mjs`, `scripts/script-art/shape.test.mjs`, `scripts/script-art/svg.mjs`, `scripts/script-art/svg.test.mjs`, `scripts/script-art/generate.mjs`
- Create: `src/assets/script/phrases.json`
- Generated and committed: `public/script/memorable.svg`, `public/script/lets-talk.svg`, `public/script/strike.svg`, `src/assets/script/art.json`
- Modify: `package.json` (dev dependency `fontkit`, script `script-art`)

**Interfaces:**
- Produces:
  - `artList.mjs`: `parseArtList(value: unknown): ArtItem[]` where `ArtItem = { name: string; fill: string; edge?: string } & ({ text: string } | { stroke: string })`; `FONT_FILES: { regular: string; alternates: string; extras: string }`; `missingFonts(dir: string, exists: (path: string) => boolean): string[]`
  - `shape.mjs`: `phraseShape(text: string, fonts: { regular: Font; alternates: Font }): Shape`; `strokeShape(key: string, extras: Font): Shape`; `Shape = { d: string; box: { minX: number; minY: number; maxX: number; maxY: number } }`
  - `svg.mjs`: `EDGE_WIDTH: number`; `renderSvg(shape: Shape, colours: { fill: string; edge?: string }): { svg: string; width: number; height: number }`
  - `src/assets/script/art.json`: `Record<string, { src: string; width: number; height: number }>`, keyed by item name, `src` like `/script/lets-talk.svg`
  - `npm run script-art`

`Font` is a fontkit font object. The functions only use `font.layout(text)` (returns `{ glyphs, positions }`), `font.glyphForCodePoint(cp)`, `font.hasGlyphForCodePoint(cp)`, `glyph.path` (with `scale`, `translate`, `bbox`, `toSVG`) and `glyph.advanceWidth`, so tests pass small fakes. The real fonts are not in the repo and CI must not need them.

Lettering uses the Alternates cut. The lowercase `b` always comes from Regular, and any character Alternates lacks falls back to Regular.

- [ ] **Step 1: Install fontkit and add the script**

```bash
npm install -D fontkit
```

In `package.json` `scripts`, add after `"typecheck"`:

```json
    "script-art": "node scripts/script-art/generate.mjs",
```

- [ ] **Step 2: Write the failing test for the art list**

`scripts/script-art/artList.test.mjs`:

```js
import { describe, expect, it } from 'vitest'
import { FONT_FILES, missingFonts, parseArtList } from './artList.mjs'

const phrase = { name: 'lets-talk', text: "let's talk", fill: '#f86343', edge: '#f4f0e6' }
const stroke = { name: 'strike', stroke: 'e', fill: '#f86343' }

describe('parseArtList', () => {
  it('accepts phrases and strokes', () => {
    expect(parseArtList([phrase, stroke])).toEqual([phrase, stroke])
  })

  it('rejects anything that is not a list', () => {
    expect(() => parseArtList({})).toThrow('phrases.json must be a list')
  })

  it('rejects names that are not lowercase kebab case', () => {
    for (const name of ['../x', 'Lets Talk', 'a/b', '', 'a--b', '-a']) {
      expect(() => parseArtList([{ ...phrase, name }])).toThrow('Invalid name')
    }
  })

  it('rejects duplicate names', () => {
    expect(() => parseArtList([phrase, { ...stroke, name: 'lets-talk' }])).toThrow('Duplicate name "lets-talk"')
  })

  it('rejects colours that are not six-digit hex', () => {
    expect(() => parseArtList([{ ...phrase, fill: 'red' }])).toThrow('"lets-talk": fill must be a hex colour')
    expect(() => parseArtList([{ ...phrase, edge: '#fff"/><script>' }])).toThrow('"lets-talk": edge must be a hex colour')
  })

  it('requires exactly one of text or stroke', () => {
    expect(() => parseArtList([{ name: 'x', fill: '#f86343' }])).toThrow('"x": give either text or stroke')
    expect(() => parseArtList([{ ...phrase, stroke: 'e' }])).toThrow('"lets-talk": give either text or stroke')
  })

  it('requires non-empty text and a single-character stroke key', () => {
    expect(() => parseArtList([{ ...phrase, text: '   ' }])).toThrow('"lets-talk": text is empty')
    expect(() => parseArtList([{ ...stroke, stroke: 'ee' }])).toThrow('"strike": stroke must be one character')
  })
})

describe('missingFonts', () => {
  it('lists the files that are not in the folder', () => {
    const present = new Set([`.fonts/${FONT_FILES.regular}`])
    expect(missingFonts('.fonts', (path) => present.has(path))).toEqual([FONT_FILES.alternates, FONT_FILES.extras])
  })

  it('is empty when all three are present', () => {
    expect(missingFonts('.fonts', () => true)).toEqual([])
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run scripts/script-art/artList.test.mjs`
Expected: FAIL, cannot resolve `./artList.mjs`.

- [ ] **Step 4: Implement the art list**

`scripts/script-art/artList.mjs`:

```js
export const FONT_FILES = {
  regular: 'Gloss_And_Bloom.ttf',
  alternates: 'Gloss_And_Bloom_Alternates.ttf',
  extras: 'Gloss_And_Bloom_Extras.ttf',
}

// Names become file names, so they are restricted to lowercase kebab case.
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/
// Colours are written into SVG attributes, so only plain hex is allowed.
const HEX = /^#[0-9a-f]{6}$/i

/** Validate the contents of phrases.json. Throws with the item's name on the first problem. */
export function parseArtList(value) {
  if (!Array.isArray(value)) throw new Error('phrases.json must be a list')

  const seen = new Set()
  return value.map((item) => {
    const name = item?.name
    if (typeof name !== 'string' || !NAME.test(name)) throw new Error(`Invalid name ${JSON.stringify(name)}`)
    if (seen.has(name)) throw new Error(`Duplicate name "${name}"`)
    seen.add(name)

    if (typeof item.fill !== 'string' || !HEX.test(item.fill)) throw new Error(`"${name}": fill must be a hex colour`)
    if (item.edge !== undefined && (typeof item.edge !== 'string' || !HEX.test(item.edge))) {
      throw new Error(`"${name}": edge must be a hex colour`)
    }

    const hasText = item.text !== undefined
    const hasStroke = item.stroke !== undefined
    if (hasText === hasStroke) throw new Error(`"${name}": give either text or stroke`)
    if (hasText && (typeof item.text !== 'string' || item.text.trim() === '')) throw new Error(`"${name}": text is empty`)
    if (hasStroke && (typeof item.stroke !== 'string' || [...item.stroke].length !== 1)) {
      throw new Error(`"${name}": stroke must be one character`)
    }

    return item
  })
}

/** Font file names that are not present in `dir`. */
export function missingFonts(dir, exists) {
  return Object.values(FONT_FILES).filter((file) => !exists(`${dir}/${file}`))
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run scripts/script-art/artList.test.mjs`
Expected: PASS, 9 tests.

- [ ] **Step 6: Write the failing test for shapes**

`scripts/script-art/shape.test.mjs`:

```js
import { describe, expect, it } from 'vitest'
import { phraseShape, strokeShape } from './shape.mjs'

// A path double: one square per glyph, 100 units wide, sitting on the baseline (font y is up).
class FakePath {
  constructor(points) {
    this.points = points
  }
  scale(sx, sy) {
    return new FakePath(this.points.map(([x, y]) => [x * sx, y * sy]))
  }
  translate(dx, dy) {
    return new FakePath(this.points.map(([x, y]) => [x + dx, y + dy]))
  }
  get bbox() {
    const xs = this.points.map(([x]) => x)
    const ys = this.points.map(([, y]) => y)
    return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }
  }
  toSVG() {
    return this.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x + 0.4} ${y}`).join('') + 'Z'
  }
}

const EMPTY = new FakePath([])

/** A font double that knows `chars`. Every glyph is a square tagged with the font's label. */
function fakeFont(label, chars) {
  const glyph = (cp) => ({
    codePoints: [cp],
    label,
    advanceWidth: 100,
    path: cp === 32 ? EMPTY : new FakePath([[0, 0], [100, 0], [100, 100], [0, 100]]),
  })
  return {
    label,
    hasGlyphForCodePoint: (cp) => chars.includes(String.fromCodePoint(cp)),
    glyphForCodePoint: glyph,
    layout: (text) => {
      const glyphs = [...text].map((ch) => glyph(ch.codePointAt(0)))
      return { glyphs, positions: glyphs.map(() => ({ xAdvance: 110, xOffset: 0, yOffset: 0 })) }
    },
  }
}

const fonts = { regular: fakeFont('regular', 'ab09 '), alternates: fakeFont('alternates', 'abc ') }

describe('phraseShape', () => {
  it('lays glyphs out left to right using the layout advances, flipped so y points down', () => {
    const shape = phraseShape('ac', fonts)
    expect(shape.box).toEqual({ minX: 0, minY: -100, maxX: 210, maxY: 0 })
    expect(shape.d.match(/M/g)).toHaveLength(2)
  })

  it('rounds coordinates to whole units', () => {
    expect(phraseShape('a', fonts).d).not.toMatch(/\./)
  })

  it('skips spaces but keeps their advance', () => {
    const shape = phraseShape('a c', fonts)
    expect(shape.d.match(/M/g)).toHaveLength(2)
    expect(shape.box.maxX).toBe(320)
  })

  it('takes the lowercase b from Regular and uses its advance', () => {
    const calls = []
    const regular = { ...fonts.regular, glyphForCodePoint: (cp) => (calls.push(cp), { ...fonts.regular.glyphForCodePoint(cp), advanceWidth: 150 }) }
    const shape = phraseShape('ba', { regular, alternates: fonts.alternates })
    expect(calls).toEqual([0x62])
    expect(shape.box.maxX).toBe(250)
  })

  it('falls back to Regular for a character Alternates lacks', () => {
    const calls = []
    const regular = { ...fonts.regular, glyphForCodePoint: (cp) => (calls.push(cp), fonts.regular.glyphForCodePoint(cp)) }
    phraseShape('a09', { regular, alternates: fonts.alternates })
    expect(calls).toEqual([0x30, 0x39])
  })

  it('names the characters neither cut has', () => {
    expect(() => phraseShape('a✓z', fonts)).toThrow('Gloss And Bloom has no glyph for: ✓ z')
  })
})

describe('strokeShape', () => {
  it('returns the flipped glyph outline for a stroke key', () => {
    const extras = fakeFont('extras', 'e')
    expect(strokeShape('e', extras).box).toEqual({ minX: 0, minY: -100, maxX: 100, maxY: 0 })
  })

  it('rejects a key the Extras font does not have', () => {
    expect(() => strokeShape('z', fakeFont('extras', 'e'))).toThrow('Extras has no stroke for key "z"')
  })
})
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run scripts/script-art/shape.test.mjs`
Expected: FAIL, cannot resolve `./shape.mjs`.

- [ ] **Step 8: Implement shapes**

`scripts/script-art/shape.mjs`:

```js
const LOWERCASE_B = 0x62

const emptyBox = () => ({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })

function grow(box, b) {
  return {
    minX: Math.min(box.minX, b.minX),
    minY: Math.min(box.minY, b.minY),
    maxX: Math.max(box.maxX, b.maxX),
    maxY: Math.max(box.maxY, b.maxY),
  }
}

/** Whole units keep the brush detail and cut the file size by about a quarter. */
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n))))

// "+ 0" turns a negative zero (from flipping y) into a plain zero.
const roundBox = (box) => ({
  minX: Math.floor(box.minX) + 0,
  minY: Math.floor(box.minY) + 0,
  maxX: Math.ceil(box.maxX) + 0,
  maxY: Math.ceil(box.maxY) + 0,
})

/**
 * Outline a phrase. Alternates sets the layout and kerning; the lowercase b always
 * comes from Regular, and so does any character Alternates lacks.
 */
export function phraseShape(text, { regular, alternates }) {
  const missing = [...new Set([...text])].filter((ch) => {
    const cp = ch.codePointAt(0)
    return !alternates.hasGlyphForCodePoint(cp) && !regular.hasGlyphForCodePoint(cp)
  })
  if (missing.length > 0) throw new Error(`Gloss And Bloom has no glyph for: ${missing.join(' ')}`)

  const run = alternates.layout(text)
  let x = 0
  let d = ''
  let box = emptyBox()

  run.glyphs.forEach((laidOut, i) => {
    const position = run.positions[i]
    const cp = laidOut.codePoints[0]
    const fromRegular = cp === LOWERCASE_B || !alternates.hasGlyphForCodePoint(cp)
    const glyph = fromRegular ? regular.glyphForCodePoint(cp) : laidOut

    // Font coordinates have y pointing up; SVG has y pointing down.
    const path = glyph.path.scale(1, -1).translate(x + position.xOffset, -position.yOffset)
    const b = path.bbox
    if (Number.isFinite(b.minX)) {
      d += path.toSVG()
      box = grow(box, b)
    }

    x += fromRegular ? glyph.advanceWidth : position.xAdvance
  })

  return { d: round(d), box: roundBox(box) }
}

/** Outline one flourish from the Extras font. */
export function strokeShape(key, extras) {
  const cp = key.codePointAt(0)
  if (!extras.hasGlyphForCodePoint(cp)) throw new Error(`Extras has no stroke for key "${key}"`)
  const path = extras.glyphForCodePoint(cp).path.scale(1, -1)
  return { d: round(path.toSVG()), box: roundBox(path.bbox) }
}
```

- [ ] **Step 9: Run it to verify it passes**

Run: `npx vitest run scripts/script-art/shape.test.mjs`
Expected: PASS, 8 tests.

- [ ] **Step 10: Write the failing test for SVG output**

`scripts/script-art/svg.test.mjs`:

```js
import { describe, expect, it } from 'vitest'
import { EDGE_WIDTH, renderSvg } from './svg.mjs'

const shape = { d: 'M0 0L100 0L100 -50Z', box: { minX: 0, minY: -50, maxX: 100, maxY: 0 } }

describe('renderSvg', () => {
  it('writes a filled path sized to the shape', () => {
    expect(renderSvg(shape, { fill: '#f86343' })).toEqual({
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -50 100 50"><path d="M0 0L100 0L100 -50Z" fill="#f86343"/></svg>\n',
      width: 100,
      height: 50,
    })
  })

  it('adds an edge behind the fill and pads the box so it is not clipped', () => {
    const pad = EDGE_WIDTH / 2
    const { svg, width, height } = renderSvg(shape, { fill: '#f86343', edge: '#0c0c0c' })
    expect(svg).toContain(`viewBox="${-pad} ${-50 - pad} ${100 + EDGE_WIDTH} ${50 + EDGE_WIDTH}"`)
    expect(svg).toContain(`stroke="#0c0c0c" stroke-width="${EDGE_WIDTH}" stroke-linejoin="round" paint-order="stroke"`)
    expect(width).toBe(100 + EDGE_WIDTH)
    expect(height).toBe(50 + EDGE_WIDTH)
  })
})
```

- [ ] **Step 11: Run it to verify it fails**

Run: `npx vitest run scripts/script-art/svg.test.mjs`
Expected: FAIL, cannot resolve `./svg.mjs`.

- [ ] **Step 12: Implement SVG output**

`scripts/script-art/svg.mjs`:

```js
/** Edge thickness in font units (the fonts are 1000 units per em). */
export const EDGE_WIDTH = 60

/**
 * Render a shape as a standalone SVG. The optional edge is drawn behind the fill in
 * the section's background colour, so the lettering cuts cleanly through type it crosses.
 */
export function renderSvg({ d, box }, { fill, edge }) {
  const pad = edge ? EDGE_WIDTH / 2 : 0
  const x = box.minX - pad
  const y = box.minY - pad
  const width = box.maxX - box.minX + pad * 2
  const height = box.maxY - box.minY + pad * 2
  const edgeAttrs = edge
    ? ` stroke="${edge}" stroke-width="${EDGE_WIDTH}" stroke-linejoin="round" paint-order="stroke"`
    : ''

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}"><path d="${d}" fill="${fill}"${edgeAttrs}/></svg>\n`,
    width,
    height,
  }
}
```

- [ ] **Step 13: Run it to verify it passes**

Run: `npx vitest run scripts/script-art`
Expected: PASS, 19 tests across three files.

- [ ] **Step 14: Add the command-line entry and the source list**

`scripts/script-art/generate.mjs` (glue only: every decision it makes is in the tested modules above):

```js
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as fontkit from 'fontkit'
import { FONT_FILES, missingFonts, parseArtList } from './artList.mjs'
import { phraseShape, strokeShape } from './shape.mjs'
import { renderSvg } from './svg.mjs'

const FONT_DIR = '.fonts'
const LIST = 'src/assets/script/phrases.json'
const MANIFEST = 'src/assets/script/art.json'
const OUT_DIR = 'public/script'

const missing = missingFonts(FONT_DIR, existsSync)
if (missing.length > 0) {
  console.error(
    `script-art: missing font files in ${FONT_DIR}/:\n` +
      missing.map((file) => `  - ${file}`).join('\n') +
      '\nCopy the purchased Gloss And Bloom files there. The folder is git-ignored and must never be committed.',
  )
  process.exit(1)
}

const fonts = {
  regular: fontkit.openSync(`${FONT_DIR}/${FONT_FILES.regular}`),
  alternates: fontkit.openSync(`${FONT_DIR}/${FONT_FILES.alternates}`),
  extras: fontkit.openSync(`${FONT_DIR}/${FONT_FILES.extras}`),
}

const items = parseArtList(JSON.parse(readFileSync(LIST, 'utf8')))
mkdirSync(OUT_DIR, { recursive: true })

const manifest = {}
for (const item of items) {
  const shape = item.text !== undefined ? phraseShape(item.text, fonts) : strokeShape(item.stroke, fonts.extras)
  const { svg, width, height } = renderSvg(shape, item)
  writeFileSync(`${OUT_DIR}/${item.name}.svg`, svg)
  manifest[item.name] = { src: `/script/${item.name}.svg`, width, height }
  console.log(`script-art: wrote ${OUT_DIR}/${item.name}.svg (${width} x ${height})`)
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
```

`src/assets/script/phrases.json`:

```json
[
  { "name": "memorable", "text": "memorable", "fill": "#f86343", "edge": "#0c0c0c" },
  { "name": "lets-talk", "text": "let's talk", "fill": "#f86343", "edge": "#f4f0e6" },
  { "name": "strike", "stroke": "e", "fill": "#f86343" }
]
```

- [ ] **Step 15: Generate the artwork**

```bash
npm run script-art && cat src/assets/script/art.json && ls -la public/script
```

Expected: three "wrote" lines, a manifest with `memorable`, `lets-talk` and `strike`, and three `.svg` files. Open `public/script/lets-talk.svg` in a browser and confirm it reads "let's talk" in brush script, upright, with an ivory edge.

- [ ] **Step 16: Confirm no font file is staged, then commit**

```bash
git add package.json package-lock.json scripts/script-art src/assets/script public/script
git status --short | grep -iE "\.(ttf|otf|woff2?)$" ; echo "font files staged: $?"
git commit -m "feat: generate Gloss And Bloom script artwork as SVG from local fonts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: `font files staged: 1` (grep found nothing). If it prints `0`, unstage the font files before committing.

---

### Task 6: Disciplines data and featured-work selection

**Files:**
- Create: `src/content/disciplines.ts`, `src/content/disciplines.test.ts`, `src/lib/featuredWork.ts`, `src/lib/featuredWork.test.ts`, `src/content.config.ts`

**Interfaces:**
- Produces:
  - `src/content/disciplines.ts`: `interface Discipline { number: string; slug: string; title: string; blurb: string; description: string; deliverables: string[]; cta: string; skills: string[]; proofSlug?: string }`; `disciplines: Discipline[]` (five, in order)
  - `src/lib/featuredWork.ts`: `interface WorkEntry { id: string; data: { title: string; date: Date; tags: string[] } }`; `type TileVariant = 'tall' | 'accent' | 'dark'`; `interface WorkTile { number: string; variant: TileVariant; title: string; href: string; tags: string[] }`; `featuredWork(entries: WorkEntry[]): WorkTile[]`
  - Content collection `caseStudies`, read with `getCollection('caseStudies')`; entry `id` is the case study slug.

- [ ] **Step 1: Write the failing test for disciplines**

`src/content/disciplines.test.ts`:

```ts
import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { disciplines } from './disciplines'

const caseStudySlugs = readdirSync('src/content/case-studies').map((file) => file.replace(/\.mdx$/, ''))

describe('disciplines', () => {
  it('has five disciplines numbered 01 to 05 in order', () => {
    expect(disciplines.map((d) => d.number)).toEqual(['01', '02', '03', '04', '05'])
  })

  it('has unique slugs and the agreed titles', () => {
    expect(new Set(disciplines.map((d) => d.slug)).size).toBe(5)
    expect(disciplines.map((d) => d.title)).toEqual([
      'UX/UI Engineering',
      'SEO/AEO',
      'Agentic Workflows',
      'Brand Development',
      'SaaS Development',
    ])
  })

  it('links every proof to a real case study', () => {
    for (const d of disciplines) expect(caseStudySlugs, d.slug).toContain(d.proofSlug)
  })

  it('writes every blurb in the first person as a whole sentence', () => {
    for (const d of disciplines) {
      expect(d.blurb, d.slug).toMatch(/^I /)
      expect(d.blurb, d.slug).toMatch(/\.$/)
    }
  })

  it('has complete copy with no em or en dashes', () => {
    for (const d of disciplines) {
      expect(d.description && d.cta).toBeTruthy()
      expect(d.deliverables.length).toBeGreaterThan(0)
      expect(d.skills.length).toBeGreaterThan(0)
    }
    expect(JSON.stringify(disciplines)).not.toMatch(/[—–]/)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/content/disciplines.test.ts`
Expected: FAIL, cannot resolve `./disciplines`.

- [ ] **Step 3: Port the data and replace the blurbs**

```bash
git show feat/site-pass:src/content/disciplines.ts > src/content/disciplines.ts
```

Then make these exact edits in `src/content/disciplines.ts`:

Replace the header comment (the first five lines, from `/**` to ` */`) with:

```ts
/**
 * The five service disciplines: the single source for the Home "What I do" strip
 * and, in later sub-projects, Services, About and the Contact project-type select.
 * Blurbs are first person. Every line is a draft until the owner approves it.
 */
```

Replace each `blurb` value:

| Discipline | New `blurb` |
|---|---|
| 01 | `'I design interfaces and build them myself in production React, so nothing gets lost between design and code.'` |
| 02 | `'I fix the technical foundations and structure your content so rankings build over time.'` |
| 03 | `'I build AI agents on Claude and the AI SDK that do real work in your business.'` |
| 04 | `'I design brand identities that hold together across logo, signage and merch.'` |
| 05 | `'I build SaaS products: the marketing site, the dashboard and the integrations behind them.'` |

Leave `description`, `deliverables`, `cta`, `skills` and `proofSlug` as they are; they are rewritten with the Services page in sub-project 3.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/content/disciplines.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing test for featured work**

`src/lib/featuredWork.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { featuredWork, type WorkEntry } from './featuredWork'

const entry = (id: string, date: string, tags: string[] = ['A', 'B', 'C']): WorkEntry => ({
  id,
  data: { title: id.toUpperCase(), date: new Date(date), tags },
})

describe('featuredWork', () => {
  it('returns the three newest, newest first, numbered and assigned tile variants', () => {
    const tiles = featuredWork([
      entry('old', '2023-01-01'),
      entry('newest', '2025-11-01'),
      entry('middle', '2025-06-01'),
      entry('older', '2024-01-01'),
    ])
    expect(tiles.map((t) => [t.number, t.variant, t.href])).toEqual([
      ['01', 'tall', '/work/newest'],
      ['02', 'accent', '/work/middle'],
      ['03', 'dark', '/work/older'],
    ])
  })

  it('carries the title and the first two tags', () => {
    expect(featuredWork([entry('a', '2025-01-01', ['Branding', 'Local SEO', 'Shopify'])])[0]).toEqual({
      number: '01',
      variant: 'tall',
      title: 'A',
      href: '/work/a',
      tags: ['Branding', 'Local SEO'],
    })
  })

  it('copes with fewer than three entries', () => {
    expect(featuredWork([])).toEqual([])
    expect(featuredWork([entry('a', '2025-01-01'), entry('b', '2024-01-01')]).map((t) => t.variant)).toEqual([
      'tall',
      'accent',
    ])
  })

  it('breaks date ties by id so the order is stable', () => {
    const tiles = featuredWork([entry('b', '2025-01-01'), entry('a', '2025-01-01')])
    expect(tiles.map((t) => t.href)).toEqual(['/work/a', '/work/b'])
  })

  it('does not reorder the list it was given', () => {
    const entries = [entry('old', '2023-01-01'), entry('new', '2025-01-01')]
    featuredWork(entries)
    expect(entries.map((e) => e.id)).toEqual(['old', 'new'])
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/lib/featuredWork.test.ts`
Expected: FAIL, cannot resolve `./featuredWork`.

- [ ] **Step 7: Implement featured work**

`src/lib/featuredWork.ts`:

```ts
export interface WorkEntry {
  /** The case study slug. */
  id: string
  data: { title: string; date: Date; tags: string[] }
}

export type TileVariant = 'tall' | 'accent' | 'dark'

export interface WorkTile {
  number: string
  variant: TileVariant
  title: string
  href: string
  tags: string[]
}

const VARIANTS: TileVariant[] = ['tall', 'accent', 'dark']

/** The three most recent case studies as Home tiles, newest first. */
export function featuredWork(entries: WorkEntry[]): WorkTile[] {
  return [...entries]
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id))
    .slice(0, VARIANTS.length)
    .map((entry, i) => ({
      number: String(i + 1).padStart(2, '0'),
      variant: VARIANTS[i],
      title: entry.data.title,
      href: `/work/${entry.id}`,
      tags: entry.data.tags.slice(0, 2),
    }))
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npx vitest run src/lib/featuredWork.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 9: Define the collection**

`src/content.config.ts` (a `*.config.*` file, so no unit test):

```ts
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Only the fields Home needs. The full case study schema arrives with the Work sub-project.
// MDX bodies are not rendered yet: they still use the old <Chapter> family of components.
const caseStudies = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).min(1),
    client: z.string().optional(),
  }),
})

export const collections = { caseStudies }
```

- [ ] **Step 10: Verify the collection loads**

```bash
npm run typecheck && npm run build
```

Expected: 0 errors and a completed build. The three MDX files are indexed but not rendered, so their unknown components do not matter.

- [ ] **Step 11: Commit**

```bash
git add src/content/disciplines.ts src/content/disciplines.test.ts src/lib/featuredWork.ts src/lib/featuredWork.test.ts src/content.config.ts
git commit -m "feat: add disciplines data, the case study collection and featured-work selection

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Navigation data and UI primitives

**Files:**
- Create: `src/content/navigation.ts`, `src/content/navigation.test.ts`
- Create: `src/components/brand/Logo.astro`, `src/components/brand/ScriptArt.astro`, `src/components/ui/Button.astro`, `src/components/ui/ArrowButton.astro`, `src/components/ui/VerticalLabel.astro`

**Interfaces:**
- Consumes: `src/assets/logo/mb-mark.svg`, `src/assets/script/art.json`, the tokens and utilities from Task 1, the reveal markup contract from Task 4.
- Produces:
  - `src/content/navigation.ts`: `interface NavLink { label: string; href: string }`; `primaryNav: NavLink[]`; `contactLink: NavLink`; `footerNav: NavLink[]`; `isCurrent(href: string, pathname: string): boolean`
  - `<Logo class? />`: inline SVG in `currentColor`, `aria-hidden`.
  - `<ScriptArt name class? reveal? delay? />`: `name` is a key of `art.json`; renders a decorative `<img>`.
  - `<Button href variant? on? class?>label</Button>`: `variant: 'accent' | 'outline'` (default `accent`), `on: 'light' | 'dark'` (default `light`).
  - `<ArrowButton href label direction? />`: `direction: 'down' | 'up-right'` (default `down`).
  - `<VerticalLabel class?>text</VerticalLabel>`

- [ ] **Step 1: Write the failing test for navigation**

`src/content/navigation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { contactLink, footerNav, isCurrent, primaryNav } from './navigation'

describe('navigation', () => {
  it('lists the primary pages in order', () => {
    expect(primaryNav).toEqual([
      { label: 'Work', href: '/work' },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
    ])
  })

  it('sends the call to action to contact', () => {
    expect(contactLink).toEqual({ label: 'Start a project', href: '/contact' })
  })

  it('adds Contact to the footer and keeps hrefs unique', () => {
    expect(footerNav.map((l) => l.label)).toEqual(['Work', 'Services', 'About', 'Blog', 'Contact'])
    expect(new Set(footerNav.map((l) => l.href)).size).toBe(footerNav.length)
  })
})

describe('isCurrent', () => {
  it('matches the page itself, with or without a trailing slash', () => {
    expect(isCurrent('/work', '/work')).toBe(true)
    expect(isCurrent('/work', '/work/')).toBe(true)
  })

  it('matches pages beneath it', () => {
    expect(isCurrent('/work', '/work/vamp-network')).toBe(true)
  })

  it('does not match a different page that shares a prefix', () => {
    expect(isCurrent('/work', '/workshop')).toBe(false)
    expect(isCurrent('/work', '/')).toBe(false)
  })

  it('only matches home exactly', () => {
    expect(isCurrent('/', '/')).toBe(true)
    expect(isCurrent('/', '/work')).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/content/navigation.test.ts`
Expected: FAIL, cannot resolve `./navigation`.

- [ ] **Step 3: Implement navigation**

`src/content/navigation.ts`:

```ts
export interface NavLink {
  label: string
  href: string
}

export const primaryNav: NavLink[] = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
]

export const contactLink: NavLink = { label: 'Start a project', href: '/contact' }

export const footerNav: NavLink[] = [...primaryNav, { label: 'Contact', href: '/contact' }]

/** Whether `pathname` is the page at `href` or a page beneath it. */
export function isCurrent(href: string, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  if (href === '/') return path === '/'
  return path === href || path.startsWith(`${href}/`)
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/content/navigation.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Load the design skills**

Before writing any `.astro` styling in this or later tasks, load `industrial-brutalist-ui`, `high-end-visual-design`, `frontend-design` and `design-taste-frontend`. Use them to refine spacing and detail. They do not change the palette, typefaces, section order or copy.

- [ ] **Step 6: Create the primitives**

`src/components/brand/Logo.astro`:

```astro
---
import mark from '../../assets/logo/mb-mark.svg?raw'

interface Props {
  class?: string
}

const { class: className } = Astro.props
---

<span class:list={['block [&>svg]:block [&>svg]:h-auto [&>svg]:w-full', className]} aria-hidden="true" set:html={mark} />
```

`src/components/brand/ScriptArt.astro`:

```astro
---
import art from '../../assets/script/art.json'

interface Props {
  /** A name from src/assets/script/phrases.json. */
  name: keyof typeof art
  class?: string
  reveal?: 'wipe' | 'fade'
  /** Seconds. */
  delay?: number
}

const { name, class: className, reveal, delay } = Astro.props
const { src, width, height } = art[name]
---

<img
  src={src}
  width={width}
  height={height}
  alt=""
  aria-hidden="true"
  loading="lazy"
  decoding="async"
  class:list={['pointer-events-none max-w-none select-none', className]}
  data-reveal={reveal}
  data-reveal-delay={delay}
/>
```

`src/components/ui/Button.astro`:

```astro
---
interface Props {
  href: string
  variant?: 'accent' | 'outline'
  /** The background the button sits on; decides the hover colours. */
  on?: 'light' | 'dark'
  class?: string
}

const { href, variant = 'accent', on = 'light', class: className } = Astro.props

const styles = {
  accent: on === 'dark' ? 'bg-vermilion text-ink hover:bg-ivory' : 'bg-vermilion text-ink hover:bg-ink hover:text-ivory',
  outline: 'border-2 border-ink text-ink hover:bg-ink hover:text-ivory',
}
---

<a
  href={href}
  class:list={[
    'type-label group inline-flex items-center gap-2 px-5 py-3.5 transition-colors duration-200',
    styles[variant],
    className,
  ]}
>
  <slot />
  <span
    aria-hidden="true"
    class="inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
    >↗</span
  >
</a>
```

`src/components/ui/ArrowButton.astro`:

```astro
---
interface Props {
  href: string
  /** Accessible name, since the button shows only an arrow. */
  label: string
  direction?: 'down' | 'up-right'
  class?: string
}

const { href, label, direction = 'down', class: className } = Astro.props
---

<a
  href={href}
  aria-label={label}
  class:list={[
    'grid size-14 place-items-center bg-ink text-xl text-ivory transition-colors duration-200 hover:bg-ivory hover:text-ink lg:size-[4.5rem]',
    className,
  ]}
>
  <span aria-hidden="true">{direction === 'down' ? '↓' : '↗'}</span>
</a>
```

`src/components/ui/VerticalLabel.astro`:

```astro
---
interface Props {
  class?: string
}

const { class: className } = Astro.props
---

<span class:list={['type-label inline-block rotate-180 [writing-mode:vertical-rl]', className]}><slot /></span>
```

- [ ] **Step 7: Verify**

```bash
npm run typecheck && npm run build
```

Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/content/navigation.ts src/content/navigation.test.ts src/components/brand src/components/ui
git commit -m "feat: add navigation data and the logo, script art, button and label primitives

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Site shell: header, mobile menu, footer

**Files:**
- Create: `src/components/nav/focusTrap.ts`, `src/components/nav/focusTrap.test.ts`, `src/components/nav/MobileMenu.tsx`, `src/components/nav/MobileMenu.test.tsx`, `src/components/nav/SiteHeader.astro`, `src/components/nav/SiteFooter.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `NavLink`, `primaryNav`, `contactLink`, `footerNav`, `isCurrent` from `src/content/navigation.ts`; `Logo`, `Button` from Task 7; `initReveals` from `src/lib/reveal.ts`; `changeMatchMedia`, `installMatchMedia`, `DESKTOP_QUERY` from `src/test/matchMedia.ts`.
- Produces: `nextFocusIndex(current: number, count: number, backwards: boolean): number`; `MobileMenu` (named and default export) with props `{ links: NavLink[]; contact: NavLink; pathname: string }`; `<SiteHeader />`; `<SiteFooter />`; a layout with `<body id="top">`, a skip link, `<main id="main" tabindex="-1">`, and reveals initialised on every page.

- [ ] **Step 1: Write the failing test for the focus trap**

`src/components/nav/focusTrap.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { nextFocusIndex } from './focusTrap'

describe('nextFocusIndex', () => {
  it('moves forward and wraps to the start', () => {
    expect(nextFocusIndex(0, 3, false)).toBe(1)
    expect(nextFocusIndex(2, 3, false)).toBe(0)
  })

  it('moves backward and wraps to the end', () => {
    expect(nextFocusIndex(1, 3, true)).toBe(0)
    expect(nextFocusIndex(0, 3, true)).toBe(2)
  })

  it('enters the trap from outside at the nearest end', () => {
    expect(nextFocusIndex(-1, 3, false)).toBe(0)
    expect(nextFocusIndex(-1, 3, true)).toBe(2)
  })

  it('returns -1 when there is nothing to focus', () => {
    expect(nextFocusIndex(0, 0, false)).toBe(-1)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/nav/focusTrap.test.ts`
Expected: FAIL, cannot resolve `./focusTrap`.

- [ ] **Step 3: Implement the focus trap**

`src/components/nav/focusTrap.ts`:

```ts
/** Index to focus when Tab is pressed inside a trap of `count` items; -1 if there are none. */
export function nextFocusIndex(current: number, count: number, backwards: boolean): number {
  if (count === 0) return -1
  if (current < 0) return backwards ? count - 1 : 0
  return (current + (backwards ? -1 : 1) + count) % count
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/nav/focusTrap.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing test for the mobile menu**

`src/components/nav/MobileMenu.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { describe, expect, it } from 'vitest'
import { changeMatchMedia, DESKTOP_QUERY } from '../../test/matchMedia'
import { MobileMenu } from './MobileMenu'

const links = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
]
const contact = { label: 'Start a project', href: '/contact' }

function setup(pathname = '/') {
  const user = userEvent.setup()
  render(<MobileMenu links={links} contact={contact} pathname={pathname} />)
  return { user, toggle: screen.getByRole('button', { name: 'Open menu' }) }
}

describe('MobileMenu', () => {
  it('starts closed with no links rendered', () => {
    const { toggle } = setup()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('opens to show every link and the call to action', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument()
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['/work', '/about', '/contact'])
  })

  it('marks the current page', async () => {
    const { user, toggle } = setup('/work/vamp-network')
    await user.click(toggle)
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('closes on Escape and returns focus to the toggle', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
  })

  it('locks page scroll while open and restores the previous value', async () => {
    document.body.style.overflow = 'clip'
    const { user, toggle } = setup()
    await user.click(toggle)
    expect(document.body.style.overflow).toBe('hidden')
    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).toBe('clip')
    document.body.style.overflow = ''
  })

  it('keeps Tab inside the toggle and the menu', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    await user.tab()
    expect(screen.getByRole('link', { name: 'Work' })).toHaveFocus()
    await user.tab()
    await user.tab()
    expect(screen.getByRole('link', { name: /Start a project/ })).toHaveFocus()
    await user.tab()
    expect(toggle).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('link', { name: /Start a project/ })).toHaveFocus()
  })

  it('closes and unlocks scroll when the viewport reaches the desktop width', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    act(() => changeMatchMedia({ [DESKTOP_QUERY]: true }))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/components/nav/MobileMenu.test.tsx`
Expected: FAIL, cannot resolve `./MobileMenu`.

- [ ] **Step 7: Implement the mobile menu**

`src/components/nav/MobileMenu.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { isCurrent, type NavLink } from '../../content/navigation'
import { nextFocusIndex } from './focusTrap'

/** Tailwind's md breakpoint, where the desktop nav takes over. */
const DESKTOP_QUERY = '(min-width: 768px)'

interface Props {
  links: NavLink[]
  contact: NavLink
  pathname: string
}

/**
 * Full-screen mobile navigation, built as a disclosure. Focus is trapped between
 * the toggle and the menu, Escape closes and returns focus to the toggle, and page
 * scroll is locked while open.
 */
export function MobileMenu({ links, contact, pathname }: Props) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  // The panel is hidden at md and up, so an open menu would leave the page locked.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e: { matches: boolean }) => {
      if (e.matches) setOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) toggleRef.current?.focus()
      wasOpen.current = false
      return
    }
    wasOpen.current = true
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      [toggleRef.current, ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href]') ?? [])].filter(
        (el): el is HTMLElement => el !== null,
      )

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      const next = nextFocusIndex(items.indexOf(document.activeElement as HTMLElement), items.length, e.shiftKey)
      if (next < 0) return
      e.preventDefault()
      items[next].focus()
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <div>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className={`relative z-[60] grid size-11 place-items-center ${open ? 'text-ivory' : 'text-ink'}`}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
            <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          <svg width="26" height="16" viewBox="0 0 20 12" fill="none" aria-hidden="true">
            <line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="2" />
            <line x1="0" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </button>

      {open && (
        <div ref={panelRef} id="mobile-menu" className="fixed inset-0 z-50 flex flex-col bg-ink px-6 pb-10 pt-28 text-ivory">
          <nav aria-label="Mobile">
            <ul role="list" className="space-y-3">
              {links.map(({ label, href }) => {
                const current = isCurrent(href, pathname)
                return (
                  <li key={href}>
                    <a
                      href={href}
                      aria-current={current ? 'page' : undefined}
                      className={`type-display block text-[clamp(3rem,16vw,5rem)] ${current ? 'text-vermilion' : ''}`}
                    >
                      {label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          <a href={contact.href} className="type-label mt-auto inline-flex items-center gap-2 self-start bg-vermilion px-5 py-3.5 text-ink">
            {contact.label}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </div>
  )
}

export default MobileMenu
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npx vitest run src/components/nav`
Expected: PASS, 11 tests, no warnings in the output.

- [ ] **Step 9: Build the header and footer**

`src/components/nav/SiteHeader.astro`:

```astro
---
import Logo from '../brand/Logo.astro'
import Button from '../ui/Button.astro'
import MobileMenu from './MobileMenu.tsx'
import { contactLink, isCurrent, primaryNav } from '../../content/navigation'

const { pathname } = Astro.url
---

<header class="absolute inset-x-0 top-0 z-40">
  <div class="mx-auto flex max-w-[1600px] items-center gap-10 px-6 py-5 md:px-12">
    <a href="/" aria-label="Mathew Brown, home" class="block w-16 text-ink md:w-[4.5rem]"><Logo /></a>
    <nav aria-label="Primary" class="hidden md:block lg:ml-8">
      <ul role="list" class="flex gap-10 lg:gap-14">
        {
          primaryNav.map(({ label, href }) => (
            <li>
              <a
                href={href}
                aria-current={isCurrent(href, pathname) ? 'page' : undefined}
                class="type-label underline-offset-8 decoration-vermilion decoration-2 hover:underline aria-[current=page]:underline"
              >
                {label}
              </a>
            </li>
          ))
        }
      </ul>
    </nav>
    <div class="ml-auto hidden md:block"><Button href={contactLink.href}>{contactLink.label}</Button></div>
    <div class="ml-auto md:hidden">
      <MobileMenu client:media="(max-width: 767px)" links={primaryNav} contact={contactLink} pathname={pathname} />
    </div>
  </div>
</header>
```

`src/components/nav/SiteFooter.astro`:

```astro
---
import Logo from '../brand/Logo.astro'
import { footerNav } from '../../content/navigation'
---

<footer class="bg-ink text-ivory">
  <div class="mx-auto flex max-w-[1600px] flex-col gap-8 px-6 py-8 md:flex-row md:items-center md:gap-12 md:px-12">
    <a href="/" aria-label="Mathew Brown, home" class="block w-16"><Logo /></a>
    <nav aria-label="Footer">
      <ul role="list" class="flex flex-wrap gap-x-10 gap-y-3">
        {
          footerNav.map(({ label, href }) => (
            <li>
              <a href={href} class="type-label underline-offset-8 decoration-vermilion decoration-2 hover:underline">
                {label}
              </a>
            </li>
          ))
        }
      </ul>
    </nav>
    <a href="#top" class="type-label opacity-70 hover:opacity-100 md:ml-auto">Back to top <span aria-hidden="true">↑</span></a>
  </div>
</footer>
```

- [ ] **Step 10: Wire the shell into the layout**

In `src/layouts/BaseLayout.astro`, add to the frontmatter imports:

```astro
import SiteHeader from '../components/nav/SiteHeader.astro'
import SiteFooter from '../components/nav/SiteFooter.astro'
```

Replace the whole `<body>...</body>` block with:

```astro
  <body id="top">
    <a
      href="#main"
      class="type-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-3 focus:text-ivory"
      >Skip to content</a
    >
    <SiteHeader />
    <main id="main" tabindex="-1" class="outline-none">
      <slot />
    </main>
    <SiteFooter />
    <script>
      import { initReveals } from '../lib/reveal'
      initReveals()
    </script>
  </body>
```

- [ ] **Step 11: Verify**

```bash
npx vitest run && npm run typecheck && npm run build && grep -c "Skip to content" dist/index.html
```

Expected: all tests pass, 0 type errors, the build completes, and the count is `1`.

- [ ] **Step 12: Commit**

```bash
git add src/components/nav src/layouts/BaseLayout.astro
git commit -m "feat: add the site header, mobile menu island and footer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Hero

**Files:**
- Create: `src/components/home/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `ArrowButton`, `VerticalLabel`; `src/assets/portraits/hero.png`; `startTypewriter` from `src/lib/typewriterElement.ts`; `parseWords` from `src/lib/typewriter.ts`; the `.caret` class; the reveal markup contract.
- Produces: `<Hero />`. The section after it must carry `id="what-i-do"` (Task 10), which the arrow button scrolls to.

Target: the hero in the reference image. At `lg` and up it is an absolutely positioned composition that fills the first viewport. Below `lg` it stacks: word, `h1` and description, then the portrait over a full-width vermilion block.

- [ ] **Step 1: Create the hero**

`src/components/home/Hero.astro`:

```astro
---
import { Image } from 'astro:assets'
import portrait from '../../assets/portraits/hero.png'
import ArrowButton from '../ui/ArrowButton.astro'
import VerticalLabel from '../ui/VerticalLabel.astro'

const words = ['ux', 'ui', 'seo', 'ai']
---

<section class="relative isolate overflow-hidden bg-ivory lg:h-svh lg:max-h-[1000px] lg:min-h-[640px]">
  {/* Rotating word. Decorative: the h1 below carries the meaning. */}
  <p
    class="font-display px-6 pt-28 text-[clamp(6rem,15.5vw,15rem)] leading-[0.9] md:px-12 lg:absolute lg:left-0 lg:top-[29%] lg:pt-0"
    aria-hidden="true"
  >
    <span data-typewriter data-words={words.join(',')}>{words[0]}</span>.<span class="caret"></span>
  </p>

  <div
    class="relative z-10 grid max-w-xl gap-5 px-6 pt-8 md:px-12 lg:absolute lg:left-[33%] lg:top-[24%] lg:w-[27%] lg:max-w-none lg:grid-cols-2 lg:gap-8 lg:px-0 lg:pt-0"
  >
    <h1 class="type-label before:mb-3 before:block before:h-0.5 before:w-10 before:bg-ink">
      UX/UI Engineer, SEO Specialist &amp; AI Workflow Developer
    </h1>
    <p class="type-label font-medium">
      I'm Mathew Brown. I design and build interfaces, get them found in search, and automate the busywork with AI
      agents.
    </p>
  </div>

  <VerticalLabel class="absolute right-6 top-28 hidden border-r-2 border-ink pr-2 text-sm md:right-12 lg:top-[14%] lg:block">
    Mathew Brown<br />Freelance<br />Available 2026
  </VerticalLabel>

  <p
    class="font-display absolute bottom-[6%] left-12 hidden rotate-180 text-[clamp(3rem,6.6vw,6.5rem)] leading-none [writing-mode:vertical-rl] lg:block"
    aria-hidden="true"
  >
    001
  </p>

  <div class="relative mt-10 h-[110vw] max-h-[720px] lg:static lg:mt-0 lg:h-auto lg:max-h-none">
    <Image
      src={portrait}
      alt="Mathew Brown"
      widths={[480, 720, 952]}
      sizes="(min-width: 1024px) 32vw, 60vw"
      loading="eager"
      fetchpriority="high"
      class="absolute bottom-0 right-[10%] h-[96%] w-auto lg:right-[13%] lg:h-[93%]"
      data-reveal="rise"
      data-reveal-on="load"
      data-reveal-delay="0.25"
    />
    <div
      class="absolute inset-x-0 bottom-0 top-1/2 bg-vermilion mix-blend-multiply lg:left-[33%]"
      data-reveal="wipe"
      data-reveal-on="load"
    >
    </div>
    <ArrowButton href="#what-i-do" label="Scroll to what I do" class="absolute bottom-[6%] left-6 md:left-12 lg:left-[33%]" />
  </div>
</section>

<script>
  import { parseWords } from '../../lib/typewriter'
  import { startTypewriter } from '../../lib/typewriterElement'

  // Start after the block has wiped in and the portrait has risen.
  document.querySelectorAll<HTMLElement>('[data-typewriter]').forEach((el) => {
    startTypewriter(el, parseWords(el.dataset.words), { startDelay: 1400 })
  })
</script>
```

- [ ] **Step 2: Put it on the page**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import Hero from '../components/home/Hero.astro'
---

<BaseLayout
  title="UX/UI Engineer, SEO Specialist & AI Workflow Developer"
  description="I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer."
>
  <Hero />
</BaseLayout>
```

- [ ] **Step 3: Check it in the browser and tune it**

Start `npx astro dev --port 4321` in the background and open `http://localhost:4321` with the Playwright MCP tools at 1440x900. Compare with the hero in the reference image and adjust the classes above until these all hold:

- The word, the text column, the portrait, the block, the arrow button, the vertical label and "001" sit where they do in the reference.
- The longest word, "seo.", and its caret end clear of the text column and the block.
- The vermilion block tints the lower half of the portrait (arms and jeans turn red; the black shirt stays black).
- The whole hero fits in the first viewport at 1440x900.
- At 390x844 everything stacks with no horizontal scroll and no overlapping text.
- With `prefers-reduced-motion: reduce` emulated, the word shows "ux." and nothing animates.

- [ ] **Step 4: Verify the static output**

```bash
npm run typecheck && npm run build && grep -o "<h1[^>]*>[^<]*" dist/index.html && grep -c 'data-typewriter[^>]*>ux<' dist/index.html
```

Expected: 0 errors, the `h1` text is printed, and the count is `1` (the first word is in the prerendered HTML).

- [ ] **Step 5: Commit**

```bash
git add src/components/home/Hero.astro src/pages/index.astro
git commit -m "feat: add the Home hero with the rotating word and tinted portrait

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Discipline strip and statement band

**Files:**
- Create: `src/components/home/DisciplineStrip.astro`, `src/components/home/StatementBand.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `disciplines` from `src/content/disciplines.ts`; `VerticalLabel`, `Button`, `ScriptArt` (names `strike`, `memorable`); `contactLink` from `src/content/navigation.ts`.
- Produces: `<DisciplineStrip />` (root has `id="what-i-do"`), `<StatementBand />`.

- [ ] **Step 1: Create the discipline strip**

`src/components/home/DisciplineStrip.astro`:

```astro
---
import VerticalLabel from '../ui/VerticalLabel.astro'
import { disciplines } from '../../content/disciplines'
---

<section id="what-i-do" class="bg-ink text-ivory" aria-labelledby="what-i-do-heading">
  <h2 id="what-i-do-heading" class="sr-only">
    What I do: UX/UI Engineering, SEO/AEO, Agentic Workflows, Brand Development and SaaS Development
  </h2>
  <div class="mx-auto flex max-w-[1600px]">
    <div class="hidden w-20 shrink-0 items-center justify-center lg:flex" aria-hidden="true">
      <VerticalLabel>What I do</VerticalLabel>
    </div>
    <ul role="list" class="grid flex-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {
        disciplines.map((d, i) => (
          <li class="border-b border-line-dark lg:border-b-0 lg:border-l">
            <a
              href={`/services#${d.slug}`}
              class="group flex h-full flex-col px-6 py-8 transition-colors duration-200 hover:bg-ivory hover:text-ink lg:px-7 lg:py-10"
              data-reveal="rise"
              data-reveal-delay={i * 0.08}
            >
              <span class="type-label text-base text-vermilion">{d.number}</span>
              <h3 class="type-display mt-3 text-[clamp(1.5rem,1.9vw,2rem)]">{d.title}</h3>
              <p class="type-label mt-4 font-medium opacity-80">{d.blurb}</p>
              <span class="mt-6 text-xl lg:mt-auto lg:pt-6" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))
      }
    </ul>
  </div>
</section>
```

The `0.08` step is `STAGGER` from `src/lib/motionTokens.ts`; it is repeated as a literal here only because `.astro` frontmatter should stay free of logic. If you change `STAGGER`, change it here.

- [ ] **Step 2: Create the statement band**

`src/components/home/StatementBand.astro`:

```astro
---
import ScriptArt from '../brand/ScriptArt.astro'
import Button from '../ui/Button.astro'
import { contactLink } from '../../content/navigation'
---

<section class="border-t border-line-dark bg-ink text-ivory">
  <div
    class="mx-auto grid max-w-[1600px] gap-10 px-6 pb-16 pt-32 md:px-12 lg:grid-cols-[1fr_auto] lg:items-end lg:pb-20 lg:pt-40"
  >
    {/* Read aloud as "I build memorable websites." The struck word and the artwork are decorative. */}
    <h2 class="type-display text-[clamp(3.25rem,9.6vw,10rem)]">
      I build
      <span class="relative inline-block">
        <span class="opacity-40" aria-hidden="true">average</span>
        <span class="sr-only">memorable</span>
        <ScriptArt name="strike" class="absolute left-[-5%] top-[36%] w-[112%] -rotate-3" reveal="wipe" delay={0.2} />
        <ScriptArt name="memorable" class="absolute bottom-[72%] left-[10%] w-[118%] -rotate-6" reveal="wipe" delay={0.5} />
      </span>
      <br />
      websites.
    </h2>
    <div class="max-w-xs">
      <p class="type-label">I design them to be remembered and build them to rank.</p>
      <Button href={contactLink.href} on="dark" class="mt-5">{contactLink.label}</Button>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add both to the page**

In `src/pages/index.astro`, add the imports:

```astro
import DisciplineStrip from '../components/home/DisciplineStrip.astro'
import StatementBand from '../components/home/StatementBand.astro'
```

and place them after `<Hero />`:

```astro
  <DisciplineStrip />
  <StatementBand />
```

- [ ] **Step 4: Check it in the browser and tune it**

At 1440x900, compare with the reference and adjust classes until:

- The strip shows five columns with vermilion numbers, Anton titles, blurbs and arrows, and the rotated "What I do" label on the left.
- Each column is one link; hovering it inverts to ivory with ink text.
- The brush stroke runs through the middle of "average" at a slight angle and reads as a strikethrough.
- "memorable" sits above "average", angled, and does not cover "I build" or "websites."
- At 1024 the strip is three across; at 390 it is one column and the headline wraps without the artwork covering another word. If the artwork cannot sit cleanly at 390, hide "memorable" below `sm` with `hidden sm:block` and keep the strikethrough.
- The arrow button in the hero scrolls to the strip.

- [ ] **Step 5: Verify**

```bash
npm run typecheck && npm run build && grep -c 'class="sr-only">memorable<' dist/index.html && grep -c 'aria-hidden="true">average<' dist/index.html && grep -c 'href="/services#' dist/index.html
```

Expected: 0 errors, then `1`, `1` and `5`: the corrected word is present for screen readers, the struck word is hidden from them, and all five disciplines link to Services.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/DisciplineStrip.astro src/components/home/StatementBand.astro src/pages/index.astro
git commit -m "feat: add the discipline strip and the struck-through statement band

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Featured work, About teaser and contact band

**Files:**
- Create: `src/components/home/FeaturedWork.astro`, `src/components/home/AboutTeaser.astro`, `src/components/home/ContactBand.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getCollection('caseStudies')`; `featuredWork`, `WorkTile` from `src/lib/featuredWork.ts`; `src/assets/portraits/about.png`; `Button`, `ScriptArt` (name `lets-talk`); `contactLink`.
- Produces: `<FeaturedWork />`, `<AboutTeaser />`, `<ContactBand />`.

- [ ] **Step 1: Create featured work**

`src/components/home/FeaturedWork.astro`:

```astro
---
import { getCollection } from 'astro:content'
import { featuredWork } from '../../lib/featuredWork'

const tiles = featuredWork(await getCollection('caseStudies'))

// Small vermilion text is only allowed on ink, so only the dark tile gets a vermilion number.
const surface = {
  tall: 'bg-stone text-ink md:row-span-2',
  accent: 'bg-vermilion text-ink',
  dark: 'bg-ink text-ivory',
}
---

<section class="bg-ivory" aria-labelledby="featured-work-heading">
  <div class="mx-auto max-w-[1600px] px-6 pb-12 pt-20 md:px-12 lg:pb-16 lg:pt-24 lg:pr-0">
    <h2 id="featured-work-heading" class="type-display text-[clamp(3rem,7.4vw,7.5rem)]" data-reveal="rise">Featured work</h2>
    <div class="mt-8 flex flex-col gap-4 lg:mt-12 lg:flex-row">
      <ul role="list" class="grid flex-1 gap-4 md:auto-rows-[minmax(13rem,15vw)] md:grid-cols-[1.15fr_1fr]">
        {
          tiles.map((tile, i) => (
            <li class:list={[surface[tile.variant]]} data-reveal="rise" data-reveal-delay={i * 0.08}>
              <a href={tile.href} class="group flex h-full min-h-52 flex-col p-6 lg:p-7">
                <span class:list={['type-label text-sm', tile.variant === 'dark' && 'text-vermilion']}>{tile.number} /</span>
                <h3 class="type-display mt-2 max-w-[9ch] text-[clamp(2rem,3.1vw,3.25rem)]">{tile.title}</h3>
                <p class="type-label mt-3 font-medium">{tile.tags.join(', ')}</p>
                <span
                  class="mt-auto inline-block pt-6 text-2xl transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            </li>
          ))
        }
      </ul>
      <a
        href="/work"
        class="type-label flex items-center justify-center gap-2 bg-vermilion px-5 py-4 text-ink transition-colors duration-200 hover:bg-ink hover:text-ivory lg:w-[5.5rem] lg:rotate-180 lg:justify-start lg:px-0 lg:py-8 lg:[writing-mode:vertical-rl]"
      >
        View all projects <span aria-hidden="true">↗</span>
      </a>
    </div>
  </div>
</section>
```

The arrow nudge on the tiles moves only the small glyph, not the tile, so it does not trigger the dark-surface compositing artifact.

- [ ] **Step 2: Create the About teaser**

`src/components/home/AboutTeaser.astro`:

```astro
---
import { Image } from 'astro:assets'
import portrait from '../../assets/portraits/about.png'
import Button from '../ui/Button.astro'
---

<section class="relative isolate overflow-hidden bg-ivory lg:h-[40vw] lg:max-h-[640px] lg:min-h-[480px]" aria-labelledby="about-heading">
  <p
    class="type-display px-6 pt-10 text-[clamp(4rem,11vw,11rem)] leading-[0.86] md:px-12 lg:absolute lg:bottom-[7%] lg:left-12 lg:top-[7%] lg:rotate-180 lg:px-0 lg:pt-0 lg:[writing-mode:vertical-rl]"
    aria-hidden="true"
  >
    Mathew
  </p>

  <div class="relative h-[90vw] max-h-[560px] lg:static lg:h-auto lg:max-h-none">
    <Image
      src={portrait}
      alt="Mathew Brown in profile"
      widths={[480, 720, 1000]}
      sizes="(min-width: 1024px) 30vw, 70vw"
      class="absolute bottom-0 left-[14%] h-[96%] w-auto lg:left-[27%]"
    />
    <div class="absolute inset-x-0 bottom-0 top-[47%] bg-vermilion mix-blend-multiply lg:right-auto lg:w-[58%]" data-reveal="wipe"></div>
  </div>

  <div class="relative z-10 max-w-xl px-6 py-12 md:px-12 lg:absolute lg:left-[60%] lg:right-12 lg:top-[26%] lg:max-w-none lg:p-0">
    <h2 id="about-heading" class="type-display text-[clamp(2.5rem,4.2vw,4.25rem)]">
      Freelance UX/UI Engineer &amp; SEO Specialist
    </h2>
    <p class="mt-5 max-w-md text-base leading-relaxed">
      I'm a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer.
    </p>
    <Button href="/about" variant="outline" class="mt-7">More about me</Button>
  </div>
</section>
```

On mobile the vertical name is set horizontally above the portrait, as the spec describes.

- [ ] **Step 3: Create the contact band**

`src/components/home/ContactBand.astro`:

```astro
---
import ScriptArt from '../brand/ScriptArt.astro'
import Button from '../ui/Button.astro'
import { contactLink } from '../../content/navigation'
---

<section class="overflow-hidden bg-ivory" aria-labelledby="contact-heading">
  <div class="mx-auto max-w-[1600px] px-6 pb-14 pt-16 md:px-12 lg:pb-16 lg:pt-20">
    <h2 id="contact-heading" class="type-display relative inline-block text-[clamp(3.5rem,11.5vw,12rem)]">
      Got a project?
      <ScriptArt name="lets-talk" class="absolute left-[78%] top-[52%] w-[62%] -rotate-[8deg]" reveal="wipe" delay={0.2} />
    </h2>
    <div class="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-14">
      <Button href={contactLink.href}>{contactLink.label}</Button>
      <a href="mailto:mat@matbrown.io" class="type-label underline-offset-8 decoration-vermilion decoration-2 hover:underline">
        mat@matbrown.io
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Assemble the page**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import Hero from '../components/home/Hero.astro'
import DisciplineStrip from '../components/home/DisciplineStrip.astro'
import StatementBand from '../components/home/StatementBand.astro'
import FeaturedWork from '../components/home/FeaturedWork.astro'
import AboutTeaser from '../components/home/AboutTeaser.astro'
import ContactBand from '../components/home/ContactBand.astro'
---

<BaseLayout
  title="UX/UI Engineer, SEO Specialist & AI Workflow Developer"
  description="I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer."
>
  <Hero />
  <DisciplineStrip />
  <StatementBand />
  <FeaturedWork />
  <AboutTeaser />
  <ContactBand />
</BaseLayout>
```

- [ ] **Step 5: Check it in the browser and tune it**

At 1440x900, compare each section with the reference and adjust classes until:

- **Featured work:** plain Anton heading with no brush stroke; one tall stone tile on the left and two stacked tiles (vermilion, ink) on the right; a vermilion "View all projects" bar down the right edge, reading bottom to top. Tiles are in date order: 'Aiwi Waffles, then the other two by date.
- **About teaser:** "Mathew" vertical on the left; the vermilion block runs from the left page edge across the lower half, behind the name and tinting the portrait; the heading, sentence and outlined button sit on the right. No script artwork.
- **Contact band:** ivory; ink "Got a project?"; vermilion "let's talk" written over the bottom right corner of "project?" with an ivory edge that cuts through the letters; the button and email sit below the headline on the left and do not touch the script.
- **No rules** between Featured work, the About teaser and the contact band.
- At 390 every section stacks with no horizontal scroll. If "let's talk" runs off screen at 390, anchor it under the headline's last line with `max-sm:static max-sm:mt-2 max-sm:w-3/5 max-sm:rotate-[-4deg]`.

- [ ] **Step 6: Verify**

```bash
npm run typecheck && npm run build && grep -o 'href="/work/[a-z-]*"' dist/index.html && grep -c "<h2" dist/index.html
```

Expected: 0 errors; three `/work/<slug>` links, newest case study first; `5` `h2` elements.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/FeaturedWork.astro src/components/home/AboutTeaser.astro src/components/home/ContactBand.astro src/pages/index.astro
git commit -m "feat: add featured work, the About teaser and the contact band to Home

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Docs

**Files:**
- Modify: `PRODUCT.md`, `DESIGN.md`, `CLAUDE.md`, `MEMORY.md`

**Interfaces:**
- Consumes: the spec and the finished build.
- Produces: docs that describe the site as it now is.

- [ ] **Step 1: Update `PRODUCT.md`**

Keep the "Register", "Users", "Product Purpose" and "Accessibility & Inclusion" sections. Change the service count in "Product Purpose" from three areas to five disciplines (UX/UI Engineering, SEO/AEO, Agentic Workflows, Brand Development, SaaS Development). Replace the "Brand Personality", "Anti-references" and "Design Principles" sections with:

```markdown
## Brand Personality

Bold, direct, specific. The site is loud in its type and plain in its claims. The emotional target is unchanged: clients feel they have found the right person and are comfortable committing a real budget.

## Anti-references

- Generic developer portfolio templates (hero, skill bars, project grid)
- SaaS marketing cream aesthetic (Inter, white backgrounds, teal accents, identical feature cards)
- Brutalism as costume: noise, distortion or clutter that gets in the way of reading
- Exaggerated or unsupported claims, however confidently set
- Agency sites that prioritize awards over clarity

## Design Principles

1. **Practice what you preach.** The portfolio is itself a UX/UI deliverable. Every layout, type and interaction choice is a live demonstration of the work on offer.
2. **Loud type, plain claims.** The attitude lives in scale, colour blocking and composition. The words stay specific and true.
3. **Expertise through specificity.** Every claim names the tool, the client or the result. Nothing is stated that the owner has not supplied.
4. **One voice.** All copy is first person. Five disciplines read as one person's practice, not five pitches.
5. **The site closes the deal.** Every page answers a question a client has before they ask it, and leads to contact.
```

- [ ] **Step 2: Replace `DESIGN.md`**

Replace the whole file with:

```markdown
---
name: Mathew Brown Portfolio
description: Brutalist freelance portfolio on a light ground. UX/UI engineer, SEO specialist, agentic workflow developer.
colors:
  ivory: "#f4f0e6"
  ink: "#0c0c0c"
  vermilion: "#f86343"
  stone: "#e4dfd3"
typography:
  display:
    fontFamily: "Anton, Impact, sans-serif"
    fontWeight: 400
    textTransform: uppercase
    lineHeight: 0.98
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.08em"
    textTransform: uppercase
---

# Design

Source of truth: `docs/superpowers/specs/2026-10-12-design-foundation-home-design.md` and its reference image in `docs/superpowers/specs/assets/`.

## Colour

- Ivory is the page. Ink is text on ivory and the background of dark sections. Vermilion is the only accent. Stone is a neutral fill.
- There is no dark theme. Dark is a section style.
- Small vermilion text appears only on ink. Text on a vermilion fill is ink.
- A vermilion block with `mix-blend-mode: multiply` tints the part of a black-and-white cut-out portrait it covers.

## Type

- Anton for display, always uppercase except the lowercase hero word. One weight: hierarchy comes from size and colour.
- Archivo for body text. JetBrains Mono for small uppercase labels.
- Gloss And Bloom is decoration only and ships as generated SVG (`npm run script-art`). At most two script moments per page, never in adjacent sections, never competing with a portrait.

## Devices

- Large solid vermilion blocks; cut-out portraits breaking out of them.
- Script written over the corner of a heading, with an edge in the background colour.
- Brush strikethrough (Extras stroke `e`) with the correction handwritten above.
- Monospace numbering on list items. No numbered labels on section headings.
- Rotated monospace labels on section edges.
- Square corners. Square ink arrow button, filled vermilion button, outlined ink button.

## Motion

- GSAP only. Durations and eases come from `src/lib/motionTokens.ts`.
- Reveals are declared in markup with `data-reveal` and run by `src/lib/reveal.ts`.
- Everything is visible without JavaScript and static under reduced motion.
```

- [ ] **Step 3: Update `CLAUDE.md`**

In section 1, delete the bullet that begins "Sections 4 and 5 below describe the pre-rebuild site".

Replace section 4 (from `## 4. Design & brand conventions` up to, not including, `## 5. Content pipeline`) with:

```markdown
## 4. Design & brand conventions

- Tokens live in `src/styles/global.css` `@theme`: `ivory`, `ink`, `vermilion`, `stone`, `line-dark`. Don't hardcode off-palette colours.
- Aesthetic: brutalist on a light ground. Ivory page, ink type, large solid vermilion blocks, black-and-white cut-out portraits, very large Anton display type, square corners. `DESIGN.md` has the full system.
- **Vermilion is the single accent.** Small vermilion text is allowed only on ink; text on a vermilion fill is ink.
- Type utilities: `type-display` (Anton, uppercase) and `type-label` (JetBrains Mono, small, tracked). Body text is Archivo.
- **Gloss And Bloom is decoration only** and ships as generated SVG. The font files live in the git-ignored `.fonts/` folder and must never be committed (the repo is public). To add a phrase or stroke: edit `src/assets/script/phrases.json`, run `npm run script-art`, commit the generated files.
- **Hover effects must not move ink surfaces with `transform`** (GPU compositing artifact on some hardware). Change colour, or move a small glyph inside. GSAP tweens on ink surfaces use `force3D: false`.
- **All animation respects `prefers-reduced-motion`,** and nothing is hidden unless JavaScript has run. Declare reveals with `data-reveal` (see `src/lib/reveal.ts`); take durations and eases from `src/lib/motionTokens.ts`.

```

Replace section 5 (from `## 5. Content pipeline` up to, not including, `## 6. Verification`) with:

```markdown
## 5. Content pipeline

- Collections are defined in `src/content.config.ts`. Case studies are `src/content/case-studies/<slug>.mdx`; the entry `id` is the slug. The schema currently covers only what Home needs (`title`, `date`, `tags`, optional `client`); the full schema and the case study page components arrive with the Work sub-project.
- `src/content/disciplines.ts` is the single source for the five disciplines. `src/content/navigation.ts` is the single source for nav links.
- Blog pillars are `src/content/blog/<slug>/index.mdx` with articles in the same folder. They are not wired to a collection yet.

```

Replace section 6's two bullets with:

```markdown
- Use the Playwright MCP tools for browser checks against your own dev server (`npx astro dev --port 4321`). Screenshots go in `.playwright-mcp/`, which is git-ignored. Don't kill dev servers by process name.
- Scroll-triggered reveals stay at their start state in a full-page screenshot until scrolled into view. Scroll the element into view, or emulate reduced motion, before capturing.
```

- [ ] **Step 4: Update `MEMORY.md`**

In the "Astro rebuild" section: change sub-project 1's status to "Built; awaiting owner review", and replace the "What the scaffold has" paragraph with a short account of what now exists: the tokens and fonts, the shell (`SiteHeader`, `MobileMenu` island, `SiteFooter`), the six Home sections under `src/components/home/`, the behaviour modules under `src/lib/` (`typewriter`, `typewriterElement`, `reveal`, `motionTokens`, `gsap`, `featuredWork`), the script-art generator under `scripts/script-art/`, and the `caseStudies` collection. Add any gotcha you hit during the build under "Known characteristics / gotchas", with the cause and the fix.

- [ ] **Step 5: Check the docs for dashes and commit**

```bash
grep -n "[—–]" PRODUCT.md DESIGN.md | cat
git add PRODUCT.md DESIGN.md CLAUDE.md MEMORY.md
git commit -m "docs: describe the brutalist design system and the rebuilt content pipeline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: the grep prints nothing.

---

### Task 13: Whole-page verification

**Files:**
- Modify: any file from Tasks 1 to 11 that a check below shows to be wrong.

**Interfaces:**
- Consumes: the finished Home page.
- Produces: a verified build, with every fix committed.

- [ ] **Step 1: Run the full automated suite**

```bash
npx vitest run && npm run typecheck && npm run build
```

Expected: every test passes with no warnings, 0 type errors, and the build completes.

- [ ] **Step 2: Check the static HTML**

```bash
grep -c "<h1" dist/index.html
grep -o "<title>[^<]*" dist/index.html
grep -c "[—–]" dist/index.html
grep -ciE "Mathew Brown is |\\bwe\\b|\\bour\\b" dist/index.html
ls dist/_astro | grep -c "\\.js$"
```

Expected: one `h1`; the title "UX/UI Engineer, SEO Specialist & AI Workflow Developer | Mathew Brown" (the ampersand is HTML-escaped); `0` dashes; `0` third-person or plural matches. If the last count is not `0`, find each match and check whether it is visible copy; a match inside inlined CSS or script does not count. Note the JavaScript file count for the next step.

- [ ] **Step 3: Confirm desktop ships no React**

With the dev server stopped, run `npx astro preview --port 4322` in the background. Open `http://localhost:4322` with Playwright at 1440x900 and list the network requests. Expected: no request for a React runtime chunk (the `client.*.js` file). Resize to 390x844, reload, and confirm the menu button opens the menu, which means the island hydrated. Stop the preview server.

- [ ] **Step 4: Visual pass at three widths**

Against `npx astro dev --port 4321`, with reduced motion emulated so reveals do not hide content, take a full-page screenshot at 1440x900, 1024x768 and 390x844. For each, confirm:

- Section order: hero, discipline strip, statement band, featured work, About teaser, contact band, footer.
- No horizontal scroll, no clipped or overlapping text, no artwork covering copy.
- At 1440 the page matches the reference image section by section.

Fix what is wrong and re-check.

- [ ] **Step 5: Motion pass**

Turn reduced-motion emulation off and reload at 1440x900. Confirm: the hero block wipes in, the portrait rises, then the word starts cycling ux, ui, seo, ai; scrolling reveals each heading and tile once; the strikethrough and the script wipe in after their headings; nothing flashes visible and then hides. Turn emulation back on, reload, and confirm nothing animates and the hero word stays "ux.".

- [ ] **Step 6: Keyboard and no-JavaScript pass**

- Press Tab from the top of the page: the skip link appears first and moves focus to the main content; every link and button after it shows a visible focus ring, including on the vermilion and ink sections.
- At 390 wide: open the menu with Enter, Tab through it and confirm focus stays inside, press Escape and confirm focus returns to the toggle.
- Disable JavaScript in a fresh Playwright context and load the page: every section's content is visible, the hero shows "ux.", and the footer links work.

- [ ] **Step 7: Confirm no font file is tracked**

```bash
git ls-files | grep -iE "\\.(ttf|otf|woff2?)$" ; echo "tracked font files: $?"
```

Expected: `tracked font files: 1` (none found).

- [ ] **Step 8: Commit any fixes**

```bash
git status --short
git add -A src public
git commit -m "fix: correct Home layout issues found in browser verification

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Skip the commit if there is nothing to commit. If a fix touched a `.ts`, `.tsx` or `.mjs` file, it needs a failing test first, in the same commit.
