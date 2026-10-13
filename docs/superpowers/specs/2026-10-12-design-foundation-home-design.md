# Design Foundation + Home Page (Astro rebuild): Design

Date: 2026-10-12
Status: Draft, awaiting review
Scope: Sub-project 1 of the Astro rebuild.
Base: branch `feat/astro-rebuild` (Astro scaffold committed as 435102f). The old React + Vite app on `feat/site-pass` is reference only.

Visual reference: [`assets/2026-10-12-home-approved.jpeg`](./assets/2026-10-12-home-approved.jpeg). This is the combined mockup the owner approved section by section. It fixes composition, proportion and attitude. Exact sizes, spacing and placeholder wording in it are not final.

## Context

The owner is redesigning the portfolio completely and has moved it to Astro + React islands + Tailwind v4 + GSAP. The old site was dark, editorial and restrained. The new direction, chosen from ten reference images in `/Users/operationhq/Documents/02-PERSONAL/PORTFOLIO-REFERENCES`, is **full brutalist on a light ground**: ivory background, ink type, one hot vermilion accent in large solid blocks, black-and-white cut-out photography, very large condensed display type, and handwritten brush accents.

The rebuild is split into five sub-projects, each with its own spec, plan and build:

1. **Design foundation + Home** (this spec).
2. Work: content collections, Work index, case study template.
3. Services, About, Contact.
4. Blog: index, pillar, article.
5. SEO/AEO layer and launch.

## Goals and audience

- **Audience: freelance clients** deciding whether to hire. Unchanged from `PRODUCT.md`.
- Establish the design system (colour, type, devices, motion tokens) that every later page uses.
- Build the site shell (header, mobile menu, footer) and the complete Home page.
- Home ships as static HTML with the keyword `h1` and all copy in the prerendered markup, and no React on desktop.

## Non-goals

- No other pages. Nav, tile and button links to `/work`, `/work/<slug>`, `/services`, `/about`, `/blog` and `/contact` are written now and resolve when sub-projects 2 to 4 land. Nothing is deployed before then.
- No real project media. Tiles are colour blocks until the owner supplies images or video.
- No page transitions, no favicon, no JSON-LD schema (sub-project 5).
- No full case study schema. Only the fields the Home tiles need.

## Constraints

- **TDD kit.** Every `.ts`, `.tsx`, `.mjs` under `src/` or `scripts/` is written test-first using the superpowers test-driven-development skill; the tdd-kit git hooks enforce it. No `Test-Exempt` trailer. `.astro`, CSS, MDX, JSON under `src/content/`, images and config are content. Keep logic out of `.astro` frontmatter.
- **Design and motion skills** as set out in `CLAUDE.md` section 8: `industrial-brutalist-ui` leads the aesthetic, `high-end-visual-design` for premium finish, `frontend-design` + `design-taste-frontend` for page architecture, `impeccable` for all easing and timing. Decisions locked in this spec override any skill default.
- **GSAP only** for animation. No `motion` package.
- **Copy rules:** all copy is first person and passes the copy guardrails in Part 4; no em dashes in visible copy; keyword-led `h1` and `h2`; never fabricate client metrics.
- **Accessibility:** WCAG AA, keyboard navigable, all motion respects `prefers-reduced-motion`.
- **No content hidden without JavaScript.** Elements are visible by default; scripts set hidden start states only when motion is allowed.

## Part 1: Design system

### Colour tokens (`src/styles/global.css` `@theme`)

| Token | Value | Use |
|-------|-------|-----|
| `ivory` | `#f4f0e6` | Default page background; text on ink |
| `ink` | `#0c0c0c` | Text on ivory; background of dark sections |
| `vermilion` | `#f86343` | The single accent: solid blocks, primary button, one word or mark per section |
| `stone` | `#e4dfd3` | Neutral tile and placeholder fill |
| `line-dark` | ivory at 16% | Dividers on ink |

Rules:

- There is no dark theme. Dark is a section style (discipline strip, statement band, footer).
- **Vermilion text contrast.** Vermilion on ivory or stone is about 2.9:1, so it is allowed only for large display type and decoration there. Small vermilion text (numbers, labels) appears only on ink. Text on a vermilion fill is ink.
- **Photo tint.** A vermilion block with `mix-blend-mode: multiply` laid over a black-and-white cut-out tints the part it covers. Used in the hero and the About teaser.

