# Work Index + Case Study Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/work` and `/work/<slug>` in the approved brutalist design, rendering the three existing case studies with labelled placeholders wherever media is missing.

**Architecture:** Static Astro pages with no React. Case study MDX keeps its five component tags, which are rebuilt as `.astro` blocks and handed to the rendered content. One `MediaSlot` component shows an image, a video or a labelled placeholder everywhere media appears; which one is decided by a tested resolver that looks files up under `src/assets/case-studies/`. Sorting, numbering, row surfaces and next-project logic live in one tested module.

**Tech Stack:** Astro 7 (static, content collections, `astro:assets`), Tailwind CSS 4, GSAP reveals through `data-reveal`, Vitest 5 + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-12-work-case-studies-design.md`. Visual reference: `docs/superpowers/specs/assets/2026-10-12-work-approved.jpeg` (section labels W1, W2, C1 to C8 are printed on it). Read both before any task. The sub-project 1 spec, `docs/superpowers/specs/2026-10-12-design-foundation-home-design.md`, defines the design system these pages use.

## Global Constraints

- Work on branch `feat/astro-rebuild`. Do not push.
- **TDD kit:** every `.ts`, `.tsx`, `.mjs` under `src/` or `scripts/` gets a failing test first. The pre-commit hook refuses source without a test. Never add a `Test-Exempt:` trailer. Never skip the git hooks in any way.
- `.astro`, `.css`, `.mdx`, `.md`, `.json`, images and `*.config.*` are content: no unit test, verified by `npm run typecheck`, `npm run build` and the browser.
- Keep logic out of `.astro` frontmatter. Anything with a branch or a calculation goes in a `.ts` file.
- Logic modules must not share a basename with a component case-insensitively (macOS).
- Every commit message ends with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01D79s9xirtfhJAjjmYsQLVp`
- Colours: ivory `#f4f0e6`, ink `#0c0c0c`, vermilion `#f86343`, stone `#e4dfd3`, through the theme names only. No other colours. Tints are made with `color-mix()` of a theme colour and `transparent`.
- Small vermilion text (numbers, labels) only on ink, in every state. Text on a vermilion fill is ink.
- Type: Anton (`type-display`), Archivo (body), JetBrains Mono (`type-label`). Gloss And Bloom only as generated SVG; never commit a `.ttf`, `.otf`, `.woff` or `.woff2` of it.
- **No React on these pages.** No `client:` directive anywhere in this sub-project.
- Animation is GSAP only, declared with `data-reveal` (`rise`, `wipe`, `fade`), optional `data-reveal-delay` (seconds), `data-reveal-index` (stagger) and `data-reveal-on="load"`. Do not move ink surfaces with `transform` on hover.
- All motion respects `prefers-reduced-motion`. Nothing is hidden unless JavaScript has run and motion is allowed.
- **Case study prose, metrics and result sentences are not changed.** Only the mechanical MDX edits in Task 4 are made. Never fabricate a metric or a result.
- Copy added by this plan is first person where it is a sentence, has no em or en dashes, and is exactly as written here.
- Design skills (load before any `.astro` styling task): `industrial-brutalist-ui` leads, then `high-end-visual-design`, then `frontend-design` + `design-taste-frontend`; `impeccable` for easing and timing. Locked decisions in the specs override any skill default.
- Do not kill dev servers by process name. Start your own with `npx astro dev --port 4321` and stop that one. Never run the test suite while your dev server is running.
- Browser checks use the Playwright MCP tools. Screenshots go under `.playwright-mcp/`.
- `dist/index.html` and the other built pages are single minified lines: count matches with `grep -o '<pattern>' <file> | wc -l`, not `grep -c`.

## Review Focus

1. **A media path that does not match a file.** A person who mistypes a file name expects the build to stop and name the case study and the path, not to ship a placeholder where their screenshot should be. Pinned in Task 2.
2. **A video without a poster, or a file with an unsupported extension.** A person dropping in a `.mov` or forgetting the poster expects a clear error. Pinned in Task 2.
3. **One case study, or none.** A person who removes case studies expects `/work` to render and "Next project" to disappear, not to link a page to itself or crash. Pinned in Task 1.
4. **A gallery with one image or with seven.** A person adding photos expects a sensible grid at any count. Pinned in Task 2.
5. **A browser without `IntersectionObserver`, or a visitor with reduced motion.** A person in either case expects to be able to play a recording, not to stare at a frozen poster with no controls. Pinned in Task 3.

---

### Task 1: Case study schema and list logic

**Files:**
- Modify: `src/content.config.ts`, `src/lib/featuredWork.ts`, `src/lib/featuredWork.test.ts`
- Create: `src/lib/caseStudies.ts`, `src/lib/caseStudies.test.ts`, `src/lib/host.ts`, `src/lib/host.test.ts`

**Interfaces:**
- Consumes: the existing `featuredWork(entries)` and its tests.
- Produces:
  - Collection `caseStudies` with data fields `title`, `headline`, `summary`, `date: Date`, `year`, `tags`, `services`, `stack`, `role`, `client?`, `liveUrl?`, `result`, `ogImage?`, `heroNote?`, `media?: { hero?: MediaRef; tile?: MediaRef }` where `MediaRef = { src?: string; alt: string; poster?: string }`.
  - `src/lib/caseStudies.ts`: `interface CaseStudyEntry { id: string; data: { title: string; date: Date } }`; `sortCaseStudies<T extends CaseStudyEntry>(entries: T[]): T[]`; `type RowSurface = 'stone' | 'ink' | 'ivory'`; `interface WorkRow<T> { entry: T; number: string; surface: RowSurface; mediaSide: 'left' | 'right'; href: string }`; `workRows<T extends CaseStudyEntry>(entries: T[]): WorkRow<T>[]`; `caseStudyNumber(entries: CaseStudyEntry[], id: string): string`; `nextCaseStudy<T extends CaseStudyEntry>(entries: T[], id: string): T | null`; `projectSpan(entries: CaseStudyEntry[]): { count: string; years: string }`.
  - `src/lib/featuredWork.ts`: `WorkTile` gains `id: string`.
  - `src/lib/host.ts`: `hostLabel(url: string): string`.

- [ ] **Step 1: Write the failing tests**

`src/lib/caseStudies.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { caseStudyNumber, nextCaseStudy, projectSpan, sortCaseStudies, workRows } from './caseStudies'

const entry = (id: string, date: string) => ({ id, data: { title: id.toUpperCase(), date: new Date(date) } })
const three = [entry('old', '2025-11-01'), entry('new', '2026-04-01'), entry('mid', '2026-02-01')]

describe('sortCaseStudies', () => {
  it('orders newest first', () => {
    expect(sortCaseStudies(three).map((e) => e.id)).toEqual(['new', 'mid', 'old'])
  })

  it('breaks date ties by id and leaves the input alone', () => {
    const tied = [entry('b', '2026-01-01'), entry('a', '2026-01-01')]
    expect(sortCaseStudies(tied).map((e) => e.id)).toEqual(['a', 'b'])
    expect(tied.map((e) => e.id)).toEqual(['b', 'a'])
  })
})

describe('workRows', () => {
  it('numbers rows, cycles the three surfaces and alternates the media side', () => {
    const four = [...three, entry('oldest', '2024-01-01')]
    expect(workRows(four).map((r) => [r.number, r.entry.id, r.surface, r.mediaSide, r.href])).toEqual([
      ['01', 'new', 'stone', 'right', '/work/new'],
      ['02', 'mid', 'ink', 'left', '/work/mid'],
      ['03', 'old', 'ivory', 'right', '/work/old'],
      ['04', 'oldest', 'stone', 'left', '/work/oldest'],
    ])
  })

  it('is empty for no entries', () => {
    expect(workRows([])).toEqual([])
  })
})

describe('caseStudyNumber', () => {
  it('is the three-digit position in the newest-first list', () => {
    expect(caseStudyNumber(three, 'new')).toBe('001')
    expect(caseStudyNumber(three, 'old')).toBe('003')
  })

  it('throws for an unknown id', () => {
    expect(() => caseStudyNumber(three, 'nope')).toThrow('Unknown case study "nope"')
  })
})

describe('nextCaseStudy', () => {
  it('is the next older case study', () => {
    expect(nextCaseStudy(three, 'new')?.id).toBe('mid')
    expect(nextCaseStudy(three, 'mid')?.id).toBe('old')
  })

  it('wraps from the oldest to the newest', () => {
    expect(nextCaseStudy(three, 'old')?.id).toBe('new')
  })

  it('is null when there is only one, or the id is unknown', () => {
    expect(nextCaseStudy([entry('only', '2026-01-01')], 'only')).toBeNull()
    expect(nextCaseStudy(three, 'nope')).toBeNull()
    expect(nextCaseStudy([], 'x')).toBeNull()
  })
})

describe('projectSpan', () => {
  it('gives the count and the year range', () => {
    expect(projectSpan(three)).toEqual({ count: '3 Projects', years: '2025 to 2026' })
  })

  it('uses the singular and a single year', () => {
    expect(projectSpan([entry('only', '2026-05-01')])).toEqual({ count: '1 Project', years: '2026' })
  })

  it('handles no entries', () => {
    expect(projectSpan([])).toEqual({ count: '0 Projects', years: '' })
  })
})
```

`src/lib/host.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { hostLabel } from './host'

describe('hostLabel', () => {
  it('returns the host without the protocol or path', () => {
    expect(hostLabel('https://vampnetwork.com')).toBe('vampnetwork.com')
    expect(hostLabel('https://thebookingflow.com/pricing?x=1')).toBe('thebookingflow.com')
  })

  it('drops a leading www', () => {
    expect(hostLabel('https://www.aiwiwaffles.com/')).toBe('aiwiwaffles.com')
  })

  it('returns the input when it is not a URL', () => {
    expect(hostLabel('not a url')).toBe('not a url')
  })
})
```

In `src/lib/featuredWork.test.ts`, change the "carries the title and the first two tags" test's expected object to include the id, and add one assertion that every tile carries its entry id:

```ts
  it('carries the id, the title and the first two tags', () => {
    expect(featuredWork([entry('a', '2025-01-01', ['Branding', 'Local SEO', 'Shopify'])])[0]).toEqual({
      id: 'a',
      number: '01',
      variant: 'tall',
      title: 'A',
      href: '/work/a',
      tags: ['Branding', 'Local SEO'],
    })
  })
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/caseStudies.test.ts src/lib/host.test.ts src/lib/featuredWork.test.ts`
Expected: FAIL. The first two cannot resolve their modules; the `featuredWork` test fails because `id` is missing.

- [ ] **Step 3: Implement**

`src/lib/caseStudies.ts`:

