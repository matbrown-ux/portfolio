# GSAP Sandbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GSAP to the portfolio as an SSR-safe, reduced-motion-aware experimentation sandbox at an unlisted `/lab` route, without touching the existing Framer Motion animations.

**Architecture:** Install `gsap` + `@gsap/react`. Centralize browser-only plugin registration in `src/lib/gsap.ts` so `vite-react-ssg` prerender never touches `window`/`document`. Animations use the `useGSAP()` hook (client-only layout effect, auto-cleanup) and `gsap.matchMedia()` for reduced-motion gating. A new `/lab` page hosts a first scroll-scrub + pinned-reveal demo and is set `noindex`.

**Tech Stack:** React 18, TypeScript, Vite + vite-react-ssg, GSAP 3 + ScrollTrigger, @gsap/react, react-helmet-async, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-06-14-gsap-sandbox-design.md`

---

## File structure

- **Create** `src/lib/gsap.ts` — single browser-guarded GSAP + plugin registration point; re-exports `gsap`, `ScrollTrigger`, `useGSAP`.
- **Create** `src/pages/Lab.tsx` — the `/lab` sandbox page with the first demo.
- **Create** `src/components/SEO.test.tsx` — test for the new `noindex` prop.
- **Modify** `src/components/SEO.tsx` — add optional `noindex` prop → robots meta.
- **Modify** `src/router.tsx` — register the `/lab` route inside `DefaultLayout`.

---

## Task 1: Install dependencies

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install gsap and the React hook**

Run:
```bash
npm install gsap @gsap/react
```
Expected: both added to `dependencies`, install completes with no errors.

- [ ] **Step 2: Verify versions landed**

Run:
```bash
node -e "const p=require('./package.json');console.log(p.dependencies.gsap, p.dependencies['@gsap/react'])"
```
Expected: prints two version strings (e.g. `^3.x.x ^2.x.x`), neither `undefined`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add gsap and @gsap/react"
```

---

## Task 2: SSR-safe GSAP registration module

**Files:**
- Create: `src/lib/gsap.ts`

This module is the only place plugins get registered. The `typeof window` guard keeps `ScrollTrigger` from touching the DOM during the `vite-react-ssg` Node prerender.

- [ ] **Step 1: Create the module**

Create `src/lib/gsap.ts`:
```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// Register plugins once, and only in the browser. vite-react-ssg prerenders in
// Node at build time, where ScrollTrigger must not access window/document.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
}

export { gsap, ScrollTrigger, useGSAP }
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npm run typecheck
```
Expected: PASS (no errors). Confirms the GSAP type packages resolve.

- [ ] **Step 3: Commit**

```bash
git add src/lib/gsap.ts
git commit -m "feat: add SSR-safe gsap registration module"
```

---

## Task 3: Add `noindex` support to the SEO component

**Files:**
- Modify: `src/components/SEO.tsx`
- Test: `src/components/SEO.test.tsx`

The `/lab` route gets prerendered by SSG, so we keep it out of search indexes with a robots meta. This is TDD: write the test first.

- [ ] **Step 1: Write the failing test**

Create `src/components/SEO.test.tsx`:
```tsx
import { describe, it, expect, afterEach } from 'vitest'
import { render, waitFor, cleanup } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { SEO } from './SEO'

afterEach(cleanup)

describe('SEO noindex', () => {
  it('renders a robots noindex meta when noindex is set', async () => {
    render(
      <HelmetProvider>
        <SEO title="Lab" description="Sandbox" noindex />
      </HelmetProvider>
    )
    await waitFor(() => {
      const meta = document.head.querySelector('meta[name="robots"]')
      expect(meta?.getAttribute('content')).toBe('noindex')
    })
  })

  it('omits the robots meta by default', async () => {
    render(
      <HelmetProvider>
        <SEO title="Work" description="Case studies" />
      </HelmetProvider>
    )
    // give Helmet a tick to flush, then assert nothing was added
    await waitFor(() => {
      expect(document.title).toContain('Work')
    })
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
npm run test:run -- src/components/SEO.test.tsx
```
Expected: FAIL — the first test cannot find a `meta[name="robots"]` (the prop does not exist yet), and TypeScript/usage of `noindex` is not yet supported.

- [ ] **Step 3: Add the `noindex` prop**

In `src/components/SEO.tsx`, add `noindex` to the interface and the destructure, and render the meta. Final file:
```tsx
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  ogImage?: string
  type?: 'website' | 'article'
  schema?: object | object[]
  noindex?: boolean
}

export function SEO({ title, description, ogImage, type = 'website', schema, noindex = false }: SEOProps) {
  const fullTitle = `${title} | Mathew Brown`
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
npm run test:run -- src/components/SEO.test.tsx
```
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/SEO.tsx src/components/SEO.test.tsx
git commit -m "feat: add noindex prop to SEO component"
```

---

## Task 4: Build the `/lab` sandbox page with the first GSAP demo

**Files:**
- Create: `src/pages/Lab.tsx`

The demo proves the wiring end to end: a scroll-scrubbed progress bar plus a pinned text reveal, gated on `prefers-reduced-motion: no-preference`. Note: animated transforms here live on the progress bar (its own vermilion element) and on text lines, **not** on dark `Card` surfaces, so we don't reawaken the GPU black-bar artifact.

GSAP DOM animations do not run reliably under jsdom, so this page is verified in the browser and via the production build (Task 6), not with a jsdom unit test. That is a deliberate choice, not a missing test.

- [ ] **Step 1: Create the page**

Create `src/pages/Lab.tsx`:
```tsx
import { useRef } from 'react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { gsap, useGSAP } from '../lib/gsap'

