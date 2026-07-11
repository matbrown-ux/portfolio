# Productized SEO/AEO Offer + Prerendered SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. For the two presentational tasks (4 and 5), also use the frontend-design skill.

**Goal:** Make matbrown.io actively sell the productized SEO/AEO offer, fix the SEO/AEO prerender gap, and ship live.

**Architecture:** Migrate SEO head management from `react-helmet-async` to vite-react-ssg's native `Head` so meta + JSON-LD prerender into static HTML. Rework the existing Services page to lead with the productized offer. Add a standalone print-ready one-pager exported to PDF. Hide placeholder metrics honestly by filtering them at the component level.

**Tech Stack:** React 18 + TypeScript, Vite + vite-react-ssg 0.9.1-beta.1, Tailwind CSS v4 (`@theme` tokens), motion (Framer Motion), GSAP, Vitest, Netlify.

## Global Constraints

- Stack is React + Vite + vite-react-ssg. No Next.js, no `"use client"`, no `next/*`.
- No em dashes in any visible copy. Use colons, commas, or reword.
- In MDX, comments are `{/* ... */}`, never HTML comments.
- Never fabricate metrics for real clients. Only the 'Aiwi `#1` local ranking is confirmed.
- Use only brand tokens from `src/styles/globals.css` `@theme`: `directors-black #090909`, `secondary-dark #0e0e0e`, `vermilion #f86343`, `vermilion-hover #f9764a`, `cream #f5f0e8`, `muted-prose #7a7060`, `border-line #1c1c1c`.
- All animation must respect `prefers-reduced-motion` (use `useReducedMotion`).
- No `transform`-based hover lift on dark cards (compositing artifact); use `position: top` lift + vermilion border/glow.
- Page `h1`/section `h2` must be keyword-led and descriptive; keep the uppercase eyebrow as a kicker.
- Keep `gsap` and `@gsap/react` in `ssr.noExternal` (required for the SSR build).
- Public pricing on the site uses "from" anchors only. Full tier pricing appears only in the one-pager.
- Commit on branch `feat/services-offer-seo`. Push/merge only when the user explicitly asks.

---

### Task 1: Migrate SEO to prerendered `Head`

**Files:**
- Modify: `src/components/SEO.tsx`
- Modify: `src/layouts/DefaultLayout.tsx`
- Modify: `vite.config.ts:18-20`
- Modify: `package.json` (remove `react-helmet-async` dependency)
- Replace: `src/components/SEO.test.tsx`

**Interfaces:**
- Produces: `SEO` component (unchanged public props: `title`, `description`, `ogImage?`, `type?`, `schema?`, `noindex?`) and a new pure export `computeSeo(props: SEOProps): { fullTitle: string; description: string; type: 'website' | 'article'; noindex: boolean; ogImage?: string; schemas: object[] }`.
- Consumes: `Head` from `vite-react-ssg` (`type Props = HelmetProps & { children: ReactNode }`).

- [ ] **Step 1: Replace the SEO unit test with a pure-logic test**

`src/components/SEO.test.tsx` (full replacement):

```tsx
import { describe, it, expect } from 'vitest'
import { computeSeo } from './SEO'

describe('computeSeo', () => {
  it('prefixes the brand name onto the title', () => {
    expect(computeSeo({ title: 'Work', description: 'x' }).fullTitle).toBe('Work | Mathew Brown')
  })

  it('sets the noindex flag when requested', () => {
    expect(computeSeo({ title: 'Lab', description: 'x', noindex: true }).noindex).toBe(true)
  })

  it('defaults noindex to false', () => {
    expect(computeSeo({ title: 'Work', description: 'x' }).noindex).toBe(false)
  })

  it('normalizes a single schema object into an array', () => {
    const r = computeSeo({ title: 'S', description: 'x', schema: { a: 1 } as object })
    expect(r.schemas).toHaveLength(1)
  })

  it('passes through an array of schemas', () => {
    const r = computeSeo({ title: 'S', description: 'x', schema: [{ a: 1 }, { b: 2 }] as object[] })
    expect(r.schemas).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- src/components/SEO.test.tsx`
