# Design Spec: Productized SEO/AEO Offer + Prerendered SEO Fix

Date: 2026-07-10
Branch: `feat/services-offer-seo`
Status: Draft for review

## Goal

Turn matbrown.io into a site that actively sells Mathew's productized SEO/AEO offer, and
fix the SEO/AEO gaps that undercut his credibility, then ship live. This directly serves the
income goal: land 4-5 retainers at $3,000+/mo.

## Success criteria

- Services page leads with the productized SEO/AEO offer and can be sent to prospects.
- Per-page SEO meta **and** JSON-LD structured data appear in the **prerendered** HTML
  (verifiable in `dist/**/*.html` without running JS).
- A standalone, on-brand one-pager PDF exists that Mathew can email or link in outreach.
- Nothing fabricated ships (placeholder `"00"` metrics are hidden until real numbers land).
- Site builds clean (`npm run build`, `npm run typecheck`) and deploys via Netlify.

## Scope

### In scope
1. Rework `src/pages/Services.tsx` around the productized SEO/AEO offer.
2. Migrate SEO head management from `react-helmet-async` to vite-react-ssg's native `Head`
   (Approach A) so meta + JSON-LD prerender.
3. Expand JSON-LD structured data (Person, WebSite, Service/Offer).
4. Standalone designed one-pager, print-ready → PDF, hostable at a link.
5. Hide placeholder `"00"` metrics for launch.
6. Build, verify, deploy.

### Out of scope (fast-follow)
- Real metric numbers (Mathew is compiling; drop in when provided).
- Real case-study screenshots (still placeholders).
- Blog articles for the 8 empty pillars.
- Raster og:image versions of SVG covers (nice-to-have; can follow).
- Outreach engine + proof case studies (separate workstream).

## Decisions (locked with user)

- **Pricing display:** "from" anchors only on the public site
  ("Retainers from $3,000/mo · Foundation Sprint from $3,000"). Full tier pricing lives in
  the one-pager and on calls, not in a public table.
- **Page structure:** Lead with the SEO/AEO offer; keep UX/UI Engineering, Agentic
  Workflows / AI, and Software builds (from $10k) as supporting disciplines below.
- **SEO fix:** Approach A — migrate to vite-react-ssg `Head`, drop `react-helmet-async`.
- **One-pager:** standalone designed PDF (print-ready), also hostable as a shareable link.
- **Go-live bar:** fix critical SEO gaps + hide placeholder metrics, then ship everything together.

## Design

### 1. Services page (`src/pages/Services.tsx`)

Structure, top to bottom:
- **Eyebrow + keyword-led h1** (e.g. "SEO & AEO Engineering for Growth", per SEO/AEO
  heading conventions in CLAUDE.md).
- **Flagship offer block:** the productized SEO/AEO offer with the "from" anchors and the
  positioning pitch ("AI-accelerated, human-directed: agency-level output at freelancer
  speed"). Framing emphasizes quality/entity-accuracy, never "AI spam."
- **Packages (positioning, not a price table):** Foundation Sprint + three retainer tiers
  (Maintain / Growth / Dominate) described by outcome + what's included, each with a CTA to
  `/contact`. No dollar figures beyond the "from" anchors.
- **Supporting disciplines:** reuse the existing numbered layout for UX/UI Engineering,
  Agentic Workflows / AI, and Software builds (from $10k floor).
- On-brand: vermilion accents, big display type, `FadeIn` / `StaggerList`, existing `Button`.

Offer content (from the locked pricing spec, memory `income-goal`):
- Foundation Sprint (one-time, from $3,000): audit, JSON-LD schema, on-page/meta,
  AI-answer-engine readiness incl. `llms.txt`, keyword+question map, 2 pillar pieces,
  90-day roadmap.
- Retainer tiers (value metric = content volume + scope, never hours):
  - Maintain (from ~$1,750/mo): monitoring, hygiene, 2 pieces, monthly report.
  - Growth (from $3,000/mo, recommended): 4-6 pieces, schema expansion, AI-visibility
    tracking, monthly strategy call, full reporting.
  - Dominate (from ~$5,500/mo): 8-10 pieces, competitor displacement, citation/link
    building, biweekly calls, priority turnaround.

### 2. SEO prerender fix (Approach A)

Replace `react-helmet-async` with vite-react-ssg's native `Head` (built on `@unhead/react`,
re-exported by `vite-react-ssg`). Rendering `title`/`meta`/`link`/`script[type=ld+json]`
inside `Head` causes vite-react-ssg to extract them into each route's prerendered HTML.