### Type

| Role | Face | Use |
|------|------|-----|
| Display | **Anton** (one weight) | Hero word, section headings, tile titles, vertical name. Uppercase, except the hero word (lowercase with a full stop). |
| Body | **Archivo** (variable) | Paragraph text. |
| Label | **JetBrains Mono** | Small uppercase tracked labels: nav, numbers, tile metadata, buttons. |
| Script | **Gloss And Bloom** | Decoration only, shipped as SVG artwork (see Part 2). |

- Anton, Archivo and JetBrains Mono are self-hosted through Astro's built-in `fonts` configuration. No runtime requests to Google.
- Display sizes use `clamp()` so they scale with the viewport; the mockup's proportions are the target at 1440 wide.

### Recurring devices

- **Script overlay:** a short handwritten vermilion phrase at a slight angle (about 6 to 8 degrees counter-clockwise), written over the corner of a heading with an edge in the background colour so it cuts through the letters it crosses.
- **Script is used sparingly.** The owner wants Gloss And Bloom kept minimal: at most two script moments on a page, never two in adjacent sections, and none where it would compete with a portrait.
- **Brush strikethrough:** Extras stroke `e` through the middle of a struck word, with the correction handwritten above.
- **Numbering:** monospace numbers on list items (disciplines, project tiles). Section headings carry no "003 / Work" style label.
- **Vertical labels:** rotated monospace text on section edges, and the vertical Anton name in the About teaser.
- **Buttons:** square ink arrow button; filled vermilion button (ink text); outlined ink button. Sharp corners throughout.
- **Logo:** the owner's brush "MB" mark as a single-path SVG that takes `currentColor`.

## Part 2: Assets

### Logo

Source: `/Users/operationhq/Documents/02-PERSONAL/logo-initials.svg`. It contains two artboards with baked-in background rectangles. Extract the mark path only (the `Layer_2` path), drop both rectangles, and save as `src/assets/logo/mb-mark.svg` with `fill="currentColor"`, `viewBox="0 0 369 278"`. A `Logo.astro` component inlines it. Below about 24px the brush detail fills in; a simplified favicon is deferred to sub-project 5.

### Portraits

Move `public/images/hero-image.png` and `public/images/about-hero-image.png` into `src/assets/portraits/` and render them with Astro's `<Image>` (responsive sizes, modern formats). Both are black-and-white cut-outs with transparency.

### Script artwork (Gloss And Bloom)

The GitHub repo is public, so the purchased font files must not be committed. The script appears only as a few fixed decorative phrases and two brush strokes, so it ships as vector shapes.

- **Font files stay local** in a git-ignored `.fonts/` folder at the project root: `Gloss_And_Bloom.ttf`, `Gloss_And_Bloom_Alternates.ttf`, `Gloss_And_Bloom_Extras.ttf`. Add `.fonts/` and `.playwright-mcp/` to `.gitignore`.
- **Source list:** `src/assets/script/phrases.json` lists each item: a name, either a phrase or an Extras stroke key, its fill colour, and an optional edge colour (the background it sits on).
- **Generator:** `npm run script-art` reads the source list and the local fonts and writes one standalone SVG per item to `public/script/`, plus a manifest `src/assets/script/art.json` (per item: path, width, height). Lettering uses the Alternates cut, with the lowercase `b` glyph taken from Regular; any character Alternates lacks also falls back to Regular; kerning is applied. If the fonts are missing it exits with a message naming the folder and files it expects.
- **Committed output:** `phrases.json`, `art.json` and the generated SVG files. Site builds, including Netlify, never need the fonts.
- **Use:** `ScriptArt.astro` renders a named item as a decorative, lazy-loaded `<img>`. The SVGs are separate files, not inlined, because each brush outline is 50 to 65 KB and would bloat the page HTML. Colours are therefore baked into each file by the generator.
- **Adding a phrase later:** add it to `phrases.json`, run `npm run script-art` on a machine that has `.fonts/`, commit the generated files.

Initial items: phrases `let's talk`, `memorable`; stroke `e`.

### Removed

Delete `public/images/vamp-network-cover.svg`, `the-booking-flow-cover.svg`, `aiwi-waffles-cover.svg`, and the `coverImage` lines in the three case study MDX files. Blog pillar covers and the case study OG PNGs stay until their sub-projects.

