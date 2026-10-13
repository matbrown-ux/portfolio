# Work Index + Case Study Pages (Astro rebuild): Design

Date: 2026-10-12
Status: Draft, awaiting review
Scope: Sub-project 2 of the Astro rebuild.
Base: branch `feat/astro-rebuild`, after sub-project 1 (design foundation + Home).

Visual reference: [`assets/2026-10-12-work-approved.jpeg`](./assets/2026-10-12-work-approved.jpeg). This is the mockup the owner approved with "keep both as is". It fixes composition, proportion and attitude for both pages. Exact sizes and spacing are tuned in the browser; striped blocks are placeholders for real media.

## Context

Sub-project 1 built the design system, the site shell and Home. Home's project tiles and its "View all projects" bar link to `/work` and `/work/<slug>`, which do not exist yet. The three case studies exist as MDX files written for the old site's components (`<Chapter>`, `<PullQuote>`, `<Walkthrough>`, `<Gallery>`, `<Outcome>`), none of which exist on this branch. The owner has no real screenshots, recordings, photography or metrics yet and wants placeholders that show clearly what is still needed.

## Goals

- `/work`: every case study listed, newest first.
- `/work/<slug>`: one case study template in the approved design that renders the three existing case studies without rewriting their prose.
- The full case study data schema.
- One media slot used everywhere media appears, accepting an image, a video or nothing.
- The optional image or video on Home's project tiles, deferred from sub-project 1.

## Non-goals

- No real media or metrics. Placeholders stay visible by the owner's decision.
- No before/after slider. The owner has retired it; do not port it.
- No sticky chapter navigation or reading progress bar.
- No JSON-LD, no new social images (sub-project 5). The existing `ogImage` field is kept and passed through.
- No Services, About, Contact or Blog pages.

## Constraints

Everything in the sub-project 1 spec's "Constraints" still binds: the TDD kit; colours limited to ivory, ink, vermilion and stone; small vermilion text only on ink; Anton, Archivo and JetBrains Mono; GSAP only, through `data-reveal`; reduced motion respected; nothing hidden without JavaScript; first-person copy passed through the `humanizer` skill with no em or en dashes; the design skills in `CLAUDE.md` section 8; the purchased script font never committed. In addition:

- **No React on these pages.** Nothing in the approved design needs an island.
- **Case study prose is not rewritten.** Only the mechanical MDX edits listed in Part 2 are made.
- **Never fabricate metrics or results.** Placeholder values (`"00"`, the "Result pending" sentence) render as they are.

## Part 1: Case study data

### Collection schema (`src/content.config.ts`)

The `caseStudies` collection grows from the four fields Home needed to the full set. Entry `id` stays the slug.

| Field | Type | Notes |
|---|---|---|
| `title` | string | Client or project name; the Anton display name |
| `headline` | string | Keyword-led; the page `h1` |
| `summary` | string | Meta description and Work index fallback |
| `date` | date | Sort key, newest first |
| `year` | string | Shown in the at-a-glance strip |
| `tags` | string[], at least one | Home tiles (first two) |
| `services` | string[] | Chapter side note |
| `stack` | string[] | At-a-glance strip |
| `role` | string | At-a-glance strip, Work index row |
| `client` | string, optional | Defaults to `title` |
| `liveUrl` | URL, optional | Hero "Visit live site" |
| `result` | string | One sentence; placeholder text renders as written |
| `ogImage` | string, optional | Passed to the layout |
| `media` | object, optional | `hero` and `tile`, each a media reference (below) |

The existing `slug` frontmatter line is redundant with the entry `id` and is left in place.

### Media references

A media reference is `{ src?: string, alt: string, poster?: string }`.

- `src` is a path relative to `src/assets/case-studies/`, for example `vamp-network/dashboard.png`. Files live in a folder per case study.
- The kind follows the file extension: `.mp4` and `.webm` are video; `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif` and `.svg` are images.
- `poster` (an image path in the same form) is required when `src` is a video.
- **No `src` means a placeholder.** `alt` is always present and doubles as the placeholder's label, so each placeholder names what belongs there.
- A `src` that does not match a file fails the build with a message naming the case study and the path. A missing file must never become a silent placeholder.

Images are optimised through Astro's image pipeline. Videos are emitted as files.

## Part 2: Building blocks