```ts
export interface CaseStudyEntry {
  /** The case study slug. */
  id: string
  data: { title: string; date: Date }
}

/** Newest first, with the id as a stable tiebreak. Does not reorder the input. */
export function sortCaseStudies<T extends CaseStudyEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id))
}

export type RowSurface = 'stone' | 'ink' | 'ivory'

export interface WorkRow<T> {
  entry: T
  number: string
  surface: RowSurface
  mediaSide: 'left' | 'right'
  href: string
}

const SURFACES: RowSurface[] = ['stone', 'ink', 'ivory']

/** One row per case study for the Work index. */
export function workRows<T extends CaseStudyEntry>(entries: T[]): WorkRow<T>[] {
  return sortCaseStudies(entries).map((entry, i) => ({
    entry,
    number: String(i + 1).padStart(2, '0'),
    surface: SURFACES[i % SURFACES.length],
    mediaSide: i % 2 === 0 ? 'right' : 'left',
    href: `/work/${entry.id}`,
  }))
}

/** The case study's position in the newest-first list, as shown in its hero. */
export function caseStudyNumber(entries: CaseStudyEntry[], id: string): string {
  const index = sortCaseStudies(entries).findIndex((entry) => entry.id === id)
  if (index < 0) throw new Error(`Unknown case study "${id}"`)
  return String(index + 1).padStart(3, '0')
}

/** The next older case study, wrapping to the newest. Null when there is nowhere to go. */
export function nextCaseStudy<T extends CaseStudyEntry>(entries: T[], id: string): T | null {
  const sorted = sortCaseStudies(entries)
  const index = sorted.findIndex((entry) => entry.id === id)
  if (index < 0 || sorted.length < 2) return null
  return sorted[(index + 1) % sorted.length]
}

/** The count and year range shown beside the Work index heading. */
export function projectSpan(entries: CaseStudyEntry[]): { count: string; years: string } {
  const count = `${entries.length} ${entries.length === 1 ? 'Project' : 'Projects'}`
  if (entries.length === 0) return { count, years: '' }
  const years = entries.map((entry) => entry.data.date.getUTCFullYear())
  const first = Math.min(...years)
  const last = Math.max(...years)
  return { count, years: first === last ? String(first) : `${first} to ${last}` }
}
```

`src/lib/host.ts`:

```ts
/** The host name to show for a link, without protocol, path or a leading www. */
export function hostLabel(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}
```

In `src/lib/featuredWork.ts`: import `sortCaseStudies` from `./caseStudies`, add `id: string` as the first field of `WorkTile`, and replace the function body's sort with the shared one:

```ts
import { sortCaseStudies } from './caseStudies'

/** The three most recent case studies as Home tiles, newest first. */
export function featuredWork(entries: WorkEntry[]): WorkTile[] {
  return sortCaseStudies(entries)
    .slice(0, VARIANTS.length)
    .map((entry, i) => ({
      id: entry.id,
      number: String(i + 1).padStart(2, '0'),
      variant: VARIANTS[i],
      title: entry.data.title,
      href: `/work/${entry.id}`,
      tags: entry.data.tags.slice(0, 2),
    }))
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `npx vitest run src/lib/caseStudies.test.ts src/lib/host.test.ts src/lib/featuredWork.test.ts`
Expected: PASS.

- [ ] **Step 5: Extend the collection schema**

Replace `src/content.config.ts` with:

```ts
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// A media slot. No `src` means a labelled placeholder; `alt` names what belongs there.
// `src` and `poster` are paths relative to src/assets/case-studies/.
const mediaRef = z.object({
  src: z.string().optional(),
  alt: z.string(),
  poster: z.string().optional(),
})

const caseStudies = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    headline: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    year: z.string(),
    tags: z.array(z.string()).min(1),
    services: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    role: z.string(),
    client: z.string().optional(),
    liveUrl: z.string().url().optional(),
    result: z.string(),
    ogImage: z.string().optional(),
    heroNote: z.string().optional(),
    media: z.object({ hero: mediaRef.optional(), tile: mediaRef.optional() }).optional(),
  }),
})

export const collections = { caseStudies }
```

- [ ] **Step 6: Verify the three case studies satisfy the schema**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all tests pass, 0 type errors, the build completes. A schema error here means a case study lacks a required field: report it, do not loosen the schema.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/lib/caseStudies.ts src/lib/caseStudies.test.ts src/lib/host.ts src/lib/host.test.ts src/lib/featuredWork.ts src/lib/featuredWork.test.ts
git commit -m "feat: add the full case study schema and the work list logic"
```

(Add the two trailer lines from Global Constraints to every commit in this plan.)

---

### Task 2: Media resolution and gallery layout

**Files:**
- Create: `src/lib/media.ts`, `src/lib/media.test.ts`, `src/lib/caseStudyMedia.ts`, `src/lib/caseStudyMedia.test.ts`, `src/lib/galleryLayout.ts`, `src/lib/galleryLayout.test.ts`, `src/assets/case-studies/README.md`

**Interfaces:**
- Produces:
  - `src/lib/media.ts`: `interface MediaRef { src?: string; alt: string; poster?: string }`; `type MediaKind = 'image' | 'video'`; `mediaKind(path: string): MediaKind | null`; `videoType(path: string): string`; `interface MediaFiles<I> { images: Record<string, I>; videos: Record<string, string> }`; `type ResolvedMedia<I> = { kind: 'placeholder'; alt: string } | { kind: 'image'; alt: string; image: I } | { kind: 'video'; alt: string; url: string; type: string; poster: I }`; `resolveMedia<I>(ref: MediaRef, files: MediaFiles<I>, context: string): ResolvedMedia<I>`.
  - `src/lib/caseStudyMedia.ts`: `mediaKey(globPath: string): string`; `type CaseStudyMedia = ResolvedMedia<ImageMetadata>`; `caseStudyMedia(ref: MediaRef, context: string): CaseStudyMedia`; `tileMedia(ref: MediaRef | undefined, context: string): CaseStudyMedia | null`.
  - `src/lib/galleryLayout.ts`: `interface GalleryLayout { grid: string; items: { span: string; tone: 'light' | 'dark' }[] }`; `galleryLayout(count: number): GalleryLayout`.

- [ ] **Step 1: Write the failing tests**

`src/lib/media.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mediaKind, resolveMedia, videoType } from './media'

const files = {
  images: { 'vamp/dash.png': 'IMG-DASH', 'vamp/poster.jpg': 'IMG-POSTER' },
  videos: { 'vamp/tour.mp4': '/assets/tour.mp4', 'vamp/tour.webm': '/assets/tour.webm' },
}

describe('mediaKind', () => {
  it('reads the kind from the extension, ignoring case', () => {
    for (const path of ['a.png', 'a.jpg', 'a.JPEG', 'a.webp', 'a.avif', 'a.svg']) expect(mediaKind(path)).toBe('image')
    for (const path of ['a.mp4', 'a.WEBM']) expect(mediaKind(path)).toBe('video')
  })

  it('is null for anything else', () => {
    for (const path of ['a.mov', 'a.gif', 'a', 'a.png.txt', '']) expect(mediaKind(path)).toBeNull()
  })
})

describe('videoType', () => {
  it('gives the MIME type', () => {
    expect(videoType('a.mp4')).toBe('video/mp4')
    expect(videoType('a.webm')).toBe('video/webm')
  })
})

describe('resolveMedia', () => {
  it('is a placeholder when there is no src, keeping the alt as its label', () => {
    expect(resolveMedia({ alt: 'Dashboard' }, files, 'vamp hero')).toEqual({ kind: 'placeholder', alt: 'Dashboard' })
    expect(resolveMedia({ src: '', alt: 'Dashboard' }, files, 'vamp hero')).toEqual({ kind: 'placeholder', alt: 'Dashboard' })
  })

  it('resolves an image', () => {
    expect(resolveMedia({ src: 'vamp/dash.png', alt: 'Dashboard' }, files, 'vamp hero')).toEqual({
      kind: 'image',
      alt: 'Dashboard',
      image: 'IMG-DASH',
    })
  })

  it('tolerates a leading slash or ./', () => {
    expect(resolveMedia({ src: '/vamp/dash.png', alt: 'D' }, files, 'x').kind).toBe('image')
    expect(resolveMedia({ src: './vamp/dash.png', alt: 'D' }, files, 'x').kind).toBe('image')
  })

  it('resolves a video with its poster', () => {
    expect(resolveMedia({ src: 'vamp/tour.mp4', alt: 'Tour', poster: 'vamp/poster.jpg' }, files, 'vamp step 1')).toEqual({
      kind: 'video',
      alt: 'Tour',
      url: '/assets/tour.mp4',
      type: 'video/mp4',
      poster: 'IMG-POSTER',
    })
  })

  it('names the context and the path when a file is missing', () => {
    expect(() => resolveMedia({ src: 'vamp/typo.png', alt: 'D' }, files, 'vamp-network hero')).toThrow(
      'vamp-network hero: no file at src/assets/case-studies/vamp/typo.png',
    )
    expect(() => resolveMedia({ src: 'vamp/nope.mp4', alt: 'T', poster: 'vamp/poster.jpg' }, files, 'vamp step 2')).toThrow(
      'vamp step 2: no file at src/assets/case-studies/vamp/nope.mp4',
    )
  })

  it('rejects an unsupported extension', () => {
    expect(() => resolveMedia({ src: 'vamp/tour.mov', alt: 'T' }, files, 'vamp step 1')).toThrow(
      'vamp step 1: "vamp/tour.mov" is not a supported image or video type',
    )
  })

  it('requires a poster for a video, and the poster must be an existing image', () => {
    expect(() => resolveMedia({ src: 'vamp/tour.mp4', alt: 'T' }, files, 'vamp step 1')).toThrow(
      'vamp step 1: the video "vamp/tour.mp4" needs a poster image',
    )
    expect(() => resolveMedia({ src: 'vamp/tour.mp4', alt: 'T', poster: 'vamp/tour.webm' }, files, 'vamp step 1')).toThrow(
      'vamp step 1: the poster "vamp/tour.webm" must be an image',
    )
    expect(() => resolveMedia({ src: 'vamp/tour.mp4', alt: 'T', poster: 'vamp/gone.jpg' }, files, 'vamp step 1')).toThrow(
      'vamp step 1: no file at src/assets/case-studies/vamp/gone.jpg',
    )
  })

  it('does not find files outside the folder', () => {
    expect(() => resolveMedia({ src: '../logo/mb-mark.svg', alt: 'L' }, files, 'x')).toThrow('x: no file at')
  })
})
```

`src/lib/galleryLayout.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { galleryLayout } from './galleryLayout'

describe('galleryLayout', () => {
  it('returns one item per image, for any count', () => {
    for (const count of [0, 1, 2, 3, 4, 5, 6, 7, 12]) expect(galleryLayout(count).items).toHaveLength(count)
  })

  it('makes the first item large when there are three or five', () => {
    expect(galleryLayout(3).items[0].span).toContain('row-span-2')
    expect(galleryLayout(5).items[0].span).toContain('row-span-2')
    expect(galleryLayout(5).items.slice(1).every((item) => !item.span.includes('row-span-2'))).toBe(true)
  })

  it('keeps even counts as a plain grid with no large item', () => {
    for (const count of [2, 4, 6]) expect(galleryLayout(count).items.every((item) => !item.span.includes('row-span-2'))).toBe(true)
  })

  it('alternates light and dark placeholder tones', () => {
    expect(galleryLayout(4).items.map((item) => item.tone)).toEqual(['light', 'dark', 'light', 'dark'])
  })

  it('always gives a grid class', () => {
    for (const count of [1, 2, 3, 5, 9]) expect(galleryLayout(count).grid).toMatch(/grid-cols/)
  })
})
```

