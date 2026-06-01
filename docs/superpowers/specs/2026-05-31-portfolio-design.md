# Personal Portfolio — Design Spec
**Date:** 2026-05-31
**Author:** Mathew Brown

---

## Overview

A personal portfolio site targeting potential freelance clients. The site communicates range across three service areas — UX/UI Engineering, SEO, and Agentic Workflow Development — without feeling unfocused. Designed minimal, clean, and modern, with animated transitions and interactive case studies that demonstrate technical depth.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Static generation | vite-react-ssg |
| Styling | Tailwind CSS + custom design tokens |
| Animations | Framer Motion |
| Blog/case study content | MDX |
| Forms | Netlify Forms |
| Deployment | Netlify (via GitHub) |
| Version control | GitHub |

---

## Architecture

### Project Structure

```
src/
├── components/       # Shared UI components
├── layouts/          # Page layout wrappers (default, blog, case-study)
├── pages/            # Route components
├── content/
│   ├── blog/
│   │   ├── pillars/  # Pillar page MDX content
│   │   └── articles/ # Article MDX files nested under pillars
│   └── case-studies/ # Case study MDX files
├── hooks/            # Custom React hooks (useSEO, useInView wrappers, etc.)
├── lib/              # Utilities (MDX loader, SEO helpers, structured data)
└── styles/           # Global styles + Tailwind config
```

### Routing

All routes are statically generated at build time via `vite-react-ssg`:

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/services` | Services |
| `/work` | Case Studies index |
| `/work/:slug` | Individual case study |
| `/blog` | Blog index (all pillars) |
| `/blog/:pillar` | Pillar page |
| `/blog/:pillar/:article` | Article page |
| `/contact` | Contact |

### Deployment Pipeline

Push to GitHub → Netlify build triggers → `vite-react-ssg` generates static HTML for all routes → Netlify deploys. Netlify Forms captures contact submissions with no backend required.

---

## Pages & Content

### Home
- Hero: name, title ("UX/UI Engineer · SEO · Agentic Workflows"), short client-focused value proposition
- Below fold: curated preview of 2–3 case studies
- Services snapshot
- CTA to contact
- Page transition animates in on load

### About
- Personal narrative focused on client value, not a resume
- Photo, short bio
- Skills/expertise breakdown across three pillars

### Services
- Three service areas: UX/UI Engineering, SEO, Agentic Workflow Development
- Each with description, deliverables, and soft CTA
- Designed for quick client self-qualification

### Case Studies (`/work`)
- Grid index with thumbnail, title, and service tags
- Each case study is an MDX file with frontmatter schema:
  - `title`, `slug`, `tags`, `coverImage`, `summary`, `date`
  - Freeform MDX body: supports interactive React components, image galleries, before/after sliders, embedded video

### Blog (three-tier)
- `/blog` — Index listing all pillars with description and article count
- `/blog/:pillar` — Long-form pillar page (SEO-optimized, links to child articles)
- `/blog/:pillar/:article` — Individual article, full MDX content with breadcrumb navigation

### Contact
- Netlify Form: name, email, project type, message
- Success state replaces form on submit (no page reload)
- Email address and social links below form

### Navigation
- Desktop: logo/name left · nav links center · social icons right
- Mobile: hamburger menu with full nav + social links
- Social links also repeated in footer

---

## Animations & Interactions

### Page Transitions
- Framer Motion `AnimatePresence` wraps the route outlet
- Enter: fade + slide up from slight offset (~300ms)
- Exit: fade out (~200ms)

### Scroll Animations
- Sections animate into view via Framer Motion `useInView`
- Lists (service cards, case study grid, pillar cards) stagger children on enter

### Case Study Interactions
- Globally-registered MDX components (no per-file imports needed):
  - Image carousel
  - Before/after slider
  - Annotated screenshot
  - Video with custom play control

### Hover States
- Case study cards: lift with shadow + subtle scale
- Nav links: animated underline
- Service cards: gentle border highlight

### Accessibility
- All animations respect `prefers-reduced-motion`

---

## SEO & Technical Foundation

### Static Generation
- `vite-react-ssg` pre-renders every route to HTML at build time
- Search engines receive fully-rendered content

### Per-Page Metadata
- `useSEO` hook sets `<title>`, `<meta description>`, Open Graph, and Twitter Card tags
- Case studies and blog posts pull metadata from MDX frontmatter automatically

### Blog SEO Structure
- Pillar pages: long-form, keyword-rich content
- Articles link back to parent pillar (internal linking via frontmatter tags)
- Breadcrumb markup on blog and case study pages

### Structured Data (JSON-LD)
| Page | Schema |
|---|---|
| Home / About | `Person` |
| Services | `Service` |
| Blog articles | `Article` |
| Blog / Case studies | `BreadcrumbList` |

### Sitemap & robots.txt
- Auto-generated from all static routes at build time

### Performance Targets
- Vite code splitting for small initial bundle
- Images: `width`/`height` attributes to prevent layout shift; blur-up placeholder pattern
- Fonts: `font-display: swap`
- Tailwind CSS purge removes unused styles
- Target: 95+ Lighthouse score across all pages

### URL Structure
Clean, descriptive, keyword-intentional slugs:
`/blog/ux-ui-design/button-states-that-convert`

---

## Content Management

Blog posts and case studies are MDX files managed in the GitHub repo. No CMS required initially. The content loading layer (`src/lib/`) will be abstracted so a CMS (Contentful, Sanity, etc.) can be swapped in later without changing page components.