### `MediaSlot`

One component, used by the hero, Work index rows, Home tiles, walkthrough steps and gallery items.

- **Image:** responsive, lazy by default; the case study hero's is eager.
- **Video:** `muted`, `playsinline`, `loop`, `preload="none"`, with the poster. It plays only while at least half of it is on screen and pauses when it leaves. Under reduced motion it never plays by itself and shows native controls so the visitor can start it.
- **Placeholder:** the striped block from the mockup with the `alt` text as a monospace label and a second line reading "Screenshot, recording or photo to come". A `tone` prop picks the light or dark stripe so it reads on stone, ivory, vermilion and ink surrounds.
- A `frame="browser"` option wraps the media in the ink-outlined browser bar from the hero, showing a URL.

### Case study MDX blocks (`src/components/case-study/`)

Static `.astro` components passed to the MDX content. Props match what the three files already use, with the changes noted.

| Block | Props | Design (section in the reference) |
|---|---|---|
| `Chapter` | `title`; optional `asideLabel`, `aside` (string[]) | C3. Numbered section on the visible six-column grid: rail with number and rotated title, Anton `h2`, body in the middle columns, optional side note in the right columns |
| `PullQuote` | `text` | C4. Full vermilion band, the sentence in large Anton, ink |
| `Walkthrough` | `steps[]`: `title`, `body`, `alt`, optional `src`, `poster` | C5. Numbered steps, each a large media slot with an Anton name tag, alternating sides, one striped accent |
| `Gallery` | `images[]`: `alt`, `caption`, optional `src`, `poster` | C6. Colour-blocked grid; the first item is large |
| `Outcome` | `metrics[]`: `value`, `label` | C7. The first metric's value set giant in vermilion, overlapping a dark panel that lists every metric |

- **Chapter numbers are automatic**, produced with a CSS counter, so reordering chapters needs no renumbering. Walkthrough step numbers come from the step's position.
- **The outcome's giant number is the first metric.** Order the metrics so the headline one is first.
- **Gallery layout adapts to the count** (one to six items); captions render as monospace labels.
- The body paragraphs and lists inside a chapter are Archivo at reading size; bold lead-ins in lists keep their weight.

### Mechanical edits to the three MDX files

- Remove every `src` that points at an old placeholder SVG, so those slots become labelled placeholders. Keep each `alt`.
- Remove the `url` prop from the two `<Walkthrough>` uses; the live URL is shown in the hero.
- On each file's first `<Chapter>`, add `asideLabel="Services"` and `aside={frontmatter.services}`.
- No prose, metric or result changes.

Delete `public/images/placeholder-screen-1.svg`, `placeholder-screen-2.svg`, `placeholder-brand-1.svg` and `placeholder-brand-2.svg`.

## Part 3: Work index (`src/pages/work/index.astro`)

- **W1. Header.** Giant Anton "Work" with a vermilion full stop, decorative. The keyword `h1`, "UX/UI Engineering & SEO Case Studies", sits in the small text block with a rule above it. A rotated label gives the project count and the year range, both computed from the collection. Script "selected" is written over the top right corner of "Work".
- **W2. Project rows.** One full-width row per case study, newest first, numbered from 01. Rows cycle through three surfaces: stone with a vermilion media block, ink with a stone media block, ivory with an ink media block. Media alternates sides and breaks out of its block toward the text. Each row shows the number, the Anton title, the headline, the result sentence, role and year, and a square arrow. The whole row is one link to the case study.
- The page ends with the shared contact band and footer.
- **Mobile:** each row stacks, media first, with no break-out.
- **Hover and focus:** the row's arrow shifts; no surface moves.

## Part 4: Case study page (`src/pages/work/[slug].astro`)