`src/lib/caseStudyMedia.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { caseStudyMedia, mediaKey, tileMedia } from './caseStudyMedia'

describe('mediaKey', () => {
  it('turns a glob path into the path used in content', () => {
    expect(mediaKey('../assets/case-studies/vamp-network/dash.png')).toBe('vamp-network/dash.png')
  })
})

describe('caseStudyMedia', () => {
  it('is a labelled placeholder when there is no src', () => {
    expect(caseStudyMedia({ alt: 'Dashboard' }, 'vamp hero')).toEqual({ kind: 'placeholder', alt: 'Dashboard' })
  })

  it('stops the build when the file does not exist', () => {
    expect(() => caseStudyMedia({ src: 'vamp-network/not-there.png', alt: 'D' }, 'vamp-network hero')).toThrow(
      'vamp-network hero: no file at src/assets/case-studies/vamp-network/not-there.png',
    )
  })
})

describe('tileMedia', () => {
  it('is null when a tile has no media, so Home shows its plain colour block', () => {
    expect(tileMedia(undefined, 'vamp tile')).toBeNull()
    expect(tileMedia({ alt: 'Tile' }, 'vamp tile')).toBeNull()
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/media.test.ts src/lib/galleryLayout.test.ts src/lib/caseStudyMedia.test.ts`
Expected: FAIL, none of the three modules resolves.

- [ ] **Step 3: Implement**

`src/lib/media.ts`:

```ts
/** A media slot as written in content. No `src` means a labelled placeholder. */
export interface MediaRef {
  /** Path relative to src/assets/case-studies/. */
  src?: string
  /** Describes the media; doubles as the placeholder's label. */
  alt: string
  /** Image path, same form as `src`. Required for a video. */
  poster?: string
}

export type MediaKind = 'image' | 'video'

const IMAGE = /\.(png|jpe?g|webp|avif|svg)$/i
const VIDEO = /\.(mp4|webm)$/i

export function mediaKind(path: string): MediaKind | null {
  if (IMAGE.test(path)) return 'image'
  if (VIDEO.test(path)) return 'video'
  return null
}

export function videoType(path: string): string {
  return /\.webm$/i.test(path) ? 'video/webm' : 'video/mp4'
}

/** Files found under src/assets/case-studies/, keyed by their path inside it. */
export interface MediaFiles<I> {
  images: Record<string, I>
  videos: Record<string, string>
}

export type ResolvedMedia<I> =
  | { kind: 'placeholder'; alt: string }
  | { kind: 'image'; alt: string; image: I }
  | { kind: 'video'; alt: string; url: string; type: string; poster: I }

const ROOT = 'src/assets/case-studies/'
const clean = (path: string) => path.replace(/^\.?\//, '')

/**
 * Decide what a media slot shows. A missing or mistyped file throws, naming `context`,
 * so the build stops instead of shipping a placeholder where real media was meant.
 */
export function resolveMedia<I>(ref: MediaRef, files: MediaFiles<I>, context: string): ResolvedMedia<I> {
  if (!ref.src) return { kind: 'placeholder', alt: ref.alt }

  const src = clean(ref.src)
  const kind = mediaKind(src)
  if (!kind) throw new Error(`${context}: "${src}" is not a supported image or video type`)

  if (kind === 'image') {
    const image = files.images[src]
    if (image === undefined) throw new Error(`${context}: no file at ${ROOT}${src}`)
    return { kind: 'image', alt: ref.alt, image }
  }

  const url = files.videos[src]
  if (url === undefined) throw new Error(`${context}: no file at ${ROOT}${src}`)
  if (!ref.poster) throw new Error(`${context}: the video "${src}" needs a poster image`)

  const posterPath = clean(ref.poster)
  if (mediaKind(posterPath) !== 'image') throw new Error(`${context}: the poster "${posterPath}" must be an image`)
  const poster = files.images[posterPath]
  if (poster === undefined) throw new Error(`${context}: no file at ${ROOT}${posterPath}`)

  return { kind: 'video', alt: ref.alt, url, type: videoType(src), poster }
}
```

`src/lib/caseStudyMedia.ts`:

```ts
import type { ImageMetadata } from 'astro'
import { resolveMedia, type MediaRef, type ResolvedMedia } from './media'

const PREFIX = '../assets/case-studies/'

/** A glob path as the path content uses, relative to src/assets/case-studies/. */
export function mediaKey(globPath: string): string {
  return globPath.slice(PREFIX.length)
}

const imageModules = import.meta.glob<{ default: ImageMetadata }>('../assets/case-studies/**/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
})
const videoModules = import.meta.glob<string>('../assets/case-studies/**/*.{mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
})

// The only place that touches the file map.
const files = {
  images: Object.fromEntries(Object.entries(imageModules).map(([path, mod]) => [mediaKey(path), mod.default])),
  videos: Object.fromEntries(Object.entries(videoModules).map(([path, url]) => [mediaKey(path), url])),
}

export type CaseStudyMedia = ResolvedMedia<ImageMetadata>

export function caseStudyMedia(ref: MediaRef, context: string): CaseStudyMedia {
  return resolveMedia(ref, files, context)
}

/** Media for a Home tile, or null when the tile has none and stays a plain colour block. */
export function tileMedia(ref: MediaRef | undefined, context: string): CaseStudyMedia | null {
  if (!ref?.src) return null
  return caseStudyMedia(ref, context)
}
```

`src/lib/galleryLayout.ts`:

```ts
export interface GalleryLayout {
  /** Classes for the grid container. */
  grid: string
  items: { span: string; tone: 'light' | 'dark' }[]
}

const LARGE = 'md:row-span-2'
const PLAIN = 'aspect-[4/3]'

const GRIDS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-[1.4fr_1fr] md:grid-rows-2',
  4: 'grid-cols-1 md:grid-cols-2',
  5: 'grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] md:grid-rows-2',
}
const MANY = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'

/** Grid classes for a gallery of `count` items. Three and five lead with one large item. */
export function galleryLayout(count: number): GalleryLayout {
  const leadsLarge = count === 3 || count === 5
  return {
    grid: GRIDS[count] ?? MANY,
    items: Array.from({ length: Math.max(0, count) }, (_, i) => ({
      span: leadsLarge && i === 0 ? `${LARGE} aspect-[4/3] md:aspect-auto` : leadsLarge ? 'aspect-[4/3] md:aspect-auto' : count === 1 ? 'aspect-[16/9]' : PLAIN,
      tone: i % 2 === 0 ? 'light' : 'dark',
    })),
  }
}
```

`src/assets/case-studies/README.md`:

```markdown
# Case study media

One folder per case study, named after its slug:

    src/assets/case-studies/vamp-network/dashboard.png
    src/assets/case-studies/vamp-network/tour.mp4
    src/assets/case-studies/vamp-network/tour-poster.jpg

Refer to a file by its path inside this folder, for example `vamp-network/dashboard.png`.

- Images: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`. They are resized and converted at build time.
- Videos: `.mp4`, `.webm`. A video must have a `poster` image.
- A slot with no `src` shows a labelled placeholder. A `src` that does not match a file stops the build and names the path.

Where media goes:

- Hero and Home tile: the case study's frontmatter, `media.hero` and `media.tile`, each `{ src, alt, poster }`.
- Walkthrough steps and gallery images: the `src` and `poster` of each item in the MDX.
```

- [ ] **Step 4: Run them to verify they pass**

Run: `npx vitest run src/lib/media.test.ts src/lib/galleryLayout.test.ts src/lib/caseStudyMedia.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all pass. If `astro check` rejects the `import.meta.glob` generic or the `?url` query option, fix the typing using Vite's documented glob options and say what changed in your report; do not use `any`.

```bash
git add src/lib/media.ts src/lib/media.test.ts src/lib/caseStudyMedia.ts src/lib/caseStudyMedia.test.ts src/lib/galleryLayout.ts src/lib/galleryLayout.test.ts src/assets/case-studies/README.md
git commit -m "feat: resolve case study media to an image, a video or a labelled placeholder"
```

---

### Task 3: Play videos only while they are on screen

**Files:**
- Create: `src/lib/videoInView.ts`, `src/lib/videoInView.test.ts`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `prefersReducedMotion()` from `src/lib/motionTokens.ts`; `installMatchMedia`, `REDUCED_QUERY` from `src/test/matchMedia.ts`.
- Produces: `initVideosInView(root?: ParentNode): () => void`. Markup contract: a `<video data-play-in-view muted playsinline loop preload="none" poster="...">` plays while at least half of it is on screen.

- [ ] **Step 1: Write the failing test**

`src/lib/videoInView.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { initVideosInView } from './videoInView'

type Callback = (entries: { target: Element; isIntersecting: boolean; intersectionRatio: number }[]) => void

let callback: Callback
let observed: Element[]
let disconnected: boolean

class ObserverStub {
  constructor(cb: Callback, public options?: IntersectionObserverInit) {
    callback = cb
  }
  observe(el: Element) {
    observed.push(el)
  }
  disconnect() {
    disconnected = true
  }
}

// jsdom does not implement media playback, so each video gets its own play and pause.
function video(attrs: Record<string, string> = { 'data-play-in-view': '' }) {
  const el = document.createElement('video')
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
  el.play = vi.fn().mockResolvedValue(undefined)
  el.pause = vi.fn()
  document.body.append(el)
  return el
}

beforeEach(() => {
  observed = []
  disconnected = false
  vi.stubGlobal('IntersectionObserver', ObserverStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('initVideosInView', () => {
  it('observes only videos marked to play in view', () => {
    const marked = video()
    video({})
    initVideosInView()
    expect(observed).toEqual([marked])
  })

  it('plays when at least half is on screen and pauses when it is not', () => {
    const el = video()
    initVideosInView()
    callback([{ target: el, isIntersecting: true, intersectionRatio: 0.6 }])
    expect(el.play).toHaveBeenCalledTimes(1)
    callback([{ target: el, isIntersecting: true, intersectionRatio: 0.2 }])
    expect(el.pause).toHaveBeenCalledTimes(1)
    callback([{ target: el, isIntersecting: false, intersectionRatio: 0 }])
    expect(el.pause).toHaveBeenCalledTimes(2)
  })

  it('does not throw when the browser refuses to play', async () => {
    const el = video()
    el.play = vi.fn().mockRejectedValue(new Error('NotAllowedError'))
    initVideosInView()
    callback([{ target: el, isIntersecting: true, intersectionRatio: 1 }])
    await Promise.resolve()
    expect(el.play).toHaveBeenCalled()
  })

  it('disconnects on cleanup', () => {
    video()
    initVideosInView()()
    expect(disconnected).toBe(true)
  })

  it('under reduced motion never plays and gives the visitor controls', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const el = video()
    initVideosInView()
    expect(observed).toEqual([])
    expect(el.controls).toBe(true)
    expect(el.play).not.toHaveBeenCalled()
  })

  it('without IntersectionObserver gives the visitor controls instead', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const el = video()
    expect(() => initVideosInView()).not.toThrow()
    expect(el.controls).toBe(true)
  })

  it('only looks inside the given root', () => {
    const outside = video()
    const root = document.createElement('section')
    document.body.append(root)
    initVideosInView(root)
    expect(observed).not.toContain(outside)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/videoInView.test.ts`
Expected: FAIL, cannot resolve `./videoInView`.

- [ ] **Step 3: Implement**

`src/lib/videoInView.ts`:

