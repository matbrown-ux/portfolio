# Work Index + Home Selected Work Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/work` list with a sticky-stacking project showcase and the Home "Selected work" card grid with an editorial index plus a pointer-following cover preview, built from shared project-listing pieces.

**Architecture:** Pure helpers (numbering, mode selection, preview positioning, ids, count label) live in `src/components/work/projectListing.ts` with unit tests. Small shared components (`ProjectMeta`, `ProjectCover`, `ProjectCta`) feed two presentations: `ProjectShowcase` (`ProjectPanel`s, CSS `sticky` stacking + GSAP-scrubbed overlay opacity) for `/work`, and `ProjectIndex` (`ProjectIndexRow`s + Motion-driven `HoverPreview`) for Home. Links name themselves via `aria-labelledby` (title + result).

**Tech Stack:** React 18, Vite 5, vite-react-ssg, TypeScript, Tailwind CSS v4, GSAP 3 + @gsap/react (via `src/lib/gsap.ts`), motion 11, react-router-dom 6, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-09-29-work-index-design.md`

## Global Constraints

- Vite + vite-react-ssg project, not Next.js. No `"use client"`, no `next/*`.
- Branch: `feat/work-index` (stacked on `feat/interaction-case-studies`).
- No em dashes (`—`) in visible copy. The meta separator is a middle dot `·`.
- Never fabricate results or metrics; `result` renders exactly as stored in frontmatter.
- Brand tokens only: `directors-black`, `secondary-dark`, `vermilion`, `vermilion-hover`, `cream`, `muted-prose`, `border-line`. Vermilion is the single accent.
- No `transform` hover lifts or transform-driven motion on dark card surfaces; hover = vermilion border + glow. GSAP tweens of dark surfaces use `force3D: false`; this plan's GSAP only tweens overlay `opacity`.
- Every animation has a complete static fallback under `prefers-reduced-motion`.
- GSAP (only via `src/lib/gsap.ts`) owns scroll-linked behaviour; Motion owns pointer/state behaviour; no element animated by both.
- Logic modules have basenames distinct from components (macOS case-insensitive imports). Import components extensionless.
- Decorative covers are wrapped `aria-hidden="true"`; images use `alt=""`. Listing links use `aria-labelledby="<titleId> <resultId>"`.
- Router tests use `src/test/TestRouter.tsx` (not bare `MemoryRouter`). Test output must be pristine.
- TDD: every source change starts with a failing test; commits that stage source also stage a test. Never bypass hooks; never add a `Test-Exempt` trailer.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Commands: `npx vitest run <path>`, `npm run test:run`, `npm run typecheck`, `npm run build`.

## Review Focus

1. **A case study missing `role`** (optional in frontmatter): the meta line shows only the year, with no dangling `·`. Pinned in Task 2.
2. **Pointer near the right or bottom viewport edge on Home**: the preview flips to the other side of the pointer and stays fully on-screen, even in a viewport smaller than the card. Pinned in Task 1.
3. **Only one case study**: `/work` shows one panel that is not sticky, and the count reads "01 case study" (singular). Pinned in Tasks 1 and 5.
4. **Reduced motion at desktop width**: `/work` renders cards (no sticky, no overlays) and Home renders inline thumbnails with no floating preview. Pinned in Tasks 5 and 8.
5. **Keyboard focus on a Home row**: focus does not summon the preview, and the row's accessible name is exactly "title result". Pinned in Task 8.

---

## File Map

**Create**
- `src/components/work/projectListing.ts` (+ `projectListing.test.ts`): pure helpers
- `src/test/caseStudyFixture.ts`: `makeCaseStudy` test helper
- `src/components/work/ProjectMeta.tsx`, `ProjectCover.tsx` (+ `ProjectMeta.test.tsx`)
- `src/components/work/ProjectCta.tsx` (+ `ProjectCta.test.tsx`)
- `src/components/work/ProjectPanel.tsx` (+ `ProjectPanel.test.tsx`)
- `src/components/work/ProjectShowcase.tsx` (+ `ProjectShowcase.test.tsx`)
- `src/pages/Work.test.tsx`
- `src/components/work/HoverPreview.tsx` (+ `HoverPreview.test.tsx`)
- `src/components/work/ProjectIndexRow.tsx`, `ProjectIndex.tsx` (+ `ProjectIndex.test.tsx`)
- `src/pages/Home.test.tsx`

**Modify**
- `src/lib/motion.ts`, `src/lib/motion.test.ts`: `SPRING.preview`
- `src/components/mdx/case-study/Outcome.tsx`: use `ProjectCta`
- `src/pages/Work.tsx`: new header + showcase + CTA
- `src/pages/Home.tsx`: Selected work section only
- `MEMORY.md`

---

### Task 1: Listing helpers, preview spring, test fixture

**Files:**
- Create: `src/components/work/projectListing.ts`, `src/components/work/projectListing.test.ts`, `src/test/caseStudyFixture.ts`
- Modify: `src/lib/motion.ts`, `src/lib/motion.test.ts`

**Interfaces:**
- Produces:
  - `type ShowcaseMode = 'stack' | 'cards'`
  - `projectNumber(index: number, total: number): string` → `"01 / 03"`
  - `showcaseMode(desktop: boolean, reduced: boolean): ShowcaseMode`
  - `interface Point { x: number; y: number }`, `interface Size { w: number; h: number }`
  - `previewPosition(pointer: Point, size: Size, viewport: Size, offset?: number): Point` (default offset 24)
  - `projectIds(prefix: string, slug: string): { titleId: string; resultId: string }` → `{ titleId: '<prefix>-<slug>-title', resultId: '<prefix>-<slug>-result' }`
  - `caseStudyCountLabel(count: number): string` → `"03 case studies"`, `"01 case study"`
  - `SPRING.preview` (softer than `SPRING.cursor`)
  - Test helper `makeCaseStudy(slug: string, fm?: Partial<CaseStudyFrontmatter>): CaseStudy`

- [ ] **Step 1: Write the failing tests**

`src/components/work/projectListing.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { projectNumber, showcaseMode, previewPosition, projectIds, caseStudyCountLabel } from './projectListing'

describe('projectNumber', () => {
  it('zero-pads index and total', () => {
    expect(projectNumber(0, 3)).toBe('01 / 03')
    expect(projectNumber(2, 3)).toBe('03 / 03')
  })
  it('keeps two-digit numbers as-is', () => {
    expect(projectNumber(9, 12)).toBe('10 / 12')
  })
})

describe('showcaseMode', () => {
  it('stacks only on desktop with motion allowed', () => {
    expect(showcaseMode(true, false)).toBe('stack')
    expect(showcaseMode(true, true)).toBe('cards')
    expect(showcaseMode(false, false)).toBe('cards')
    expect(showcaseMode(false, true)).toBe('cards')
  })
})

describe('previewPosition', () => {
  const size = { w: 420, h: 236 }
  const viewport = { w: 1440, h: 900 }

  it('offsets down and right of the pointer', () => {
    expect(previewPosition({ x: 100, y: 100 }, size, viewport)).toEqual({ x: 124, y: 124 })
  })
  it('flips left near the right edge', () => {
    expect(previewPosition({ x: 1300, y: 100 }, size, viewport)).toEqual({ x: 856, y: 124 })
  })
  it('flips up near the bottom edge', () => {
    expect(previewPosition({ x: 100, y: 800 }, size, viewport)).toEqual({ x: 124, y: 540 })
  })
  it('clamps on-screen when the viewport is smaller than the card', () => {
    expect(previewPosition({ x: 150, y: 100 }, size, { w: 300, h: 200 })).toEqual({ x: 0, y: 0 })
  })
})

describe('projectIds', () => {
  it('derives stable, prefixed ids from the slug', () => {
    expect(projectIds('work', 'vamp-network')).toEqual({
      titleId: 'work-vamp-network-title',
      resultId: 'work-vamp-network-result',
    })
  })
})

describe('caseStudyCountLabel', () => {
  it('pads and pluralizes', () => {
    expect(caseStudyCountLabel(3)).toBe('03 case studies')
    expect(caseStudyCountLabel(1)).toBe('01 case study')
    expect(caseStudyCountLabel(12)).toBe('12 case studies')
  })
})
```

Add to `src/lib/motion.test.ts` inside the existing `describe('motion tokens', ...)`:

```ts
  it('has a preview spring softer than the cursor', () => {
    expect(SPRING.preview.stiffness).toBeLessThan(SPRING.cursor.stiffness)
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/work/projectListing.test.ts src/lib/motion.test.ts`
Expected: FAIL: `./projectListing` not found; `SPRING.preview` undefined.

- [ ] **Step 3: Implement**

`src/components/work/projectListing.ts`:

```ts
export type ShowcaseMode = 'stack' | 'cards'

export interface Point {
  x: number
  y: number
}

export interface Size {
  w: number
  h: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/** "01 / 03" style position label for a project in a listing. */
