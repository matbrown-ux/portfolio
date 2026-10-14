# Project Memory — Mathew Brown Portfolio

> Read this at the start of every session to understand what the project is and what has been built.
> Keep it updated as work progresses.

## Astro rebuild (read first, supersedes the roadmap below)

> **2026-10-13: The Booking Flow case study was removed at the owner's request** (nothing shareable; the project stalled). It is replaced by `portfolio-optimization` (a Vamp Network service). Vamp Network's campaign analytics was never built and must not be claimed. Older notes below that mention The Booking Flow describe the site before this change.

On 2026-10-12 the owner decided to redesign the site completely and move to their preferred stack: **Astro + React islands + Tailwind v4 + GSAP**. The rebuild is a clean scaffold on `feat/astro-rebuild` (branched from the old app's last commit, `0bfb10a`). Everything below this section describes the old React + Vite app. Its branches (`feat/interaction-case-studies`, `feat/work-index`, `feat/site-pass`) were deleted on 2026-10-12 because the owner does not want the old design; the code is still in this branch's history. Use `git show 0bfb10a:<path>` as the reference to port from, not as a description of this branch.

**What exists now (sub-project 1):** Astro 7 static output with `site: https://matbrown.io`, `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, Tailwind v4 via `@tailwindcss/vite`, `gsap` + `@gsap/react`, Vitest 5 + jsdom + Testing Library (setup in `src/test/setup.ts`), and `astro check` as `npm run typecheck`.

- **Tokens and fonts:** `src/styles/global.css` `@theme` holds `ivory`, `ink`, `vermilion`, `stone` and `line-dark`, plus the `type-display` and `type-label` utilities. Anton, Archivo and JetBrains Mono are self-hosted through Astro's font handling.
- **Layout:** `src/layouts/BaseLayout.astro` owns the head (title, description, canonical, OG, Twitter) and the inline script that sets the `js` and `reveals-ready` classes on `<html>`. Pages are `index.astro` (Home), `404.astro`, from sub-project 2 `work/index.astro` and `work/[slug].astro`, and from sub-project 3 `services.astro`, `about.astro`, `contact/index.astro` and `contact/thanks.astro`, and from sub-project 4 `blog/index.astro`, `blog/[topic]/index.astro` and `blog/[topic]/[article].astro`.
- **Shell:** `src/components/nav/` has `SiteHeader.astro`, `SiteFooter.astro` and the `MobileMenu.tsx` React island (with `focusTrap.ts`).
- **Header scroll behaviour:** `src/lib/headerScroll.ts` (with its test, started from the closing script in `BaseLayout.astro`) sets `data-header-state` on the header, found by `data-site-header`. `top` is the header as written (absolute over the hero, no background), `hidden` is fixed just above the viewport, and `shown` is fixed at the top on an ivory bar with a 1px ink rule. The header hides on the way down and returns after 8px of travel up; the styles for the states are in `src/styles/global.css`. Without JavaScript there is no attribute and the header is absolute, as before. It is never hidden while the mobile menu is open (`aria-expanded="true"` on the toggle) or while keyboard focus is inside it, and focus moving into a hidden header shows it. Only a change between hidden and shown slides (`data-header-slide`, 0.2s, off under reduced motion). Anchor jumps scroll down or load mid-page, so the header is hidden when they land and the Services sections still need no `scroll-margin-top`.
- **Footer anchoring:** `body` in `BaseLayout.astro` is a flex column at least one viewport tall and `main` takes the spare height (`flex-1`), so on a short page the footer sits at the bottom of the viewport. The layout's `fill` prop makes `main` a flex column too, so a page's single top-level element can stretch down to the footer; `/contact` and `/contact/thanks` use it.
- **Gotcha, header and mobile menu:** the open menu is a `position: fixed` panel inside the header. A `transform` on the header (even `translateY(0)`, even mid-transition) makes the header the panel's containing block and shrinks the panel to the bar. So the shown state has `transform: none`, and a `:has([aria-expanded="true"])` rule in `global.css` drops the transform and the transition while the menu is open.
- **Gotcha, header slide:** the header becomes fixed while it is off screen. If that change were allowed to transition, the header would flash at the top of the viewport and slide away, so the transition exists only when the script adds `data-header-slide`, which it does only between hidden and shown.
- **Home:** five sections under `src/components/home/`: `Hero`, `DisciplineStrip`, `StatementBand`, `FeaturedWork`, `AboutTeaser`. `ContactBand` moved to `src/components/sections/` in sub-project 2 so the case study pages share it.
- **Primitives:** `src/components/ui/` (`Button`, `ArrowButton`, `VerticalLabel`) and `src/components/brand/` (`Logo`, `ScriptArt`).
- **Behaviour modules in `src/lib/`:** `typewriter`, `typewriterElement`, `reveal`, `motionTokens`, `gsap`, `featuredWork`, each with a co-located test.
- **Script art:** `scripts/script-art/` (`generate.mjs`, `shape.mjs`, `svg.mjs`, `artList.mjs`, with tests) turns `src/assets/script/phrases.json` into one SVG per entry in `public/script/*.svg`, plus the manifest `src/assets/script/art.json` that `ScriptArt.astro` reads, via `npm run script-art`. The Gloss And Bloom font files stay in the git-ignored `.fonts/` folder. A phrase may carry an optional `edge` colour, which makes the generator draw an outline and pad the box, but no phrase uses it: on 2026-10-12 the owner asked for the outline to be removed from all script artwork, so phrases in `phrases.json` carry no `edge` and new ones should not be given one.
- **Content:** `src/content.config.ts` defines the `caseStudies` collection (glob loader over `src/content/case-studies/*.mdx`; the full schema is described under "What sub-project 2 added" below), and since sub-project 4 the `blogTopics` and `blogArticles` collections. `src/content/disciplines.ts` and `src/content/navigation.ts` are the single sources for the five disciplines and the nav links. Home, Services, About and the Contact select all read `disciplines.ts`.
- **Build status:** every task on the plan is done, including Task 13 (final verification pass) and the fix pass after the final review. `netlify.toml` no longer has the SPA catch-all redirect.

**Kept from the old app:** the 13 MDX files in `src/content/` (3 case studies, 10 blog), everything else in `public/images/` (`case-studies/<slug>/og.png`; the blog cover SVGs were removed in sub-project 4), the tdd-kit, and the docs. The case study frontmatter is indexed by the `caseStudies` collection in `src/content.config.ts`, and since sub-project 2 the bodies are rendered by `work/[slug].astro` with new `<Chapter>`, `<Walkthrough>`, `<Gallery>`, `<Outcome>` and `<PullQuote>` components (`<BeforeAfter>` is retired). The `coverImage` frontmatter lines and the three case study cover SVGs were removed. The blog MDX is read by the `blogTopics` and `blogArticles` collections since sub-project 4; the old cover SVGs were removed.

**Removed from this branch (recover with `git show 0bfb10a:<path>`):** the old React components, pages and router, the old `src/lib/` modules (`src/lib/` now holds the new rebuild modules), `src/types/content.ts`, `motion`, `react-router-dom`, `react-helmet-async`, `vite-react-ssg`. `src/content/disciplines.ts` was ported back with new first-person blurbs (and has its test).

**Design direction (approved 2026-10-12):** full brutalist on a light ground. Ivory `#f4f0e6` background, ink `#0c0c0c`, vermilion `#f86343` as the single accent in large solid blocks, black-and-white cut-out portraits that multiply onto solid vermilion blocks (the block itself stays exact brand vermilion), Anton display type, Archivo body, JetBrains Mono labels, and Gloss And Bloom brush script used sparingly as SVG artwork (the repo is public, so the purchased font files stay in a git-ignored `.fonts/` folder and are never committed). The owner's references are in `/Users/operationhq/Documents/02-PERSONAL/PORTFOLIO-REFERENCES`; the logo source is `/Users/operationhq/Documents/02-PERSONAL/logo-initials.svg`. All copy is first person and goes through the `humanizer` skill (guardrails in `CLAUDE.md` section 2). Design and motion skills to use are in `CLAUDE.md` section 8.

**Rebuild roadmap:** five sub-projects, each with its own spec, plan and build.

| # | Sub-project | Spec | Status |
|---|-------------|------|--------|
| 1 | Design foundation + Home | `docs/superpowers/specs/2026-10-12-design-foundation-home-design.md` (reference image in `docs/superpowers/specs/assets/`) | Built; awaiting owner review |
| 2 | Work: content collections, Work index, case study template | `docs/superpowers/specs/2026-10-12-work-case-studies-design.md` | Built; awaiting owner review |
| 3 | Services, About, Contact | `docs/superpowers/specs/2026-10-12-services-about-contact-design.md` | Built; awaiting owner review |
| 4 | Blog | `docs/superpowers/specs/2026-10-12-blog-design.md` | Built; awaiting owner review |
| 5 | SEO/AEO layer and launch | `docs/superpowers/specs/2026-10-13-seo-launch-design.md` | Built on feat/astro-rebuild; not pushed, no pull request, not live |

**Owner inputs still needed for sub-project 1:** approval of the drafted Home copy (table in the spec), new images or video for the three project tiles (the old case study cover SVGs were removed), confirmation of "Available 2026", and a check that the font licence allows outlined artwork. Items the build ledger marks for the owner to confirm: the word "memorable" overlaps the top of "average" in the statement band at all widths (deepest at 390); the Home hero word is slightly smaller than the mockup between 1024 and 1279 (about 150px vs 169px glyph height at 1440); the statement band's right half is empty at 1024; the featured work tile order follows the case study dates (Vamp Network, The Booking Flow, 'Aiwi Waffles), so reorder by editing `date`; tile numbers are ink on stone and vermilion tiles because small vermilion text is only allowed on ink.

Decisions the final review left for the owner, answered 2026-10-12:

- Portraits: the owner will look for larger versions of the portrait cut-outs (`hero.png` is 476x900, `about.png` is 626x874). Still open.
- Hero rotating word: stops after two cycles and the cursor disappears. Built.
- Project tiles: change colour on hover and focus. Built.
- Hero label direction: stays as built (bottom to top).

**What sub-project 2 added:** the Work index and one page per case study, built from the three MDX files with no React island.

- **Pages:** `src/pages/work/index.astro` and `src/pages/work/[slug].astro`.
- **Components:** `src/components/case-study/` (`CaseStudyHero`, `AtAGlance`, `Chapter`, `PullQuote`, `Walkthrough`, `Gallery`, `Outcome`, `NextProject`), `src/components/work/` (`WorkHeader`, `WorkRow`), `src/components/media/MediaSlot.astro` and `src/components/sections/ContactBand.astro`.
- **Modules in `src/lib/`, each with a test:** `caseStudies` (case study numbering, next project, Work rows, project span), `media` and `caseStudyMedia` (resolve a media path under `src/assets/case-studies/<slug>/`, poster rules, tile media), `galleryLayout`, `titleFit` (scales long client names down by character count), `videoInView` (plays a muted video only while it is on screen; wired into the closing script in `BaseLayout.astro`) and `host` (the link label for `liveUrl`).
- **Schema:** `title`, `headline` (the page `h1`), `summary`, `date`, `year`, `tags`, `services`, `stack`, `role`, `result`, and optional `client`, `liveUrl`, `heroNote`, `media.hero`, `media.tile`. Home's featured work tiles now show a case study's tile media when it has one.
- **Script art:** two new phrases in `src/assets/script/phrases.json`, `selected` and `case-study`.
- **Media:** `src/assets/case-studies/<slug>/` holds the images and clips (see the README there). No real media has been added yet.

**Owner inputs still needed for sub-project 2:**

- Real result sentences for Vamp Network and The Booking Flow.
- Real metrics for all three case studies (only 'Aiwi Waffles' "#1" local ranking is a confirmed fact; every other number is a `"00"` placeholder).
- Per case study: a hero capture and a Home tile image or video.
- Walkthrough captures: 2 for Vamp Network and 3 for The Booking Flow.
- Gallery photography: 2 images for 'Aiwi Waffles.
- A short `heroNote` for 'Aiwi Waffles. Its hero note currently falls back to the summary, clamped to six lines.
- One real video clip, so playback can be checked. A `.webm` has been played in the browser; an `.mp4` has not.

**Decisions made during the sub-project 2 build, for the owner to confirm:**

- The chapter six-column layout starts at `xl` (1280px), not `lg`, so everything stacks at 1024px as the acceptance list asks.
- In 'Aiwi Waffles' outcome chapter the pull quote is drawn on desktop as a full-width vermilion band under the split, although in the MDX it sits between paragraphs two and three, so visual and reading order differ there.
- 'Aiwi Waffles' `summary` is now quoted in the frontmatter, with no word changed, because YAML had cut it at " #1".
- The hero note is clamped to six lines, so a long summary shows an ellipsis until a short `heroNote` is supplied.
- When Work rows stack below 1024px, each row's media block is inset by the row gutter so the row's own surface frames it; media stays first and the palette is unchanged.
- Gallery layout: the first item is large only for three and five items. Two images are equal halves (so 'Aiwi Waffles' two images sit side by side), and seven or more use a plain three-column grid.
- A video inside a link (a Work row, a Home tile) gets no controls under reduced motion or when the browser refuses autoplay, because controls nested in a link cannot be used, so a recording made only for a tile could not be played there.
- Long client names are scaled down by character count (`titleFit`); a single word over about 20 letters can still overflow.
- Pull quote that ends a chapter: it leaves an empty gridded strip under the vermilion band (seen under 'Aiwi Waffles' "The challenge"). Whether to pull the band flush is a design call.
- A looping video outside a link gets a "Pause" / "Play" button in its bottom right corner (`src/lib/videoInView.ts`); a video the visitor paused stays paused when scrolled back into view. A video inside a link (a Work row, a Home tile) has no control, because a button nested in a link cannot be used, so WCAG 2.2.2 is still unmet for those. No real recording is on the site yet, so the button has only been tested in unit tests.
- The chapter headings ("Overview", "The challenge", "The approach", "The outcome") are generic labels that come from the MDX and are the owner's to rewrite.
- An `.mp4` has not been played, only a `.webm`.
- The ledger also marks these for the owner: the outcome chapter heading wraps to two lines and keeps the rail; 'Aiwi Waffles' outcome panel is about 900px tall; the two dark placeholders in a five-item gallery stack in one column; below 1280px Vamp Network's Services note falls under the quote band; The Booking Flow's name takes three lines at 1440 and does not reach the vermilion block.

**What sub-project 3 added:** the Services, About and Contact pages, with no React island.

- **Pages:** `src/pages/services.astro`, `about.astro`, `contact/index.astro` and `contact/thanks.astro`. The thanks page is the form's `action` target and is filtered out of the sitemap in `astro.config.mjs`.
- **Components:** `src/components/services/` (`ServicesHeader`, `ServiceJumpNav`, `ServiceSection`), `src/components/about/` (`AboutHero`, `AboutBio`, `AboutFacts`, `AboutBackground`, `AboutSkills`) and `src/components/contact/` (`ContactIntro`, `ContactForm`, `Confirmation`).
- **Modules in `src/lib/`, each with a test:** `serviceSections` (builds the five Services sections from `disciplines.ts` and the case studies), `contactValidation` (field rules and the `?service=` lookup) and `contactForm` (inline validation, preselect and the in-place send, found through `data-` attributes).
- **Content:** `src/content/about.ts` (the "By the numbers" facts, the owner's own statements) and `src/content/contactOptions.ts` (budget ranges and the "Multiple services" option), each with a test. `Discipline` lost its unused `description` field.
- **`Button`:** a new `ink` variant and a `current` prop. The header's button for the page you are on uses `current`, so `/contact` and `/contact/thanks` show an ink button. The mobile menu's contact link takes the same current state on those two pages.
- **Script art:** two new phrases in `src/assets/script/phrases.json`, `what-i-do` and `always-building`.
- **Contact form:** plain HTML posted to Netlify Forms (`data-netlify`, honeypot, `action="/contact/thanks"`), so it works without JavaScript. With JavaScript it validates inline and sends in place. See `CLAUDE.md` section 5. Two protections in `src/lib/contactForm.ts`: a press on the send button (`pointerdown` until `pointerup`, `pointercancel` or the submit) suppresses the leave check, because showing or hiding an error line as the mouse goes down moves the button and swallows the click, and a send is aborted after 15 seconds (`timeoutMs` option, an `AbortController` timer cleared when the request settles) so a stalled connection ends in the failure message instead of a button stuck on "Sending". Two layout fixes from browser verification: between `lg` and `xl` the two selects take a full row each, and the footer's "Back to top" link is fully opaque on focus.

**Owner inputs still needed for sub-project 3:**

- Enable Netlify Forms for the site and set where submissions go.
- After the first deploy, send one test enquiry and confirm it arrives. A host that answers the form's POST with success while Netlify Forms is not enabled would show the visitor the confirmation and lose the message.
- (Done 2026-10-13: the owner confirmed the Brand Development and SaaS Development copy in `disciplines.ts`.)
- A larger About portrait (`about.png` is 626x874 and is upscaled on 2x displays at desktop widths).
- Check the portrait blend (each portrait multiplying onto its vermilion block: Home hero, Home About teaser, About hero) and the contact form in Safari and Firefox and on a real phone.
- Checks not run in this build: a real Netlify submission, Safari and Firefox, a real iOS device.

**Owner's own instructions during the sub-project 3 build (not decisions to confirm):** on 2026-10-12 the owner asked for the About hero block to be exactly brand vermilion (it had been vermilion multiplied twice, about `#f12612`) and for its top edge to sit at the shoulders in the portrait. Both override the approved mockup, so do not restore the mockup. The block is one solid `bg-vermilion` fill, its top is derived from the portrait's own size and shoulder line, and the portrait itself multiplies onto it (`AboutHero.astro`). The same day the owner asked for Home's two portrait blocks to be exact vermilion too (they were a multiply layer over the page and sampled `#ed5d3c`). Home's hero and About teaser now use the same approach: one solid `bg-vermilion` block with `-z-10`, so it sits above the section's ivory ground and below everything else, and `mix-blend-multiply` on the portrait image. All three blocks sample `#f86343`.

**Decisions made during the sub-project 3 build, for the owner to confirm:**

- The About hero's rotated label moved onto the ivory above the block, because the block now starts at the shoulders and the label would sit on it.
- Services sections have no scroll offset for anchor links. The header is now fixed only after a scroll up, and an anchor jump is a scroll down or a fresh load mid-page, where the header starts hidden (checked in the browser for a fresh load, the jump strip and a Home discipline tile). If a link is ever added that jumps up the page to a section, add `scroll-margin-top` to the sections.
- The `ink` Button on hover becomes an ink outline with a transparent fill, with a permanent 2px border so it never changes size, because an ivory fill nearly vanished on the stone SEO/AEO section.
- While the contact form is sending, the button is `aria-disabled="true"` instead of natively `disabled`, so keyboard focus stays on it after a failed send; the spec says the button is disabled and this keeps that meaning for assistive technology.
- The thanks page's vermilion block starts below the header on an ivory strip, not under it, because the nav's vermilion hover underline vanished on a vermilion ground.
- The About portrait is upscaled on 2x displays until a larger file arrives, at 1024px two skill titles wrap to two lines, and at two columns the sixth skills cell is empty.
- The contact panel turns vermilion on success, fields go two-column from 640px, and the short thanks page shows ivory under the footer at 1440x900, as the 404 page does.

**What sub-project 4 added:** the Blog, with no React island and no new dependency.

- **Routes:** `/blog` (`src/pages/blog/index.astro`), nine topic pages at `/blog/<topic>` and the article page at `/blog/<topic>/<article>`. A "topic" is what the old files called a pillar; visitors never see "pillar". No address on the site has a trailing slash, internal or generated (decided by the owner 2026-10-13; see `CLAUDE.md` section 3). Pages are built as files (`dist/blog.html`), not folders.
- **Components in `src/components/blog/`:** thirteen: `BlogHeader`, `LatestArticle`, `TopicIndex`, `TopicHeader`, `TopicArticles`, `ArticleRow`, `EmptyTopic`, `ArticleHeader`, `ArticleContents`, `ArticleNext`, `Breadcrumb`, `Terms` and `Term`.
- **Modules in `src/lib/`, each with a test:** `blog` (slugs, grouping, latest articles, sibling topics, breadcrumb, next tiles, count labels and number words, UTC date formatting), `readingTime` (`ceil(words / 200)`, never under 1; the article currently shows "2 min read"), `emptyTopics` (`emptyTopicSlugs`, imported by `astro.config.mjs`) and `tocSpy` (marks the contents link for the section being read; started from the closing script in `BaseLayout.astro`).
- **Collections (`src/content.config.ts`, both strict):** `blogTopics` reads `src/content/blog/*/index.mdx`, id is the folder name, fields `title`, `headline`, `description`, `discipline` (a slug from `disciplines.ts`), `order`, optional `keywords`. `blogArticles` reads every other `.mdx` in a topic folder, id is `<topic>/<article>`, fields `title`, `description`, `date`, optional `updated` and `keywords`. An article belongs to the folder it sits in; there is no `slug`, `coverImage` or `pillar` field.
- **Empty topics:** eight of the nine topics have no article. A topic with no article is `noindex` (from the collection data) and left out of the sitemap by `emptyTopicSlugs`. Adding the first article switches the count, the index status, `noindex` and the sitemap with no manual list. The two rules were checked against the built site at the end of the build and agreed for all nine topics. Nothing automated guards that agreement: `src/lib/emptyTopics.test.ts` uses temporary folders only. The spec asked for an automated check and it is still owed; carry it into sub-project 5's launch audits.
- **Script art:** one new phrase, `notes`, on the blog index (the contact band is its second moment). Topic and article pages carry only the contact band.
- **Code blocks:** coloured from the palette by a small hand-written theme object inline in `astro.config.mjs`, not the stock `css-variables` theme. Its colours are `var(--astro-code-...)` strings; `--astro-code-token-tag` (vermilion) and `--astro-code-token-muted` are set in `src/styles/global.css`. The stock theme cannot colour tag names separately from quoted strings. The block's bar shows the language only, and the block is keyboard focusable so a long line can be scrolled.
- **`<Terms>` and `<Term name>`:** an MDX block for a ruled list of named items (the article's five button states).
- **Reading position:** `ArticleContents` is sticky from `xl` and absent for an article with fewer than two `h2`s. `tocSpy` uses an IntersectionObserver and also re-reads on scroll, because the observer reports nothing for a heading that jumps from above the viewport to below the watched band.
- **Empty-topic sentence:** it ends "..., and the case study on <title> shows it on a real business." (the planned wording printed "the The Booking Flow"). The clause is dropped when the discipline has no proof case study.
- **Type:** the topic title and the article `h1` use `leading-[0.92]`; at 0.86 the lines touched.

**Owner inputs still needed for sub-project 4:**

- Correct or approve the nine topic rows in the spec's copy table, and the nine new headlines in particular.
- Correct or approve the revised article. The article says a focus ring should pass 4.5:1 contrast; WCAG asks 3:1 for a focus indicator and 4.5:1 is the figure for body text. The text is left as the owner wrote it until they say which they mean.
- Approve "notes" as the handwritten word on the index.
- Articles for the eight empty topics, whenever they are written. None blocks this build.
- Still owed by the build, not by the owner: an automated check that the `noindex` rule and the sitemap rule agree on the real content folder. The spec asked for it. Carry it into sub-project 5's launch audits.
- A decision on article links. A link in an article is marked only by a vermilion underline, which is 2.69:1 on ivory, under the 3:1 asked of non-text cues. An ink underline that turns vermilion on hover would pass.
- A decision on the breadcrumb for Agentic Workflows and SaaS Development. It repeats the name, because the topic and its discipline share it.
- Items the copy pass (Task 8) changed nothing about and left to confirm: (1) the index intro "Nine topics across the five disciplines I work in." and the third "where next" tile caption "Nine topics across five disciplines." are verbless lines; (2) the article `description` "A practical guide to designing button states that communicate clearly and drive action." is a third-person descriptor with mildly promotional wording; (3) the topic descriptions "save hours every week" (AI Automation) and "earns rankings" (Technical SEO) are outcome claims the owner wrote; (4) all nine topic bodies open "These articles are about / cover".

**Gotchas from the sub-project 4 build:**

- Blank lines are required inside a `<Term>` for inline Markdown to be parsed.
- A `headline` or `description` containing `: ` must be quoted in frontmatter, or YAML cuts it there.
- Display type with a line height under 1 has a text box taller than its line box, so its glyph box can cover a link placed just above or below and swallow the click even though nothing visibly overlaps. `Breadcrumb.astro` has `relative z-10` for this. Check with `document.elementFromPoint` at the link's centre, since screenshots look fine.
- `ch` in a `max-w-[Nch]` class follows the element's own font size. On display type scaled by `--fit`, divide by the scale (`calc(11ch/var(--fit))`); on a prose wrapper, set the font size on the wrapper.
- A grid row with a fixed side column, a fixed title column and an `auto` pill leaves almost nothing for the `1fr` text at 1024. Keep such rows two-column until `xl`.
- A `position: sticky; left: 0` pseudo-element with negative side margins inside a padded scroll container is shifted by the sticky offset in Chrome. Put the padding on the inner `code` and leave the bar unmargined.
- JSX in `.astro` drops the line break between `{expr}` and a following element; add `{' '}` when a space is needed.
- A jump across an IntersectionObserver band produces no entry, so "current section" logic needs a scroll re-read too.
- Logic modules cannot share a basename with a component case-insensitively on macOS.
- `grep -P` does not work with this machine's grep; use perl for dash checks, for example `perl -CSD -ne 'print "$ARGV\n" if /[\x{2013}\x{2014}]/' $(find dist/blog -name '*.html')`.
- Built pages in `dist/` are single minified lines: count matches with `grep -o ... | wc -l`, not `grep -c`.

**What sub-project 5 added:** the SEO/AEO layer: share cards, a favicon set, structured data, crawler files, optional analytics, a build check and an indexing hold. Spec: `docs/superpowers/specs/2026-10-13-seo-launch-design.md`. No new React island. Audit: `docs/superpowers/audits/2026-10-13-launch-audit.md`.

- **Header profile icons:** LinkedIn and GitHub icons (Phosphor, `fill="currentColor"`) in the header, the mobile menu and the footer (left of "Back to top"), read from `src/content/person.ts`. Each opens in a new tab and says so in its `aria-label`.
- **Person facts:** `src/content/person.ts` (with its test) is the single source for the owner's name, job title, location, email and public profiles. Structured data, `llms.txt` and the profile icons read it. Change a value only when the owner does.
- **Share cards:** every page gets a 1200x630 PNG from `src/pages/og/[...path].png.ts`, served at `/og/<path>.png` (Home is `/og/index.png`). The card text lives in `shareCards()` in `src/lib/shareCards.ts` (label, title, address per page; case studies, topics and articles are built from their collections, and a case study card shows its hero capture when the hero is a raster image or a video poster). To change a card, edit that function, run `npm run build` and look at the PNG. Rendering is `src/lib/cardRender.ts` (fontkit outlines the Anton glyphs, sharp rasterises), layout and fitting are `cardText.ts` and `cardSvg.ts`. The hex colours may appear in the card and favicon generators because they run outside CSS. `ShareMeta.astro` writes the `og:` and Twitter tags; a page with no card of its own falls back to Home's.
- **Card title rules:** the title sets on at most two lines, never ends a line on "&", and `fitTitle` keeps stepping down 10% below the listed sizes to a floor of 24 (`MIN_TITLE_SIZE`) until it fits. A very long title therefore sets small.
- **Favicon set:** `npm run favicons` (`scripts/favicons/generate.mjs`, sizes and the mark in `icons.mjs`) writes `public/favicon.svg`, the three PNGs (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) and `favicon.ico` from the logo mark. `public/site.webmanifest` is a hand-kept file that the script does not write. The mark fills 92% of its square (`MARK_SHARE`); the approved mock showed about 65 to 70%, but at 16px a smaller mark thins out. To change it, edit `MARK_SHARE` and re-run `npm run favicons`; the output tests fail until the committed files match.
- **Structured data:** `src/lib/structuredData.ts` builds JSON-LD nodes (Person, WebSite, WebPage types, BreadcrumbList, Service, ItemList, CreativeWork for a case study, BlogPosting for an article, Blog) and `src/components/seo/JsonLd.astro` prints them. `BaseLayout.astro` always adds Person and WebSite; a page passes its own nodes in the `schema` prop. To give a new page type a node, add a builder to `structuredData.ts` with a test, then pass it from the page. It states only what the page shows, and a case study `result` (a placeholder) never appears in it. A case study's `dateCreated` is its `year` (the page shows only the year; `date` is a sort key), and an article's `isPartOf` names its Blog in full, so the article's own graph resolves.
- **`robots.txt`, `llms.txt`, RSS:** `src/pages/robots.txt.ts`, `llms.txt.ts` and `rss.xml.ts`, built from the same content as the pages. `articleUrl` in `src/lib/llmsTxt.ts` makes an article's absolute address (RSS uses it too; it sits there because `structuredData.ts` imports `shareCards.ts`, which imports `blog.ts`, so `blog.ts` cannot import it). `BLOG_DESCRIPTION` in `src/lib/blog.ts` is the single source for the blog index description, used by the page, structured data and RSS.
- **Analytics:** `src/content/analytics.ts` holds `cloudflareToken`, set on 2026-10-13 to the owner's token for the site registered in Cloudflare as `matbrown.io`. The beacon loads only on a production build (`CONTEXT=production`); with an empty token nothing loads and nothing is sent. Not yet confirmed: that Cloudflare records visits (it may drop views on the `netlify.app` address because the hostname does not match; check the dashboard after the domain moves). After an in-place contact send the address becomes `/contact/thanks` (history `pushState`), so the enquiry counts as a page view; Back reloads the page to a fresh form and Forward shows the real thanks page; the thanks page also reloads on an address mismatch (`reloadOnAddressMismatch`, shared with the form). Cloudflare's docs say the beacon counts `pushState` route changes by default; confirm on the first production deploy.
- **Build check:** `npm run build` is `astro build && node scripts/check-dist/run.mjs` (rules in `scripts/check-dist/rules.mjs`, tested). It fails the build, naming the page and the rule, when: a page is `noindex` and in the sitemap, or indexable and missing from it; an indexable page lacks exactly one `h1`, a title, a description or a canonical that equals its own address; any page lacks a share image whose file was built, or has JSON-LD that does not parse or lacks Person or WebSite; a sitemap address was not built; text, `alt`, `title`, `content` or `aria-label` carries an em or en dash, as the character or as an HTML entity (`&mdash;`, `&#8212;` and the like); a required file (`robots.txt`, `llms.txt`, `rss.xml`, the favicons, the three touch icons, the manifest) is missing; a share image address is not absolute; or `llms.txt` or `rss.xml` links to a page that was not built. JSON-LD and `rss.xml` are not scanned for dashes.
- **Indexing hold:** `netlify.toml` sends `X-Robots-Tag: noindex` on every path, because the canonical links name `matbrown.io`, which is still a parking page. It is not served by a local file server. Delete the block on domain day.
- **Dependencies:** `fontkit` (stub types in `src/types/fontkit.d.ts`), `sharp` and the two `@fontsource` packages (Anton and JetBrains Mono, for the card renderer) are normal dependencies, so a production-only install still builds.
- **Dashes:** the build check's dash rule reads attribute copy as well as visible text because the copy rules cover alt text and meta descriptions.

**Gotchas from the sub-project 5 build:**

- `fontkit` ships no types and reads `.woff2` directly. The real build was the proof that the endpoint can open the fonts.
- A `// @vitest-environment node` comment breaks tests in this repo: `src/test/setup.ts` touches `window`. `sharp` works under the default jsdom environment.
- The favicon output tests read `public/` relative to the repo root, so changing `MARK_SHARE` means running `npm run favicons` before the suite passes. That coupling is intended.
- A helper script that imports `sharp` must live inside the repo tree, or node cannot resolve the package.
- A greedy wrap can end a card title's first line on "&"; `wrapTitle` now avoids that.
- A link whose focus state turns its text ivory on an ivory ground loses the global focus outline, which uses `currentColor`. Give it an explicit `focus-visible:outline-ink` (the header icons do).
- At 768px the two header icons push the button onto two lines unless the nav gap is `gap-6` at `md`.
- A flex row with `self-start` is only as wide as its content, so `justify-between` does nothing.
- After a test file adds `popstate` listeners, remove them in each test, or later tests reload jsdom's window and print "Not implemented: navigation".
- Back after an in-place send does not change the page by itself: a `pushState` entry fires `popstate`, and `contactForm.ts` reloads when the address and the page disagree.
- The Cloudflare token appears HTML-escaped in the built page (`data-cf-beacon="{&quot;token&quot;...}"`), which browsers decode.
- `npx lighthouse` works here with the installed Chrome (`--chrome-flags="--headless=new"`). A `noindex` page scores 66 for SEO because of the `is-crawlable` audit; that is correct for the topic pages with no article and the 404.
- Contrast findings the owner accepted on 2026-10-13: three pieces of large vermilion display type on ivory measure 2.69:1 against the 3:1 needed for large text (the "and" in `AboutBio.astro:4`, the step numbers in `Walkthrough.astro:48`, the giant figure in `Outcome.astro:20`). They stay vermilion as a design decision, so Lighthouse accessibility reads 96 and axe reports them on `/about/` and the case study pages. Do not change them. The owner also accepted the article link underline and the favicon mark at 92%.
- An accessibility scan run before scroll reveals have fired under-reports contrast failures (Lighthouse scored About phone 100 while axe, settled, flagged the same element). Scan with reduced motion, or after scrolling the page top to bottom.

**Owner inputs still needed for sub-project 5:**

- Confirm the Person facts in `src/content/person.ts`, including anything beyond the two profile addresses (the owner confirmed LinkedIn and GitHub on 2026-10-13).
- Confirm the favicon's tighter mark (92% of its square) by eye against the approved mock.
- Confirm the two-line share card titles, and that a long title may set small.
- Switch on Netlify Forms and its notification email, then send one real test enquiry and confirm it arrives.
- Create the Cloudflare Web Analytics site and supply its token, whenever ready. The site launches with analytics off.
- Check Safari, Firefox and a real phone, and look at a real browser tab strip for the favicon. None of these has been run.
- (Decided 2026-10-13: the three contrast findings and the article link underline stay as designed.)
- Case study hero captures, whenever they exist; the cards pick them up.

**Domain day checklist** (the site is built on `feat/astro-rebuild` and is not live):

1. Point the domain at Netlify.
2. Delete the `X-Robots-Tag` block from `netlify.toml`.
3. Confirm the Netlify address redirects to the domain.
4. Set up Google Search Console and Bing Webmaster Tools and submit `https://matbrown.io/sitemap-index.xml`.
5. Paste the Cloudflare token into `src/content/analytics.ts`.
6. Re-run LinkedIn's Post Inspector on the home page. Share image addresses (`og:image`) are built on `https://matbrown.io`, which is still a parking page, so a link-preview tool pointed at the Netlify address shows no image until the domain moves. Until then, check a card by opening `/og/<path>.png` on the Netlify address directly.

## Redesign roadmap and where we are (old Vite app, historical)

The site is mid-way through a 5-part semi-redesign focused on high-end UX and interaction design. Audience: freelance clients; interaction must build trust and lead to contact, and the visitor stays in control. Each sub-project gets its own spec, then plan, then a subagent-driven build (fresh implementer + task reviewer per task, final whole-branch review on the strongest model, one fix wave). Nothing is merged or pushed yet; the owner chose "keep as-is" after each branch.

| # | Sub-project | Branch (stacked) | Spec / plan | Status |
|---|-------------|------------------|-------------|--------|
| 1+2 | Interaction foundation + case study system | `feat/interaction-case-studies` (from `main` @ 6387ede) | `docs/superpowers/specs/2026-09-28-interaction-foundation-case-studies-design.md`, `docs/superpowers/plans/2026-09-28-interaction-foundation-case-studies.md` | Built, reviewed, fixed. Not merged. |
| 3 | Work index + Home "Selected work" | `feat/work-index` (from `feat/interaction-case-studies`) | `docs/superpowers/specs/2026-09-29-work-index-design.md`, `docs/superpowers/plans/2026-09-29-work-index.md` | Built, reviewed, fixed. Not merged. |
| 4 | Site-wide pass: Home hero + "What I do", About, Services, Contact, navbar, mobile menu, footer | `feat/site-pass` (from `feat/work-index`; spec committed as 5080f4b) | `docs/superpowers/specs/2026-09-29-site-pass-design.md`, `docs/superpowers/plans/2026-09-29-site-pass.md` | Built, reviewed, fixed (15 tasks + final review fix wave). Not merged. |
| 5 | Launch hardening | not started | none yet | See "Launch hardening backlog" below. |

**Sub-project 4 status:** done on `feat/site-pass` (final review "with fixes"; one fix wave applied and re-reviewed clean). Next: owner decides merge/keep, then sub-project 5. Give every implementer the rules below.

### Rules every implementer must follow (learned the hard way)

- Commit trailer is always `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, whatever model writes the commit.
- Never add a `Test-Exempt:` trailer (needs the owner's explicit approval). If the TDD hook refuses an amend, stage the test file with it. Prefer new commits over amends.
- Logic modules must not share a basename with a component case-insensitively (macOS: `./Magnetic` resolved to `magnetic.ts`). Use names like `magneticOffset.ts`, `metricFormat.ts`, `galleryNav.ts`.
- `RevealText` and `CountUp` render ONE copy of their text (no sr-only duplicate), so crawlers don't index headings twice.
- `useGSAP` with `dependencies` must pass `revertOnUpdate: true`, or ScrollTriggers accumulate.
- Router tests use `src/test/TestRouter.tsx` (MemoryRouter with v7 future flags); test output must be pristine.
- Don't kill dev servers by name (`pkill vite`); the owner keeps one on port 5180. Don't commit `.playwright-mcp/`. `agent-browser` is NOT installed; use the Playwright MCP tools for browser checks.
- Don't write "--no-verify" literally in shell heredocs: the tdd-kit Claude hook blocks any command containing it.

### Owner inputs still needed

- Real one-sentence `result` for Vamp Network and The Booking Flow (both show "Result pending: headline outcome to be supplied").
- Real screenshots/recordings and metrics for all three case studies (`00` placeholders; only 'Aiwi's `#1` is real).
- Review of drafted copy in sub-project 4: Brand Development and SaaS Development discipline copy, the hero rotator lines, and the four new keyword `h1`s (all in the site-pass spec).
- Design call: placement of the hero rotator's pause button (at 1440 it sits after the reserved longest-line width, so it floats right of short lines).

### Launch hardening backlog (sub-project 5)

- SSG prerenders only 7 routes: `/work/<slug>` and blog pillar/article routes are not prerendered.
- `react-helmet-async` head tags are client-only; `og:image` is relative and there is no `twitter:image` (raster OG PNGs already exist per case study).
- Deferred polish: `/work` panel focus-scroll also fires on mouse-click focus (guard with `:focus-visible`); em dashes remain in 8 blog pillar descriptions and the blog breadcrumb separator; placeholder `result` strings are shown prominently until replaced.
- Site-pass deferred minors: Contact errors clear only on blur; uncontrolled project-type select ignores a `?service` change on the same mounted page; Contact SEO description lists three disciplines; duplicate nav item lists in Navbar and MobileMenu; rotator swap takes ~1.0s (spec ~0.6s) and reserves height by character count; bloom durations in PortraitMedia are literals, not tokens; several test gaps (hidden-tab rotator pause, reduced-motion scroll, blur-clears-error, dialog unmount).
- Performance, accessibility, and reduced-motion audit; swap in real assets; deploy.

## What this is

A personal portfolio site for **Mathew Brown** — a freelance UX/UI engineer, SEO/AEO specialist, and agentic-workflow developer. Dark, editorial, design-forward aesthetic. Domain: `matbrown.io`. Email: `mat@matbrown.io`.

## Tech stack

- **React + Vite** with **vite-react-ssg** (static site generation / prerender at build)
- **TypeScript**
- **Tailwind CSS v4** (tokens defined via `@theme` in `src/styles/globals.css`, plus `@tailwindcss/typography`)
- **motion** (Framer Motion) for animation (the established library, used site-wide)
- **GSAP** + **@gsap/react** (`useGSAP`) for scroll/timeline experiments, currently sandboxed to `/lab`
- **react-router-dom** for routing (`src/router.tsx`)
- **MDX** (`@mdx-js/react`) for case study + blog content
- **react-helmet-async** for SEO (`src/components/SEO.tsx`)
- **Netlify Forms** for the contact form
- Font: **Poppins**

### Commands
- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — `vite-react-ssg build` (static prerender)
- `npm run preview` — preview production build
- `npm run test` / `npm run test:run` — Vitest
- `npm run typecheck` — `tsc --noEmit`

## Brand tokens (from `src/styles/globals.css` `@theme`)

| Token | Value | Use |
|-------|-------|-----|
| `directors-black` | `#090909` | page background |
| `secondary-dark` | `#0e0e0e` | panels / cards |
| `vermilion` | `#f86343` | accent |
| `vermilion-hover` | `#f9764a` | accent hover |
| `cream` | `#f5f0e8` | primary text |
| `muted-prose` | `#7a7060` | secondary text |
| `border-line` | `#1c1c1c` | borders / dividers |

Design language: big bold display type (clamp sizing, tight tracking), uppercase tracked "eyebrow" labels, vermilion numbered sections (`01`, `02`…), generous spacing, alternating left/centered section alignment.

## Architecture / key files

- `src/router.tsx` — routes (Home, About, Services, Work, Work detail, Blog, Blog pillar, Blog article, Contact, 404)
- `src/layouts/DefaultLayout.tsx` — Navbar + `<PageCurtain>` (renders the routed page + the global page transition) + Footer.
- `src/lib/content.ts` — content pipeline via `import.meta.glob` over `src/content/**`. **Case studies are sorted by `date` descending.** Helpers: `getCaseStudies`, `getCaseStudyBySlug`, `getNextCaseStudy`, `getBlogPillars`, `getBlogArticles`, etc.
- `src/types/content.ts` — frontmatter interfaces (`CaseStudyFrontmatter`, `BlogPillarFrontmatter`, `BlogArticleFrontmatter`)
- `src/content/case-studies/*.mdx` — case studies
- `src/content/blog/<pillar>/index.mdx` — blog pillar landing pages; articles are `src/content/blog/<pillar>/<article>.mdx`
- `src/components/animations/` — `FadeIn`, `StaggerList`/`StaggerItem`. `PageTransition` is now a **pass-through** (no-op wrapper kept so pages don't need edits); the global transition + scroll reset live in `PageCurtain`.
- `src/components/PageCurtain.tsx` — **global page transition** (the "curtain"). Renders the routed page via `useOutlet` (frozen during cover so the content swap is hidden) plus two GSAP panels (vermilion diagonal + directors-black) that slide down to cover, swap content + reset scroll at full cover, then lift to reveal. Replaced the Framer fade + `AnimatePresence`. Panels are `h-[130vh]` (taller than viewport so the diagonal sweeps but the bottom stays covered), ~2s, `power2.inOut`, reduced-motion = instant swap. Exposes `useEntranceDelay()` and owns scroll reset.
- `src/lib/gsap.ts` — **single, browser-guarded** GSAP plugin-registration point (`typeof window` guard for SSR); re-exports `gsap`, `ScrollTrigger`, `useGSAP`. Import GSAP through this, not directly.
- `src/components/work/` — project listing components. `ProjectShowcase`/`ProjectPanel` (`/work`: CSS sticky stacking with a GSAP-scrubbed overlay opacity; cards fallback on mobile, reduced motion and prerender). `ProjectIndex`/`ProjectIndexRow`/`HoverPreview` (Home selected work: editorial rows, pointer-following preview built from static covers, `previewPosition` edge flip, `SPRING.preview`; inline thumbnails on touch and reduced motion). Shared `ProjectMeta`, `ProjectCover`, `ProjectCta`; `projectListing.ts` holds numbering (`projectNumber`), `showcaseMode`, `STACK_QUERY`, `previewPosition` (flips at the right AND bottom edges), the id helpers and `caseStudyCountLabel`. Test fixture: `src/test/caseStudyFixture.ts`.
- `src/components/work/covers/` — animated inline-SVG case-study covers: one component per project (`VampNetworkCover`, `TheBookingFlowCover`, `AiwiWafflesCover`), a shared `useCoverReveal` hook (scroll-in reveal, reduced-motion gated, SSR-safe), `CoverChip` (centered category pills), and `index.ts` (slug→component map; falls back to the static `<img>` cover). Used on the `/work` cards and the case-study hero (`WorkDetail`).
- `src/pages/Lab.tsx` + `/lab` route — GSAP sandbox (noindex, not linked in nav). Holds a hero-load-animation prototype (image grows+fades, then circle), a scroll-scrub progress bar, and a character-reveal scroll demo. `gsap.matchMedia()` reduced-motion gating; progress bar `z-[70]` above the `z-[60]` navbar.
- `src/components/mdx/` — MDX components: `ImageCarousel`, `BeforeAfterSlider`, `AnnotatedImage`, `VideoPlayer`, `Metrics`, plus `caseStudyMdx.tsx` (scroll-animated h2/h3/p/ul/ol/blockquote, case-study only)
- `src/components/ui/` — `Button`, `Card`, `Tag`
- `public/images/` — hand-built SVG cover art + placeholder mockups

## Content

### Case studies (`src/content/case-studies/`)
1. **Vamp Network** — Creative Director; creator-management platform; React/Vite/Supabase/APIs; custom dashboard + internal AI flows. Live: vampnetwork.com
2. **The Booking Flow** — Founder & Lead Developer; lead-capture SaaS for trades; React/Vite/Supabase/n8n/Google OAuth. Live: thebookingflow.com
3. **'Aiwi Waffles** — Lead Designer & Developer; brand identity + Shopify storefront; **Google Business Profile / local SEO got the storefront ranking #1 for multiple keywords, driving tourist foot traffic.** Live: aiwiwaffles.com

Each case study has: cover image, SEO `headline`, project-meta grid (`role`/`services`/`stack` frontmatter), `liveUrl`, numbered animated sections, a pull quote, an `<ImageCarousel>` (placeholder screens), and a `<Metrics>` block.

### Blog pillars (9 total, card layout with cover images)
- **UX/UI:** UX/UI Design, Design Systems
- **SEO/AEO:** Technical SEO, Answer Engine Optimization
- **AI Workflows:** Agentic Workflows, AI Automation
- **Brand Development:** Brand Identity, Brand Strategy
- **SaaS Development:** SaaS Development

Pillars render alphabetically by directory name. Only UX/UI Design currently has an article (`button-states-that-convert`).

## Build log (work completed)

- **Mobile menu drawer** — added padding so content isn't flush to edges.
- **Content cleanup** — removed redundant name from hero eyebrow; removed em dashes from all visible copy site-wide.
- **Section scroll animations** — `FadeIn` and per-item `StaggerItem` reveal at ~15% scroll offset; respect reduced motion.
- **Case study pages** — built 3 real case studies; date-sorted; SEO headlines; meta grids; numbered sections (`.case-study-prose` CSS counter); pull quotes; image carousels; metrics blocks; "Next project" link.
- **Cover art** — hand-built on-brand SVGs (1600×900, 16:9) for all case studies and blog pillars; placeholder UI mockups (`placeholder-screen-1/2.svg`) and brand mockups (`placeholder-brand-1/2.svg`).
- **SEO headings** — keyword-led `h1`/`h2` across Home, About, Work, Blog, and case studies.
- **Homepage** — added section `h2`s; centered the Work section; removed the "Ready to start" CTA (footer CTA replaces it); 2-sentence hero body copy.
- **About** — Skills section as cards with vermilion accent; centered heading + columns.
- **Blog** — pillars converted from list to card layout; expanded to 9 pillars.
- **Card hover** — redesigned to a `top`-based lift + vermilion border/glow to avoid a GPU compositing artifact (verified in-browser).
- **Scroll restoration** — now owned by `PageCurtain`: it resets scroll (`window.scrollTo(0,0)` + `ScrollTrigger.clearScrollMemory()`) at the covered content swap, so navigation (including case-study → next-project) lands on the hero. (Superseded the old `PageTransition`-on-mount reset.)
- **Responsive fix** — the case study project-meta grid stacks to one column on mobile and goes 3-across at `sm`+ (`grid-cols-1 sm:grid-cols-3`).
- **Footer** — full redesign: contact CTA band (availability indicator, email, button), link columns (Pages/Writing/Connect with vermilion labels), bottom bar with back-to-top.
- **Contact form** — added Company input + Budget select; everything required except Message; custom select caret with padding; vermilion `*` on required labels. Posts to Netlify.
- **Work/Services polish** — fixed card image cropping on Work; removed trailing bottom border on Services.
- **Config** — disabled the Vercel Claude Code plugin in `~/.claude/settings.json` (takes effect next session).
- **GSAP sandbox** — added `gsap` + `@gsap/react`; SSR-safe registration module (`src/lib/gsap.ts`); `noindex` prop on `SEO`; `/lab` sandbox page + route with a scroll-scrub + pinned-reveal demo (reduced-motion aware). Verified end-to-end in-browser (scrub 0→1, reveals to opacity 1, reduced-motion static, bar above navbar). Spec/plan in `docs/superpowers/`.
- **SSG build fix** — `npm run build` was **already broken before this work** (`react-helmet-async` named-export failure in the Node ESM SSR bundle). Fixed via `ssr.noExternal: ['react-helmet-async', 'gsap', '@gsap/react']` in `vite.config.ts`. GSAP's subpath imports need the same treatment, so this config is required for the build to pass.
- **Hero load animation** — homepage hero image grows + fades in, then the circle blooms behind it (GSAP `useGSAP`, `force3D: false`). Made the hero full-height (`min-h-[calc(100svh-4rem)]`), bottom-anchored the circle + image (fixed a tall-viewport gap), enlarged the image and stacked the CTAs full-width on mobile. Prototyped in `/lab`, then ported to `Home.tsx`; typewriter h1 + Framer text fades kept.
- **Animated work covers** — converted the 3 case-study cover SVGs to inline React components with tailored GSAP reveals (Vamp: chart builds; Booking Flow: pipeline flows; 'Aiwi: waffle mark assembles), playing once on scroll-in (reduced-motion safe) on the `/work` cards and the case-study hero. Centered the category-pill text (`CoverChip`).
- **Page transition (curtain)** — replaced the Framer fade with a GSAP curtain inspired by thebookingflow.com (reverse-engineered from the live DOM; that site is also Vite+React, minified, no source map). Vermilion-diagonal + directors-black panels slide down to cover, swap content while covered, then lift to reveal. ~2s, `power2.inOut`, reduced-motion = instant swap.
- **Hero-after-reveal timing** — pages mount while covered, so entrance animations would play behind the curtain. `PageCurtain` provides an entrance delay via context (`useEntranceDelay()`): 0 on direct load, ~1.2s after a transition. `Home` applies it to the hero GSAP + text fades so the hero plays as the curtain clears.
- **Interaction foundation** — `src/lib/motion.ts` (shared durations, eases, springs for both GSAP and Motion) and `src/components/interaction/`: `Cursor` (contextual pill over `data-cursor` regions: View, Drag, Visit; fine pointers only), `Magnetic`, `RevealText`, `CountUp`, `useScrollReveal`. Ownership rule: **GSAP owns scroll-driven and timeline work** (reveals, ScrollTrigger scrubs, the curtain); **Motion owns pointer-driven work** (drag, springs, cursor, magnetic). `useScrollReveal` is curtain-aware (waits for `useEntranceDelay()`) and reduced-motion gated (final state, no reveal).
- **Case study system** — `CaseStudyHero` (keyword h1, summary, at-a-glance strip: client, role, year, result, then Visit live site, all above the fold at 1440x900), body from `<Chapter>` sections (`src/components/mdx/case-study/`) with `<Walkthrough>` (pinned device frame + scrolling steps at md+, stacked on mobile or reduced motion), `<Gallery>` (drag + arrow keys), `<BeforeAfter>` (keyboard slider), `<Outcome>`, `<PullQuote>`. `ChapterNav` is a sticky rail in the left gutter at 1440px+ (`min-[1440px]`; at 1280-1407 it overlapped wide modules) and a thin fixed progress bar with the chapter name below 1440px. At 390px the hero Visit button sits below the fold on phones (by design). Width system: `.cs-grid` in `globals.css` (`column` / `wide` / `full`); the `.cs-layer` sits above the rail but passes clicks through empty gutters. `NextProject` band at the end (scrubbed clip-path reveal to full bleed, click runs the curtain). Raster 1200x630 OG PNGs per case study in `public/images/case-studies/<slug>/og.png`, wired via `ogImage` frontmatter (rendered from the SVG covers with headless Chrome).
- **Visual verification pass (task 17)** — verified in a real browser at 1440x900, 1600x900, 390x844 and with reduced motion. Fixed two defects: the hero's Visit button sat below the fold on Vamp Network (tightened hero spacing and h1 size), and the Gallery could not be dragged (the track `ul` was as wide as the viewport, so drag constraints had no travel; fixed with `w-max`).
- **Build rulings** — logic modules have distinct basenames from components (e.g. `chapters.ts` next to `Chapter.tsx`, `galleryNav.ts`, `sliderPosition.ts`) because macOS is case-insensitive and same-basename imports collide. `RevealText` and `CountUp` render one copy of their text (no sr-only duplicate) so crawlers and screen readers see it once. Router-dependent tests use `src/test/TestRouter.tsx`. Implementer commits carry the `Co-Authored-By: Claude Opus 5.5` trailer and never `Test-Exempt`.
- **Work index + Home selected work** — `/work` is now a stacked showcase: `ProjectShowcase`/`ProjectPanel` use CSS `position: sticky` for the stacking, a GSAP-scrubbed overlay `opacity` darkens covered panels, and it falls back to plain cards on mobile, under reduced motion and in prerender; `ScrollTrigger.refresh()` runs after the stack mounts. Home selected work is an editorial `ProjectIndex` (`ProjectIndexRow`, `HoverPreview`): the floating preview uses static covers, flips left near the right edge (`previewPosition`), moves with `SPRING.preview`, and is replaced by inline thumbnails on touch and reduced motion. Keyboard focus never summons the preview. Shared `ProjectMeta`/`ProjectCover`/`ProjectCta`; listing links use `aria-labelledby` on title + result ids; `src/test/caseStudyFixture.ts` is the shared test fixture. Stack mode only when `STACK_QUERY` matches (`(min-width: 1024px) and (min-height: 700px)`), so short or narrow windows get cards. In stack mode each panel is preceded by a zero-height non-sticky `[data-panel-anchor]`; the overlay ScrollTriggers use the next anchor as trigger, and focusing a non-last panel scrolls the window to its anchor position minus 64px (a stuck panel is "in view" while covered, so the browser would not scroll it). Verified in a browser at 1440x900, 1280x720, 900x700 (cards), 844x390 (cards), 390x844, resize 390 to 1440 and back, reduced motion, and Shift+Tab through the panels.
- **Site-wide pass (sub-project 4)** — `src/content/disciplines.ts` is the single source for the five disciplines (UX/UI Engineering, SEO/AEO, Agentic Workflows, Brand Development, SaaS Development; Brand/SaaS copy awaits owner review), used by Home "What I do" (five linked cards, 5/3/2/1 columns, each to `/services#<slug>`), Services, About skills and the Contact select. Keyword `h1`s per page (Home "UX/UI Engineer, SEO Specialist & AI Workflow Developer", About, Services, Contact "Hire a UX/UI Engineer & SEO Specialist"). `PortraitMedia` (Home hero + About): GSAP bloom of image then circle (curtain-aware, `force3D: false`) plus Motion pointer parallax on the OUTER circle wrapper only (fine pointer, not reduced motion); Tailwind v4 `translate-*` uses the CSS `translate` property, so it composes with Motion's `transform` and the circle keeps its centering. `DisciplineRotator` (masked slide, aria-hidden with one sr-only sentence, pauses on hidden tab, static under reduced motion) reserves the height of its longest line (invisible sizer in the same grid cell) so a wrapping line never shifts the hero. `DisciplineIndex` + `ProofCard` on Services: one row open at a time, hash deep links (`/services#<slug>`), collapsed panels stay in the DOM but `inert`; the panel has a `-mx-6 px-6` + `pt-4` gutter inside its `overflow-hidden` so the proof card glow/focus ring are not clipped. Contact: inline validation (blur + submit, focuses first invalid field) and `?service=` preselect. `Reveal` (curtain-aware block reveal). Navbar: `layoutId` gliding underline + Contact CTA (filled on `/contact`). Full-screen, keyboard-safe mobile menu (focus trap incl. toggle, Escape returns focus, scroll lock/restore, logo + X stay above the overlay via `relative z-[56]`). Footer on the interaction system (RevealText heading capped at `max-w-[15ch]` for two lines, magnetic CTA, back-to-top honours reduced motion). Skip link + focusable `main` + `scroll-padding-top: 64px`.
- **Site-wide pass browser verification (task 15)** — verified with Playwright at 1440x900, 1024x768, 390x844 (touch context) and reduced motion; built site checked via `vite preview`. Fixed: rotator height shift on wrap; proof card glow/ring clipped by the panel; `/services#<slug>` never scrolled (Motion's keyframe measurement of a `height: auto` panel restores the pre-measure scroll, cancelling a scroll started earlier: the row now scrolls in `onAnimationComplete`); `?service=` preselect lost on the prerendered Contact page (hydration keeps the server's `defaultValue`: now applied in an effect via a ref); footer heading wrapped to three lines at 12ch.

## Known characteristics / gotchas

- **Astro rebuild: load reveals flashed visible before animating.** Elements marked `data-reveal-on="load"` painted at full opacity for a frame or two before GSAP set their start state. Fix, in three parts: CSS `html.js:not(.reveals-ready) [data-reveal]` holds every reveal hidden, scroll reveals included (only when JavaScript has run and motion is allowed); the inline head script in `BaseLayout.astro` adds `js` to `<html>` and adds `reveals-ready` after 3 seconds as a failsafe; and the reveal tweens in `src/lib/reveal.ts` use `lazy: false` so GSAP writes the start state synchronously. A code comment is the only guard for `lazy: false` (jsdom cannot detect it).
- **Astro rebuild: `initReveals` cleanup must revert, not kill.** Killing the tweens leaves elements at their hidden start state. Cleanup reverts them so nothing stays hidden.
- **Astro rebuild: a focused link could be transparent.** A link in view but below the reveal line took focus while its reveal had not fired (the browser does not scroll a partly visible element, so its trigger never ran) and showed no focus ring. Fix: a delegated `focusin` listener in `src/lib/reveal.ts` kills the trigger and completes the reveal of the focused element and every `[data-reveal]` ancestor; cleanup removes it.
- **Astro rebuild: self-hosted fonts are hashed.** Astro emits the font files under `dist/_astro/fonts/` with a hashed family name, so grepping `dist/index.html` for the literal "Anton" fails. Verify by checking that the font files exist in `dist/` and that a `font-family` rule is present.
- **Astro rebuild: `dist/index.html` is one minified line.** `grep -c` counts lines, so it always returns 1. Count matches with `grep -o ... | wc -l`.
- **Astro rebuild: the mobile menu panel needs `overflow-y-auto`.** The body scroll is locked while the menu is open, so on a short viewport the last links and the call to action were unreachable. The panel (`#mobile-menu`) now scrolls on its own.
- **Astro rebuild: logical padding swaps axes under `writing-mode: vertical-rl`.** Tailwind 4's `px` and `py` are logical properties, so on the rotated vertical label they applied to the wrong axis and the label sat hard against the bottom edge. Use physical utilities such as `pt-10` there; after the 180 degree rotation it becomes the visual bottom inset.
- **Astro rebuild: an unquoted YAML frontmatter value containing ` #` is cut off at the `#`.** YAML reads it as a comment, so 'Aiwi Waffles' `summary` lost everything from "#1" onward, including the meta description and the confirmed ranking. Fix: quote any frontmatter string that can contain ` #`.
- **Astro rebuild: Tailwind `lg` is 1024px, so a 1024px viewport gets the `lg:` layout.** The hero, at-a-glance strip, next project and Work rows switch at `lg`, while the chapter six-column layout switches at `xl` (1280px). Keep that split in mind when adding a section next to a chapter, and use `xl:` for anything that must still be stacked at 1024.
- **Astro rebuild: element selectors on MDX prose also hit block components.** `.cs-chapter-body > ul` matched the gallery's `<ul>`. Scope prose rules with `:not(.cs-block)`.
- **Astro rebuild: gallery grids with explicit rows collapse or overflow.** `grid-auto-rows` does nothing once the grid has explicit `grid-rows-*`; an item with `aspect-ratio` does not stretch to its row; and a stretched item with no content height in `1fr` rows collapses to its minimum height. Give the sibling items an aspect ratio so they set the row height.
- **Astro rebuild: a Work row's focus ring is an `::after` border, not an outline.** An inset outline on the link is painted below positioned children, and the media block is `relative`, so the ring showed only over the text half. The ring is an absolutely positioned `::after` with `z-10` and `pointer-events-none`, coloured per row (a `currentColor` ring vanishes where a block matches its text colour), and the native outline is `outline-hidden`.
- **Astro rebuild: when Work rows stack, the media block reads as part of the row above.** Each block is the colour of the previous row's surface, so with media first it blended into that row. The block is inset by the row gutter (`--gutter`) so the row's own surface frames it.
- **Astro rebuild: an outcome chapter that holds a pull quote draws the quote under the split.** On desktop the quote is a full-width band below the split, while in the MDX it sits mid-chapter, so visual and reading order differ. The outcome chapter CSS pairs `grid-row: 1 / span 40` with `grid-row: 42`, which breaks silently past 40 grid items.
- **Astro rebuild: `z.string().url()` is flagged deprecated by `astro check`.** It is a hint, not an error, so `npm run typecheck` reports 0 errors and 1 hint. `z.url()` is the replacement if the owner wants the hint gone.
- **Astro rebuild: Astro's dev server reloads the page on a source edit.** That destroys a Playwright `evaluate` in flight ("Execution context was destroyed"); navigate again after an edit. `astro dev` also detaches, so stop it with `npx astro dev stop` rather than the PID the shell prints.
- **Astro rebuild: Astro can drop the line break between text and an inline element in `.astro` markup.** The About bio rendered "onmy blog" where "tooling on" and `<a>` sat on separate lines. Fix: put `{' '}` before the element, or keep them on one line. Check with `grep -o 'tooling on <a' dist/about.html`. Any sentence that ends a line before a link has the same risk.
- **Astro rebuild: a natively `disabled` button loses keyboard focus in Chrome.** After a failed send the contact form dropped a keyboard user to the top of the page. Fix: the button is `aria-disabled="true"` while sending, and a `sending` flag in `src/lib/contactForm.ts` blocks a double send.
- **Astro rebuild: `astro dev` answers the contact form's POST with 200.** The dev server renders the route for any method, so a local send shows the confirmation and a real failure cannot occur. Simulate success and failure by intercepting the request in a browser script. Only a deployed Netlify build tests the real submission.
- **Astro rebuild: the Playwright MCP server can drop mid-session.** The Playwright library in the npx cache can drive the installed Chrome from a node script (`pw.chromium.launch({ channel: 'chrome' })`) as a full replacement: screenshots, hover, focus, keyboard, form behaviour and network requests. Find the library with `ls -d ~/.npm/_npx/*/node_modules/playwright-core`, `require` it in a `.cjs` script and launch with `pw.chromium.launch({ channel: 'chrome' })`.
- **Astro rebuild: the `ink` Button keeps a permanent 2px border.** Its hover is an ink outline on a transparent fill, so it is the same size in every state. The header's `current` button has its own style (an inset ring) so the header does not shift between pages.
- **Astro rebuild: the site header is `absolute`, not fixed.** It scrolls away, so anchor targets such as the Services sections need no scroll offset.
- **Astro rebuild: a vermilion ground under the absolute header hides the nav's vermilion hover underline.** Keep the header on ivory, as the thanks page does.
- **Astro rebuild: `transition-colors` includes `outline-color`.** A computed outline colour read right after Tab is mid-transition. Wait about 300ms before reading it in a check.
- **Astro rebuild: a Tailwind arbitrary property with a slash is silently not generated.** `after:[content:'↗'/'']` produced no rule and no warning. Use a real `aria-hidden` element instead.
- **Astro rebuild: a script that sets `button.textContent` removes any child glyph.** Keep decoration outside the button, as a sibling in a `group` wrapper.
- **Astro rebuild: a vermilion multiply layer over the page is not brand vermilion.** `#f86343` multiplied onto ivory samples `#ed5d3c`. Use a solid block and put `mix-blend-multiply` on the portrait image. A solid block hides whatever used to show through the layer (the About teaser's vertical "Mathew"), so give the block `-z-10` inside the section's `isolate`. A rise on the blended image itself (opacity and transform) does not cancel the blend.
- **Astro rebuild: full-page screenshots miss `loading="lazy"` images below the fold.** Set the images to eager and await `decode()` before capturing.
- **GSAP `force3D: false` when animating dark elements.** GSAP's default (`force3D: "auto"`) promotes the element to a 3D GPU layer during a transform tween, which on some Chrome/GPU combos paints a dark element on a dark background as a solid black rectangle until the tween ends and the layer is dropped. Set `force3D: false` on tweens that move/scale dark surfaces (hero circle, curtain panels). Same root cause as the dark-`Card` hover-lift artifact noted in CLAUDE.md.
- **GSAP ScrollTrigger restores scroll on route change.** It remembers the window scroll position and restores it on its post-navigation refresh, landing SPA navigation at the previous scroll (e.g. case-study → next-project at the bottom). Fix: call `ScrollTrigger.clearScrollMemory()` before `scrollTo(0,0)` (done in `PageCurtain`).
- **Entrance animations + the curtain.** Because the curtain swaps content while covered, a new page's mount-time entrance animations would play hidden behind it. Solved for everything built on `useScrollReveal` (covers, `RevealText`, `CountUp`, case study modules): it reads `useEntranceDelay()` and holds its animation until the curtain has lifted (verified: after a click from a case study to the next, the h1 words stay masked until about 1.2s after the swap, then reveal). Any new above-the-fold mount animation should go through `useScrollReveal` or consume `useEntranceDelay()` itself.
- **`react-helmet-async` SEO meta is client-side only.** It is NOT collected into the prerendered HTML for ANY page (titles, descriptions, og tags, and the new `/lab` `noindex` all inject on mount in the browser, not at build). vite-react-ssg is not wired to extract Helmet output during prerender. Prerendered `<title>` is just the static `Mathew Brown` from `index.html`. This is a meaningful SEO/AEO gap for a prerender-focused site and is worth addressing separately (e.g. wire Helmet into the SSG head, or move to vite-react-ssg's `Head`/route `entry` metadata). Not GSAP-related.
- **`useGSAP` with `dependencies` only reverts its context on unmount unless `revertOnUpdate: true`** — without it, ScrollTriggers accumulate on dependency change.
- **Motion `height: 'auto'` animations reset scroll while measuring.** Motion's keyframe resolver records `scrollY`, measures, then `window.scrollTo(0, recorded)`, which cancels any smooth scroll started just before. Scroll to a disclosure after it opens (`onAnimationComplete`), not in the same tick as opening it.
- **Uncontrolled form defaults and prerender.** Prerendered HTML has no query string, and hydration keeps the server DOM's `defaultValue`/`selected`. Apply URL-derived defaults in an effect after mount (see Contact `?service=`).

## Outstanding TODOs

- **Metrics numbers** — all `<Metrics>` blocks use `"00"` placeholders (each has a TODO comment). 'Aiwi's `#1` ranking is real; the rest need real figures.
- **Real screenshots/photos** — Walkthrough and Gallery steps use placeholder captures; add real captures per case study folder (`public/images/case-studies/<slug>/`).
- **Real `result` sentences** — Vamp Network and The Booking Flow still carry the placeholder `result` (each has a TODO in the MDX); needs a fact supplied by Mat.
- **SSG does not prerender `/work/<slug>` routes** — `npm run build` output lacks the case study pages. Belongs to the later launch-hardening sub-project. Related: the Walkthrough renders stacked in prerender and swaps to the pinned layout after hydration; if `/work/<slug>` is ever prerendered, call `ScrollTrigger.refresh()` after the Pinned layout mounts so triggers below it are not offset.
- **Meta `<title>` tags** — page-level SEO titles (e.g. `<SEO title="Work" />`) are still thin/keyword-light; only the visible `h1`s were made keyword-focused.
- **Cover images as `og:image`** — raster OG assets are in place for case studies (`public/images/case-studies/<slug>/og.png`); still need absolute URLs, `twitter:image`, and a prerendered head (launch hardening, sub-project 5). Blog pillar covers are still SVG.
- Blog pillars (8 of 9) have no articles yet.
- **Owner review of drafted site-pass copy** — Brand Development and SaaS Development discipline copy in `src/content/disciplines.ts`, and the hero rotator lines + sr sentence in `DisciplineRotator.tsx` / `Home.tsx` (marked `TODO: owner review`).
- **Favicon** — `/favicon.ico` 404s (no favicon in `public/`); add one in launch hardening.