```ts
import { prefersReducedMotion } from './motionTokens'

/** Play a video once at least this much of it is on screen. */
const VISIBLE = 0.5

/**
 * Play `video[data-play-in-view]` elements only while they are on screen. Under reduced
 * motion, or where the browser cannot observe intersection, nothing plays by itself and
 * the videos get native controls so the visitor can start them. Returns a cleanup function.
 */
export function initVideosInView(root: ParentNode = document): () => void {
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-play-in-view]'))

  if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') {
    for (const video of videos) video.controls = true
    return () => {}
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE) {
          // Browsers may refuse autoplay; the poster stays and nothing breaks.
          void video.play()?.catch(() => {})
        } else {
          video.pause()
        }
      }
    },
    { threshold: [0, VISIBLE] },
  )

  for (const video of videos) observer.observe(video)
  return () => observer.disconnect()
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/videoInView.test.ts`
Expected: PASS, 7 tests, no warnings.

- [ ] **Step 5: Call it from the layout**

In `src/layouts/BaseLayout.astro`, change the closing `<script>` to:

```astro
    <script>
      import { initReveals } from '../lib/reveal'
      import { initVideosInView } from '../lib/videoInView'
      initReveals()
      initVideosInView()
    </script>
```

- [ ] **Step 6: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all pass.

```bash
git add src/lib/videoInView.ts src/lib/videoInView.test.ts src/layouts/BaseLayout.astro
git commit -m "feat: play case study videos only while they are on screen"
```

---

### Task 4: MediaSlot, script artwork and content preparation

**Files:**
- Create: `src/components/media/MediaSlot.astro`
- Move: `src/components/home/ContactBand.astro` to `src/components/sections/ContactBand.astro`
- Modify: `src/pages/index.astro`, `src/styles/global.css`, `src/assets/script/phrases.json`, `src/content/case-studies/vamp-network.mdx`, `the-booking-flow.mdx`, `aiwi-waffles.mdx`
- Generated: `public/script/selected.svg`, `public/script/case-study.svg`, `src/assets/script/art.json`
- Delete: `public/images/placeholder-screen-1.svg`, `placeholder-screen-2.svg`, `placeholder-brand-1.svg`, `placeholder-brand-2.svg`

**Interfaces:**
- Consumes: `CaseStudyMedia` from `src/lib/caseStudyMedia.ts`; the generator `npm run script-art` (needs the local `.fonts/` folder).
- Produces:
  - `<MediaSlot media tone? frame? url? eager? sizes? class? />` where `media: CaseStudyMedia`, `tone: 'light' | 'dark'` (default `light`), `frame: 'browser'`, `url: string` (shown in the browser bar), `eager: boolean`, `sizes: string`.
  - CSS classes `.media-placeholder` and `.media-placeholder-dark` (striped fills).
  - `ScriptArt` names `selected` and `case-study`.
  - `src/components/sections/ContactBand.astro` (same component, new path).
  - Case study MDX with no placeholder `src`, no Walkthrough `url`, a services side note on each first chapter, and `heroNote` on the two with a walkthrough.

- [ ] **Step 1: Add the placeholder stripes**

Append to `src/styles/global.css`:

```css
/* A slot with no media yet. Its label says what belongs there. */
.media-placeholder {
  background:
    repeating-linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-ink) 7%, transparent) 0 1rem,
      transparent 1rem 2rem
    ),
    var(--color-stone);
  color: color-mix(in srgb, var(--color-ink) 70%, transparent);
}

.media-placeholder-dark {
  background:
    repeating-linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-ivory) 8%, transparent) 0 1rem,
      transparent 1rem 2rem
    ),
    color-mix(in srgb, var(--color-ivory) 8%, var(--color-ink));
  color: color-mix(in srgb, var(--color-ivory) 75%, transparent);
}
```

- [ ] **Step 2: Create MediaSlot**

`src/components/media/MediaSlot.astro`:

```astro
---
import { Image } from 'astro:assets'
import type { CaseStudyMedia } from '../../lib/caseStudyMedia'

interface Props {
  media: CaseStudyMedia
  /** Which placeholder stripe reads on the surface behind this slot. */
  tone?: 'light' | 'dark'
  /** Wrap the media in the ink-outlined browser bar. */
  frame?: 'browser'
  /** Shown in the browser bar. */
  url?: string
  /** Load an image straight away (the case study hero). */
  eager?: boolean
  sizes?: string
  class?: string
}

const { media, tone = 'light', frame, url, eager = false, sizes = '(min-width: 1024px) 50vw, 100vw', class: className } = Astro.props
---

<div class:list={['flex flex-col', frame === 'browser' && 'border-2 border-ink bg-ivory', className]}>
  {
    frame === 'browser' && (
      <div class="type-label flex items-center gap-1.5 border-b-2 border-ink px-3 py-2 font-medium normal-case tracking-normal" aria-hidden="true">
        <span class="size-2 bg-ink" />
        <span class="size-2 bg-ink" />
        <span class="size-2 bg-ink" />
        {url && <span class="ml-3">{url}</span>}
      </div>
    )
  }
  <div class="relative min-h-0 flex-1">
    {
      media.kind === 'placeholder' && (
        <div
          class:list={[
            'type-label grid h-full min-h-40 place-items-center p-6 text-center',
            tone === 'dark' ? 'media-placeholder-dark' : 'media-placeholder',
          ]}
          role="img"
          aria-label={`Placeholder: ${media.alt}`}
        >
          <p>
            {media.alt}
            <span class="mt-1 block font-medium">Screenshot, recording or photo to come</span>
          </p>
        </div>
      )
    }
    {
      media.kind === 'image' && (
        <Image
          src={media.image}
          alt={media.alt}
          widths={[640, 960, 1280, 1920]}
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          class="h-full w-full object-cover"
        />
      )
    }
    {
      media.kind === 'video' && (
        <video
          data-play-in-view
          muted
          playsinline
          loop
          preload="none"
          poster={media.poster.src}
          aria-label={media.alt}
          class="h-full w-full object-cover"
        >
          <source src={media.url} type={media.type} />
        </video>
      )
    }
  </div>
</div>
```

- [ ] **Step 3: Generate the two new script phrases**

Replace `src/assets/script/phrases.json` with:

```json
[
  { "name": "memorable", "text": "memorable", "fill": "#f86343", "edge": "#0c0c0c" },
  { "name": "lets-talk", "text": "let's talk", "fill": "#f86343", "edge": "#f4f0e6" },
  { "name": "strike", "stroke": "e", "fill": "#f86343" },
  { "name": "selected", "text": "selected", "fill": "#f86343", "edge": "#f4f0e6" },
  { "name": "case-study", "text": "case study", "fill": "#f86343", "edge": "#f4f0e6" }
]
```

Run: `npm run script-art && git status --short public/script src/assets/script`
Expected: five "wrote" lines; `public/script/selected.svg` and `public/script/case-study.svg` are new; `art.json` gains both keys. If the command reports missing fonts, stop and report BLOCKED: the fonts live in the git-ignored `.fonts/` folder on the owner's machine.

Confirm no font file is staged or tracked: `git ls-files | grep -iE "\.(ttf|otf|woff2?)$"` prints nothing.

- [ ] **Step 4: Move the contact band**

```bash
mkdir -p src/components/sections
git mv src/components/home/ContactBand.astro src/components/sections/ContactBand.astro
```

Inside the moved file the three relative imports are unchanged (`../brand/ScriptArt.astro`, `../ui/Button.astro`, `../../content/navigation`), since `sections/` sits at the same depth as `home/`. In `src/pages/index.astro` change the import to `import ContactBand from '../components/sections/ContactBand.astro'`.

- [ ] **Step 5: Make the mechanical MDX edits**

```bash
cd src/content/case-studies
# Old placeholder images out; each slot keeps its alt and becomes a labelled placeholder.
sed -i '' -E 's/ src: "\/images\/placeholder-[a-z0-9-]+\.svg",//g' vamp-network.mdx the-booking-flow.mdx aiwi-waffles.mdx
# The live URL is shown in the hero.
sed -i '' -E '/^  url="[^"]*"$/d' vamp-network.mdx the-booking-flow.mdx
# Services side note on each first chapter.
sed -i '' 's/<Chapter title="Overview">/<Chapter title="Overview" asideLabel="Services" aside={frontmatter.services}>/' vamp-network.mdx the-booking-flow.mdx aiwi-waffles.mdx
cd ../../..
grep -c "placeholder-" src/content/case-studies/*.mdx
grep -c 'url="' src/content/case-studies/*.mdx
grep -c 'asideLabel="Services"' src/content/case-studies/*.mdx
```

Expected: `0` for every file on the first two greps and `1` for every file on the third.

Then add one frontmatter line to two files, directly under the `result:` line. The text is each file's first walkthrough step body, verbatim:

`vamp-network.mdx`:

```yaml
heroNote: "A custom backend dashboard to manage creators, managers, and brands in one place."
```

`the-booking-flow.mdx`:

```yaml
heroNote: "A backend dashboard where owners track and manage every lead in their pipeline."
```

`aiwi-waffles.mdx` has no walkthrough and gets no `heroNote`.

Check that nothing else changed: `git diff --stat src/content/case-studies` shows three files and only the lines described. Read the diff.

- [ ] **Step 6: Delete the old placeholder images**

```bash
git rm -q public/images/placeholder-screen-1.svg public/images/placeholder-screen-2.svg public/images/placeholder-brand-1.svg public/images/placeholder-brand-2.svg
grep -rn "placeholder-screen\|placeholder-brand" src public --include="*.astro" --include="*.mdx" --include="*.ts" --include="*.css" | cat
```

Expected: the grep prints nothing.

- [ ] **Step 7: Verify MediaSlot in all three states**

Nothing uses `MediaSlot` yet, so check it with a temporary page and temporary files, then remove them.

1. Create a temporary image: copy `src/assets/portraits/about.png` to `src/assets/case-studies/_check/shot.png` and to `src/assets/case-studies/_check/poster.png`. For the video state, put any small real `.mp4` or `.webm` at `src/assets/case-studies/_check/clip.mp4` if one is available on the machine; if none is, write a file of a few bytes there, which is enough to check the markup and the lazy loading, and say in your report that playback itself was not exercised.
2. Create `src/pages/media-check.astro` that renders, inside `BaseLayout`, four `MediaSlot`s each in a `h-80` box: a placeholder (light), a placeholder with `tone="dark"` on an ink background, an image with `frame="browser"` and a `url`, and a video. Build each `media` prop with `caseStudyMedia({ ... }, 'check')` from `src/lib/caseStudyMedia.ts`.
3. Run your dev server and look at `/media-check` at 1440x900 and 390x844: both placeholders show their label and the "to come" line legibly on their surfaces; the image fills its box inside the browser frame; the video element has `muted`, `playsinline`, `loop`, `preload="none"`, a `poster` and `data-play-in-view`. With reduced motion emulated, the video shows native controls.
4. Change one `src` to a file that does not exist and confirm the dev server shows the error naming `check` and the path. Change it back.
5. Delete `src/pages/media-check.astro` and the `src/assets/case-studies/_check/` folder. Confirm `git status --short` shows neither.

