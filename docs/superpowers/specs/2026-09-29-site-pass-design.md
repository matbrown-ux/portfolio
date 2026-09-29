# Site-wide Pass: Home, About, Services, Contact + Chrome: Design

Date: 2026-09-29
Status: Draft, awaiting review
Scope: Sub-project 4 of the portfolio semi-redesign.
Base: build on a new branch `feat/site-pass` created from `feat/work-index` (unmerged; this work depends on the interaction foundation, the case study system, and the work index).

## Context

Sub-projects 1 to 3 are built (interaction foundation, case study system, work index + Home selected work). The remaining pages and the global chrome still use the pre-redesign patterns: `FadeIn`/`StaggerList` reveals, locally hard-coded eases, no `RevealText`/`Magnetic`/`data-cursor`, and non-keyword `h1`s on About, Services, and Contact. The Home hero `h1` is produced client-side by a typewriter, so the prerendered HTML likely carries a partial or empty `h1` on the most important page. Services, About, and Home "What I do" advertise three disciplines while the site's keyword themes and case studies cover five.

Remaining after this: 5 (launch hardening).

## Goals and audience

- **Audience: freelance clients.** Interaction builds trust and leads to contact; the visitor stays in control.
- Every page and the chrome move onto the interaction foundation for a consistent, high-end feel.
- Two signature moments where clients decide: the **Home hero** (crawlable keyword `h1` + rotating discipline line + portrait parallax) and the **Services discipline index** (each discipline linked to the case study that proves it).
- Five disciplines, one source of truth.

## Non-goals

- No change to the case study pages or the work index beyond what shared components require.
- No prerender/head-tag work (sub-project 5).
- No new pages (no "How I work" section; the owner has not supplied process content).
- No invented facts: new discipline copy is drafted only from existing copy and case study facts and is marked for owner review.

## Constraints (carried)

- No em dashes in visible copy. Never fabricate results, metrics, response times, or process claims.
- Brand tokens only; vermilion is the single accent.
- No transform hover lifts on dark cards; `force3D: false` on GSAP tweens of dark surfaces.
- Every animation has a complete static fallback under `prefers-reduced-motion`.
- GSAP (via `src/lib/gsap.ts`) owns scroll/timeline; Motion owns pointer/state; never both on one element.
- `useGSAP` calls with `dependencies` use `revertOnUpdate: true`.
- Logic modules have basenames distinct from components.
- Keyword-led page `h1`s and section `h2`s (CLAUDE.md), rendered with `RevealText` (single text copy).
- Decorative art is `aria-hidden`; links carry clean accessible names.
- Router tests use `TestRouter`; tests are pristine.

---

## Part 1: Shared content

### `src/content/disciplines.ts` (typed data; a `.ts` file under `src/content/` is source per the TDD contract, so it ships with a shape/validity unit test)

```ts
interface Discipline {
  number: string        // "01".."05"
  slug: string          // anchor + ?service= value
  title: string
  blurb: string         // one line, Home "What I do"
  description: string   // Services
  deliverables: string[]
  cta: string           // Services CTA label
  skills: string[]      // About
  proofSlug?: string    // case study that proves it
}
```

| # | slug | title | proofSlug | copy source |
|---|------|-------|-----------|-------------|
| 01 | `ux-ui-engineering` | UX/UI Engineering | `vamp-network` | existing Services + Home + About copy, verbatim |
| 02 | `seo-aeo` | SEO/AEO | `aiwi-waffles` | existing SEO copy, verbatim (title gains "/AEO") |
| 03 | `agentic-workflows` | Agentic Workflows | `the-booking-flow` | existing "Agentic Workflow Development" copy, verbatim |
| 04 | `brand-development` | Brand Development | `aiwi-waffles` | drafted from case study facts (below), owner review |
| 05 | `saas-development` | SaaS Development | `the-booking-flow` | drafted from case study facts (below), owner review |

Drafted copy (each drafted entry carries a `// TODO: owner review` code comment):

- **Brand Development**
  - blurb: "Identities that stay cohesive from storefront to merch."
  - description: "Brand identity built to work everywhere a business shows up: logo, messaging, and a cohesive visual system carried across storefronts, signage, merch, product, and marketing."
  - deliverables: "Logo and visual identity system", "Brand messaging and voice", "Signage and physical touchpoints", "Merchandise design"
  - cta: "Build my brand"
  - skills: "Logo design", "Visual identity systems", "Brand messaging", "Signage", "Merchandise design", "Graphic design"
  - Sources: 'Aiwi Waffles (logo, messaging, visual system, store and food truck signage, merch line); The Booking Flow (full brand development, look and voice); Vamp Network (visual identity across product and marketing).