export function projectNumber(index: number, total: number): string {
  return `${pad(index + 1)} / ${pad(total)}`
}

/** Sticky stacking only on desktop with motion allowed; cards otherwise. */
export function showcaseMode(desktop: boolean, reduced: boolean): ShowcaseMode {
  return desktop && !reduced ? 'stack' : 'cards'
}

/**
 * Top-left position for a floating preview card near the pointer: offset down
 * and right, flipped to the other side when it would overflow the right or
 * bottom edge, then clamped so it stays fully on-screen.
 */
export function previewPosition(pointer: Point, size: Size, viewport: Size, offset = 24): Point {
  let x = pointer.x + offset
  let y = pointer.y + offset
  if (x + size.w > viewport.w) x = pointer.x - offset - size.w
  if (y + size.h > viewport.h) y = pointer.y - offset - size.h
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), Math.max(0, max))
  return { x: clamp(x, viewport.w - size.w), y: clamp(y, viewport.h - size.h) }
}

/** Element ids for a listing link's aria-labelledby (title + result). */
export function projectIds(prefix: string, slug: string): { titleId: string; resultId: string } {
  return { titleId: `${prefix}-${slug}-title`, resultId: `${prefix}-${slug}-result` }
}

/** "03 case studies" / "01 case study". */
export function caseStudyCountLabel(count: number): string {
  return `${pad(count)} case ${count === 1 ? 'study' : 'studies'}`
}
```

`src/lib/motion.ts`: add to `SPRING`:

```ts
  preview: { stiffness: 220, damping: 30, mass: 0.6 },
```

`src/test/caseStudyFixture.ts`:

```ts
import type { CaseStudy, CaseStudyFrontmatter } from '../types/content'