- Refactor `src/components/SEO.tsx` to use `Head` instead of `Helmet`, preserving its current
  props (`title`, `description`, `schema`, `noindex`, canonical, og/twitter tags).
- Remove `<HelmetProvider>` from the app entry / layout.
- Remove `react-helmet-async` from `package.json` and from `ssr.noExternal` in
  `vite.config.ts` (keep `gsap`, `@gsap/react`).
- All pages already funnel through `SEO.tsx`, so no per-page edits beyond that.
- **Verification:** grep prerendered `dist/**/*.html` for a page-specific `<title>` and a
  `ld+json` block after build. This closes the gap recorded in project MEMORY.md.

Rejected: Approach B (hand-wire Helmet server output) — fragile, keeps extra dep;
Approach C (two head systems) — confusing. Approach A also *simplifies* the stack.

### 3. Structured data (`src/lib/seo.ts`)

Add builders and wire into the relevant pages' `SEO schema` prop (now prerendered via #2):
- `Person` (Mathew Brown: name, url, jobTitle, sameAs socials, knowsAbout keywords) - sitewide/home.
- `WebSite` (name, url, publisher) - home.
- `Service` / `Offer` for the SEO/AEO productized service - Services page (keep existing
  `serviceSchema`, extend with `Offer`/priceRange reflecting the "from" anchors).
- Keep case-study/article schema as-is.

### 4. One-pager (standalone designed PDF)

- Build an on-brand, single-page sales sheet as a **print-optimized HTML document**
  (dark editorial style, vermilion accents, matching the site) that renders to a clean
  1-page (or 2-page) PDF via print-to-PDF.
- Content: headline value prop, the AI-accelerated positioning, the Sprint + 3 tiers with
  full pricing (this is the gated detail), the 'Aiwi #1 proof point, a short process, and a
  clear CTA (email + booking link).
- Deliver the rendered **PDF** file plus keep the HTML source so it can be hosted at a link
  and updated. Location: `public/` (so the PDF is served at a stable URL for emailing/linking)
  with source under the repo. Exact path finalized in the implementation plan.
- No fabricated metrics; use only the confirmed 'Aiwi #1 ranking until more proof exists.

### 5. Metrics handling

- Hide/remove the `<Metrics>` blocks (currently `"00"` placeholders) on the three case
  studies for launch, so nothing fake ships. Preserve the data structure/TODOs so real
  numbers slot in fast. Swap in real figures as a fast-follow when Mathew provides them.

### 6. Go-live

- `npm run typecheck` and `npm run build` must pass.
- Browser smoke-test key routes (`/`, `/services`, a case study) on the preview build;
  confirm prerendered meta + JSON-LD in `dist`.
- Commit on `feat/services-offer-seo`; push and open/merge per user instruction → Netlify
  auto-deploys from the GitHub repo. (Push/merge only when the user asks.)

## Risks / watch-items

- **vite-react-ssg `Head` API details** — confirm exact import + usage against the installed
  version during implementation; adjust `SEO.tsx` accordingly.
- **Head/JSON-LD extraction** — verify tags actually appear in `dist` HTML (the whole point);
  do not assume.
- **Netlify SPA redirect** (`/* -> /index.html 200`) is non-forced, so prerendered files are
  served first; confirm it doesn't shadow prerendered routes after this change.
- **Reduced motion** — any new animated elements must respect `prefers-reduced-motion`.
- **No em dashes** in any visible copy (project rule).

## Testing

- `npm run typecheck`, `npm run test:run`, `npm run build` all green.
- Post-build grep of `dist/**/*.html` for per-page `<title>`, meta description, and `ld+json`.
- Manual browser pass on `/services` and the one-pager print output.