- [ ] **Step 8: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build && grep -o 'Got a project' dist/index.html | wc -l`
Expected: all pass; the count is `1` (Home still has its contact band).

```bash
git add src/components/media src/components/sections src/pages/index.astro src/styles/global.css src/assets/script public/script src/content/case-studies public/images
git status --short | grep -iE "\.(ttf|otf|woff2?)$" ; echo "font files staged: $?"
git commit -m "feat: add the media slot, two script phrases and prepare the case study content"
```

Expected: `font files staged: 1`.

---

### Task 5: Case study content blocks and a bare page to render them

**Files:**
- Create: `src/components/case-study/Chapter.astro`, `PullQuote.astro`, `Walkthrough.astro`, `Gallery.astro`, `Outcome.astro`, `src/pages/work/[slug].astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `MediaSlot`; `caseStudyMedia` from `src/lib/caseStudyMedia.ts`; `galleryLayout` from `src/lib/galleryLayout.ts`; the `caseStudies` collection; `ContactBand` from `src/components/sections/`.
- Produces: the five blocks with these props, and a page at `/work/<slug>` that renders a case study's MDX body with them. Task 6 adds the hero, the at-a-glance strip and next project to this page.
  - `Chapter`: `title: string`, `asideLabel?: string`, `aside?: string[]`, default slot.
  - `PullQuote`: `text: string`.
  - `Walkthrough`: `steps: { title: string; body: string; alt: string; src?: string; poster?: string }[]`.
  - `Gallery`: `images: { alt: string; caption?: string; src?: string; poster?: string }[]`.
  - `Outcome`: `metrics: { value: string; label: string }[]`.

Target: sections C3 to C7 of the reference. In the content, `PullQuote`, `Walkthrough`, `Gallery` and `Outcome` are written inside a `Chapter`. They must break out of the chapter's text column to the full width, as the reference shows.

- [ ] **Step 1: Add the case study layout CSS**

Append to `src/styles/global.css`:

```css
/* Case study body: numbered chapters on a visible six-column grid. */
.cs-body {
  counter-reset: chapter;
}

.cs-chapter {
  counter-increment: chapter;
  background-image: linear-gradient(to right, color-mix(in srgb, var(--color-ink) 12%, transparent) 1px, transparent 1px);
  background-size: calc(100% / 6) 100%;
}

.cs-chapter-number::before {
  content: counter(chapter, decimal-leading-zero);
}

/* The slot wrapper dissolves so prose and blocks are placed on the chapter's own grid. */
.cs-chapter-body {
  display: contents;
}

@media (min-width: 1024px) {
  .cs-chapter-body > * {
    grid-column: 2 / 5;
  }

  /* Blocks written inside a chapter run the full width. */
  .cs-chapter-body > .cs-block {
    grid-column: 1 / -1;
  }

  /* The outcome chapter splits: heading and prose on the left, the metrics panel on the right. */
  .cs-chapter:has(.cs-outcome) > h2,
  .cs-chapter:has(.cs-outcome) .cs-chapter-body > :not(.cs-block) {
    grid-column: 2 / 4;
  }

  .cs-chapter-body > .cs-outcome {
    grid-column: 4 / -1;
    grid-row: 1 / span 40;
  }
}

/* Reading styles for prose written in a chapter. */
.cs-chapter-body > p,
.cs-chapter-body > ul,
.cs-chapter-body > ol {
  font-size: 1.0625rem;
  line-height: 1.65;
  margin-bottom: 1.2rem;
  padding-inline: 1.5rem;
}

.cs-chapter-body > ul {
  list-style: square;
  padding-left: 2.75rem;
}

.cs-chapter-body > ul > li + li {
  margin-top: 0.6rem;
}

.cs-chapter-body strong {
  font-weight: 600;
}

@media (min-width: 1024px) {
  .cs-chapter-body > p,
  .cs-chapter-body > ul,
  .cs-chapter-body > ol {
    padding-inline: 1.25rem 2rem;
  }

  .cs-chapter-body > ul {
    padding-left: 2.5rem;
  }
}
```

Archivo ships at weight 400 only (weight 600 was dropped in sub-project 1 because nothing used it). The bold lead-ins in chapter lists need it: in `astro.config.mjs` change Archivo's `weights` back to `[400, 600]`.

- [ ] **Step 2: Create the five blocks**

`src/components/case-study/Chapter.astro`:

```astro
---
interface Props {
  title: string
  /** Heading of the optional side note, for example "Services". */
  asideLabel?: string
  aside?: string[]
}

const { title, asideLabel, aside = [] } = Astro.props
---

<section class="cs-chapter grid border-t-2 border-ink py-16 first:border-t-0 lg:grid-cols-6 lg:py-20">
  <div class="flex items-baseline gap-4 px-6 md:px-12 lg:col-[1/2] lg:row-[1/2] lg:flex-col lg:items-start lg:gap-3 lg:pr-0" aria-hidden="true">
    <span class="cs-chapter-number type-label text-sm"></span>
    <span class="type-label lg:rotate-180 lg:[writing-mode:vertical-rl]">{title}</span>
  </div>
  <h2 class="type-display px-6 pb-8 pt-3 text-[clamp(3rem,7vw,7rem)] md:px-12 lg:col-[2/7] lg:row-[1/2] lg:px-5 lg:pb-10 lg:pt-0" data-reveal="rise">
    {title}
  </h2>
  <div class="cs-chapter-body">
    <slot />
  </div>
  {
    aside.length > 0 && (
      <aside class="type-label mt-8 px-6 font-medium md:px-12 lg:col-[5/7] lg:row-[2/5] lg:mt-0 lg:self-start lg:px-5">
        {asideLabel && (
          <p class="mb-2 font-bold">
            <span aria-hidden="true">// </span>
            {asideLabel}
          </p>
        )}
        <ul role="list">
          {aside.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
      </aside>
    )
  }
</section>
```

`src/components/case-study/PullQuote.astro`:

```astro
---
interface Props {
  text: string
}

const { text } = Astro.props
---

<figure class="cs-block my-10 grid gap-4 bg-vermilion px-6 py-14 text-ink md:px-12 lg:my-12 lg:grid-cols-[5rem_1fr] lg:py-20">
  <span class="font-display text-[clamp(5rem,9vw,9rem)] leading-[0.7]" aria-hidden="true">&ldquo;</span>
  <blockquote class="type-display text-[clamp(2rem,4.4vw,4.5rem)] leading-[1.04]" data-reveal="rise">
    <p>{text}</p>
  </blockquote>
</figure>
```

`src/components/case-study/Walkthrough.astro`:

```astro
---
import MediaSlot from '../media/MediaSlot.astro'
import { caseStudyMedia } from '../../lib/caseStudyMedia'

interface Step {
  title: string
  body: string
  alt: string
  src?: string
  poster?: string
}

interface Props {
  steps: Step[]
}

const { steps } = Astro.props
---

<ol role="list" class="cs-block relative my-10 space-y-14 px-6 md:px-12 lg:my-14 lg:space-y-20">
  <span
    class="absolute right-6 top-0 hidden h-28 w-28 [background:repeating-linear-gradient(90deg,var(--color-ink)_0_0.3rem,transparent_0.3rem_0.8rem)] md:right-12 lg:block"
    aria-hidden="true"
  >
  </span>
  {
    steps.map((step, i) => (
      <li class="grid items-end gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-12 lg:even:grid-cols-[1fr_1.5fr]">
        <div class:list={['relative', i % 2 === 1 && 'lg:order-2']} data-reveal="rise">
          <MediaSlot
            media={caseStudyMedia({ src: step.src, alt: step.alt, poster: step.poster }, `walkthrough step "${step.title}"`)}
            class="aspect-[16/9.4]"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
          <p
            class:list={[
              'type-display absolute bottom-6 border-2 border-ink bg-ivory px-4 py-2.5 text-[clamp(1rem,1.5vw,1.5rem)]',
              'before:mr-3 before:inline-block before:h-1 before:w-6 before:bg-vermilion before:align-middle',
              i % 2 === 1 ? '-right-3' : '-left-3',
            ]}
          >
            {step.title}
          </p>
        </div>
        <div>
          <p class="font-display text-[clamp(3.5rem,6vw,6rem)] leading-none text-vermilion" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </p>
          <p class="mt-3 max-w-md text-[1.0625rem] leading-relaxed">{step.body}</p>
        </div>
      </li>
    ))
  }
</ol>
```

The step number is vermilion on ivory. That is allowed because it is large display type (at least 3.5rem) and decorative (`aria-hidden`); the rule against vermilion on ivory covers small text.

`src/components/case-study/Gallery.astro`:

```astro
---
import MediaSlot from '../media/MediaSlot.astro'
import { caseStudyMedia } from '../../lib/caseStudyMedia'
import { galleryLayout } from '../../lib/galleryLayout'

interface GalleryImage {
  alt: string
  caption?: string
  src?: string
  poster?: string
}

interface Props {
  images: GalleryImage[]
}

const { images } = Astro.props
const layout = galleryLayout(images.length)
---

<ul role="list" class:list={['cs-block my-10 grid gap-4 px-6 md:px-12 lg:my-14 md:auto-rows-[minmax(14rem,17vw)]', layout.grid]}>
  {
    images.map((image, i) => (
      <li class:list={['relative', layout.items[i].span]} data-reveal="rise" data-reveal-index={i}>
        <MediaSlot
          media={caseStudyMedia({ src: image.src, alt: image.alt, poster: image.poster }, `gallery image "${image.alt}"`)}
          tone={layout.items[i].tone}
          class="h-full"
        />
        {image.caption && <p class="type-label absolute bottom-3 left-3 bg-ivory px-2.5 py-1.5 text-ink">{image.caption}</p>}
      </li>
    ))
  }
</ul>
```

`src/components/case-study/Outcome.astro`:

```astro
---
interface Metric {
  value: string
  label: string
}

interface Props {
  /** The first metric is the headline one and is set giant. */
  metrics: Metric[]
}

const { metrics } = Astro.props
const [headline] = metrics
---

<div class="cs-block cs-outcome relative mt-10 bg-ink text-ivory lg:mt-0 lg:min-h-[30rem]">
  {
    headline && (
      <p
        class="font-display pointer-events-none px-6 pt-8 text-[clamp(7rem,19vw,19rem)] leading-[0.9] text-vermilion md:px-12 lg:absolute lg:-left-[22%] lg:bottom-10 lg:p-0"
        aria-hidden="true"
        data-reveal="rise"
      >
        {headline.value}
      </p>
    )
  }
  <span
    class="absolute right-6 top-8 hidden h-24 w-36 [background:repeating-linear-gradient(90deg,var(--color-ivory)_0_0.3rem,transparent_0.3rem_0.8rem)] md:right-12 lg:block"
    aria-hidden="true"
  >
  </span>
  <dl class="grid gap-6 px-6 pb-12 pt-8 md:px-12 lg:absolute lg:inset-x-0 lg:bottom-0 lg:pb-14 lg:pl-[28%]">
    {
      metrics.map((metric) => (
        <div class="grid grid-cols-[minmax(6rem,11rem)_1fr] items-baseline border-t border-line-dark pt-4">
          <dd class="font-display order-1 text-[clamp(3.5rem,6.4vw,6.5rem)] leading-[0.9] text-vermilion">{metric.value}</dd>
          <dt class="type-label order-2">{metric.label}</dt>
        </div>
      ))
    }
  </dl>
</div>
```