/** A minimal, valid CaseStudy for component tests. */
export function makeCaseStudy(slug: string, fm: Partial<CaseStudyFrontmatter> = {}): CaseStudy {
  return {
    slug,
    Component: () => null,
    frontmatter: {
      title: `Title ${slug}`,
      slug,
      summary: 'Summary.',
      tags: ['UX/UI'],
      coverImage: `/images/${slug}.svg`,
      date: '2026-01-01',
      year: '2026',
      result: `Result for ${slug}.`,
      role: 'Lead Designer',
      ...fm,
    },
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/work/projectListing.test.ts src/lib/motion.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/projectListing.ts src/components/work/projectListing.test.ts src/lib/motion.ts src/lib/motion.test.ts src/test/caseStudyFixture.ts
git commit -m "feat: project listing helpers and preview spring

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: ProjectMeta and ProjectCover

**Files:**
- Create: `src/components/work/ProjectMeta.tsx`, `src/components/work/ProjectCover.tsx`, `src/components/work/ProjectMeta.test.tsx`

**Interfaces:**
- Consumes: `getCoverComponent(slug)` from `src/components/work/covers/index.ts`; `makeCaseStudy` (Task 1).
- Produces:
  - `<ProjectMeta frontmatter showResult? resultId? className? resultClassName? />`: renders `Role · Year` (only present parts) then the result paragraph (`id={resultId}`).
  - `<ProjectCover caseStudy variant: 'animated' | 'static' className? />`: `aria-hidden` wrapper with `data-project-cover`, 16:9, animated cover component or `<img alt="">`.

- [ ] **Step 1: Write the failing test**

`src/components/work/ProjectMeta.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectMeta } from './ProjectMeta'
import { ProjectCover } from './ProjectCover'
import { makeCaseStudy } from '../../test/caseStudyFixture'

describe('ProjectMeta', () => {
  it('shows role and year joined by a middle dot, then the result', () => {
    const { frontmatter } = makeCaseStudy('a', { role: 'Founder', year: '2026', result: 'Ranked #1.' })
    render(<ProjectMeta frontmatter={frontmatter} resultId="r1" />)
    expect(screen.getByText('Founder · 2026')).toBeInTheDocument()
    expect(screen.getByText('Ranked #1.')).toHaveAttribute('id', 'r1')
  })

  it('omits a missing role without a dangling separator', () => {
    const { frontmatter } = makeCaseStudy('a', { role: undefined, year: '2025' })
    const { container } = render(<ProjectMeta frontmatter={frontmatter} />)
    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(container.textContent).not.toContain('·')
  })

  it('can hide the result', () => {
    const { frontmatter } = makeCaseStudy('a', { result: 'Hidden result.' })
    render(<ProjectMeta frontmatter={frontmatter} showResult={false} />)
    expect(screen.queryByText('Hidden result.')).toBeNull()
  })
})

describe('ProjectCover', () => {
  it('renders a static, decorative image', () => {
    const { container } = render(<ProjectCover caseStudy={makeCaseStudy('x')} variant="static" />)
    const wrapper = container.querySelector('[data-project-cover]')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(wrapper?.querySelector('img')).toHaveAttribute('alt', '')
    expect(wrapper?.querySelector('img')).toHaveAttribute('src', '/images/x.svg')
  })

  it('falls back to the image when no animated cover exists for the slug', () => {
    const { container } = render(<ProjectCover caseStudy={makeCaseStudy('unknown')} variant="animated" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/images/unknown.svg')
  })

  it('renders the animated cover for a known slug', () => {
    const { container } = render(<ProjectCover caseStudy={makeCaseStudy('the-booking-flow')} variant="animated" />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/work/ProjectMeta.test.tsx`
Expected: FAIL: modules not found.

- [ ] **Step 3: Implement**

`src/components/work/ProjectMeta.tsx`:

```tsx
import type { CaseStudyFrontmatter } from '../../types/content'

interface ProjectMetaProps {
  frontmatter: CaseStudyFrontmatter
  showResult?: boolean
  /** Id on the result element, for a listing link's aria-labelledby. */
  resultId?: string
  className?: string
  resultClassName?: string
}

/** "Role · Year" plus the headline result, in one consistent format. */
export function ProjectMeta({
  frontmatter: fm,
  showResult = true,
  resultId,
  className = '',
  resultClassName = 'text-cream',
}: ProjectMetaProps) {
  const line = [fm.role, fm.year].filter(Boolean).join(' · ')
  return (
    <div className={className}>
      {line && <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">{line}</p>}
      {showResult && (
        <p id={resultId} className={`mt-3 leading-snug ${resultClassName}`}>
          {fm.result}
        </p>
      )}
    </div>
  )
}
```

`src/components/work/ProjectCover.tsx`:

```tsx
import { getCoverComponent } from './covers'
import type { CaseStudy } from '../../types/content'

interface ProjectCoverProps {
  caseStudy: CaseStudy
  /** animated: inline SVG cover with its scroll-in reveal; static: the cover image. */
  variant: 'animated' | 'static'
  className?: string
}

/** Decorative 16:9 cover for project listings, hidden from assistive tech. */
export function ProjectCover({ caseStudy, variant, className = '' }: ProjectCoverProps) {
  const Cover = variant === 'animated' ? getCoverComponent(caseStudy.slug) : undefined
  return (
    <div aria-hidden="true" data-project-cover className={`aspect-video overflow-hidden bg-directors-black ${className}`}>
      {Cover ? (
        <Cover />
      ) : (
        <img
          src={caseStudy.frontmatter.coverImage}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          width={1600}
          height={900}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/work && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/ProjectMeta.tsx src/components/work/ProjectCover.tsx src/components/work/ProjectMeta.test.tsx
git commit -m "feat: shared ProjectMeta and decorative ProjectCover

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Shared ProjectCta (and Outcome uses it)

**Files:**
- Create: `src/components/work/ProjectCta.tsx`, `src/components/work/ProjectCta.test.tsx`
- Modify: `src/components/mdx/case-study/Outcome.tsx`

**Interfaces:**
- Consumes: `Magnetic` (`src/components/interaction/Magnetic`), `Button` (`src/components/ui/Button`), `TestRouter`.
- Produces: `<ProjectCta className? />`: "Have a project like this in mind?" + Magnetic "Start a project" link to `/contact`.

- [ ] **Step 1: Write the failing test**

`src/components/work/ProjectCta.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { ProjectCta } from './ProjectCta'

describe('ProjectCta', () => {
  it('prompts and links to the contact page', () => {
    render(<ProjectCta />, { wrapper: TestRouter })
    expect(screen.getByText('Have a project like this in mind?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '/contact')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/work/ProjectCta.test.tsx`
Expected: FAIL: module not found.

- [ ] **Step 3: Implement**

`src/components/work/ProjectCta.tsx`:

```tsx
import { Magnetic } from '../interaction/Magnetic'
import { Button } from '../ui/Button'

/** Closing "start a project" prompt shared by case studies and the work index. */
export function ProjectCta({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-start justify-between gap-6 border-t border-border-line pt-10 sm:flex-row sm:items-center ${className}`}
    >
      <p className="text-2xl font-semibold tracking-tight text-cream">Have a project like this in mind?</p>
      <Magnetic>
        <Button href="/contact">Start a project</Button>
      </Magnetic>
    </div>
  )
}
```

In `src/components/mdx/case-study/Outcome.tsx`, replace the final CTA `<div className="mt-16 flex ...">...</div>` block with `<ProjectCta className="mt-16" />`, import it from `'../../work/ProjectCta'`, and remove the now-unused `Magnetic` and `Button` imports.

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/work src/components/mdx/case-study/Outcome.test.tsx && npm run typecheck`
Expected: PASS (Outcome's existing "Start a project" test still passes).

- [ ] **Step 5: Commit**

```bash
git add src/components/work/ProjectCta.tsx src/components/work/ProjectCta.test.tsx src/components/mdx/case-study/Outcome.tsx
git commit -m "refactor: extract shared ProjectCta from Outcome

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: ProjectPanel

**Files:**
- Create: `src/components/work/ProjectPanel.tsx`, `src/components/work/ProjectPanel.test.tsx`

**Interfaces:**
- Consumes: `projectNumber`, `projectIds`, `ShowcaseMode` (Task 1); `ProjectMeta`, `ProjectCover` (Task 2); `Tag` (`src/components/ui/Tag`); `makeCaseStudy`, `TestRouter`.
- Produces: `<ProjectPanel caseStudy index total mode sticky />`: a `Link` with `data-project-panel`, `data-cursor="view"`, `aria-labelledby`; in `stack` mode it has `min-h-[calc(100svh-4rem)]`, `sticky top-16` when `sticky`, inline `z-index: index + 1`, and a `[data-panel-overlay]` child.

- [ ] **Step 1: Write the failing test**

`src/components/work/ProjectPanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { ProjectPanel } from './ProjectPanel'
import { makeCaseStudy } from '../../test/caseStudyFixture'

const cs = makeCaseStudy('the-booking-flow', { title: 'The Booking Flow', result: 'Leads captured automatically.' })

describe('ProjectPanel', () => {
  it('names the link with title and result only', () => {
    render(<ProjectPanel caseStudy={cs} index={0} total={3} mode="cards" sticky={false} />, { wrapper: TestRouter })
    const link = screen.getByRole('link', { name: 'The Booking Flow Leads captured automatically.' })
    expect(link).toHaveAttribute('href', '/work/the-booking-flow')
    expect(link).toHaveAttribute('data-cursor', 'view')
  })

  it('shows its position and hides the cover from assistive tech', () => {
    const { container } = render(<ProjectPanel caseStudy={cs} index={1} total={3} mode="cards" sticky={false} />, {
      wrapper: TestRouter,
    })
    expect(screen.getByText('02 / 03')).toBeInTheDocument()
    expect(container.querySelector('[data-project-cover]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('heading', { level: 2, name: 'The Booking Flow' })).toBeInTheDocument()
  })

  it('in cards mode has no sticky positioning and no overlay', () => {
    const { container } = render(<ProjectPanel caseStudy={cs} index={0} total={3} mode="cards" sticky />, {
      wrapper: TestRouter,
    })
    const panel = container.querySelector('[data-project-panel]')!
    expect(panel.className).not.toContain('sticky')
    expect(container.querySelector('[data-panel-overlay]')).toBeNull()
  })

  it('in stack mode sticks under the navbar with an overlay, unless it is the last panel', () => {
    const { container, rerender } = render(<ProjectPanel caseStudy={cs} index={0} total={3} mode="stack" sticky />, {
      wrapper: TestRouter,
    })
    const panel = container.querySelector<HTMLElement>('[data-project-panel]')!
    expect(panel.className).toContain('sticky')
    expect(panel.style.zIndex).toBe('1')
    expect(container.querySelector('[data-panel-overlay]')).toHaveAttribute('aria-hidden', 'true')

    rerender(<ProjectPanel caseStudy={cs} index={2} total={3} mode="stack" sticky={false} />)
    expect(container.querySelector('[data-project-panel]')!.className).not.toContain('sticky')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/work/ProjectPanel.test.tsx`
Expected: FAIL: module not found.

- [ ] **Step 3: Implement**

`src/components/work/ProjectPanel.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { Tag } from '../ui/Tag'
import { ProjectMeta } from './ProjectMeta'
import { ProjectCover } from './ProjectCover'
import { projectIds, projectNumber, type ShowcaseMode } from './projectListing'
import type { CaseStudy } from '../../types/content'

interface ProjectPanelProps {
  caseStudy: CaseStudy
  index: number
  total: number
  mode: ShowcaseMode
  /** Stack mode only: stick under the navbar (every panel but the last). */
  sticky: boolean
}

/**
 * One case study on the work index. In stack mode it fills the viewport and
 * sticks so the next panel slides over it; its overlay is darkened by
 * ProjectShowcase. The link is named by title + result only.
 */
export function ProjectPanel({ caseStudy, index, total, mode, sticky }: ProjectPanelProps) {
  const { frontmatter: fm, slug } = caseStudy
  const { titleId, resultId } = projectIds('work', slug)
  const stack = mode === 'stack'

  return (
    <Link
      to={`/work/${slug}`}
      data-project-panel
      data-cursor="view"
      aria-labelledby={`${titleId} ${resultId}`}
      style={stack ? { zIndex: index + 1 } : undefined}
      className={`group relative block overflow-hidden border border-border-line bg-secondary-dark transition-[border-color,box-shadow] duration-300 hover:border-vermilion/40 hover:shadow-[0_4px_22px_-4px_rgba(248,99,67,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion ${
        stack ? 'min-h-[calc(100svh-4rem)]' : ''
      } ${stack && sticky ? 'sticky top-16' : ''}`}
    >
      <div
        className={`grid gap-8 p-6 md:gap-10 md:p-10 ${
          stack ? 'min-h-[calc(100svh-4rem)] content-center lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center' : ''
        }`}
      >
        <div className="order-2 lg:order-1">
          <p className="font-mono text-xs tracking-[0.2em] text-vermilion">{projectNumber(index, total)}</p>
          <h2
            id={titleId}
            className="mt-4 font-bold leading-none text-cream transition-colors duration-200 group-hover:text-vermilion"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4.5rem)', letterSpacing: '-0.03em' }}
          >
            {fm.title}
          </h2>
          <ProjectMeta
            frontmatter={fm}
            resultId={resultId}
            className="mt-6"
            resultClassName="max-w-md text-lg font-semibold text-cream"
          />
          {fm.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {fm.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}
          <p
            aria-hidden="true"
            className="mt-8 text-xs uppercase tracking-widest text-muted-prose transition-colors duration-200 group-hover:text-cream"
          >
            View case study →
          </p>
        </div>
        <ProjectCover caseStudy={caseStudy} variant="animated" className="order-1 lg:order-2" />
      </div>
      {stack && (
        <div
          data-panel-overlay
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-directors-black opacity-0"
        />
      )}
    </Link>
  )
}
```

(The `rgba(248,99,67,…)` glow is the existing `Card` hover glow: vermilion, on-palette.)

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/work && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/ProjectPanel.tsx src/components/work/ProjectPanel.test.tsx
git commit -m "feat: ProjectPanel for the work showcase

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: ProjectShowcase (stacking + overlay scrub + fallbacks)

**Files:**
- Create: `src/components/work/ProjectShowcase.tsx`, `src/components/work/ProjectShowcase.test.tsx`

**Interfaces:**
- Consumes: `ProjectPanel` (Task 4); `showcaseMode` (Task 1); `useMediaQuery` (`src/hooks/useMediaQuery`); `useReducedMotion`; `gsap`, `ScrollTrigger`, `useGSAP` from `src/lib/gsap.ts`; test helpers `installMatchMedia`, `DESKTOP_QUERY`, `REDUCED_QUERY`.
- Produces: `<ProjectShowcase caseStudies />`: root has `data-showcase-mode="stack" | "cards"`; renders the empty-state copy when the list is empty.

Mode is chosen in React (`showcaseMode`), so GSAP only runs in stack mode; `useGSAP` reverts triggers when `mode` changes (resize across `md`, reduced-motion toggle).

- [ ] **Step 1: Write the failing test**

`src/components/work/ProjectShowcase.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { ProjectShowcase } from './ProjectShowcase'
import { makeCaseStudy } from '../../test/caseStudyFixture'
import { installMatchMedia, DESKTOP_QUERY, REDUCED_QUERY } from '../../test/matchMedia'

const three = [makeCaseStudy('a'), makeCaseStudy('b'), makeCaseStudy('c')]

describe('ProjectShowcase', () => {
  it('renders cards by default (server/mobile)', () => {
    const { container } = render(<ProjectShowcase caseStudies={three} />, { wrapper: TestRouter })
    expect(container.querySelector('[data-showcase-mode]')).toHaveAttribute('data-showcase-mode', 'cards')
    expect(container.querySelectorAll('[data-project-panel]')).toHaveLength(3)
    expect(container.querySelector('[data-panel-overlay]')).toBeNull()
  })

  it('stacks on desktop: every panel but the last is sticky', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true })
    const { container } = render(<ProjectShowcase caseStudies={three} />, { wrapper: TestRouter })
    expect(container.querySelector('[data-showcase-mode]')).toHaveAttribute('data-showcase-mode', 'stack')
    const panels = [...container.querySelectorAll('[data-project-panel]')]
    expect(panels.map((p) => p.className.includes('sticky'))).toEqual([true, true, false])
  })

  it('falls back to cards under reduced motion at desktop width', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true, [REDUCED_QUERY]: true })
    const { container } = render(<ProjectShowcase caseStudies={three} />, { wrapper: TestRouter })
    expect(container.querySelector('[data-showcase-mode]')).toHaveAttribute('data-showcase-mode', 'cards')
    expect(container.querySelector('[data-panel-overlay]')).toBeNull()
  })

  it('shows a single case study as one non-sticky panel', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true })
    const { container } = render(<ProjectShowcase caseStudies={[makeCaseStudy('solo')]} />, { wrapper: TestRouter })
    const panels = container.querySelectorAll('[data-project-panel]')
    expect(panels).toHaveLength(1)
    expect(panels[0].className).not.toContain('sticky')
  })

  it('shows an empty state with no case studies', () => {
    render(<ProjectShowcase caseStudies={[]} />, { wrapper: TestRouter })
    expect(screen.getByText('Case studies coming soon.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/work/ProjectShowcase.test.tsx`
Expected: FAIL: module not found.

- [ ] **Step 3: Implement**

`src/components/work/ProjectShowcase.tsx`:

```tsx
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ProjectPanel } from './ProjectPanel'
import { showcaseMode } from './projectListing'
import type { CaseStudy } from '../../types/content'

/**
 * The /work showcase. Stack mode (md+, motion allowed): panels stick under the
 * navbar and each next panel slides over the previous one on native scroll,
 * while the covered panel's overlay darkens (opacity only, scrubbed). Cards
 * mode (mobile, reduced motion, and the prerendered HTML): a plain list.
 */
export function ProjectShowcase({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const desktop = useMediaQuery('(min-width: 768px)')
  const reduced = useReducedMotion()
  const mode = showcaseMode(desktop, reduced)
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || mode !== 'stack') return
      const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-project-panel]'))
      panels.forEach((panel, i) => {
        const next = panels[i + 1]
        const overlay = panel.querySelector<HTMLElement>('[data-panel-overlay]')
        if (!next || !overlay) return
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          {
            opacity: 0.6,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=64', scrub: true },
          }
        )
      })
      // The prerendered HTML is cards mode; re-measure everything once the
      // taller stack layout is in place so triggers below stay accurate.
      ScrollTrigger.refresh()
    },
    { scope: rootRef, dependencies: [mode, caseStudies.length] }
  )

  if (caseStudies.length === 0) {
    return <p className="text-muted-prose">Case studies coming soon.</p>
  }

  return (
    <div ref={rootRef} data-showcase-mode={mode} className={mode === 'stack' ? 'relative' : 'space-y-10'}>
      {caseStudies.map((cs, i) => (
        <ProjectPanel
          key={cs.slug}
          caseStudy={cs}
          index={i}
          total={caseStudies.length}
          mode={mode}
          sticky={i < caseStudies.length - 1}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/work && npm run typecheck`
Expected: PASS, pristine output.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/ProjectShowcase.tsx src/components/work/ProjectShowcase.test.tsx
git commit -m "feat: sticky-stacking ProjectShowcase with scrubbed overlays

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: `/work` page

**Files:**
- Modify: `src/pages/Work.tsx` (full rewrite)
- Create: `src/pages/Work.test.tsx`

**Interfaces:**
- Consumes: `RevealText` (`src/components/interaction/RevealText`), `ProjectShowcase` (Task 5), `ProjectCta` (Task 3), `caseStudyCountLabel` (Task 1), `getCaseStudies`, `SEO`, `PageTransition`.

- [ ] **Step 1: Write the failing test**

`src/pages/Work.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { Work } from './Work'

function renderWork() {
  return render(
    <HelmetProvider>
      <TestRouter>
        <Work />
      </TestRouter>
    </HelmetProvider>
  )
}

describe('Work page', () => {
  it('has the keyword h1 and a case study count', () => {
    renderWork()
    expect(screen.getByRole('heading', { level: 1, name: 'UX/UI Engineering & SEO Case Studies' })).toBeInTheDocument()
    expect(screen.getByText('03 case studies')).toBeInTheDocument()
  })

  it('shows every case study as a panel linking to its page', () => {
    const { container } = renderWork()
    const hrefs = [...container.querySelectorAll('[data-project-panel]')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/work/vamp-network', '/work/the-booking-flow', '/work/aiwi-waffles'])
  })

  it('ends with the start-a-project CTA', () => {
    renderWork()
    expect(screen.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '/contact')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Work.test.tsx`
Expected: FAIL: no count label, no `[data-project-panel]` links, no CTA.

- [ ] **Step 3: Implement**

`src/pages/Work.tsx` (full file):

```tsx
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { RevealText } from '../components/interaction/RevealText'
import { ProjectShowcase } from '../components/work/ProjectShowcase'
import { ProjectCta } from '../components/work/ProjectCta'
import { caseStudyCountLabel } from '../components/work/projectListing'
import { getCaseStudies } from '../lib/content'

export function Work() {
  const caseStudies = getCaseStudies()

  return (
    <PageTransition>
      <SEO
        title="Work"
        description="Case studies covering UX/UI engineering, SEO, and agentic workflow projects."
      />

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Work</p>
        <RevealText
          as="h1"
          text="UX/UI Engineering & SEO Case Studies"
          className="font-bold leading-none tracking-tight text-cream"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
        />
        <div className="mb-16 mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-lg leading-relaxed text-muted-prose">
            Selected client and product work across UX/UI engineering, SEO/AEO, AI workflows, and brand development.
          </p>
          {caseStudies.length > 0 && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-prose">
              {caseStudyCountLabel(caseStudies.length)}
            </p>
          )}
        </div>

        <ProjectShowcase caseStudies={caseStudies} />

        {caseStudies.length > 0 && <ProjectCta className="mt-24" />}
      </section>
    </PageTransition>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Work.tsx src/pages/Work.test.tsx
git commit -m "feat: /work page on the project showcase

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: HoverPreview

**Files:**
- Create: `src/components/work/HoverPreview.tsx`, `src/components/work/HoverPreview.test.tsx`

**Interfaces:**
- Consumes: `previewPosition` (Task 1), `SPRING.preview` (Task 1), `DURATION.fast` (`src/lib/motion.ts`), `ProjectCover` (Task 2), `motion`, `useMotionValue`, `useSpring` from `motion/react`.
- Produces: `<HoverPreview caseStudies activeSlug: string | null />`: fixed, `aria-hidden`, `pointer-events-none`, `data-testid="hover-preview"`, `data-active={activeSlug ?? ''}`; one static cover per case study, only the active one visible.

- [ ] **Step 1: Write the failing test**

`src/components/work/HoverPreview.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoverPreview } from './HoverPreview'
import { makeCaseStudy } from '../../test/caseStudyFixture'

const list = [makeCaseStudy('a'), makeCaseStudy('b')]

describe('HoverPreview', () => {
  it('is decorative and ignores the pointer', () => {
    render(<HoverPreview caseStudies={list} activeSlug={null} />)
    const preview = screen.getByTestId('hover-preview')
    expect(preview).toHaveAttribute('aria-hidden', 'true')
    expect(preview.className).toContain('pointer-events-none')
    expect(preview).toHaveAttribute('data-active', '')
  })

  it('shows only the active project cover', () => {
    const { container } = render(<HoverPreview caseStudies={list} activeSlug="b" />)
    expect(screen.getByTestId('hover-preview')).toHaveAttribute('data-active', 'b')
    const layers = [...container.querySelectorAll('[data-preview-layer]')]
    expect(layers.map((l) => l.getAttribute('data-preview-layer'))).toEqual(['a', 'b'])
    expect(layers.map((l) => l.className.includes('opacity-100'))).toEqual([false, true])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/work/HoverPreview.test.tsx`
Expected: FAIL: module not found.

- [ ] **Step 3: Implement**

`src/components/work/HoverPreview.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { DURATION, SPRING } from '../../lib/motion'
import { ProjectCover } from './ProjectCover'
import { previewPosition } from './projectListing'
import type { CaseStudy } from '../../types/content'

const SIZE = { w: 420, h: 236 }

interface HoverPreviewProps {
  caseStudies: CaseStudy[]
  /** Slug of the hovered row, or null when no row is hovered. */
  activeSlug: string | null
}

/**
 * Floating cover preview for the Home project index. Follows the pointer on a
 * soft spring, offset and edge-flipped so it never leaves the viewport or
 * covers the cursor pill. Static covers only (no GSAP inside a fixed element).
 */
export function HoverPreview({ caseStudies, activeSlug }: HoverPreviewProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING.preview)
  const sy = useSpring(y, SPRING.preview)
  const wasActive = useRef(false)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const p = previewPosition({ x: e.clientX, y: e.clientY }, SIZE, { w: window.innerWidth, h: window.innerHeight })
      x.set(p.x)
      y.set(p.y)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [x, y])

  // When the preview appears, jump straight to the pointer instead of
  // springing in from wherever it was last hidden.
  useEffect(() => {
    const active = activeSlug !== null
    if (active && !wasActive.current) {
      sx.jump(x.get())
      sy.jump(y.get())
    }
    wasActive.current = active
  }, [activeSlug, sx, sy, x, y])

  return (
    <motion.div
      aria-hidden="true"
      data-testid="hover-preview"
      data-active={activeSlug ?? ''}
      className="pointer-events-none fixed left-0 top-0 z-50 overflow-hidden rounded-md border border-border-line bg-directors-black"
      style={{ x: sx, y: sy, width: SIZE.w, height: SIZE.h }}
      initial={false}
      animate={{ opacity: activeSlug ? 1 : 0 }}
      transition={{ duration: DURATION.fast }}
    >
      {caseStudies.map((cs) => (
        <div
          key={cs.slug}
          data-preview-layer={cs.slug}
          className={`absolute inset-0 transition-opacity duration-300 ${cs.slug === activeSlug ? 'opacity-100' : 'opacity-0'}`}
        >
          <ProjectCover caseStudy={cs} variant="static" className="h-full" />
        </div>
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/work && npm run typecheck`
Expected: PASS, pristine output.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/HoverPreview.tsx src/components/work/HoverPreview.test.tsx
git commit -m "feat: pointer-following HoverPreview for the project index

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: ProjectIndexRow and ProjectIndex

**Files:**
- Create: `src/components/work/ProjectIndexRow.tsx`, `src/components/work/ProjectIndex.tsx`, `src/components/work/ProjectIndex.test.tsx`

**Interfaces:**
- Consumes: `projectIds` (Task 1), `ProjectMeta`, `ProjectCover` (Task 2), `HoverPreview` (Task 7), `useMediaQuery`, `useReducedMotion`; test helpers `installMatchMedia`, `FINE_POINTER_QUERY`, `REDUCED_QUERY`, `makeCaseStudy`, `TestRouter`.
- Produces:
  - `<ProjectIndexRow caseStudy index showThumb onHover? />`: `<li>` with one `Link` (`data-cursor="view"`, `aria-labelledby`, `onPointerEnter` → `onHover(slug)`); inline static thumbnails when `showThumb`.
  - `<ProjectIndex caseStudies />`: `<ol>` of rows; `HoverPreview` only when `(pointer: fine)` matches and motion is allowed; clears the active row on pointer leave.

- [ ] **Step 1: Write the failing test**

`src/components/work/ProjectIndex.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { ProjectIndex } from './ProjectIndex'
import { makeCaseStudy } from '../../test/caseStudyFixture'
import { installMatchMedia, FINE_POINTER_QUERY, REDUCED_QUERY } from '../../test/matchMedia'

const list = [
  makeCaseStudy('alpha', { title: 'Alpha', result: 'Result A.' }),
  makeCaseStudy('beta', { title: 'Beta', result: 'Result B.' }),
]

describe('ProjectIndex', () => {
  it('names each row link with title and result only', () => {
    render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    expect(screen.getByRole('link', { name: 'Alpha Result A.' })).toHaveAttribute('href', '/work/alpha')
    expect(screen.getByRole('link', { name: 'Beta Result B.' })).toHaveAttribute('data-cursor', 'view')
    expect(screen.getByRole('heading', { level: 3, name: 'Alpha' })).toBeInTheDocument()
  })

  it('shows inline thumbnails and no preview on touch', () => {
    const { container } = render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    expect(screen.queryByTestId('hover-preview')).toBeNull()
    expect(container.querySelectorAll('ol [data-project-cover]').length).toBeGreaterThan(0)
  })

  it('shows inline thumbnails and no preview under reduced motion, even with a mouse', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_QUERY]: true })
    const { container } = render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    expect(screen.queryByTestId('hover-preview')).toBeNull()
    expect(container.querySelectorAll('ol [data-project-cover]').length).toBeGreaterThan(0)
  })

  it('previews the hovered row with a mouse, and clears on leave', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    const { container } = render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    expect(container.querySelectorAll('ol [data-project-cover]')).toHaveLength(0)
    const preview = screen.getByTestId('hover-preview')
    fireEvent.pointerEnter(screen.getByRole('link', { name: 'Beta Result B.' }))
    expect(preview).toHaveAttribute('data-active', 'beta')
    fireEvent.pointerLeave(container.querySelector('[data-project-index]')!)
    expect(preview).toHaveAttribute('data-active', '')
  })

  it('does not summon the preview on keyboard focus', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    screen.getByRole('link', { name: 'Alpha Result A.' }).focus()
    expect(screen.getByTestId('hover-preview')).toHaveAttribute('data-active', '')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/work/ProjectIndex.test.tsx`
Expected: FAIL: module not found.

- [ ] **Step 3: Implement**

`src/components/work/ProjectIndexRow.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ProjectMeta } from './ProjectMeta'
import { ProjectCover } from './ProjectCover'
import { projectIds } from './projectListing'
import type { CaseStudy } from '../../types/content'

interface ProjectIndexRowProps {
  caseStudy: CaseStudy
  index: number
  /** Inline thumbnails replace the floating preview on touch / reduced motion. */
  showThumb: boolean
  onHover?: (slug: string) => void
}

/** One editorial row in the Home project index. Named by title + result. */
export function ProjectIndexRow({ caseStudy, index, showThumb, onHover }: ProjectIndexRowProps) {
  const { frontmatter: fm, slug } = caseStudy
  const { titleId, resultId } = projectIds('home', slug)

  return (
    <li className="border-b border-border-line">
      <Link
        to={`/work/${slug}`}
        data-cursor="view"
        aria-labelledby={`${titleId} ${resultId}`}
        onPointerEnter={onHover ? () => onHover(slug) : undefined}
        className="group grid gap-6 py-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-center md:gap-10"
      >
        {showThumb && <ProjectCover caseStudy={caseStudy} variant="static" className="md:hidden" />}
        <div className="flex items-center gap-6 md:gap-10">
          <div className="w-10 shrink-0">
            <span className="font-mono text-xs tracking-[0.2em] text-vermilion">{String(index + 1).padStart(2, '0')}</span>
            <span
              aria-hidden="true"
              className="mt-2 block h-px w-3 bg-vermilion transition-[width] duration-300 group-hover:w-8 group-focus-visible:w-8 motion-reduce:transition-none"
            />
          </div>
          {showThumb && <ProjectCover caseStudy={caseStudy} variant="static" className="hidden w-40 shrink-0 md:block" />}
          <h3
            id={titleId}
            className="font-bold leading-none text-cream transition-colors duration-200 group-hover:text-vermilion group-focus-visible:text-vermilion"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)', letterSpacing: '-0.03em' }}
          >
            {fm.title}
          </h3>
        </div>
        <ProjectMeta frontmatter={fm} resultId={resultId} resultClassName="text-sm text-muted-prose" />
      </Link>
    </li>
  )
}
```

`src/components/work/ProjectIndex.tsx`:

```tsx
import { useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ProjectIndexRow } from './ProjectIndexRow'
import { HoverPreview } from './HoverPreview'
import type { CaseStudy } from '../../types/content'

/**
 * Condensed editorial project list for Home. With a mouse (and motion
 * allowed) a floating cover preview follows the pointer; otherwise each row
 * shows an inline thumbnail. Keyboard focus never summons the preview.
 */
export function ProjectIndex({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = useReducedMotion()
  const preview = fine && !reduced
  const [active, setActive] = useState<string | null>(null)

  return (
    <div data-project-index onPointerLeave={() => setActive(null)}>
      <ol className="border-t border-border-line">
        {caseStudies.map((cs, i) => (
          <ProjectIndexRow
            key={cs.slug}
            caseStudy={cs}
            index={i}
            showThumb={!preview}
            onHover={preview ? setActive : undefined}
          />
        ))}
      </ol>
      {preview && <HoverPreview caseStudies={caseStudies} activeSlug={active} />}
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/work && npm run typecheck`
Expected: PASS, pristine output.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/ProjectIndexRow.tsx src/components/work/ProjectIndex.tsx src/components/work/ProjectIndex.test.tsx
git commit -m "feat: editorial ProjectIndex with hover preview and touch fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Home "Selected work" on ProjectIndex

**Files:**
- Modify: `src/pages/Home.tsx` (the `{/* Featured work */}` section and imports only)
- Create: `src/pages/Home.test.tsx`

**Interfaces:**
- Consumes: `ProjectIndex` (Task 8), `RevealText`.

- [ ] **Step 1: Write the failing test**

`src/pages/Home.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { Home } from './Home'

function renderHome() {
  return render(
    <HelmetProvider>
      <TestRouter>
        <Home />
      </TestRouter>
    </HelmetProvider>
  )
}

describe('Home selected work', () => {
  it('keeps the keyword section heading', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 2, name: 'Featured UX/UI Engineering & SEO Projects' })).toBeInTheDocument()
  })

  it('lists the three newest case studies as an editorial index', () => {
    const { container } = renderHome()
    const rows = container.querySelectorAll('[data-project-index] ol > li a')
    expect([...rows].map((a) => a.getAttribute('href'))).toEqual([
      '/work/vamp-network',
      '/work/the-booking-flow',
      '/work/aiwi-waffles',
    ])
  })

  it('links to all work', () => {
    renderHome()
    expect(screen.getByRole('link', { name: /All work/ })).toHaveAttribute('href', '/work')
  })
})
```

If Home fails to render in jsdom for a reason unrelated to this section (e.g. an API jsdom lacks in the hero), stub only that API in this test file and report it; do not change the hero.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Home.test.tsx`
Expected: FAIL: no `[data-project-index]` (the section is still the card grid).

- [ ] **Step 3: Implement**

In `src/pages/Home.tsx`, replace the whole `{/* Featured work */}` block with:

```tsx
      {/* Featured work */}
      {featuredWork.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">Selected work</p>
            <RevealText
              as="h2"
              text="Featured UX/UI Engineering & SEO Projects"
              className="mx-auto mb-16 max-w-2xl font-semibold tracking-tight text-cream"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
            />
          </div>
          <ProjectIndex caseStudies={featuredWork} />
          <div className="mt-14 text-center">
            <Link
              to="/work"
              data-cursor="view"
              className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-muted-prose transition-colors duration-200 hover:text-cream"
            >
              All work <span className="text-vermilion">→</span>
            </Link>
          </div>
        </section>
      )}
```

Add imports `import { RevealText } from '../components/interaction/RevealText'` and `import { ProjectIndex } from '../components/work/ProjectIndex'`. Remove imports this change leaves unused (likely `Card`, `Tag`, `StaggerList`/`StaggerItem`; keep any still used elsewhere in Home; `npm run typecheck` will flag leftovers).

- [ ] **Step 4: Run tests**

Run: `npm run test:run && npm run typecheck`
Expected: PASS, pristine output.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.tsx src/pages/Home.test.tsx
git commit -m "feat: Home selected work as an editorial project index

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Visual verification, build, docs

**Files:**
- Modify: `MEMORY.md`

- [ ] **Step 1: Visual verification in a browser**

`agent-browser` is not installed; use the Playwright MCP browser tools against `npm run dev` (run it on port 5173 in the background; stop only that process when done, and do not kill other Vite processes). Scroll scroll-revealed content into view before judging. Check:

1. `/work` at 1440x900: the `h1` reveals; panels stick under the navbar and each next panel slides over the previous; the covered panel darkens; the last panel scrolls away normally and the CTA band follows; hover shows the vermilion border + glow; the cursor pill reads "View" over panels.
2. `/work` at 390x844: cards mode, no horizontal overflow, cover above text.
3. Home at 1440x900: hovering rows shows the floating preview near the pointer with the right cover, crossfading between rows; near the right edge it flips left; it disappears when leaving the list; Tab through rows shows focus rings and no preview.
4. Home at 390x844: inline thumbnails above titles, no preview.
5. Reduced-motion emulation at 1440: `/work` shows cards (no sticky, no darkening); Home shows inline thumbnails and no preview.
6. Clicking a panel on `/work` and a row on Home runs the curtain and lands on the case study hero.

Fix defects found: logic fixes need a failing test first; styling fixes don't. List each fix in the report.

- [ ] **Step 2: Update MEMORY.md**

Add a build-log entry for the work index + Home selected work: `ProjectShowcase`/`ProjectPanel` (CSS sticky stacking, GSAP-scrubbed overlay opacity, cards fallback on mobile/reduced motion/prerender, `ScrollTrigger.refresh()` after stack mount), `ProjectIndex`/`ProjectIndexRow`/`HoverPreview` (static covers, `previewPosition` edge flip, `SPRING.preview`, inline thumbnails on touch/reduced motion), shared `ProjectMeta`/`ProjectCover`/`ProjectCta`, `aria-labelledby` title + result naming, and `src/test/caseStudyFixture.ts`. Update the architecture list for `src/components/work/`.

- [ ] **Step 3: Final checks and commit**

Run: `npm run test:run && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add MEMORY.md
git commit -m "docs: record work index and home selected work in MEMORY

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