- **C1. Hero.** A monospace number (the case study's position in the newest-first list). The client name in Anton, decorative, **sitting on top of the vermilion block where they cross**, so the name overlays the block. The keyword `h1` (`headline`) in the small text block at the lower left. The hero media in a browser frame over the vermilion block, to the right. A small technical note with a corner mark carries the first walkthrough step's body when there is one, otherwise the `summary`. A square arrow button and "Visit live site" with the host name, shown only when `liveUrl` exists and opening in the same tab with `rel="noopener"`. A rotated "Case study" and year label. Script "case study" written over the bottom left corner of the client name, overlapping its last line slightly.
- **C2. At a glance.** Dark strip: Client, Role, Year, Stack and Result, with a rotated "At a glance" label.
- **Body.** The MDX content with the five blocks.
- **C8. Next project.** Dark band: "Next project", the next case study's title in Anton, a vermilion arrow. The next one is the next older case study, wrapping from the oldest to the newest. Hidden when there is only one case study.
- The page ends with the shared contact band and footer.
- **Head:** title is the `headline`, description the `summary`, type `article`, `ogImage` when set.
- **Mobile:** the hero stacks (name, `h1`, then media over the block); the at-a-glance strip becomes a two-column list; chapters drop the rail to a number above the heading and the side note below the body; walkthrough steps stack with the media first; the outcome number sits above the panel.

## Part 5: Shared and Home changes

- **Contact band.** `ContactBand.astro` moves from `src/components/home/` to `src/components/sections/` and is used by Home, the Work index and case study pages.
- **Home tiles.** `FeaturedWork` shows a tile's `media.tile` through `MediaSlot` when it exists, filling the tile behind a legibility layer in the tile's fill colour. A tile without media stays the plain colour block it is today; Home tiles never show the striped placeholder.
- **Script artwork.** Add `selected` and `case-study` to `src/assets/script/phrases.json`, vermilion with an ivory edge, and regenerate. Each of these pages then has two script moments, at opposite ends: one in the hero, and "let's talk" in the contact band.

## Part 6: Logic (all test-first)

| Unit | Purpose |
|---|---|
| `src/lib/caseStudies.ts` | `sortCaseStudies` (date descending, id tiebreak; `featuredWork` is changed to use it), `workRows` (number, surface, media side), `nextCaseStudy` (wraps; `null` for a single entry), `projectSpan` (count and year range for the header label) |
| `src/lib/media.ts` | `mediaKind(path)`; `resolveMedia(ref, files)` returning image, video or placeholder, and throwing on an unknown path or a video without a poster |
| `src/lib/caseStudyMedia.ts` | The two `import.meta.glob` lookups over `src/assets/case-studies/` and the call into `resolveMedia`; the only module that touches the file map |
| `src/lib/videoInView.ts` | Plays and pauses `video[data-play-in-view]` by intersection; under reduced motion adds `controls` and never plays; returns a cleanup function |
| `src/lib/galleryLayout.ts` | Grid classes for one to six items; more than six repeats the pattern |
| `src/lib/host.ts` | Host name from a URL for the "Visit live site" label, without `www.` |

## Docs

Update `MEMORY.md` (roadmap status, what exists, how to add media) and `CLAUDE.md` section 5 (the full schema, the media folder convention, the MDX blocks). Add a short "Adding case study media" note to `DESIGN.md` or `CLAUDE.md` section 5, since the owner will do this later.

## Testing and verification

- **Unit (Vitest, test-first):** every unit in Part 6.
- **Static checks:** `npm run typecheck`, `npm run build`. The build emits `/work/index.html` and three `/work/<slug>/index.html` pages; each has exactly one `h1` and all copy in the HTML; no page requests a React chunk.
- **Media paths:** a temporary image and a temporary video in a case study prove the three media states end to end, then are removed.
- **Browser (Playwright MCP):** 1440x900, 1024x768 and 390x844; reduced motion; keyboard pass from a fresh load without scrolling first; JavaScript disabled; section-by-section comparison with the reference image.
- **Links:** Home's tiles and "View all projects" bar now resolve.

## Risks and mitigations

- **Placeholders shipping.** The owner chose to see them. They are plainly labelled, and `MEMORY.md` lists what each case study still needs.
- **`frontmatter` inside MDX.** The side note uses the MDX file's own `frontmatter.services`. If that is not available to component props in this Astro version, the fallback is to list the services in the MDX directly.
- **Video weight.** `preload="none"` plus a poster keeps a recording from loading until it is near the viewport.
- **Long names and headlines.** The hero and rows are tuned for the three current titles; the build checks a deliberately long title for overflow.

## Owner inputs needed

- Real result sentences for Vamp Network and The Booking Flow.
- Real metrics for all three (only 'Aiwi Waffles' "#1" is real).
- Media per case study: a hero capture, a Home tile image or video, walkthrough captures, gallery photography.