- [ ] **Step 3: Create the bare case study page**

`src/pages/work/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content'
import BaseLayout from '../../layouts/BaseLayout.astro'
import Chapter from '../../components/case-study/Chapter.astro'
import PullQuote from '../../components/case-study/PullQuote.astro'
import Walkthrough from '../../components/case-study/Walkthrough.astro'
import Gallery from '../../components/case-study/Gallery.astro'
import Outcome from '../../components/case-study/Outcome.astro'
import ContactBand from '../../components/sections/ContactBand.astro'

export async function getStaticPaths() {
  const entries = await getCollection('caseStudies')
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }))
}

const { entry } = Astro.props
const { Content } = await render(entry)
---

<BaseLayout title={entry.data.headline} description={entry.data.summary} type="article" ogImage={entry.data.ogImage}>
  <h1 class="type-label px-6 pt-32 md:px-12">{entry.data.headline}</h1>
  <div class="cs-body mt-10">
    <Content components={{ Chapter, PullQuote, Walkthrough, Gallery, Outcome }} />
  </div>
  <ContactBand />
</BaseLayout>
```

The `h1` here is a temporary plain heading so the page is valid; Task 6 replaces it with the hero.

- [ ] **Step 4: Check the build renders all three**

Run: `npm run typecheck && npm run build && ls dist/work`
Expected: 0 errors; `dist/work/` contains `vamp-network`, `the-booking-flow` and `aiwi-waffles`. If the build fails because `frontmatter` is not defined inside the MDX (the `aside={frontmatter.services}` prop from Task 4), use the fallback the spec names: in each of the three files replace `aside={frontmatter.services}` with the literal list from that file's `services` frontmatter, and say so in your report.

- [ ] **Step 5: Load the design skills, then tune in the browser**

Load `industrial-brutalist-ui`, `high-end-visual-design`, `frontend-design` and `design-taste-frontend` as guidance. Then, against your dev server at 1440x900 with reduced motion emulated, compare `/work/vamp-network` and `/work/aiwi-waffles` with sections C3 to C7 of the reference and adjust the classes and the CSS above until all of these hold:

- **C3 Chapters:** visible vertical column lines; each chapter has an automatic number (01 to 04) and its title rotated in the left rail; the Anton heading; prose in the middle columns at a comfortable measure; the Services list as a side note on the right of the first chapter, aligned with the first paragraph; an ink rule between chapters.
- **C4 Pull quote:** a full-width vermilion band, ink Anton sentence, a large quotation mark.
- **C5 Walkthrough:** steps alternate sides; each has a large media slot with the Anton name tag overlapping its lower corner, the big step number and the body; one striped accent top right. Placeholders show each step's own description.
- **C6 Gallery** ('Aiwi Waffles): the grid for two images; captions as labels; alternating light and dark placeholders.
- **C7 Outcome:** on desktop the chapter splits, heading and prose on the left, the ink panel on the right from the top of the chapter, the first metric's value giant in vermilion overlapping the panel's left edge, every metric listed in the panel. 'Aiwi Waffles shows "#1"; the others show "00".
- Blocks written inside a chapter run the full page width.
- At 1024x768 and 390x844 everything stacks cleanly: the rail becomes a number and title above the heading, the side note falls below the prose, walkthrough media comes first, the outcome number sits above its panel. No horizontal scroll at any width.
- With motion allowed, headings, steps and gallery items reveal once on scroll and nothing is left transparent.
- Keyboard: there is nothing focusable in these blocks; confirm Tab moves from the header straight to the contact band without getting stuck.

You may restructure the markup and CSS to get there, provided: prop names stay as listed, chapter numbering stays automatic, the outcome's giant value is the first metric and is `aria-hidden` (the same value is in the list), placeholders keep their labels, and no copy changes. If the `:has()` split for the outcome chapter cannot be made to work cleanly, fall back to the outcome as a full-width band under the chapter's prose and say so in your report.

- [ ] **Step 6: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`, then:

```bash
for f in vamp-network the-booking-flow aiwi-waffles; do printf "%s h1:%s h2:%s\n" $f "$(grep -o '<h1' dist/work/$f/index.html | wc -l | tr -d ' ')" "$(grep -o '<h2' dist/work/$f/index.html | wc -l | tr -d ' ')"; done
```

Expected: each page has `h1:1` and `h2:5` (four chapters plus the contact band).

```bash
git add src/components/case-study src/pages/work src/styles/global.css astro.config.mjs src/content/case-studies
git commit -m "feat: render case study chapters, quotes, walkthroughs, galleries and outcomes"
```

---

### Task 6: Case study hero, at-a-glance strip and next project

**Files:**
- Create: `src/components/case-study/CaseStudyHero.astro`, `AtAGlance.astro`, `NextProject.astro`
- Modify: `src/pages/work/[slug].astro`

**Interfaces:**
- Consumes: `caseStudyNumber`, `nextCaseStudy` from `src/lib/caseStudies.ts`; `hostLabel` from `src/lib/host.ts`; `caseStudyMedia`; `MediaSlot`; `ScriptArt` (name `case-study`); `ArrowButton`, `VerticalLabel`.
- Produces: the finished case study page.

Target: sections C1, C2 and C8 of the reference.

- [ ] **Step 1: Create the hero**

`src/components/case-study/CaseStudyHero.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content'
import ScriptArt from '../brand/ScriptArt.astro'
import MediaSlot from '../media/MediaSlot.astro'
import VerticalLabel from '../ui/VerticalLabel.astro'
import { caseStudyMedia } from '../../lib/caseStudyMedia'
import { hostLabel } from '../../lib/host'

interface Props {
  entry: CollectionEntry<'caseStudies'>
  /** Position in the newest-first list, for example "001". */
  number: string
}

const { entry, number } = Astro.props
const { title, headline, year, liveUrl, heroNote, summary, media } = entry.data
const hero = caseStudyMedia(media?.hero ?? { alt: `${title} hero capture` }, `${entry.id} hero`)
---

<section class="relative isolate overflow-hidden bg-ivory lg:h-[54vw] lg:max-h-[900px] lg:min-h-[620px]">
  <div class="absolute inset-x-0 bottom-0 top-[58%] bg-vermilion lg:left-[34%] lg:top-[44%]" data-reveal="wipe" data-reveal-on="load"></div>

  <p class="type-label relative px-6 pt-28 text-sm md:px-12 lg:absolute lg:left-0 lg:top-[17%] lg:pt-0" aria-hidden="true">{number}</p>

  {/* The client name sits on top of the vermilion block where they cross. Decorative: the h1 is the headline. */}
  <p class="type-display relative z-10 mt-3 inline-block px-6 text-[clamp(3.5rem,9.4vw,9.5rem)] leading-[0.88] md:px-12 lg:absolute lg:left-0 lg:top-[22%] lg:mt-0 lg:max-w-[46%]" aria-hidden="true">
    {title}
    <ScriptArt name="case-study" class="absolute -bottom-[0.34em] left-3 w-[min(60%,22rem)] -rotate-6 md:left-9" reveal="wipe" delay={0.5} />
  </p>

  <VerticalLabel class="absolute right-6 top-28 border-r-2 border-ink pr-2 md:right-12 lg:top-[15%] lg:text-sm">
    Case study<br />{year}
  </VerticalLabel>

  <p class="type-label relative z-10 mt-12 hidden max-w-[12rem] font-medium before:mb-2 before:block before:size-3 before:border-l-2 before:border-t-2 before:border-ink lg:absolute lg:left-[35%] lg:top-[22%] lg:mt-0 lg:block">
    {heroNote ?? summary}
  </p>

  <div class="relative z-10 mx-6 mt-12 md:mx-12 lg:absolute lg:bottom-[9%] lg:left-[48%] lg:right-[7%] lg:top-[19%] lg:mx-0 lg:mt-0" data-reveal="rise" data-reveal-on="load" data-reveal-delay="0.25">
    <MediaSlot media={hero} frame="browser" url={liveUrl && hostLabel(liveUrl)} eager class="aspect-[4/3] lg:aspect-auto lg:h-full" sizes="(min-width: 1024px) 45vw, 100vw" />
  </div>

  <h1 class="type-label relative z-10 mt-10 max-w-sm px-6 before:mb-3 before:block before:h-0.5 before:w-10 before:bg-ink md:px-12 lg:absolute lg:bottom-[9%] lg:left-0 lg:mt-0 lg:max-w-[24%]">
    {headline}
  </h1>

  {
    liveUrl && (
      <a
        href={liveUrl}
        rel="noopener"
        class="group relative z-10 mx-6 mb-10 mt-8 inline-flex items-center gap-4 text-ink focus-visible:outline-ink md:mx-12 lg:absolute lg:bottom-[9%] lg:left-[34%] lg:m-0"
      >
        <span class="grid size-14 place-items-center bg-ink text-xl text-ivory transition-colors duration-200 group-hover:bg-ivory group-hover:text-ink lg:size-[4.5rem]" aria-hidden="true">
          ↗
        </span>
        <span class="type-label">
          Visit live site<br />
          {hostLabel(liveUrl)}
        </span>
      </a>
    )
  }
</section>
```

- [ ] **Step 2: Create the at-a-glance strip**

`src/components/case-study/AtAGlance.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content'
import VerticalLabel from '../ui/VerticalLabel.astro'

interface Props {
  entry: CollectionEntry<'caseStudies'>
}

const { title, client, role, year, stack, result } = Astro.props.entry.data
---

<section class="bg-ink text-ivory" aria-labelledby="glance-heading">
  <h2 id="glance-heading" class="sr-only">At a glance</h2>
  <div class="mx-auto flex max-w-[1600px]">
    <div class="hidden w-20 shrink-0 items-center justify-center lg:flex" aria-hidden="true">
      <VerticalLabel>At a glance</VerticalLabel>
    </div>
    <dl class="grid flex-1 grid-cols-2 lg:grid-cols-[repeat(4,1fr)_1.6fr]">
      <div class="border-b border-line-dark px-6 py-8 lg:border-b-0 lg:border-l lg:px-7">
        <dt class="type-label text-vermilion">Client</dt>
        <dd class="type-display mt-3 text-[clamp(1.25rem,1.5vw,1.6rem)]">{client ?? title}</dd>
      </div>
      <div class="border-b border-line-dark px-6 py-8 lg:border-b-0 lg:border-l lg:px-7">
        <dt class="type-label text-vermilion">Role</dt>
        <dd class="type-display mt-3 text-[clamp(1.25rem,1.5vw,1.6rem)]">{role}</dd>
      </div>
      <div class="border-b border-line-dark px-6 py-8 lg:border-b-0 lg:border-l lg:px-7">
        <dt class="type-label text-vermilion">Year</dt>
        <dd class="type-display mt-3 text-[clamp(1.25rem,1.5vw,1.6rem)]">{year}</dd>
      </div>
      <div class="border-b border-line-dark px-6 py-8 lg:border-b-0 lg:border-l lg:px-7">
        <dt class="type-label text-vermilion">Stack</dt>
        <dd class="type-label mt-3 font-medium">
          <ul role="list">
            {stack.map((item) => (
              <li>{item}</li>
            ))}
          </ul>
        </dd>
      </div>
      <div class="col-span-2 px-6 py-8 lg:col-span-1 lg:border-l lg:border-line-dark lg:px-7">
        <dt class="type-label text-vermilion">Result</dt>
        <dd class="mt-3 text-lg leading-snug">{result}</dd>
      </div>
    </dl>
  </div>
</section>
```

- [ ] **Step 3: Create next project**

`src/components/case-study/NextProject.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content'

interface Props {
  entry: CollectionEntry<'caseStudies'>
}

const { entry } = Astro.props
---

<a
  href={`/work/${entry.id}`}
  class="group grid items-end gap-6 border-b border-line-dark bg-ink px-6 py-14 text-ivory focus-visible:-outline-offset-4 md:px-12 lg:grid-cols-[1fr_auto] lg:py-16"
>
  <span>
    <span class="type-label block text-vermilion">Next project</span>
    <span class="type-display mt-3 block text-[clamp(3rem,10vw,10rem)]" data-reveal="rise">{entry.data.title}</span>
  </span>
  <span
    class="grid size-20 place-items-center bg-vermilion text-3xl text-ink transition-colors duration-200 group-hover:bg-ivory group-focus-visible:bg-ivory lg:size-28"
    aria-hidden="true"
  >
    ↗
  </span>
</a>
```

- [ ] **Step 4: Assemble the page**

Replace `src/pages/work/[slug].astro` with:

```astro
---
import { getCollection, render } from 'astro:content'
import BaseLayout from '../../layouts/BaseLayout.astro'
import CaseStudyHero from '../../components/case-study/CaseStudyHero.astro'
import AtAGlance from '../../components/case-study/AtAGlance.astro'
import NextProject from '../../components/case-study/NextProject.astro'
import Chapter from '../../components/case-study/Chapter.astro'
import PullQuote from '../../components/case-study/PullQuote.astro'
import Walkthrough from '../../components/case-study/Walkthrough.astro'
import Gallery from '../../components/case-study/Gallery.astro'
import Outcome from '../../components/case-study/Outcome.astro'
import ContactBand from '../../components/sections/ContactBand.astro'
import { caseStudyNumber, nextCaseStudy } from '../../lib/caseStudies'

export async function getStaticPaths() {
  const entries = await getCollection('caseStudies')
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }))
}