## Part 3: Site shell

### Header (`SiteHeader.astro`)

Logo mark (links home), then Work, Services, About, Blog in monospace, and a vermilion "Start a project" button to `/contact`. Sits over the hero on Home. Includes a skip link to `main`. Below `md` the links collapse behind a menu button.

### Mobile menu (`MobileMenu.tsx`, React island)

Loaded with `client:media` for small screens only, so desktop Home ships no React. Full-screen ink panel with the nav links in Anton and the contact button. Focus is trapped while open, Escape closes and returns focus to the toggle, body scroll is locked and restored. Without JavaScript the nav links remain reachable in the footer.

### Footer (`SiteFooter.astro`)

Ink band: logo mark, Work, Services, About, Blog, Contact, and "Back to top". Back-to-top scrolls smoothly unless reduced motion is set.

## Part 4: Home page (`src/pages/index.astro`)

Section order is fixed. Each section is a static `.astro` component.

### 1. Hero (reference: `hero-design`)

- **Rotating word:** lowercase Anton with a full stop, typing through `ux`, `ui`, `seo`, `ai` with a vermilion caret. Every word is short enough that the word and its caret stay clear of the text column and the vermilion block. Same rhythm as the old `useTypewriter` hook (type, pause, delete, next). It is `aria-hidden`; the prerendered HTML contains the first word so it reads correctly without JavaScript. Under reduced motion it shows `ux.` and does not type.
- **Keyword `h1`:** "UX/UI Engineer, SEO Specialist & AI Workflow Developer", set small in monospace in the text column with a short rule above it, next to a short first-person description that names the owner.
- **Portrait:** hero cut-out anchored to the bottom, right of centre, with a vermilion `multiply` block across the lower half running to the right edge.
- **Edge details:** rotated monospace label top right (name, "Freelance", availability line); rotated Anton "001" bottom left (decorative); square ink arrow button on the block's lower left corner that scrolls to the discipline strip.
- **Height:** fills the first viewport on desktop.
- **Mobile:** word and `h1` stack at the top; portrait and block sit below; edge details reduce to the label.

### 2. What I do (dark strip, reference: `style-direction`)

Five disciplines from `src/content/disciplines.ts`, numbered 01 to 05: vermilion number, Anton title, one-line blurb, arrow. Each is a link to `/services#<slug>`. A rotated "What I do" label sits on the left edge. Five columns at desktop, three across at tablet, stacked rows on mobile. The section has a visually hidden `h2` ("What I do: UX/UI Engineering, SEO/AEO, Agentic Workflows, Brand Development and SaaS Development").

### 3. Statement band (dark)

- Anton headline with one struck word: "I build ~~average~~ websites." with stroke `e` through "average" and "memorable" handwritten above it in vermilion.
- **Markup:** the `h2` reads "I build memorable websites." to assistive tech and crawlers. The struck word and both pieces of artwork are `aria-hidden`; "memorable" is present as visually hidden text.
- Right side: one monospace sentence and a vermilion "Start a project" button to `/contact`.

### 4. Featured work (ivory)

- `h2` "Featured work" in plain Anton. The brush underline tried in mockups was dropped; the owner may add a different accent later.
- Three tiles for the three most recent case studies: one tall (stone), two stacked (vermilion, ink). Each shows number, Anton title, discipline tags and an arrow, and the whole tile links to `/work/<slug>`.
- Tiles are plain colour blocks now. The component accepts an optional image or video per tile so media can be added later without redesign: video plays muted only while on screen, has a poster, and falls back to the poster under reduced motion.
- A vermilion vertical "View all projects" bar on the right edge links to `/work`.
- The vertical "Featured work" side label from the earlier mockup is dropped, since the heading now says it.
- Mobile: tiles stack; the bar becomes a full-width button below them.

### 5. About teaser (ivory, reference: `about-section`)

- "Mathew" set vertically in Anton on the left edge; the About cut-out portrait beside it.
- A vermilion `multiply` block runs from the left page edge across the lower half, behind the name and over the portrait.
- Right column: `h2` "Freelance UX/UI Engineer & SEO Specialist", one sentence of bio, outlined "More about me" button to `/about`.
- No script in this section. A "hey, I'm Mat" overlay was tried in mockups and removed as too much.
- Mobile: portrait and block first, name set horizontally, copy below.