Expected: FAIL — `computeSeo` is not exported yet.

- [ ] **Step 3: Rewrite `src/components/SEO.tsx` to use `Head` + export `computeSeo`**

Full replacement:

```tsx
import { Head } from 'vite-react-ssg'

export interface SEOProps {
  title: string
  description: string
  ogImage?: string
  type?: 'website' | 'article'
  schema?: object | object[]
  noindex?: boolean
}

export function computeSeo({
  title,
  description,
  type = 'website',
  noindex = false,
  ogImage,
  schema,
}: SEOProps) {
  const fullTitle = `${title} | Mathew Brown`
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : []
  return { fullTitle, description, type, noindex, ogImage, schemas }
}

export function SEO(props: SEOProps) {
  const { fullTitle, description, type, noindex, ogImage, schemas } = computeSeo(props)

  return (
    <Head>
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
    </Head>
  )
}
```

- [ ] **Step 4: Remove the `HelmetProvider` wrapper from the layout**

In `src/layouts/DefaultLayout.tsx`: delete the `import { HelmetProvider } from 'react-helmet-async'` line and unwrap it (the `Head` component needs no provider — vite-react-ssg sets up the head context in its runtime). Result:

```tsx
import { Navbar } from '../components/nav/Navbar'
import { Footer } from '../components/Footer'
import { PageCurtain } from '../components/PageCurtain'

export function DefaultLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-directors-black">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Renders the routed page and handles the curtain page transition +
            scroll reset on navigation. */}
        <PageCurtain />
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 5: Drop `react-helmet-async` from the SSR externals**

In `vite.config.ts`, change the `ssr.noExternal` array to remove `react-helmet-async` (keep the GSAP entries):

```ts
  ssr: {
    noExternal: ['gsap', '@gsap/react'],
  },
```

- [ ] **Step 6: Uninstall the dependency**

Run: `npm uninstall react-helmet-async`
Expected: removes the package; `package.json` no longer lists it.

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run test:run -- src/components/SEO.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 8: Typecheck and confirm no lingering Helmet references**

Run: `npm run typecheck && grep -rn "helmet\|Helmet" src/`
Expected: typecheck passes; grep returns nothing.

- [ ] **Step 9: Commit**

```bash
git add src/components/SEO.tsx src/components/SEO.test.tsx src/layouts/DefaultLayout.tsx vite.config.ts package.json package-lock.json
git commit -m "feat: prerender SEO meta + JSON-LD via vite-react-ssg Head"
```

---

### Task 2: Expand JSON-LD structured data

**Files:**
- Modify: `src/lib/seo.ts`
- Modify: `src/pages/Home.tsx` (wire Person + WebSite schema into its existing `<SEO>`)
- Test: `src/lib/seo.test.ts` (create)

**Interfaces:**
- Produces:
  - `personSchema(name: string, url: string, extras?: { jobTitle?: string; sameAs?: string[]; knowsAbout?: string[] })` — backward compatible (extras optional).
  - `websiteSchema(name: string, url: string)`
  - `serviceOfferSchema(input: { name: string; description: string; provider: string; priceRange: string })`
- Consumes: nothing new.

- [ ] **Step 1: Write failing tests for the new builders**

`src/lib/seo.test.ts` (create):

```ts
import { describe, it, expect } from 'vitest'
import { personSchema, websiteSchema, serviceOfferSchema } from './seo'

describe('personSchema', () => {
  it('includes extras when provided', () => {
    const s = personSchema('Mathew Brown', 'https://matbrown.io', {
      jobTitle: 'UX/UI Engineer',
      sameAs: ['https://example.com'],
      knowsAbout: ['SEO'],
    }) as Record<string, unknown>
    expect(s.jobTitle).toBe('UX/UI Engineer')
    expect(s.sameAs).toEqual(['https://example.com'])
    expect(s.knowsAbout).toEqual(['SEO'])
  })

  it('omits extras when not provided', () => {
    const s = personSchema('Mathew Brown', 'https://matbrown.io') as Record<string, unknown>
    expect('jobTitle' in s).toBe(false)
  })
})