- **SaaS Development**
  - blurb: "Marketing sites, dashboards, and the integrations behind them."
  - description: "End-to-end SaaS builds: the marketing site that converts visitors, the product dashboard customers run on, and the authentication and integrations behind it."
  - deliverables: "Marketing site and product UI", "Custom dashboards on React, Vite, and Supabase", "Authentication with Google OAuth", "Third-party API integrations"
  - cta: "Build my SaaS"
  - skills: "React & Vite", "Supabase", "Authentication", "API integrations", "Dashboard design", "Marketing sites"
  - Sources: The Booking Flow (marketing site, pipeline dashboard, Google OAuth, Supabase, Angi/Thumbtack APIs); Vamp Network (custom dashboard, Supabase, external APIs).

Existing Home blurbs for 01 to 03 ("Interfaces that close deals...", "Technical and content SEO that compounds...", "AI-powered systems built on Claude...") become their `blurb`s. About's three skill lists become their `skills`.

### Keyword `h1`s (all via `RevealText`)

| Page | `h1` | Former headline becomes |
|------|------|--------------------------|
| Home | "UX/UI Engineer, SEO Specialist & AI Workflow Developer" | (typewriter removed; see rotator) |
| About | "About Mathew Brown: UX/UI Engineer & SEO Specialist" | eyebrow "The person behind the work" |
| Services | "UX/UI, SEO, AI Workflow, Brand & SaaS Services" | subline "Five disciplines. One point of view." |
| Contact | "Hire a UX/UI Engineer & SEO Specialist" | eyebrow "Let's talk." |

`SEO` titles/descriptions stay as they are (head-tag work is sub-project 5), except Services' description mentions all five disciplines.

---

## Part 2: Shared components

### `PortraitMedia` (`src/components/portrait/PortraitMedia.tsx`)
- The photo + circle composition used by Home and About: an `aria-hidden` circle (`bg-secondary-dark`) behind a portrait `<img alt="Mathew Brown">`.
- Load bloom (GSAP, curtain-aware via `useEntranceDelay`, `force3D: false`, `(prefers-reduced-motion: no-preference)` only): image grows + fades in, then the circle blooms. This is the current Home hero timeline, moved.
- Pointer parallax (Motion, fine pointer + motion allowed only): the circle's positioning wrapper drifts up to ~16px opposite the pointer on a soft spring. GSAP scales the inner circle element; Motion moves the outer wrapper; no element is animated by both.
- Props for per-page sizing: `src`, `imageClassName`, `circleClassName`, `className`.
- Pure logic `parallaxOffset(pointer, viewport, max = 16)` in `src/components/portrait/parallax.ts` (unit tested).

### `DisciplineRotator` (`src/components/interaction/DisciplineRotator.tsx`)
- A large display line under the Home `h1` cycling through: "Designing interfaces.", "Ranking in search and AI answers.", "Automating workflows.", "Building brands.", "Shipping SaaS." (owner review).
- Each change: outgoing words mask up, incoming words mask up from below (~0.6s), every ~2.8s. Motion-driven.
- `aria-hidden="true"`; a sibling `sr-only` sentence lists all five disciplines once. Pauses when the document is hidden. Reduced motion: renders the first line statically, no cycling.
- Pure logic `nextRotatorIndex(i, count)` (unit tested) in `src/components/interaction/rotatorIndex.ts`.

### `DisciplineIndex` (`src/components/services/DisciplineIndex.tsx`)
- Five full-width rows from `disciplines`. Row header is a `<button>` (`aria-expanded`, `aria-controls`) containing the large number (muted; vermilion when open), the title as `h2`, the blurb on `md+`, and a +/× glyph (`aria-hidden`).
- The panel (`id` = `panel-<slug>`, `role="region"`, `aria-labelledby` the button) holds the description, deliverables, a **proof card**, and a `Magnetic` CTA `Button` to `/contact?service=<slug>`.
- Proof card: a link to `/work/<proofSlug>` with `data-cursor="view"` and `aria-labelledby` title + result, showing `ProjectCover variant="static"`, the case study title, and `ProjectMeta`. Rendered only when `proofSlug` resolves to an existing case study.
- Single-open; first row open by default. On mount and on `hashchange`, `#<slug>` opens that row and scrolls it into view (smooth unless reduced motion).
- Height animation with Motion (`height: 0` ↔ `auto`, opacity); reduced motion: instant. Collapsed panels stay in the DOM with `inert` and `aria-hidden` (full copy remains crawlable).
- Pure logic `resolveOpenSlug(hash, slugs, fallback)` in `src/components/services/disciplineState.ts` (unit tested).