const { entry } = Astro.props
const all = await getCollection('caseStudies')
const { Content } = await render(entry)
const next = nextCaseStudy(all, entry.id)
---

<BaseLayout title={entry.data.headline} description={entry.data.summary} type="article" ogImage={entry.data.ogImage}>
  <CaseStudyHero entry={entry} number={caseStudyNumber(all, entry.id)} />
  <AtAGlance entry={entry} />
  <div class="cs-body">
    <Content components={{ Chapter, PullQuote, Walkthrough, Gallery, Outcome }} />
  </div>
  {next && <NextProject entry={next} />}
  <ContactBand />
</BaseLayout>
```

- [ ] **Step 5: Load the design skills, then tune in the browser**

At 1440x900, then 1024x768 and 390x844, compare all three case study pages with C1, C2 and C8 of the reference and adjust until:

- **C1 Hero:** the number, the Anton client name, the small note with its corner mark, the framed hero media over the vermilion block, the square arrow with "Visit live site" and the host, the keyword `h1` at the lower left, and the rotated "Case study" and year label are placed as in the reference.
- **The client name sits on top of the vermilion block where they cross**, so the name overlays the block. It must not be clipped by the block or by the media frame, and must stay legible. Check the longest name, "The Booking Flow", and the shortest.
- **Script:** "case study" sits at the bottom left corner of the client name and overlaps its last line slightly. It is vermilion with an ivory edge and must not sit on the vermilion block (it would vanish there).
- The hero fits the first viewport at 1440x900 and the header does not collide with anything.
- **C2:** five cells with vermilion labels on ink; the result sentence reads comfortably. Placeholder result text shows as written.
- **C8:** one link, the next case study's title in Anton, a vermilion arrow square that turns ivory on hover and focus; nothing moves. From 'Aiwi Waffles (the oldest) it points to Vamp Network (the newest).
- Mobile: the hero stacks name, `h1`, media over the block, then the live link; the strip is two columns with the result full width.
- No horizontal scroll at any width. No flash on load: the block and the media are held until their reveal starts.
- Keyboard: Tab reaches "Visit live site", then the next-project link, then the contact band, with a visible focus ring on each surface.

You may restructure markup and classes, provided: the `h1` is the `headline`; the client name and number are `aria-hidden`; the live link opens in the same tab with `rel="noopener"` and is absent when there is no `liveUrl`; the note falls back to the summary; no copy changes.

- [ ] **Step 6: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`, then:

```bash
for f in vamp-network the-booking-flow aiwi-waffles; do printf "%s h1:%s next:%s live:%s\n" $f "$(grep -o '<h1' dist/work/$f/index.html | wc -l | tr -d ' ')" "$(grep -o 'Next project' dist/work/$f/index.html | wc -l | tr -d ' ')" "$(grep -o 'Visit live site' dist/work/$f/index.html | wc -l | tr -d ' ')"; done
grep -o '<title>[^<]*' dist/work/vamp-network/index.html
```

Expected: `h1:1 next:1 live:1` for each; the title is Vamp Network's headline followed by " | Mathew Brown".

```bash
git add src/components/case-study src/pages/work
git commit -m "feat: add the case study hero, at-a-glance strip and next project"
```

---

### Task 7: Work index

**Files:**
- Create: `src/components/work/WorkHeader.astro`, `src/components/work/WorkRow.astro`, `src/pages/work/index.astro`

**Interfaces:**
- Consumes: `workRows`, `projectSpan`, `WorkRow` type from `src/lib/caseStudies.ts`; `caseStudyMedia`; `MediaSlot`; `ScriptArt` (name `selected`); `VerticalLabel`; `ContactBand`.
- Produces: `/work`.

Target: sections W1 and W2 of the reference.

- [ ] **Step 1: Create the header**

`src/components/work/WorkHeader.astro`:

```astro
---
import ScriptArt from '../brand/ScriptArt.astro'
import VerticalLabel from '../ui/VerticalLabel.astro'

interface Props {
  count: string
  years: string
}

const { count, years } = Astro.props
---

<section class="relative isolate overflow-hidden bg-ivory px-6 pb-12 pt-32 md:px-12 lg:pb-16 lg:pt-36">
  <div class="mx-auto grid max-w-[1600px] items-end gap-8 lg:grid-cols-[1fr_auto]">
    <p class="type-display relative inline-block justify-self-start text-[clamp(7rem,22vw,22rem)] leading-[0.82]" aria-hidden="true">
      Work<span class="text-vermilion">.</span>
      <ScriptArt name="selected" class="absolute -top-[0.08em] left-[58%] w-[42%] -rotate-[7deg]" reveal="wipe" delay={0.3} />
    </p>
    <h1 class="type-label max-w-xs pb-4 before:mb-3 before:block before:h-0.5 before:w-10 before:bg-ink">
      UX/UI Engineering &amp; SEO Case Studies
    </h1>
  </div>
  <VerticalLabel class="absolute right-6 top-28 border-r-2 border-ink pr-2 md:right-12 lg:top-32 lg:text-sm">
    {count}<br />{years}
  </VerticalLabel>
</section>
```

- [ ] **Step 2: Create a row**

`src/components/work/WorkRow.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content'
import MediaSlot from '../media/MediaSlot.astro'
import { caseStudyMedia } from '../../lib/caseStudyMedia'
import type { WorkRow } from '../../lib/caseStudies'

interface Props {
  row: WorkRow<CollectionEntry<'caseStudies'>>
}

const { row } = Astro.props
const { title, headline, result, role, year, media } = row.entry.data
// The Work index uses the hero media; a row without it shows the labelled placeholder.
const slot = caseStudyMedia(media?.hero ?? { alt: `${title} hero capture` }, `${row.entry.id} work row`)

// Small vermilion text is only allowed on ink, so only the ink row has a vermilion number.
const surface = {
  stone: { row: 'bg-stone text-ink', block: 'bg-vermilion', arrow: 'bg-ink text-ivory', tone: 'light' },
  ink: { row: 'bg-ink text-ivory', block: 'bg-stone', arrow: 'bg-vermilion text-ink', tone: 'light' },
  ivory: { row: 'bg-ivory text-ink', block: 'bg-ink', arrow: 'bg-ink text-ivory', tone: 'dark' },
} as const
const look = surface[row.surface]
---

<li>
  <a
    href={row.href}
    class:list={['group grid focus-visible:-outline-offset-4 lg:min-h-[30vw] lg:grid-cols-[1fr_1.25fr]', look.row, row.mediaSide === 'left' && 'lg:grid-cols-[1.25fr_1fr]']}
  >
    <div class:list={['flex flex-col px-6 py-10 md:px-12 lg:py-14', row.mediaSide === 'left' ? 'lg:pl-[9vw]' : 'lg:pr-[8vw]']}>
      <span class:list={['type-label text-sm', row.surface === 'ink' && 'text-vermilion']}>{row.number} /</span>
      <h2 class="type-display mt-3 max-w-[9ch] text-[clamp(3rem,7vw,7rem)]" data-reveal="rise">{title}</h2>
      <p class="type-label mt-5 max-w-md">{headline}</p>
      <p class="mt-5 max-w-md text-lg leading-snug">{result}</p>
      <p class="type-label mt-auto flex items-center gap-8 pt-10">
        <span>{role}</span>
        <span>{year}</span>
        <span
          class:list={['ml-auto grid size-14 place-items-center text-xl lg:size-[4.5rem]', look.arrow]}
          aria-hidden="true"
        >
          <span class="inline-block transition-transform duration-200 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1 motion-reduce:transition-none">↗</span>
        </span>
      </p>
    </div>
    <div class:list={['relative min-h-[60vw] lg:min-h-0', look.block, row.mediaSide === 'left' && 'lg:order-first']}>
      <MediaSlot
        media={slot}
        tone={look.tone}
        class:list={['absolute inset-6 lg:inset-y-[3vw]', row.mediaSide === 'left' ? 'lg:-right-[5vw] lg:left-[4vw]' : 'lg:-left-[5vw] lg:right-[4vw]']}
        sizes="(min-width: 1024px) 55vw, 100vw"
      />
    </div>
  </a>
</li>
```

`MediaSlot` takes `class` as a string. If passing `class:list` to it does not type-check, build the string in the element with a template literal instead; do not add logic to the frontmatter beyond the lookup object above.

- [ ] **Step 3: Create the page**

`src/pages/work/index.astro`:

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../../layouts/BaseLayout.astro'
import WorkHeader from '../../components/work/WorkHeader.astro'
import WorkRow from '../../components/work/WorkRow.astro'
import ContactBand from '../../components/sections/ContactBand.astro'
import { projectSpan, workRows } from '../../lib/caseStudies'

const entries = await getCollection('caseStudies')
const rows = workRows(entries)
const span = projectSpan(entries)
---

<BaseLayout
  title="UX/UI Engineering & SEO Case Studies"
  description="Case studies from my work as a freelance UX/UI engineer and SEO specialist: what I was asked to do, what I built and what came of it."
>
  <WorkHeader count={span.count} years={span.years} />
  <ul role="list">
    {rows.map((row) => <WorkRow row={row} />)}
  </ul>
  <ContactBand />