describe('websiteSchema', () => {
  it('builds a WebSite node', () => {
    const s = websiteSchema('Mathew Brown', 'https://matbrown.io') as Record<string, unknown>
    expect(s['@type']).toBe('WebSite')
    expect(s.url).toBe('https://matbrown.io')
  })
})

describe('serviceOfferSchema', () => {
  it('builds a Service node with an offer priceRange', () => {
    const s = serviceOfferSchema({
      name: 'SEO/AEO',
      description: 'x',
      provider: 'Mathew Brown',
      priceRange: 'from $3,000/mo',
    }) as Record<string, any>
    expect(s['@type']).toBe('Service')
    expect(s.offers.priceSpecification.price).toContain('3,000')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/lib/seo.test.ts`
Expected: FAIL — `websiteSchema` / `serviceOfferSchema` not exported.

- [ ] **Step 3: Check existing `personSchema` callers stay compatible**

Run: `grep -rn "personSchema(" src/`
Expected: any existing calls pass exactly two args; the new optional `extras` keeps them valid.

- [ ] **Step 4: Add the builders to `src/lib/seo.ts`**

Replace `personSchema` and append the two new builders:

```ts
export function personSchema(
  name: string,
  url: string,
  extras?: { jobTitle?: string; sameAs?: string[]; knowsAbout?: string[] }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person' as const,
    name,
    url,
    ...(extras?.jobTitle ? { jobTitle: extras.jobTitle } : {}),
    ...(extras?.sameAs ? { sameAs: extras.sameAs } : {}),
    ...(extras?.knowsAbout ? { knowsAbout: extras.knowsAbout } : {}),
  }
}

export function websiteSchema(name: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite' as const,
    name,
    url,
    publisher: { '@type': 'Person' as const, name },
  }
}

export function serviceOfferSchema(input: {
  name: string
  description: string
  provider: string
  priceRange: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service' as const,
    name: input.name,
    description: input.description,
    provider: { '@type': 'Person' as const, name: input.provider },
    offers: {
      '@type': 'Offer' as const,
      priceSpecification: {
        '@type': 'PriceSpecification' as const,
        price: input.priceRange,
        priceCurrency: 'USD',
      },
    },
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/lib/seo.test.ts`
Expected: PASS.

- [ ] **Step 6: Wire Person + WebSite schema into the Home page**

In `src/pages/Home.tsx`, locate the existing `<SEO ... />`. Import the builders and pass a `schema` array. Add near the other imports:

```tsx
import { personSchema, websiteSchema } from '../lib/seo'
```

Give the `<SEO>` a `schema` prop (merge with any existing one):

```tsx
schema={[
  personSchema('Mathew Brown', 'https://matbrown.io', {
    jobTitle: 'UX/UI Engineer, SEO/AEO & AI Automation Developer',
    knowsAbout: [
      'UX/UI Engineering',
      'SEO',
      'Answer Engine Optimization',
      'Agentic Workflows',
      'AI Automation',
      'Brand Development',
      'SaaS Development',
    ],
  }),
  websiteSchema('Mathew Brown', 'https://matbrown.io'),
]}
```

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 8: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts src/pages/Home.tsx
git commit -m "feat: add Person, WebSite, and Service/Offer JSON-LD builders"
```

---

### Task 3: Hide placeholder metrics honestly

**Files:**
- Modify: `src/components/mdx/Metrics.tsx`
- Test: `src/components/mdx/Metrics.test.tsx` (create)

**Interfaces:**
- Produces: `Metrics` renders only non-placeholder items and renders nothing when none remain. A placeholder value is empty/whitespace or all zeros (e.g. `"00"`).

- [ ] **Step 1: Write failing tests**

`src/components/mdx/Metrics.test.tsx` (create):

```tsx
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import { Metrics } from './Metrics'

afterEach(cleanup)

describe('Metrics', () => {
  it('renders nothing when every value is a placeholder', () => {
    const { container } = render(
      <Metrics items={[{ value: '00', label: 'A' }, { value: '00', label: 'B' }]} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders only the non-placeholder metrics', () => {
    render(
      <Metrics
        items={[
          { value: '#1', label: 'Google local ranking' },
          { value: '00', label: 'Keywords ranked #1' },
        ]}
      />
    )
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.queryByText('Keywords ranked #1')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/components/mdx/Metrics.test.tsx`
Expected: FAIL — placeholders currently render.

- [ ] **Step 3: Add placeholder filtering to `Metrics.tsx`**

At the top of the component body (inside `Metrics`, before the return), and add the guard. Replace the function so it filters:

```tsx
const isPlaceholder = (v: string) => {
  const t = v.trim()
  return t === '' || /^0+$/.test(t)
}

export function Metrics({ items }: MetricsProps) {
  const reduced = useReducedMotion()
  const real = items.filter((item) => !isPlaceholder(item.value))

  if (real.length === 0) return null

  return (
    <div className="my-12 grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-line border border-border-line not-prose">
      {real.map((item, i) => (
        <motion.div
          key={item.label}
          className="bg-secondary-dark p-8"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
        >
          <span className="block w-8 h-0.5 bg-vermilion mb-5" aria-hidden="true" />
          <div
            className="text-cream font-bold tracking-tight leading-none"
            style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', letterSpacing: '-0.03em' }}
          >
            {item.value}
          </div>
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mt-4">
            {item.label}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
```

Keep the existing `isPlaceholder` helper above the component (module scope) and the existing imports/`EASE` const unchanged.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/components/mdx/Metrics.test.tsx`
Expected: PASS. (Result: 'Aiwi shows only the real `#1` tile; Vamp and Booking Flow blocks render nothing.)

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/Metrics.tsx src/components/mdx/Metrics.test.tsx
git commit -m "feat: hide placeholder metric values until real numbers land"
```

---

### Task 4: Rework the Services page around the SEO/AEO offer

**Files:**
- Modify: `src/pages/Services.tsx` (full rewrite)

**Interfaces:**
- Consumes: `SEO`, `FadeIn`, `StaggerList`/`StaggerItem`, `Button`, `serviceOfferSchema` (Task 2).

**Use the frontend-design skill for this task.** Follow the existing dark editorial aesthetic (numbered sections, vermilion accents, big display type, `FadeIn`/`Stagger` reveals, `Button` component). Respect all Global Constraints (no em dashes, brand tokens, keyword-led headings, reduced motion).

Page structure and locked copy, top to bottom:

1. **SEO tag** — title `Services`, description mentioning SEO/AEO engineering, and `schema={[serviceOfferSchema({ name: 'SEO & AEO Engineering', description: 'Productized search and answer-engine optimization: audits, structured data, and AI-accelerated content that gets you found, ranked, and cited.', provider: 'Mathew Brown', priceRange: 'from $3,000/mo' })]}`.

2. **Hero**
   - Eyebrow: `Services`
   - h1 (keyword-led): `SEO and AEO engineering that gets you found, ranked, and cited.`
   - Subhead (no em dashes): `Search and answer-engine optimization built for how people find businesses now: Google and the AI assistants quoting it. Productized, fast, and priced to compound.`
   - Anchor line (the only public pricing): `Retainers from $3,000/mo. Foundation Sprint from $3,000.`
   - Primary CTA `Book a call` to `/contact`.

3. **Flagship offer: the AEO/SEO system** (positioning, not a price table)
   - Positioning pitch: `AI-accelerated, human-directed. I run audits and generate validated schema in hours, not weeks, and produce more optimized content per month than an agency will at the same price, because my systems do the heavy lifting and I do the strategy. You get agency-level output at freelancer speed.`
   - **Foundation Sprint** (one-time, from $3,000): a card describing the sprint deliverables (technical + AEO audit, JSON-LD structured data, on-page and meta optimization, AI-answer-engine readiness including `llms.txt`, a keyword and question map, two pillar content pieces, a 90-day roadmap). CTA `Start with a Sprint` to `/contact`.
   - **Growth Retainer** (three tiers as positioning cards, "from" anchors only, no full dollar table):
     - `Maintain` (from $1,750/mo): monitoring, technical hygiene, two content pieces a month, monthly reporting.
     - `Growth` (from $3,000/mo, mark as recommended with vermilion): four to six content pieces a month, structured-data expansion, AI-visibility tracking, a monthly strategy call, full reporting.
     - `Dominate` (from $5,500/mo): eight to ten content pieces a month, competitor displacement, citation and link building, biweekly calls, priority turnaround.
     - Each card CTA `Book a call` to `/contact`.
   - Note under the tiers: `Full scope and pricing shared on a quick call.`
   - Cards must use the `position: top` hover lift + vermilion border/glow pattern (never transform) per Global Constraints.

4. **Supporting disciplines** (reuse the existing numbered `StaggerList` layout)
   - `01 UX/UI Engineering` — keep the existing description and deliverables from the current file.
   - `02 Agentic Workflows and AI Automation` — keep the existing "Agentic Workflow Development" description and deliverables.
   - `03 Software Builds` — new: `Full-stack product builds shipped fast with my own automation systems. From lead-capture SaaS to internal tools and custom dashboards.` Deliverables: `React, Vite, and Supabase product builds`, `Automations and integrations (n8n, APIs, OAuth)`, `Internal tools and custom dashboards`, `From $10k, scoped to your project`. CTA `Scope a build` to `/contact`.

- [ ] **Step 1: Rewrite `src/pages/Services.tsx`** following the structure and copy above, reusing the existing components and the numbered-section pattern already in the file. Keep `serviceOfferSchema` wired into `<SEO schema>`.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Visual verification**

Start the dev server and screenshot `/services` (scroll each section into view first, since `whileInView` content is hidden until scrolled). Confirm: hero + anchors render, offer cards render with vermilion "recommended" accent on Growth, hover lift shows no black-bar artifact, disciplines section intact, no em dashes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Services.tsx
git commit -m "feat: lead Services page with productized SEO/AEO offer"
```

---

### Task 5: Standalone designed one-pager (hosted link + PDF)

**Files:**
- Create: `public/offer/index.html` (self-contained, inline CSS, brand colors)
- Create: `public/mathew-brown-seo-aeo-offer.pdf` (generated from the HTML)

**Use the frontend-design skill for this task.** The page is self-contained (served from `public/`, no Tailwind build), so inline all CSS using the brand hex values from Global Constraints. It must look like the site: dark `#090909` background, `#f5f0e8` text, `#f86343` vermilion accents, big display headings, generous spacing. Include a print stylesheet (`@media print`) so it renders as a clean 1-2 page PDF (light or dark; choose a print-friendly treatment that keeps the vermilion accents and stays legible on paper).

Content (this is the gated detail, so full pricing appears here):
- Header: `Mathew Brown` + `SEO and AEO Engineering` + contact `mat@matbrown.io` and `matbrown.io`.
- Value prop headline: `Get found, ranked, and cited: by Google and the AI assistants quoting it.`
- Positioning paragraph: the "AI-accelerated, human-directed ... agency-level output at freelancer speed" pitch (verbatim from Task 4).
- **Foundation Sprint** — `$3,000 one-time`, 2 to 3 weeks. List the seven deliverables from the spec.
- **Growth Retainer** — full tier table with real prices:
  - `Maintain` `$1,750/mo` — 2 pieces/mo, monitoring, hygiene, monthly report.
  - `Growth` `$3,000/mo` (recommended) — 4 to 6 pieces/mo, schema expansion, AI-visibility tracking, monthly call, full reporting.
  - `Dominate` `$5,500/mo` — 8 to 10 pieces/mo, competitor displacement, citations and links, biweekly calls, priority turnaround.
  - Footnote: `Annual prepay: two months free.`
- **Proof**: `Local SEO and Google Business Profile work ranked 'Aiwi Waffles #1 on Google for multiple keywords, turning online searches into walk-in customers.` (Only the confirmed fact. No fabricated numbers.)
- **Process**: Audit and Foundation Sprint, then ongoing Growth. Short three-step line.
- **CTA**: `Book a call` with `mat@matbrown.io`.
- No em dashes anywhere.

- [ ] **Step 1: Build `public/offer/index.html`** per the content and styling above, fully self-contained with inline `<style>` including an `@media print` block.

- [ ] **Step 2: Preview it**

Run: `npm run dev` and open `http://localhost:5173/offer/index.html` (files in `public/` are served at the site root). Confirm it looks on-brand and the print preview (Cmd+P) is clean.

- [ ] **Step 3: Generate the PDF with headless Chrome**

Run (Chrome path per project convention):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="public/mathew-brown-seo-aeo-offer.pdf" \
  "file://$(pwd)/public/offer/index.html"
```

Expected: `public/mathew-brown-seo-aeo-offer.pdf` is created. Open it and confirm it is a clean 1-2 page designed sheet. (The PDF is served at `https://matbrown.io/mathew-brown-seo-aeo-offer.pdf` and the page at `https://matbrown.io/offer/` for outreach.)

- [ ] **Step 4: Commit**

```bash
git add public/offer/index.html public/mathew-brown-seo-aeo-offer.pdf
git commit -m "feat: standalone SEO/AEO one-pager (hosted page + PDF)"
```

---

### Task 6: Build, verify prerender, deploy

**Files:** none (verification + release)

- [ ] **Step 1: Full test + typecheck**

Run: `npm run typecheck && npm run test:run`
Expected: all green.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: `vite-react-ssg build` completes without the `react-helmet-async` named-export error and writes `dist/`.

- [ ] **Step 3: Prove meta + JSON-LD are in the prerendered HTML**

Run:

```bash
grep -o '<title>[^<]*</title>' dist/services/index.html
grep -c 'application/ld+json' dist/index.html dist/services/index.html
grep -o '<meta name="description"[^>]*>' dist/work/index.html
```

Expected: `dist/services/index.html` has a `Services | Mathew Brown` title; `ld+json` count is `>= 1` on home and services; the Work page has a real description meta. This confirms the prerender gap is closed. If counts are 0, stop and fix Task 1 before proceeding.

- [ ] **Step 4: Confirm the one-pager assets shipped to `dist`**

Run: `ls dist/offer/index.html dist/mathew-brown-seo-aeo-offer.pdf`
Expected: both exist.

- [ ] **Step 5: Preview smoke-test**

Run: `npm run preview` and load `/services` and `/offer/index.html`. Confirm both render correctly from the built output.

- [ ] **Step 6: Hand off for deploy (do NOT push without the user's go-ahead)**

Summarize results to the user. When the user says go, push the branch and open/merge per their instruction; Netlify auto-deploys from the GitHub repo (`npm run build` → `dist`). Confirm the live URLs after deploy.

---

## Self-Review

**Spec coverage:**
- Services rework → Task 4. ✓
- SEO prerender fix (Approach A) → Task 1. ✓
- JSON-LD expansion → Task 2. ✓
- One-pager PDF + hosted link → Task 5. ✓
- Hide placeholder metrics → Task 3. ✓
- Build/verify/deploy + prerender proof → Task 6. ✓
- "from" anchors only on site; full pricing in one-pager → Task 4 (anchors) + Task 5 (full). ✓
- No fabricated metrics → Task 3 (filter) + Task 5 (only 'Aiwi #1). ✓

**Type consistency:** `computeSeo` return shape (Task 1) is self-contained. `personSchema`/`websiteSchema`/`serviceOfferSchema` signatures (Task 2) are used with matching args in Tasks 2 and 4. `Metrics` props unchanged (Task 3).

**Placeholders:** none — all code steps contain full code; copy is verbatim; the one presentational latitude (exact JSX/CSS of Tasks 4 and 5) is intentional and delegated to the frontend-design skill with locked copy, structure, tokens, and acceptance checks.