const REVEAL_LINES = ['Scroll-driven', 'GSAP', 'experiments']

export function Lab() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Only animate when the user has not asked for reduced motion.
      // Reduced-motion users keep the static end state (text visible, bar empty).
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Scroll-scrubbed progress bar. scaleX is a transform, but it sits on its
        // own vermilion element, NOT a dark Card, so no GPU compositing artifact.
        gsap.fromTo(
          '.lab-progress',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          }
        )

        // Pinned text reveal: lines slide up into view as the section is reached.
        gsap.from('.lab-reveal-line', {
          yPercent: 120,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.lab-pin',
            start: 'top center',
          },
        })
      })

      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <PageTransition>
      <SEO title="Lab" description="GSAP animation sandbox." noindex />

      {/* Fixed scroll-progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-border-line">
        <div className="lab-progress h-full bg-vermilion" style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }} />
      </div>

      <div ref={root}>
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-6">Lab</p>
          <h1
            className="text-cream font-bold leading-none tracking-tight max-w-3xl"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
          >
            GSAP sandbox.
          </h1>
          <p className="text-muted-prose leading-relaxed mt-8 max-w-prose">
            A private space for scroll and timeline experiments. Scroll down to watch the progress bar scrub and the lines reveal.
          </p>
        </section>

        <section className="lab-pin min-h-screen flex items-center max-w-7xl mx-auto px-6">
          <div className="space-y-2">
            {REVEAL_LINES.map((line) => (
              <div key={line} className="overflow-hidden">
                <span
                  className="lab-reveal-line block text-cream font-bold leading-none tracking-tight"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Tail spacer so the scrub has room to reach 100 percent */}
        <section className="h-screen flex items-center justify-center">
          <p className="text-muted-prose text-sm tracking-[0.2em] uppercase">End of sandbox</p>
        </section>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npm run typecheck
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Lab.tsx
git commit -m "feat: add /lab GSAP sandbox page with scroll demo"
```

---

## Task 5: Wire the `/lab` route

**Files:**
- Modify: `src/router.tsx`

- [ ] **Step 1: Import and register the route**

In `src/router.tsx`, add the import alongside the other page imports:
```tsx
import { Lab } from './pages/Lab'
```
Then add this child route inside the `DefaultLayout` `children` array, after the `/contact` entry:
```tsx
      { path: '/lab', element: <Lab /> },
```
For reference, the `children` array becomes:
```tsx
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/services', element: <Services /> },
      { path: '/work', element: <Work /> },
      { path: '/work/:slug', element: <WorkDetail /> },
      { path: '/blog', element: <Blog /> },
      { path: '/blog/:pillar', element: <BlogPillar /> },
      { path: '/blog/:pillar/:article', element: <BlogArticle /> },
      { path: '/contact', element: <Contact /> },
      { path: '/lab', element: <Lab /> },
    ],
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npm run typecheck
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/router.tsx
git commit -m "feat: register /lab sandbox route"
```

---

## Task 6: Verify the build and the demo

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run:
```bash
npm run test:run
```
Expected: PASS, including the new `src/components/SEO.test.tsx`.

- [ ] **Step 2: Verify the SSG production build (the real SSR-safety check)**

Run:
```bash
npm run build
```
Expected: build completes with no errors. Specifically, no `window is not defined` / `document is not defined` / `ScrollTrigger` errors during prerender, and a prerendered file for `/lab` is emitted (e.g. `dist/lab/index.html` or `dist/lab.html`).

- [ ] **Step 3: Confirm the prerendered /lab page is noindex**

Run:
```bash
grep -rl 'name="robots"' dist | grep -i lab
```
Expected: prints the prerendered `/lab` HTML path (the robots noindex meta is present in the static output).

- [ ] **Step 4: Visually verify the demo in the browser**

Start the dev server (`npm run dev`), then drive system Chrome per CLAUDE.md section 6:
```bash
agent-browser --executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" open http://localhost:5173/lab
```
Scroll the page and screenshot. Confirm: the vermilion progress bar scrubs left-to-right as you scroll, and the three lines ("Scroll-driven", "GSAP", "experiments") slide up into view when their section reaches center. Remember whileInView/scroll content is hidden until scrolled into view, so scroll before capturing. Clean up temp files and run `agent-browser close` when done.

- [ ] **Step 5: Verify reduced-motion (static end state)**

In Chrome DevTools, enable "Emulate CSS prefers-reduced-motion: reduce" (Rendering tab), reload `/lab`, and confirm the three lines are fully visible and static with no slide animation. The progress bar staying empty is expected and acceptable.

---

## Self-review notes

- **Spec coverage:** dependencies (Task 1), SSR-safe registration module (Task 2), noindex (Task 3), reduced-motion + transforms-off-dark-cards + first demo (Task 4), `/lab` route (Task 5), success criteria — dev serves demo, build passes, typecheck passes, reduced-motion static, Framer Motion untouched (Task 6). All spec sections map to a task.
- **No Framer Motion files are modified** — the spec's "out of scope" holds.
- **Naming consistency:** the module exports `gsap`, `ScrollTrigger`, `useGSAP`; `Lab.tsx` imports `gsap` and `useGSAP` from `../lib/gsap`. The demo CSS hooks (`.lab-progress`, `.lab-reveal-line`, `.lab-pin`) are defined in the JSX and referenced in the `useGSAP` callback consistently.