</BaseLayout>
```

- [ ] **Step 4: Load the design skills, then tune in the browser**

At 1440x900, then 1024x768 and 390x844, compare `/work` with W1 and W2 of the reference and adjust until:

- **W1:** giant "Work" with a vermilion full stop; the keyword `h1` in the small text block at the lower right; the rotated count and year range ("3 Projects", "2025 to 2026") at the right; "selected" written over the top right corner of "Work", clear of the full stop and of the header.
- **W2:** three full-width rows, newest first (Vamp Network, The Booking Flow, 'Aiwi Waffles), on stone, ink and ivory, with vermilion, stone and ink media blocks. Media sits right, left, right, and breaks out of its block toward the text without covering any text. Each row shows the number, the Anton title, the headline, the result sentence, role, year and the square arrow.
- Each row is one link with a visible focus ring; on hover and focus only the arrow glyph shifts.
- Placeholders are legible on each surface and show each project's label.
- Mobile: each row stacks with the media block first and no break-out; the header's script stays on screen.
- No horizontal scroll at any width.
- The page has one `h1`; each row title is an `h2`.

You may restructure markup and classes, provided: rows come from `workRows` in that order; the whole row is one link; the number is vermilion only on the ink row; no copy changes beyond what this task states.

- [ ] **Step 5: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`, then:

```bash
grep -o '<h1' dist/work/index.html | wc -l
grep -o 'href="/work/[a-z-]*"' dist/work/index.html | sort -u
grep -o 'astro-island' dist/work/index.html | wc -l
```

Expected: one `h1`; the three case study links; the island count equals Home's (the header's mobile menu only).

```bash
git add src/components/work src/pages/work/index.astro
git commit -m "feat: add the Work index"
```

---

### Task 8: Media on Home's project tiles

**Files:**
- Modify: `src/components/home/FeaturedWork.astro`

**Interfaces:**
- Consumes: `tileMedia` from `src/lib/caseStudyMedia.ts`; `MediaSlot`; `WorkTile.id` from Task 1.
- Produces: Home tiles that show `media.tile` when a case study has one, and stay plain colour blocks when it does not.

- [ ] **Step 1: Wire the media into the tiles**

In `src/components/home/FeaturedWork.astro` frontmatter, keep the existing lookups and replace the first lines with:

```astro
---
import { getCollection } from 'astro:content'
import MediaSlot from '../media/MediaSlot.astro'
import { tileMedia } from '../../lib/caseStudyMedia'
import { featuredWork } from '../../lib/featuredWork'

const entries = await getCollection('caseStudies')
const tiles = featuredWork(entries)
// Media per tile id; null leaves the tile a plain colour block.
const media = Object.fromEntries(entries.map((entry) => [entry.id, tileMedia(entry.data.media?.tile, `${entry.id} tile`)]))
```

Inside each tile's `<a>`, as its first child, add the media and a legibility layer in the tile's own fill, and make the link `relative` with its content above them:

```astro
                {media[tile.id] && (
                  <>
                    <MediaSlot media={media[tile.id]} class="absolute inset-0" sizes="(min-width: 768px) 50vw, 100vw" />
                    <span class="absolute inset-0 bg-[inherit] opacity-80 transition-opacity duration-200 group-hover:opacity-90 motion-reduce:transition-none" aria-hidden="true" />
                  </>
                )}
```

Add `relative isolate overflow-hidden` to the `<a>`'s classes, and `relative` to each of its existing text children (the number, the `h3`, the tags and the arrow) so they sit above the layer. `media[tile.id]` is typed as possibly null; narrow it in the template as shown, not with a non-null assertion.

- [ ] **Step 2: Check both states in the browser**

1. With no tile media (the current state), Home's tiles look exactly as before. Compare a screenshot at 1440x900 with `.playwright-mcp/final-full-1440.png` from sub-project 1: the Featured work section is unchanged.
2. Temporarily give one case study tile media: copy `src/assets/portraits/about.png` to `src/assets/case-studies/vamp-network/tile-check.png` and add to `vamp-network.mdx` frontmatter:

   ```yaml
   media:
     tile:
       src: "vamp-network/tile-check.png"
       alt: "Temporary tile check"
   ```

   Confirm at 1440x900 and 390x844: the image fills the tall tile behind a stone-coloured layer; the number, title, tags and arrow stay fully legible at rest, on hover and on keyboard focus (the tile turns ink with ivory text, and the layer follows); the focus ring is visible; nothing moves or resizes. Adjust the layer's opacity if the title is not comfortably legible in every state.
3. Remove the temporary frontmatter and delete `src/assets/case-studies/vamp-network/tile-check.png` (and the folder if empty). Confirm `git status --short` shows only `FeaturedWork.astro`.

- [ ] **Step 3: Check the links now resolve**

Run: `npm run build`, then confirm every Home link to work exists: `for h in $(grep -o 'href="/work[^"]*"' dist/index.html | sort -u | sed 's/href="//;s/"//'); do test -f "dist$h/index.html" && echo "ok $h" || echo "MISSING $h"; done`
Expected: four `ok` lines (`/work` and three case studies), no `MISSING`.

- [ ] **Step 4: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all pass.

```bash
git add src/components/home/FeaturedWork.astro
git commit -m "feat: show a case study's tile media on Home when it has one"
```

---

### Task 9: Docs

**Files:**
- Modify: `CLAUDE.md`, `MEMORY.md`

- [ ] **Step 1: Update `CLAUDE.md` section 5**

Replace section 5 (from `## 5. Content pipeline` up to, not including, `## 6. Verification`) with:

```markdown
## 5. Content pipeline

- Collections are defined in `src/content.config.ts`. Case studies are `src/content/case-studies/<slug>.mdx`; the entry `id` is the slug. Frontmatter: `title`, `headline` (the page `h1`), `summary`, `date`, `year`, `tags`, `services`, `stack`, `role`, `result`, and optional `client`, `liveUrl`, `ogImage`, `heroNote`, `media.hero`, `media.tile`.
- Case study bodies are `<Chapter title>` sections containing prose and the blocks `<PullQuote text>`, `<Walkthrough steps>`, `<Gallery images>` and `<Outcome metrics>` (`src/components/case-study/`). Chapters number themselves. The first metric in `<Outcome>` is the headline one. There is no before/after slider; the owner retired it.
- **Media** lives in `src/assets/case-studies/<slug>/` and is referenced by its path inside that folder (see the README there). Every media slot takes `{ src, alt, poster }`: no `src` shows a labelled placeholder, a video needs a `poster`, and a `src` that matches no file stops the build. `alt` doubles as the placeholder's label, so write it to say what belongs there.
- **Never fabricate metrics or results.** Placeholder values (`"00"`, "Result pending...") are shown as written until the owner supplies real ones.
- `src/content/disciplines.ts` is the single source for the five disciplines. `src/content/navigation.ts` is the single source for nav links.
- Blog pillars are `src/content/blog/<slug>/index.mdx` with articles in the same folder. They are not wired to a collection yet.

```

- [ ] **Step 2: Update `MEMORY.md`**

In the "Astro rebuild" section:

- Set sub-project 2's roadmap row to status "Built; awaiting owner review" with the spec path `docs/superpowers/specs/2026-10-12-work-case-studies-design.md`, and remove the note about tile media being deferred to it.
- Add a short "What sub-project 2 added" paragraph listing what now exists, from the code: the pages `src/pages/work/index.astro` and `src/pages/work/[slug].astro`; the components under `src/components/case-study/`, `src/components/work/`, `src/components/media/` and `src/components/sections/`; the modules `caseStudies`, `media`, `caseStudyMedia`, `galleryLayout`, `videoInView` and `host` in `src/lib/`; the two new script phrases.
- Add an "Owner inputs still needed for sub-project 2" paragraph: real result sentences for Vamp Network and The Booking Flow; real metrics for all three (only 'Aiwi Waffles' "#1" is real); per case study a hero capture, a Home tile image or video, walkthrough captures (Vamp Network 2, The Booking Flow 3) and gallery photography ('Aiwi Waffles 2). Confirm those counts against the MDX before writing them.
- Under the Astro rebuild gotchas, add any real gotcha met during this build, each with cause and fix. Read this plan's ledger at `.superpowers/sdd/2026-10-12-work-case-studies/progress.md` for them. Do not invent any.

No em or en dashes in anything you add.

- [ ] **Step 3: Commit**

```bash
npm run typecheck
git add CLAUDE.md MEMORY.md
git commit -m "docs: describe the case study schema, media folders and the Work pages"
```

---

### Task 10: Whole-page verification

**Files:**
- Modify: any file from Tasks 1 to 8 that a check below shows to be wrong.

- [ ] **Step 1: Automated suite**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: every test passes with no warnings, 0 type errors, the build completes.

- [ ] **Step 2: Static HTML**

```bash
for p in work work/vamp-network work/the-booking-flow work/aiwi-waffles; do f=dist/$p/index.html; printf "%s h1:%s dashes:%s\n" $p "$(grep -o '<h1' $f | wc -l | tr -d ' ')" "$(grep -o '[—–]' $f | wc -l | tr -d ' ')"; done
git ls-files | grep -iE "\.(ttf|otf|woff2?)$" ; echo "tracked font files: $?"
```

Expected: `h1:1 dashes:0` for all four; `tracked font files: 1`.

Every placeholder is labelled: `grep -o 'to come' dist/work/vamp-network/index.html | wc -l` is at least 3 (hero plus two walkthrough steps).

- [ ] **Step 3: No React on desktop**

Against `npx astro preview --port 4322` at 1440x900, list the network requests for `/work` and `/work/vamp-network`. Expected: no React runtime chunk on either. At 390x844 the menu button opens the menu on both. Stop the preview server.

- [ ] **Step 4: Visual pass**

Against your dev server with reduced motion emulated, take full-page screenshots of `/work` and all three case studies at 1440x900, 1024x768 and 390x844, saved as `.playwright-mcp/sp2-<page>-<width>.png`. For each: section order matches the reference; no horizontal scroll; no clipped or overlapping text; no artwork covering copy; placeholders legible. At 1440 compare section by section with the reference image and list every difference you see, intended or not.

- [ ] **Step 5: Motion, keyboard and no-JavaScript passes**

- Motion allowed, fresh load: hero block and media animate in with no flash; scrolling reveals each heading, row, step and gallery item once; nothing is left transparent at the bottom of the page.
- Keyboard, from a fresh load without scrolling first, on `/work` and on one case study: Tab from the skip link to the footer. Every link takes focus in document order with a visible ring on its surface, and every focused element is fully opaque.
- JavaScript disabled: every section's content is visible on all four pages.
- Home: the three tiles and "View all projects" now load real pages.

- [ ] **Step 6: Long-content check**

Temporarily change one case study's `title` to `"A Considerably Longer Client Name Ltd"` and its `headline` to a sentence of about 120 characters. Check its hero, its Work index row, its Home tile and the next-project band of the case study before it at 1440 and 390: nothing overflows horizontally or covers other text. Fix what breaks, then restore the frontmatter exactly (`git diff src/content` shows nothing).

- [ ] **Step 7: Commit any fixes**

```bash
git status --short
git add <the files you changed, by name>
git commit -m "fix: correct Work and case study layout issues found in browser verification"
```

Skip the commit if there is nothing to commit. A fix to a `.ts` file needs a failing test first, in the same commit.