### 6. Contact band (ivory)

- Ink Anton "Got a project?" on ivory, with "let's talk" in vermilion script written over its bottom right corner (ivory edge so it cuts through the ink letters).
- A vermilion "Start a project" button to `/contact` and the email link `mat@matbrown.io` sit below the headline on the left, clear of the script.
- No rule separates sections. Featured work, the About teaser and the contact band are all ivory and run into one another; the About teaser's vermilion block is the only division.

### Copy guardrails

These apply to every page of the site, not only Home. They are also recorded in `CLAUDE.md` section 2.

- **First person, always.** "I", "my", "me". Never "Mathew Brown is", never "we" or "our". The name appears in labels, titles, metadata and in "I'm Mathew Brown" statements, so search and answer engines can still tie the site to the person.
- **Talk to the reader as "you".**
- **Humanizer pass.** All visible copy goes through the `humanizer` skill before it ships.
- **Whole sentences in body copy.** Each has a subject and a plain verb (is, has, build, fix). One short sentence for emphasis is fine; a run of fragments is not. Labels, buttons and headings are exempt.
- **No "X, not Y" endings** and no "it's not just X, it's Y".
- **No forced groups of three.** List three things only when there are three real things.
- **No sales adjectives or stock AI words:** stunning, seamless, cutting-edge, world-class, elevate, unlock, crafted, passionate, robust, leverage, delve, showcase, landscape, journey, and the like.
- **Specific over vague.** Name the tool, the client, the deliverable or the result, and only state facts the owner has supplied. No fabricated metrics.
- **Headlines may be loud; body copy is plain.** The brutalist attitude lives in the display type, not in exaggerated claims.
- **Mechanics:** no em or en dashes, straight quotes, no emojis, sentence case in the markup (Anton uppercases through CSS).

### Home copy (first person, humanized)

| Where | Copy |
|-------|------|
| Page title | UX/UI Engineer, SEO Specialist & AI Workflow Developer \| Mathew Brown |
| Meta description | I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer. |
| Hero `h1` | UX/UI Engineer, SEO Specialist & AI Workflow Developer |
| Hero description | I'm Mathew Brown. I design and build interfaces, get them found in search, and automate the busywork with AI agents. |
| Hero edge label | Mathew Brown / Freelance / Available 2026 |
| 01 UX/UI Engineering | I design interfaces and build them myself in production React, so nothing gets lost between design and code. |
| 02 SEO/AEO | I fix the technical foundations and structure your content so rankings build over time. |
| 03 Agentic Workflows | I build AI agents on Claude and the AI SDK that do real work in your business. |
| 04 Brand Development | I design brand identities that hold together across logo, signage and merch. |
| 05 SaaS Development | I build SaaS products: the marketing site, the dashboard and the integrations behind them. |
| Statement `h2` | I build memorable websites. (with "average" struck through) |
| Statement side line | I design them to be remembered and build them to rank. |
| Featured work `h2` | Featured work |
| About `h2` | Freelance UX/UI Engineer & SEO Specialist |
| About sentence | I'm a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer. |
| Contact headline and script | Got a project? / let's talk |
| Buttons | Start a project, More about me, View all projects |

### Copy status

Every line above is a draft for the owner to approve or replace, except the `h1`, the discipline titles and the project names. Blurbs 01 to 03 replace the old site's third-person-neutral fragments ("Interfaces that close deals. Designed with precision...") and keep their facts. "Available 2026" needs the owner's confirmation.

## Part 5: Behaviour and motion

### Units of logic (all test-first)