### `validateContactField` (`src/components/contact/contactValidation.ts`)
- `validateContactField(name, value): string | null` for `name`, `email`, `company`, `projectType`, `budget` (required; email format) and `message` (optional). Plain, short messages, no em dashes (e.g. "Please enter your name.", "Please enter a valid email address.").
- `serviceFromQuery(search, slugs): string | null` maps `?service=<slug>` to a discipline title for preselection.

### `SkipLink` (`src/components/nav/SkipLink.tsx`)
- "Skip to content", visually hidden until focused, links to `#main`; `DefaultLayout`'s `<main>` gets `id="main"` and `tabIndex={-1}`.

---

## Part 3: Pages

### Home (`src/pages/Home.tsx`)
- Hero: same layout; `PortraitMedia` replaces the inline image/circle and GSAP code; eyebrow "Available for freelance work" kept; keyword `h1` via `RevealText` (no `whitespace-nowrap`); `DisciplineRotator` below it; body copy unchanged; "View my work" and "Get in touch" wrapped in `Magnetic` with `data-cursor="view"` on the work CTA. The hero's text entrance uses the curtain-aware reveal (no Framer `initial/animate` with local eases). `useTypewriter` is deleted if no other consumer remains.
- "What I do": eyebrow + keyword `h2` "UX/UI, SEO, AI Workflow, Brand & SaaS Services" via `RevealText`; the five disciplines as a numbered grid (`xl:5`, `lg:3`, `md:2`, 1 on phones), each item a link to `/services#<slug>` (number, title, blurb); "All services →" link kept (arrow `aria-hidden`). Curtain-aware reveals replace `FadeIn`/`StaggerList`.
- "Selected work" (sub-project 3) unchanged.

