# Personal Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a statically-generated React + Vite portfolio site with animated page transitions, MDX-powered case studies and blog (pillar/article/index tier), Netlify Forms contact, and full SEO infrastructure, deployed to Netlify from GitHub.

**Architecture:** `vite-react-ssg` generates HTML for every route at build time. MDX files in `src/content/` are loaded via Vite's `import.meta.glob`. Framer Motion (`motion` package) handles page transitions and scroll animations. React Router v6 nested routes put the nav/footer layout in a parent route.

**Tech Stack:** React 18, Vite, TypeScript, vite-react-ssg, React Router v6, Tailwind CSS v4, motion (Framer Motion), @mdx-js/rollup, remark-frontmatter, remark-mdx-frontmatter, react-helmet-async, Vitest, @testing-library/react, Netlify

---

## File Map

```
package.json
vite.config.ts
tsconfig.json
postcss.config.mjs
index.html
.gitignore
netlify.toml

src/
├── main.tsx                          # SSG entry — exports createRoot via ViteReactSSG
├── router.tsx                        # React Router route tree
├── App.tsx                           # Root component (HelmetProvider + RouterProvider)
├── test/setup.ts                     # Vitest/jsdom setup
├── styles/globals.css                # Tailwind v4 import + @theme design tokens
├── types/content.ts                  # CaseStudy, BlogPillar, BlogArticle types
├── lib/
│   ├── content.ts                    # import.meta.glob loaders + path parsers
│   ├── content.test.ts
│   ├── seo.ts                        # JSON-LD schema generators (pure functions)
│   └── seo.test.ts
├── hooks/
│   └── useReducedMotion.ts           # Reactive prefers-reduced-motion
├── components/
│   ├── SEO.tsx                       # Helmet-based head manager component
│   ├── animations/
│   │   ├── PageTransition.tsx        # motion.div with enter/exit variants
│   │   ├── FadeIn.tsx                # Scroll-triggered fade-up
│   │   └── StaggerList.tsx           # Staggered children wrapper
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Tag.tsx
│   │   └── Card.tsx
│   ├── nav/
│   │   ├── Navbar.tsx
│   │   ├── MobileMenu.tsx
│   │   └── SocialLinks.tsx
│   ├── Footer.tsx
│   └── mdx/
│       ├── ImageCarousel.tsx
│       ├── BeforeAfterSlider.tsx
│       ├── AnnotatedImage.tsx
│       ├── VideoPlayer.tsx
│       └── index.ts                  # MDXComponents registry object
├── layouts/
│   ├── DefaultLayout.tsx             # Navbar + AnimatePresence<Outlet> + Footer
│   ├── BlogLayout.tsx                # Adds breadcrumb nav above content
│   └── CaseStudyLayout.tsx           # Full-width hero + constrained body
└── pages/
    ├── Home.tsx
    ├── About.tsx
    ├── Services.tsx
    ├── Work.tsx                      # Case studies grid index
    ├── WorkDetail.tsx                # Individual case study
    ├── Blog.tsx                      # Pillar index
    ├── BlogPillar.tsx                # Pillar page
    ├── BlogArticle.tsx               # Article page
    ├── Contact.tsx                   # Netlify Forms
    └── NotFound.tsx

src/content/
├── case-studies/
│   └── example-project.mdx
└── blog/
    └── ux-ui-design/
        ├── index.mdx                 # Pillar page content
        └── button-states-that-convert.mdx
```

---

## Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `index.html`, `.gitignore`, `netlify.toml`, `src/test/setup.ts`

- [ ] **Step 1: Scaffold Vite project**

```bash
npm create vite@latest . -- --template react-ts
```

When prompted about existing files, confirm overwrite. This gives you `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, and `src/App.tsx` as starting points.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install react-router-dom vite-react-ssg react-helmet-async motion @mdx-js/react
```

> **Check docs before continuing:** https://github.com/antfu/vite-react-ssg — confirm the exact package name and `createRoot` export API. As of writing the package is `vite-react-ssg` and entry uses `ViteReactSSG`.

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D @mdx-js/rollup remark-frontmatter remark-mdx-frontmatter tailwindcss @tailwindcss/postcss vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @types/react @types/react-dom
```

- [ ] **Step 4: Replace `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 5: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 6: Update `package.json` scripts**

Replace the `scripts` block:
```json
"scripts": {
  "dev": "vite",
  "build": "vite-react-ssg build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 7: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 8: Create `.gitignore`** (if not already created by Vite)

```
node_modules
dist
.env
.env.local
```

- [ ] **Step 9: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 10: Update `tsconfig.json`** to include MDX type support

Add to `compilerOptions`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 11: Add MDX type declaration**

Create `src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  const Component: ComponentType
  export default Component
  export const frontmatter: Record<string, unknown>
}
```

- [ ] **Step 12: Verify tests run**

```bash
npm run test:run
```

Expected: `No test files found` (no tests yet — this confirms vitest is configured correctly).

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold project with Vite, React, TypeScript, MDX, Tailwind, Vitest"
```

---

## Task 2: Design Tokens & Global Styles

**Files:**
- Create: `src/styles/globals.css`
- Modify: `index.html`

- [ ] **Step 1: Create `src/styles/globals.css`**

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-background: #ffffff;
  --color-surface: #f8f8f8;
  --color-foreground: #0f0f0f;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-accent: #6366f1;
  --color-accent-hover: #4f46e5;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

html {
  font-family: var(--font-sans);
  background-color: var(--color-background);
  color: var(--color-foreground);
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}
```

> **Note:** Tailwind v4 uses `@theme` for design tokens instead of `tailwind.config.js`. Tokens defined here become CSS custom properties AND Tailwind utility classes automatically (e.g. `bg-accent`, `text-muted`). Check https://tailwindcss.com/docs if the `@theme` API differs.

- [ ] **Step 2: Add Inter font to `index.html`**

Add inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css index.html
git commit -m "feat: add design tokens and global styles"
```

---

## Task 3: TypeScript Content Types

**Files:**
- Create: `src/types/content.ts`

- [ ] **Step 1: Create `src/types/content.ts`**