| Unit | Purpose |
|------|---------|
| `src/lib/typewriter.ts` | Pure state step: given the current text, phase and word list, return the next state and delay. No DOM. |
| `src/lib/typewriterElement.ts` | Binds the step function to an element with timers; honours reduced motion; cleans up. |
| `src/lib/motionTokens.ts` | Named durations and eases, chosen with `impeccable`. The only place these values live. |
| `src/lib/gsap.ts` | Single browser-guarded GSAP + ScrollTrigger registration point. |
| `src/lib/reveal.ts` | Reads `data-reveal` attributes and builds the scroll reveals; no-op under reduced motion. |
| `src/content/disciplines.ts` | Ported from `feat/site-pass` with its shape test (minus the old content-pipeline import). |
| `src/lib/featuredWork.ts` | From collection entries: sort by date descending, take three, assign numbers and tile variants. |
| `src/components/nav/MobileMenu.tsx` | The island described above. |
| `scripts/script-art/*.mjs` | Glyph selection (Alternates, with Regular's `b`), layout with kerning, path and viewBox output, slug naming, missing-font error. |

### Motion

- **Load:** hero block wipes in, portrait rises, then the word starts typing.
- **Scroll:** headings and tiles reveal once on entering the viewport; brush strokes and script wipe in left to right just after their heading.
- **Hover:** tiles and buttons respond with a colour change and a small positional shift. No `transform`-based lift on ink surfaces (the GPU compositing artifact from the old site); GSAP tweens on ink surfaces use `force3D: false`.
- **Reduced motion:** final states only, no typing, no reveals.

### Content collection

`src/content.config.ts` defines a `caseStudies` collection over `src/content/case-studies/*.mdx` with only the fields Home needs: `title`, `slug`, `date`, `tags`, and optional `client`. Tiles show `tags`. Other frontmatter passes through untouched. MDX bodies are not rendered in this sub-project (they still reference the old `<Chapter>` family of components).

## Part 6: Docs

- Rewrite `PRODUCT.md`: keep audience and purpose; replace "premium reads as restraint" and the "loud" anti-reference with the brutalist position (bold, confident, specific), keeping the rule that every claim is specific and true.
- Rewrite `DESIGN.md` from this spec's design system.
- Replace `CLAUDE.md` sections 4 and 5 with the new tokens, devices and content notes; correct section 6 (Playwright MCP is the browser tool, not `agent-browser`).
- Update `MEMORY.md` as the build progresses.

## File map (indicative)

```
.fonts/                                  git-ignored, local only
scripts/script-art/                      generator + tests
src/assets/logo/mb-mark.svg
src/assets/portraits/hero.png, about.png
src/assets/script/phrases.json, art.json
public/script/*.svg                      generated script artwork
src/components/brand/Logo.astro, ScriptArt.astro
src/components/ui/Button.astro, ArrowButton.astro, VerticalLabel.astro
src/components/nav/SiteHeader.astro, SiteFooter.astro, MobileMenu.tsx, focusTrap.ts (+ tests)
src/components/home/Hero.astro, DisciplineStrip.astro, StatementBand.astro, FeaturedWork.astro, AboutTeaser.astro, ContactBand.astro
src/content/disciplines.ts, navigation.ts (+ tests)
src/content.config.ts
src/lib/typewriter.ts, typewriterElement.ts, motionTokens.ts, gsap.ts, reveal.ts, featuredWork.ts (+ tests)
src/layouts/BaseLayout.astro             gains header, footer, fonts
src/pages/index.astro
src/styles/global.css                    @theme tokens
```

## Testing and verification

- **Unit (Vitest, test-first):** every unit in the Part 5 table.
- **Static checks:** `npm run typecheck` (`astro check`) and `npm run build` pass; the built `dist/index.html` contains the `h1`, all section copy and the first hero word.
- **Browser (Playwright MCP against the dev server):** 1440x900, 1024x768 and 390x844; reduced motion; keyboard pass through header, tiles, buttons and the mobile menu; compare each section against the reference image.
- **No-JavaScript check:** all content visible and readable with scripts disabled.

## Risks and mitigations

- **Font licence.** Outlines of fixed phrases avoid publishing the font files. The owner should still confirm the licence permits this use.
- **Overlap legibility.** Script and strokes sit over headings by design. Each placement was approved in mockup; the build must hold those relationships at every breakpoint, and may drop a script overlay on small screens where it would cover text.
- **`mix-blend-mode: multiply`.** Supported in all current browsers; verify in Safari. The fallback is an untinted portrait over a solid block.
- **Anton has one weight.** Hierarchy comes from size and colour, never from faux bold.
- **Links to pages that do not exist yet.** Accepted for this sub-project; nothing deploys until the linked pages land.

## Owner inputs needed

- Approval or replacement of the placeholder copy listed under "Copy status".
- New images or video for the three project tiles.
- Confirmation of the font licence terms.