### About (`src/pages/About.tsx`)
- Header: `PortraitMedia` (desktop right, mobile below text, as today); eyebrow "The person behind the work"; keyword `h1`; bio paragraphs verbatim; "Work with me" in `Magnetic`.
- Skills: eyebrow + existing `h2` via `RevealText`; five rows (number, discipline `h3`, skills as wrapped `Tag`s) from `disciplines`; curtain-aware reveals.
- No `ProjectCta` (the footer band is the page's contact prompt).

### Services (`src/pages/Services.tsx`)
- Header: eyebrow "Services"; keyword `h1`; subline "Five disciplines. One point of view."; existing intro sentence if present (otherwise none).
- `DisciplineIndex`.
- `serviceSchema` for all five disciplines.
- No `ProjectCta`.

### Contact (`src/pages/Contact.tsx`)
- Header: eyebrow "Let's talk."; keyword `h1`; existing intro and email link.
- Form: fields, `name="contact"`, Netlify attributes, hidden `form-name`, and honeypot unchanged. "Project type" options: the five discipline titles + "Multiple services"; preselected from `?service=<slug>` via `serviceFromQuery`.
- Validation: on blur and on submit per `validateContactField`; invalid fields get `aria-invalid="true"`, a vermilion border, and an error `<p id="<field>-error">` referenced by `aria-describedby`; on submit, focus the first invalid field and do not send.
- Submit: `Magnetic` "Send message" button; "Sending…" while in flight. Success: the form is replaced by a panel whose heading uses `RevealText` and whose copy is the existing success copy, plus a link to `/work`. Error: the existing error copy plus a `mailto:mat@matbrown.io` fallback link. No new claims (e.g. response times) beyond existing copy.

---

## Part 4: Chrome

### Navbar (`src/components/nav/Navbar.tsx`)
- Links: About, Services, Work, Blog. Active indicator: one `h-px` vermilion underline rendered under the active link with a shared Motion `layoutId`, gliding between links on route change; instant under reduced motion. Hover underline (CSS width) kept.
- Contact becomes an outlined vermilion CTA button on the right (`Magnetic`), active state when on `/contact`.
- Social icons kept. Always visible (no hide-on-scroll: the `/work` sticky panels depend on the 64px bar). Scrolled background behaviour kept.
- `SkipLink` rendered first in the layout.

### Mobile menu (`src/components/nav/MobileMenu.tsx`)
- Full-screen overlay (`bg-directors-black`) replacing the 70% drawer; links at display size revealed with a staggered word mask; active link vermilion; Contact CTA + social links at the bottom.
- Toggle button: `aria-expanded`, `aria-controls`, accessible label "Open menu"/"Close menu".
- While open: focus trapped within the overlay, `Escape` closes, page scroll locked; on close focus returns to the toggle; closes on route change.
- Reduced motion: instant open/close. Motion-driven.
- Pure logic `nextFocusIndex(current, count, shift)` for the trap in `src/components/nav/focusTrap.ts` (unit tested).

### Footer (`src/components/Footer.tsx`)
- CTA band structure kept (availability indicator, email, "Start a conversation"); heading via `RevealText`; button in `Magnetic`; shared motion tokens. "Pages" column lists Home, About, Services, Work, Blog, Contact. Back-to-top respects reduced motion (instant).

### Site-wide
- `html { scroll-padding-top: 4rem; }` in `globals.css` so anchor jumps and focus scrolling clear the fixed navbar.
- Every component/page touched in this pass imports eases/durations from `src/lib/motion.ts`; no local bezier arrays remain in them.

---

## File map (indicative)

**Create:** `src/content/disciplines.ts` (+ shape test), `src/components/portrait/{PortraitMedia.tsx,parallax.ts}`, `src/components/interaction/{DisciplineRotator.tsx,rotatorIndex.ts}`, `src/components/services/{DisciplineIndex.tsx,disciplineState.ts}`, `src/components/contact/contactValidation.ts`, `src/components/nav/{SkipLink.tsx,focusTrap.ts}`, tests for each.

**Modify:** `src/pages/{Home,About,Services,Contact}.tsx`, `src/components/nav/{Navbar,MobileMenu}.tsx`, `src/components/Footer.tsx`, `src/layouts/DefaultLayout.tsx`, `src/styles/globals.css`, `src/lib/seo.ts` if needed for five service schemas, `MEMORY.md`. Delete `src/hooks/useTypewriter.ts` (+ test) if unused.

## Testing

Per the tdd-kit contract, every source change starts with a failing test.

**Unit (Vitest):**
- `disciplines`: five entries, unique slugs/numbers, every `proofSlug` resolves via `getCaseStudyBySlug`, no em dashes in any string.
- `parallaxOffset`, `nextRotatorIndex`, `resolveOpenSlug`, `validateContactField`, `serviceFromQuery`, `nextFocusIndex`: pure-function tests including edge cases.
- `DisciplineRotator`: reduced motion shows the first line statically; `sr-only` sentence present; rotating line `aria-hidden`.
- `DisciplineIndex`: button ARIA; first open by default; single-open; `#brand-development` opens that row; collapsed panels in the DOM with `inert`; proof card link name = title + result; CTA href carries `?service=`.
- `PortraitMedia`: image alt, circle `aria-hidden`, no parallax on coarse pointer or reduced motion.
- Pages: each `h1` accessible name equals its keyword text; Home "What I do" links to `/services#<slug>` for five disciplines; About lists five disciplines; Contact preselects from `?service=`, shows inline errors and focuses the first invalid field, keeps Netlify attributes and honeypot.
- Chrome: skip link targets `#main`; navbar has four links + Contact CTA; mobile menu toggle ARIA, `Escape` closes and returns focus, closes on route change, focus trap cycles.

**Visual (Playwright MCP, dev server):** every page at 1440x900, 1024x768, 390x844; reduced motion; keyboard-only pass (skip link, nav, mobile menu trap, discipline index, form errors); `/services#saas-development` deep link; `/contact?service=brand-development` preselect; hero parallax on a fine pointer; mobile menu at 390.

**Build:** `npm run typecheck`, `npm run test:run`, `npm run build`; confirm the built `dist/contact/index.html` (or equivalent prerendered Contact HTML) still contains the Netlify form markup and that the Home prerendered HTML contains the keyword `h1` text.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| New discipline copy reads as invented | Drafted only from listed case study facts; `TODO: owner review` markers; listed in the handoff |
| Rotator distracts or is read repeatedly by screen readers | `aria-hidden` + one `sr-only` sentence; slow cadence; paused when hidden; static under reduced motion |
| Accordion hides content from crawlers | Collapsed panels remain in the DOM (`inert`, height 0) |
| Focus trap bugs trap keyboard users | Pure `nextFocusIndex`; `Escape` always closes; tested |
| GSAP and Motion both touching the portrait | GSAP only on inner image/circle scale; Motion only on the outer circle wrapper |
| Netlify form detection breaks | Markup and attributes unchanged; checked in built HTML |
| Double CTAs | `ProjectCta` only on `/work` and case studies; other pages rely on the footer band |