```ts
export interface CaseStudyFrontmatter {
  title: string
  slug: string
  summary: string
  tags: string[]
  coverImage: string
  date: string
}

export interface CaseStudy {
  frontmatter: CaseStudyFrontmatter
  slug: string
  Component: React.ComponentType
}

export interface BlogPillarFrontmatter {
  title: string
  slug: string
  description: string
  keywords: string[]
}

export interface BlogPillar {
  frontmatter: BlogPillarFrontmatter
  slug: string
  Component: React.ComponentType
  articleCount: number
}

export interface BlogArticleFrontmatter {
  title: string
  slug: string
  description: string
  date: string
  pillar: string
  keywords: string[]
}

export interface BlogArticle {
  frontmatter: BlogArticleFrontmatter
  slug: string
  pillarSlug: string
  Component: React.ComponentType
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/content.ts
git commit -m "feat: add content type definitions"
```

---

## Task 4: Content Loader (TDD)

**Files:**
- Create: `src/lib/content.ts`, `src/lib/content.test.ts`

The content loader separates pure path-parsing functions (testable) from the Vite glob calls (not directly testable). Tests cover only the pure functions.

- [ ] **Step 1: Write failing tests**

Create `src/lib/content.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import {
  parseCaseStudyPath,
  parsePillarPath,
  parseArticlePath,
} from './content'

describe('parseCaseStudyPath', () => {
  it('extracts slug from full path', () => {
    expect(parseCaseStudyPath('../content/case-studies/my-project.mdx')).toBe('my-project')
  })

  it('handles hyphenated slugs', () => {
    expect(parseCaseStudyPath('../content/case-studies/e-commerce-redesign.mdx')).toBe('e-commerce-redesign')
  })
})

describe('parsePillarPath', () => {
  it('extracts pillar slug from index path', () => {
    expect(parsePillarPath('../content/blog/ux-ui-design/index.mdx')).toBe('ux-ui-design')
  })

  it('works for different pillar slugs', () => {
    expect(parsePillarPath('../content/blog/seo/index.mdx')).toBe('seo')
  })
})

describe('parseArticlePath', () => {
  it('extracts both pillar and article slug', () => {
    const result = parseArticlePath('../content/blog/ux-ui-design/button-states-that-convert.mdx')
    expect(result.pillarSlug).toBe('ux-ui-design')
    expect(result.slug).toBe('button-states-that-convert')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run
```

Expected: `Cannot find module './content'`

- [ ] **Step 3: Implement `src/lib/content.ts`**

```ts
import type { CaseStudy, BlogPillar, BlogArticle } from '../types/content'

// Pure path parsers — exported for testing
export function parseCaseStudyPath(path: string): string {
  return path.split('/').pop()!.replace('.mdx', '')
}

export function parsePillarPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 2]
}

export function parseArticlePath(path: string): { pillarSlug: string; slug: string } {
  const parts = path.split('/')
  return {
    pillarSlug: parts[parts.length - 2],
    slug: parts[parts.length - 1].replace('.mdx', ''),
  }
}

// Vite glob imports — loaded at build time
const caseStudyModules = import.meta.glob('../content/case-studies/*.mdx', { eager: true }) as Record<
  string,
  { default: React.ComponentType; frontmatter: CaseStudy['frontmatter'] }
>

const blogModules = import.meta.glob('../content/blog/**/*.mdx', { eager: true }) as Record<
  string,
  { default: React.ComponentType; frontmatter: BlogPillar['frontmatter'] | BlogArticle['frontmatter'] }
>

export function getCaseStudies(): CaseStudy[] {
  return Object.entries(caseStudyModules).map(([path, mod]) => ({
    frontmatter: mod.frontmatter,
    slug: parseCaseStudyPath(path),
    Component: mod.default,
  }))
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getCaseStudies().find((cs) => cs.slug === slug)
}

export function getBlogPillars(): BlogPillar[] {
  const pillarEntries = Object.entries(blogModules).filter(([path]) => path.endsWith('/index.mdx'))
  const articleCounts = getBlogArticles().reduce<Record<string, number>>((acc, a) => {
    acc[a.pillarSlug] = (acc[a.pillarSlug] ?? 0) + 1
    return acc
  }, {})

  return pillarEntries.map(([path, mod]) => {
    const slug = parsePillarPath(path)
    return {
      frontmatter: mod.frontmatter as BlogPillar['frontmatter'],
      slug,
      Component: mod.default,
      articleCount: articleCounts[slug] ?? 0,
    }
  })
}

export function getBlogPillarBySlug(slug: string): BlogPillar | undefined {
  return getBlogPillars().find((p) => p.slug === slug)
}

export function getBlogArticles(): BlogArticle[] {
  return Object.entries(blogModules)
    .filter(([path]) => !path.endsWith('/index.mdx'))
    .map(([path, mod]) => {
      const { pillarSlug, slug } = parseArticlePath(path)
      return {
        frontmatter: mod.frontmatter as BlogArticle['frontmatter'],
        slug,
        pillarSlug,
        Component: mod.default,
      }
    })
}

export function getBlogArticleBySlug(pillarSlug: string, slug: string): BlogArticle | undefined {
  return getBlogArticles().find((a) => a.pillarSlug === pillarSlug && a.slug === slug)
}

export function getArticlesForPillar(pillarSlug: string): BlogArticle[] {
  return getBlogArticles().filter((a) => a.pillarSlug === pillarSlug)
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run
```

Expected: `3 tests passed`

- [ ] **Step 5: Commit**

```bash
git add src/lib/content.ts src/lib/content.test.ts
git commit -m "feat: add MDX content loader with path parsers"
```

---

## Task 5: SEO Utilities (TDD)

**Files:**
- Create: `src/lib/seo.ts`, `src/lib/seo.test.ts`, `src/components/SEO.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/lib/seo.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { personSchema, articleSchema, breadcrumbSchema, serviceSchema } from './seo'

describe('personSchema', () => {
  it('returns correct type and fields', () => {
    const s = personSchema('Mathew Brown', 'https://matbrown.io')
    expect(s['@type']).toBe('Person')
    expect(s.name).toBe('Mathew Brown')
    expect(s.url).toBe('https://matbrown.io')
  })
})

describe('articleSchema', () => {
  it('maps all fields', () => {
    const s = articleSchema({
      title: 'Test Article',
      description: 'A description',
      datePublished: '2026-01-01',
      url: 'https://matbrown.io/blog/ux/test',
    })
    expect(s['@type']).toBe('Article')
    expect(s.headline).toBe('Test Article')
    expect(s.datePublished).toBe('2026-01-01')
  })
})

describe('breadcrumbSchema', () => {
  it('generates list items with correct positions', () => {
    const s = breadcrumbSchema([
      { name: 'Blog', url: 'https://matbrown.io/blog' },
      { name: 'UX/UI Design', url: 'https://matbrown.io/blog/ux-ui-design' },
    ])
    expect(s['@type']).toBe('BreadcrumbList')
    expect(s.itemListElement).toHaveLength(2)
    expect(s.itemListElement[0].position).toBe(1)
    expect(s.itemListElement[1].name).toBe('UX/UI Design')
  })
})

describe('serviceSchema', () => {
  it('sets provider name', () => {
    const s = serviceSchema('UX/UI Engineering', 'Design systems', 'Mathew Brown')
    expect(s['@type']).toBe('Service')
    expect(s.provider.name).toBe('Mathew Brown')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run
```

Expected: `Cannot find module './seo'`

- [ ] **Step 3: Implement `src/lib/seo.ts`**

```ts
export function personSchema(name: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person' as const,
    name,
    url,
  }
}

export function articleSchema({
  title,
  description,
  datePublished,
  url,
}: {
  title: string
  description: string
  datePublished: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article' as const,
    headline: title,
    description,
    datePublished,
    url,
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem' as const,
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function serviceSchema(name: string, description: string, provider: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service' as const,
    name,
    description,
    provider: {
      '@type': 'Person' as const,
      name: provider,
    },
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run
```

Expected: `4 tests passed`

- [ ] **Step 5: Create `src/components/SEO.tsx`**

```tsx
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  ogImage?: string
  type?: 'website' | 'article'
  schema?: object
}

export function SEO({ title, description, ogImage, type = 'website', schema }: SEOProps) {
  const fullTitle = `${title} | Mathew Brown`
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts src/components/SEO.tsx
git commit -m "feat: add SEO schema generators and SEO head component"
```

---

## Task 6: useReducedMotion Hook (TDD)

**Files:**
- Create: `src/hooks/useReducedMotion.ts`

- [ ] **Step 1: Write failing test**

Create `src/hooks/useReducedMotion.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

function mockMatchMedia(matches: boolean) {
  const listeners: ((e: { matches: boolean }) => void)[] = []
  return vi.fn().mockImplementation(() => ({
    matches,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
    _trigger: (val: boolean) => listeners.forEach((cb) => cb({ matches: val })),
  }))
}

describe('useReducedMotion', () => {
  it('returns true when prefers-reduced-motion is reduce', () => {
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mockMatchMedia(true) })
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('returns false when prefers-reduced-motion is no-preference', () => {
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mockMatchMedia(false) })
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run
```

Expected: `Cannot find module './useReducedMotion'`

- [ ] **Step 3: Implement `src/hooks/useReducedMotion.ts`**

```ts
import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run
```

Expected: `2 tests passed`

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useReducedMotion.ts src/hooks/useReducedMotion.test.ts
git commit -m "feat: add useReducedMotion hook"
```

---

## Task 7: Animation Components

**Files:**
- Create: `src/components/animations/PageTransition.tsx`, `src/components/animations/FadeIn.tsx`, `src/components/animations/StaggerList.tsx`

- [ ] **Step 1: Create `src/components/animations/PageTransition.tsx`**

```tsx
import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? {} : { opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/components/animations/FadeIn.tsx`**

```tsx
import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Create `src/components/animations/StaggerList.tsx`**

```tsx
import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface StaggerListProps {
  children: React.ReactNode
  className?: string
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function StaggerList({ children, className }: StaggerListProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/animations/
git commit -m "feat: add animation primitives (PageTransition, FadeIn, StaggerList)"
```

---

## Task 8: UI Primitives

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Tag.tsx`, `src/components/ui/Card.tsx`

- [ ] **Step 1: Create `src/components/ui/Button.tsx`**

```tsx
import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  href?: string
  external?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  outline: 'border border-foreground text-foreground hover:bg-surface',
  ghost: 'text-foreground hover:bg-surface',
}

export function Button({ variant = 'primary', href, external, children, className = '', ...props }: ButtonProps) {
  const base = `inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`

  if (href && external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={base}>{children}</a>
  }
  if (href) {
    return <Link to={href} className={base}>{children}</Link>
  }
  return <button className={base} {...props}>{children}</button>
}
```

- [ ] **Step 2: Create `src/components/ui/Tag.tsx`**

```tsx
interface TagProps {
  label: string
  className?: string
}

export function Tag({ label, className = '' }: TagProps) {
  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-surface text-muted border border-border ${className}`}>
      {label}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/Card.tsx`**

```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-background border border-border rounded-lg overflow-hidden ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add Button, Tag, and Card UI primitives"
```

---

## Task 9: Navigation Components

**Files:**
- Create: `src/components/nav/SocialLinks.tsx`, `src/components/nav/MobileMenu.tsx`, `src/components/nav/Navbar.tsx`

- [ ] **Step 1: Create `src/components/nav/SocialLinks.tsx`**

```tsx
const links = [
  { label: 'GitHub', href: 'https://github.com/matbrown-ux', icon: GithubIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/matbrown', icon: LinkedInIcon },
]

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

interface SocialLinksProps {
  className?: string
}

export function SocialLinks({ className = '' }: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-muted hover:text-foreground transition-colors"
        >
          <Icon />
        </a>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/nav/MobileMenu.tsx`**

```tsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { SocialLinks } from './SocialLinks'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Work', to: '/work' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="p-2 text-foreground"
      >
        <span className="sr-only">{open ? 'Close' : 'Open'} navigation</span>
        {open ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 bg-background border-b border-border px-6 py-6 flex flex-col gap-4 z-50"
          >
            {navItems.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors ${isActive ? 'text-accent' : 'text-foreground hover:text-accent'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <SocialLinks className="mt-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/nav/Navbar.tsx`**

```tsx
import { NavLink } from 'react-router-dom'
import { SocialLinks } from './SocialLinks'
import { MobileMenu } from './MobileMenu'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Work', to: '/work' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="text-sm font-semibold tracking-tight text-foreground hover:text-accent transition-colors">
          Mathew Brown
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors relative group ${isActive ? 'text-accent' : 'text-muted hover:text-foreground'}`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-200 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Desktop social links */}
        <SocialLinks className="hidden md:flex" />

        {/* Mobile menu */}
        <MobileMenu />
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/nav/
git commit -m "feat: add Navbar, MobileMenu, and SocialLinks components"
```

---

## Task 10: Footer

**Files:**
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Create `src/components/Footer.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { SocialLinks } from './nav/SocialLinks'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-muted">
          © {year} Mathew Brown. All rights reserved.
        </p>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link to="/work" className="hover:text-foreground transition-colors">Work</Link>
          <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
        <SocialLinks />
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: add Footer component"
```

---

## Task 11: Layouts & App Shell

**Files:**
- Create: `src/layouts/DefaultLayout.tsx`, `src/layouts/BlogLayout.tsx`, `src/layouts/CaseStudyLayout.tsx`, `src/router.tsx`, `src/main.tsx`
- Replace: `src/App.tsx`

- [ ] **Step 1: Create `src/layouts/DefaultLayout.tsx`**

```tsx
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Navbar } from '../components/nav/Navbar'
import { Footer } from '../components/Footer'

export function DefaultLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Create `src/layouts/BlogLayout.tsx`**

```tsx
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BlogLayoutProps {
  children: React.ReactNode
  breadcrumbs: BreadcrumbItem[]
}

export function BlogLayout({ children, breadcrumbs }: BlogLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted mb-8">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>/</span>}
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/layouts/CaseStudyLayout.tsx`**

```tsx
interface CaseStudyLayoutProps {
  children: React.ReactNode
  hero?: React.ReactNode
}

export function CaseStudyLayout({ children, hero }: CaseStudyLayoutProps) {
  return (
    <article>
      {hero && <div className="w-full">{hero}</div>}
      <div className="max-w-3xl mx-auto px-6 py-12">{children}</div>
    </article>
  )
}
```

- [ ] **Step 4: Create `src/router.tsx`**

```tsx
import type { RouteObject } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Services } from './pages/Services'
import { Work } from './pages/Work'
import { WorkDetail } from './pages/WorkDetail'
import { Blog } from './pages/Blog'
import { BlogPillar } from './pages/BlogPillar'
import { BlogArticle } from './pages/BlogArticle'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'

export const routes: RouteObject[] = [
  {
    element: <DefaultLayout />,
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
    ],
  },
  { path: '*', element: <NotFound /> },
]
```

- [ ] **Step 5: Replace `src/main.tsx`**

```tsx
import './styles/globals.css'
import { ViteReactSSG } from 'vite-react-ssg'
import { HelmetProvider } from 'react-helmet-async'
import { routes } from './router'

export const createRoot = ViteReactSSG(
  { routes },
  ({ app }) => {
    app.use(HelmetProvider)
  }
)
```

> **Check docs:** https://github.com/antfu/vite-react-ssg — the `HelmetProvider` integration pattern may differ. Confirm the `app.use` API or use the wrapper component pattern instead.

- [ ] **Step 6: Replace `src/App.tsx`** (can be deleted — vite-react-ssg no longer needs it)

Delete `src/App.tsx`.

- [ ] **Step 7: Create stub pages so the app compiles**

Create stubs for all pages (replace in later tasks). Run these commands:

```bash
mkdir -p src/pages
for page in Home About Services Work WorkDetail Blog BlogPillar BlogArticle Contact NotFound; do
cat > "src/pages/${page}.tsx" << 'EOF'
export function PAGENAME() {
  return <div>PAGENAME</div>
}
EOF
sed -i '' "s/PAGENAME/${page}/g" "src/pages/${page}.tsx"
done
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts on http://localhost:5173. All routes load a stub page.

- [ ] **Step 9: Commit**

```bash
git add src/layouts/ src/router.tsx src/main.tsx src/pages/
git commit -m "feat: add layouts, router, and page stubs"
```

---

## Task 12: MDX Interactive Components

**Files:**
- Create: `src/components/mdx/ImageCarousel.tsx`, `src/components/mdx/BeforeAfterSlider.tsx`, `src/components/mdx/AnnotatedImage.tsx`, `src/components/mdx/VideoPlayer.tsx`, `src/components/mdx/index.ts`

- [ ] **Step 1: Create `src/components/mdx/ImageCarousel.tsx`**

```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface ImageCarouselProps {
  images: { src: string; alt: string; caption?: string }[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrent((i) => (i + 1) % images.length)

  return (
    <div className="relative overflow-hidden rounded-lg bg-surface my-8">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current].src}
          alt={images[current].alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full object-cover"
        />
      </AnimatePresence>
      {images[current].caption && (
        <p className="text-sm text-muted text-center px-4 py-2">{images[current].caption}</p>
      )}
      {images.length > 1 && (
        <div className="flex items-center justify-between absolute inset-x-0 top-1/2 -translate-y-1/2 px-4">
          <button onClick={prev} aria-label="Previous image" className="bg-background/80 rounded-full p-2 hover:bg-background transition-colors">
            ←
          </button>
          <button onClick={next} aria-label="Next image" className="bg-background/80 rounded-full p-2 hover:bg-background transition-colors">
            →
          </button>
        </div>
      )}
      <div className="flex justify-center gap-1.5 py-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to image ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-accent' : 'bg-border'}`}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/mdx/BeforeAfterSlider.tsx`**

```tsx
import { useState, useRef } from 'react'

interface BeforeAfterSliderProps {
  before: { src: string; alt: string }
  after: { src: string; alt: string }
}

export function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100))
    setPosition(pct)
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg select-none my-8 cursor-col-resize"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      aria-label="Before and after comparison slider"
    >
      <img src={after.src} alt={after.alt} className="w-full block" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={before.src} alt={before.alt} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md flex items-center justify-center"
        style={{ left: `${position}%` }}
      >
        <div className="bg-white rounded-full p-1.5 shadow text-xs font-semibold text-foreground">⟺</div>
      </div>
      <div className="absolute bottom-3 left-3 bg-background/80 text-xs px-2 py-1 rounded">Before</div>
      <div className="absolute bottom-3 right-3 bg-background/80 text-xs px-2 py-1 rounded">After</div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/mdx/AnnotatedImage.tsx`**

```tsx
interface Annotation {
  x: number
  y: number
  label: string
}

interface AnnotatedImageProps {
  src: string
  alt: string
  annotations: Annotation[]
}

export function AnnotatedImage({ src, alt, annotations }: AnnotatedImageProps) {
  return (
    <div className="relative my-8 rounded-lg overflow-hidden">
      <img src={src} alt={alt} className="w-full block" />
      {annotations.map((a, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${a.x}%`, top: `${a.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative group">
            <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold cursor-pointer ring-2 ring-white">
              {i + 1}
            </div>
            <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {a.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/mdx/VideoPlayer.tsx`**

```tsx
import { useState, useRef } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
  caption?: string
}

export function VideoPlayer({ src, poster, caption }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggle = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setPlaying(!playing)
  }

  return (
    <div className="my-8 rounded-lg overflow-hidden bg-surface">
      <div className="relative cursor-pointer" onClick={toggle}>
        <video ref={videoRef} src={src} poster={poster} className="w-full block" loop playsInline />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
            <div className="w-14 h-14 bg-background/90 rounded-full flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      {caption && <p className="text-sm text-muted text-center px-4 py-2">{caption}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/mdx/index.ts`**

```ts
import { ImageCarousel } from './ImageCarousel'
import { BeforeAfterSlider } from './BeforeAfterSlider'
import { AnnotatedImage } from './AnnotatedImage'
import { VideoPlayer } from './VideoPlayer'

export const MDXComponents = {
  ImageCarousel,
  BeforeAfterSlider,
  AnnotatedImage,
  VideoPlayer,
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/mdx/
git commit -m "feat: add MDX interactive components (carousel, before/after, annotated image, video)"
```

---

## Task 13: Home Page

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Replace `src/pages/Home.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { getCaseStudies } from '../lib/content'
import { personSchema } from '../lib/seo'

const services = [
  { title: 'UX/UI Engineering', description: 'Pixel-perfect interfaces built on solid design principles.' },
  { title: 'SEO', description: 'Technical and content SEO that drives qualified organic traffic.' },
  { title: 'Agentic Workflows', description: 'AI-powered automations that scale your operations.' },
]

export function Home() {
  const featuredWork = getCaseStudies().slice(0, 3)

  return (
    <PageTransition>
      <SEO
        title="UX/UI Engineer & SEO Specialist"
        description="Mathew Brown — freelance UX/UI engineer, SEO specialist, and agentic workflow developer. Available for projects."
        schema={personSchema('Mathew Brown', 'https://matbrown.io')}
      />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <FadeIn>
          <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Available for freelance work</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Mathew Brown
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xl md:text-2xl text-muted max-w-2xl mb-10">
            UX/UI Engineer · SEO · Agentic Workflows. I design and build digital products that perform.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex flex-wrap gap-4">
            <Button href="/work">View my work</Button>
            <Button href="/contact" variant="outline">Get in touch</Button>
          </div>
        </FadeIn>
      </section>

      {/* Services snapshot */}
      <section className="bg-surface border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-10">What I do</h2>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s) => (
              <StaggerItem key={s.title}>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-muted text-sm">{s.description}</p>
              </StaggerItem>
            ))}
          </StaggerList>
          <FadeIn className="mt-10">
            <Link to="/services" className="text-sm font-medium text-accent hover:underline">
              See all services →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Featured work */}
      {featuredWork.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <FadeIn>
            <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-10">Selected work</h2>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWork.map((cs) => (
              <StaggerItem key={cs.slug}>
                <Link to={`/work/${cs.slug}`}>
                  <Card hover className="h-full">
                    <div className="bg-surface aspect-video overflow-hidden">
                      {cs.frontmatter.coverImage && (
                        <img
                          src={cs.frontmatter.coverImage}
                          alt={cs.frontmatter.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {cs.frontmatter.tags.map((tag) => <Tag key={tag} label={tag} />)}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{cs.frontmatter.title}</h3>
                      <p className="text-sm text-muted">{cs.frontmatter.summary}</p>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
          <FadeIn className="mt-10">
            <Link to="/work" className="text-sm font-medium text-accent hover:underline">
              View all work →
            </Link>
          </FadeIn>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <FadeIn>
          <div className="border border-border rounded-xl p-10 md:p-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to work together?</h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              I take on a small number of projects at a time to ensure quality. Let's talk about yours.
            </p>
            <Button href="/contact">Start a conversation</Button>
          </div>
        </FadeIn>
      </section>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: build Home page"
```

---

## Task 14: About Page

**Files:**
- Modify: `src/pages/About.tsx`

- [ ] **Step 1: Replace `src/pages/About.tsx`**

```tsx
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Button } from '../components/ui/Button'

const skills = [
  {
    pillar: 'UX/UI Engineering',
    items: ['Design systems', 'Component architecture', 'Prototyping', 'Accessibility', 'React', 'TypeScript'],
  },
  {
    pillar: 'SEO',
    items: ['Technical SEO', 'Core Web Vitals', 'Schema markup', 'Content strategy', 'Pillar/cluster architecture', 'Keyword research'],
  },
  {
    pillar: 'Agentic Workflows',
    items: ['Claude API', 'AI SDK', 'MCP servers', 'Prompt engineering', 'Automation pipelines', 'Tool integration'],
  },
]

export function About() {
  return (
    <PageTransition>
      <SEO
        title="About"
        description="Learn about Mathew Brown — UX/UI engineer, SEO specialist, and agentic workflow developer based in the US."
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">About me</h1>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          {/* Bio */}
          <FadeIn delay={0.1}>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                I'm a UX/UI engineer with a rare combination of skills: I design interfaces, build them in production-quality React, optimize them for search engines, and wire them up with AI-powered workflows that save clients hours every week.
              </p>
              <p>
                I work with founders and businesses who want a single skilled collaborator — not a handoff chain between designers, developers, and SEO agencies.
              </p>
              <p>
                When I'm not building products, I write about design engineering, technical SEO, and the practical side of AI tooling on my blog.
              </p>
            </div>
            <div className="mt-8">
              <Button href="/contact">Work with me</Button>
            </div>
          </FadeIn>

          {/* Photo placeholder */}
          <FadeIn delay={0.15}>
            <div className="aspect-square rounded-xl bg-surface border border-border flex items-center justify-center text-muted text-sm">
              Photo coming soon
            </div>
          </FadeIn>
        </div>

        {/* Skills */}
        <FadeIn>
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-10">Areas of expertise</h2>
        </FadeIn>
        <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skills.map((group) => (
            <StaggerItem key={group.pillar}>
              <h3 className="font-semibold mb-4">{group.pillar}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-muted flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/About.tsx
git commit -m "feat: build About page"
```

---

## Task 15: Services Page

**Files:**
- Modify: `src/pages/Services.tsx`

- [ ] **Step 1: Replace `src/pages/Services.tsx`**

```tsx
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Button } from '../components/ui/Button'
import { serviceSchema } from '../lib/seo'

const services = [
  {
    title: 'UX/UI Engineering',
    description:
      'End-to-end interface design and implementation. From wireframes to production React components, I bridge the gap between design and engineering so nothing gets lost in translation.',
    deliverables: ['Design system / component library', 'Responsive, accessible React implementation', 'Figma-to-code handoff', 'Interaction design & prototyping'],
    cta: { label: 'Start a UI project', href: '/contact' },
  },
  {
    title: 'SEO',
    description:
      'Technical SEO combined with content architecture that earns rankings through relevance, not tricks. I build the kind of SEO infrastructure that compounds over time.',
    deliverables: ['Technical SEO audit & remediation', 'Pillar/cluster content architecture', 'Schema markup implementation', 'Core Web Vitals optimization'],
    cta: { label: 'Improve my SEO', href: '/contact' },
  },
  {
    title: 'Agentic Workflow Development',
    description:
      'Custom AI-powered workflows that automate the repetitive work in your business — built on Claude, the AI SDK, and MCP tooling. Real automation, not toy demos.',
    deliverables: ['Workflow design & scoping', 'Claude API / AI SDK integration', 'MCP server development', 'Deployment & monitoring'],
    cta: { label: 'Automate my workflows', href: '/contact' },
  },
]

const schemas = services.map((s) => serviceSchema(s.title, s.description, 'Mathew Brown'))

export function Services() {
  return (
    <PageTransition>
      <SEO
        title="Services"
        description="UX/UI engineering, SEO, and agentic workflow development services by Mathew Brown. Available for freelance projects."
        schema={schemas}
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Services</h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-xl text-muted max-w-2xl mb-16">
            I offer three deeply interconnected services. Most of my best projects involve all three.
          </p>
        </FadeIn>

        <StaggerList className="space-y-16">
          {services.map((service, i) => (
            <StaggerItem key={service.title}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-16 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-accent mb-2">0{i + 1}</p>
                  <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                  <p className="text-muted leading-relaxed mb-8">{service.description}</p>
                  <Button href={service.cta.href} variant="outline">{service.cta.label}</Button>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted uppercase tracking-widest mb-4">What you get</p>
                  <ul className="space-y-3">
                    {service.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-3 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Services.tsx
git commit -m "feat: build Services page"
```

---

## Task 16: Contact Page

**Files:**
- Modify: `src/pages/Contact.tsx`

- [ ] **Step 1: Replace `src/pages/Contact.tsx`**

```tsx
import { useState } from 'react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { Button } from '../components/ui/Button'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function Contact() {
  const [formState, setFormState] = useState<FormState>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState('submitting')
    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      })
      if (res.ok) {
        setFormState('success')
      } else {
        setFormState('error')
      }
    } catch {
      setFormState('error')
    }
  }

  return (
    <PageTransition>
      <SEO
        title="Contact"
        description="Get in touch with Mathew Brown to discuss your UX/UI, SEO, or agentic workflow project."
      />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Let's talk</h1>
          <p className="text-muted mb-12">
            Tell me about your project. I'll get back to you within one business day.
          </p>
        </FadeIn>

        {formState === 'success' ? (
          <FadeIn>
            <div className="border border-border rounded-xl p-10 text-center">
              <p className="text-2xl font-semibold mb-2">Message received.</p>
              <p className="text-muted">I'll be in touch soon.</p>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            {/* Hidden input required for Netlify Forms detection */}
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>Don't fill this out: <input name="bot-field" /></label>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="projectType" className="block text-sm font-medium mb-2">Project type</label>
                <select
                  id="projectType"
                  name="projectType"
                  className="w-full px-4 py-2.5 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                >
                  <option value="">Select a service</option>
                  <option value="UX/UI Engineering">UX/UI Engineering</option>
                  <option value="SEO">SEO</option>
                  <option value="Agentic Workflow Development">Agentic Workflow Development</option>
                  <option value="Multiple services">Multiple services</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-shadow resize-none"
                />
              </div>

              {formState === 'error' && (
                <p className="text-sm text-red-500">Something went wrong. Please try again or email me directly.</p>
              )}

              <Button type="submit" disabled={formState === 'submitting'}>
                {formState === 'submitting' ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          </FadeIn>
        )}

        <FadeIn delay={0.2} className="mt-12 pt-12 border-t border-border flex flex-col sm:flex-row gap-4 text-sm text-muted">
          <a href="mailto:mat@matbrown.io" className="hover:text-foreground transition-colors">mat@matbrown.io</a>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Contact.tsx
git commit -m "feat: build Contact page with Netlify Forms"
```

---

## Task 17: Case Studies Pages

**Files:**
- Modify: `src/pages/Work.tsx`, `src/pages/WorkDetail.tsx`

- [ ] **Step 1: Replace `src/pages/Work.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Card } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { getCaseStudies } from '../lib/content'

export function Work() {
  const caseStudies = getCaseStudies()

  return (
    <PageTransition>
      <SEO
        title="Work"
        description="Case studies from Mathew Brown — UX/UI engineering, SEO, and agentic workflow projects."
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Work</h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-xl text-muted max-w-2xl mb-16">Selected projects across design engineering, SEO, and AI workflows.</p>
        </FadeIn>

        {caseStudies.length === 0 ? (
          <FadeIn>
            <p className="text-muted">Case studies coming soon.</p>
          </FadeIn>
        ) : (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseStudies.map((cs) => (
              <StaggerItem key={cs.slug}>
                <Link to={`/work/${cs.slug}`} className="block h-full">
                  <Card hover className="h-full">
                    <div className="bg-surface aspect-video overflow-hidden">
                      {cs.frontmatter.coverImage && (
                        <img
                          src={cs.frontmatter.coverImage}
                          alt={cs.frontmatter.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={800}
                          height={450}
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {cs.frontmatter.tags.map((tag) => <Tag key={tag} label={tag} />)}
                      </div>
                      <h2 className="text-xl font-semibold mb-2">{cs.frontmatter.title}</h2>
                      <p className="text-sm text-muted">{cs.frontmatter.summary}</p>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Replace `src/pages/WorkDetail.tsx`**

```tsx
import { useParams, Navigate } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { Tag } from '../components/ui/Tag'
import { CaseStudyLayout } from '../layouts/CaseStudyLayout'
import { MDXComponents } from '../components/mdx'
import { getCaseStudyBySlug } from '../lib/content'

export function WorkDetail() {
  const { slug } = useParams<{ slug: string }>()
  const cs = getCaseStudyBySlug(slug!)

  if (!cs) return <Navigate to="/work" replace />

  const { frontmatter, Component } = cs

  return (
    <PageTransition>
      <SEO
        title={frontmatter.title}
        description={frontmatter.summary}
        ogImage={frontmatter.coverImage}
        type="article"
      />
      <CaseStudyLayout
        hero={
          frontmatter.coverImage ? (
            <div className="max-h-[60vh] overflow-hidden bg-surface">
              <img
                src={frontmatter.coverImage}
                alt={frontmatter.title}
                className="w-full object-cover"
                width={1600}
                height={900}
              />
            </div>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {frontmatter.tags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
        <h1 className="text-4xl font-bold mb-4">{frontmatter.title}</h1>
        <p className="text-muted mb-10">{frontmatter.summary}</p>
        <div className="prose prose-gray max-w-none">
          <MDXProvider components={MDXComponents}>
            <Component />
          </MDXProvider>
        </div>
      </CaseStudyLayout>
    </PageTransition>
  )
}
```

- [ ] **Step 3: Install `@tailwindcss/typography` for prose styles**

```bash
npm install -D @tailwindcss/typography
```

Add to `src/styles/globals.css`:
```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Work.tsx src/pages/WorkDetail.tsx src/styles/globals.css
git commit -m "feat: build Case Studies index and detail pages"
```

---

## Task 18: Blog Pages

**Files:**
- Modify: `src/pages/Blog.tsx`, `src/pages/BlogPillar.tsx`, `src/pages/BlogArticle.tsx`

- [ ] **Step 1: Replace `src/pages/Blog.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { getBlogPillars } from '../lib/content'

export function Blog() {
  const pillars = getBlogPillars()

  return (
    <PageTransition>
      <SEO
        title="Blog"
        description="Articles on UX/UI engineering, technical SEO, and agentic workflow development by Mathew Brown."
      />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-xl text-muted mb-16">
            In-depth writing on the topics I work with every day.
          </p>
        </FadeIn>

        {pillars.length === 0 ? (
          <FadeIn><p className="text-muted">Articles coming soon.</p></FadeIn>
        ) : (
          <StaggerList className="space-y-8">
            {pillars.map((pillar) => (
              <StaggerItem key={pillar.slug}>
                <Link
                  to={`/blog/${pillar.slug}`}
                  className="block p-6 border border-border rounded-xl hover:border-accent transition-colors group"
                >
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                    {pillar.frontmatter.title}
                  </h2>
                  <p className="text-muted text-sm mb-3">{pillar.frontmatter.description}</p>
                  <p className="text-xs text-muted">{pillar.articleCount} article{pillar.articleCount !== 1 ? 's' : ''}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Replace `src/pages/BlogPillar.tsx`**

```tsx
import { useParams, Navigate, Link } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { BlogLayout } from '../layouts/BlogLayout'
import { getBlogPillarBySlug, getArticlesForPillar } from '../lib/content'
import { breadcrumbSchema } from '../lib/seo'

export function BlogPillar() {
  const { pillar: pillarSlug } = useParams<{ pillar: string }>()
  const pillar = getBlogPillarBySlug(pillarSlug!)
  const articles = getArticlesForPillar(pillarSlug!)

  if (!pillar) return <Navigate to="/blog" replace />

  const breadcrumbs = [
    { label: 'Blog', href: '/blog' },
    { label: pillar.frontmatter.title },
  ]

  return (
    <PageTransition>
      <SEO
        title={pillar.frontmatter.title}
        description={pillar.frontmatter.description}
        schema={breadcrumbSchema([
          { name: 'Blog', url: 'https://matbrown.io/blog' },
          { name: pillar.frontmatter.title, url: `https://matbrown.io/blog/${pillarSlug}` },
        ])}
      />
      <BlogLayout breadcrumbs={breadcrumbs}>
        <FadeIn>
          <h1 className="text-4xl font-bold mb-4">{pillar.frontmatter.title}</h1>
          <p className="text-muted mb-10">{pillar.frontmatter.description}</p>
        </FadeIn>

        <div className="prose prose-gray max-w-none mb-16">
          <MDXProvider>
            <pillar.Component />
          </MDXProvider>
        </div>

        {articles.length > 0 && (
          <FadeIn>
            <h2 className="text-xl font-semibold mb-6">Articles</h2>
            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/blog/${pillarSlug}/${article.slug}`}
                  className="block p-5 border border-border rounded-lg hover:border-accent transition-colors group"
                >
                  <h3 className="font-medium mb-1 group-hover:text-accent transition-colors">
                    {article.frontmatter.title}
                  </h3>
                  <p className="text-sm text-muted">{article.frontmatter.description}</p>
                  <p className="text-xs text-muted mt-2">{article.frontmatter.date}</p>
                </Link>
              ))}
            </div>
          </FadeIn>
        )}
      </BlogLayout>
    </PageTransition>
  )
}
```

- [ ] **Step 3: Replace `src/pages/BlogArticle.tsx`**

```tsx
import { useParams, Navigate } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { BlogLayout } from '../layouts/BlogLayout'
import { getBlogArticleBySlug, getBlogPillarBySlug } from '../lib/content'
import { articleSchema, breadcrumbSchema } from '../lib/seo'

export function BlogArticle() {
  const { pillar: pillarSlug, article: articleSlug } = useParams<{ pillar: string; article: string }>()
  const article = getBlogArticleBySlug(pillarSlug!, articleSlug!)
  const pillar = getBlogPillarBySlug(pillarSlug!)

  if (!article || !pillar) return <Navigate to="/blog" replace />

  const breadcrumbs = [
    { label: 'Blog', href: '/blog' },
    { label: pillar.frontmatter.title, href: `/blog/${pillarSlug}` },
    { label: article.frontmatter.title },
  ]

  return (
    <PageTransition>
      <SEO
        title={article.frontmatter.title}
        description={article.frontmatter.description}
        type="article"
        schema={[
          articleSchema({
            title: article.frontmatter.title,
            description: article.frontmatter.description,
            datePublished: article.frontmatter.date,
            url: `https://matbrown.io/blog/${pillarSlug}/${articleSlug}`,
          }),
          breadcrumbSchema([
            { name: 'Blog', url: 'https://matbrown.io/blog' },
            { name: pillar.frontmatter.title, url: `https://matbrown.io/blog/${pillarSlug}` },
            { name: article.frontmatter.title, url: `https://matbrown.io/blog/${pillarSlug}/${articleSlug}` },
          ]),
        ]}
      />
      <BlogLayout breadcrumbs={breadcrumbs}>
        <h1 className="text-4xl font-bold mb-2">{article.frontmatter.title}</h1>
        <p className="text-sm text-muted mb-10">{article.frontmatter.date}</p>
        <div className="prose prose-gray max-w-none">
          <MDXProvider>
            <article.Component />
          </MDXProvider>
        </div>
      </BlogLayout>
    </PageTransition>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Blog.tsx src/pages/BlogPillar.tsx src/pages/BlogArticle.tsx
git commit -m "feat: build Blog index, pillar, and article pages"
```

---

## Task 19: NotFound Page

**Files:**
- Modify: `src/pages/NotFound.tsx`

- [ ] **Step 1: Replace `src/pages/NotFound.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <PageTransition>
      <SEO title="404 — Not Found" description="Page not found." />
      <div className="max-w-6xl mx-auto px-6 py-32 text-center">
        <p className="text-8xl font-bold text-border mb-6">404</p>
        <h1 className="text-3xl font-bold mb-4">Page not found</h1>
        <p className="text-muted mb-10">This page doesn't exist or has been moved.</p>
        <Button href="/">Go home</Button>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/NotFound.tsx
git commit -m "feat: add 404 page"
```

---

## Task 20: Placeholder Content

**Files:**
- Create: `src/content/case-studies/example-project.mdx`, `src/content/blog/ux-ui-design/index.mdx`, `src/content/blog/ux-ui-design/button-states-that-convert.mdx`

This content is placeholder only — it validates the MDX pipeline and provides real routes to test against.

- [ ] **Step 1: Create case study directory and file**

```bash
mkdir -p src/content/case-studies
```

Create `src/content/case-studies/example-project.mdx`:
```mdx
---
title: Example Project
slug: example-project
summary: A sample case study to validate the content pipeline.
tags: ["UX/UI Engineering", "React"]
coverImage: ""
date: "2026-01-01"
---

## Overview

This is placeholder content. Replace with your real case study once assets are ready.

## The challenge

Describe the client's problem here.

## The solution

Describe your approach and implementation.

## Results

Share outcomes and metrics.
```

- [ ] **Step 2: Create blog content directory and pillar page**

```bash
mkdir -p src/content/blog/ux-ui-design
```

Create `src/content/blog/ux-ui-design/index.mdx`:
```mdx
---
title: UX/UI Design
slug: ux-ui-design
description: Deep dives into design engineering, component architecture, and the intersection of design and code.
keywords: ["UX engineering", "UI design", "design systems", "React components"]
---

## What you'll find here

Articles on building interfaces that are both beautiful and technically solid — from component design patterns to accessibility and animation.
```

- [ ] **Step 3: Create a sample article**

Create `src/content/blog/ux-ui-design/button-states-that-convert.mdx`:
```mdx
---
title: Button States That Convert
slug: button-states-that-convert
description: A practical guide to designing button states that communicate clearly and drive action.
date: "2026-05-31"
pillar: ux-ui-design
keywords: ["button design", "UI states", "conversion", "UX engineering"]
---

## Why button states matter

Most buttons have five states: default, hover, focus, active, and disabled. Most implementations only style two of them.

This article covers how to design all five states in a way that communicates clearly to users and builds trust.

## The five states

Placeholder content — replace with your real article.
```

- [ ] **Step 4: Verify the site builds and content loads**

```bash
npm run dev
```

Navigate to:
- http://localhost:5173/work — should show example project card
- http://localhost:5173/blog — should show UX/UI Design pillar
- http://localhost:5173/blog/ux-ui-design — should show pillar page with article link
- http://localhost:5173/blog/ux-ui-design/button-states-that-convert — should render the article

- [ ] **Step 5: Commit**

```bash
git add src/content/
git commit -m "feat: add placeholder MDX content for case study and blog pipeline"
```

---

## Task 21: GitHub Repository Setup

- [ ] **Step 1: Create GitHub repository**

```bash
gh repo create matbrown-ux/portfolio --public --description "Personal portfolio — UX/UI engineer, SEO, agentic workflows" --source=. --remote=origin
```

> If `gh` is not authenticated run `gh auth login` first.

- [ ] **Step 2: Push to GitHub**

```bash
git push -u origin main
```

- [ ] **Step 3: Verify repository on GitHub**

```bash
gh repo view --web
```

Expected: GitHub opens the repo in browser with all commits visible.

---

## Task 22: Netlify Deployment

- [ ] **Step 1: Deploy to Netlify via CLI**

```bash
npx netlify-cli init
```

When prompted:
- "What would you like to do?" → Connect this directory to an existing Netlify site or create a new one
- Build command: `npm run build`
- Publish directory: `dist`
- Link to GitHub repo when asked

- [ ] **Step 2: Trigger a deploy**

```bash
npx netlify-cli deploy --build --prod
```

- [ ] **Step 3: Verify Netlify Forms is detected**

In the Netlify dashboard → Forms → confirm the `contact` form appears after first deploy.

- [ ] **Step 4: Test the live site**

Navigate to your Netlify URL and verify:
- All 9 routes load correctly
- Contact form submits successfully
- No console errors

- [ ] **Step 5: Commit deploy config if any changes were made**

```bash
git add netlify.toml .netlify/
git commit -m "chore: add Netlify deploy configuration"
git push
```

---

## Self-Review Checklist

| Spec requirement | Covered by task |
|---|---|
| React + Vite + TypeScript | Task 1 |
| vite-react-ssg static generation | Task 1, Task 11 |
| Tailwind CSS + design tokens | Task 2 |
| Framer Motion page transitions | Task 7, Task 11 |
| Scroll animations with stagger | Task 7 |
| MDX blog + case studies | Task 4, Task 12 |
| Three-tier blog structure (index/pillar/article) | Task 18 |
| JSON-LD structured data (Person, Article, Service, Breadcrumb) | Task 5 |
| Per-page meta / Open Graph | Task 5 |
| Netlify Forms contact | Task 16 |
| Social links in nav + footer | Task 9, Task 10 |
| Mobile responsive nav | Task 9 |
| Interactive MDX components (carousel, before/after, etc.) | Task 12 |
| Case study pages | Task 17 |
| prefers-reduced-motion support | Task 6, Task 7 |
| GitHub repo | Task 21 |
| Netlify deploy | Task 22 |
| Placeholder content | Task 20 |
