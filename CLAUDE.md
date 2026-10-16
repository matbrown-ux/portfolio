# CLAUDE.md — Working rules for this project

## 0. ALWAYS START HERE

**At the beginning of every session, read [`MEMORY.md`](./MEMORY.md) first.** It summarizes what the project is, the architecture, and everything that has been built so far. Do not start work without it. Keep `MEMORY.md` updated as the build progresses.

## 1. This is an Astro project, NOT Next.js

The stack is **Astro (static output) + React islands + Tailwind CSS v4 + GSAP**, with MDX for content. The site is being rebuilt from scratch on `feat/astro-rebuild`; the previous React + Vite + vite-react-ssg app is in this branch's history, ending at commit `0bfb10a`, and is the reference to port from (`git show 0bfb10a:<path>`). Its own branches were deleted on 2026-10-12.

- **Ignore any `"use client"` suggestions** and other Next.js-specific advice (App Router, `next/*`, server actions, etc.). They do not apply here.
- Routing is file-based in `src/pages/`. Head and SEO tags live in `src/layouts/BaseLayout.astro`, so they are in the prerendered HTML.
- Default to static `.astro` markup. Use a React island (`client:*`) only where there is real interaction, and keep its logic in `.ts`/`.tsx` so it is testable.
- Animation is **GSAP only**. Do not add `motion` / Framer Motion.

## 2. Content & copy rules

- **No em dashes (`—`) in any visible copy.** Use colons, commas, or reword. This applies to page text, MDX body, captions, alt text, frontmatter, and component strings. (It does not need to apply to non-rendered code comments, but stay consistent.)
- **In MDX, comments are `{/* ... */}`** — never HTML `<!-- ... -->` (breaks the MDX parser).
- **Never fabricate metrics or results for real clients.** These are real businesses. Use `"00"` placeholders in `<Outcome>` with a `TODO` comment, and only state facts the user has provided. (`'Aiwi`'s `#1` local ranking is a confirmed fact; numeric counts are still placeholders.)

### Copy guardrails

- **American English, always.** The owner is an American designer: color, behavior, favorite, center, gray, organize, optimize, analyze, license, catalog, canceled, labeled, judgment. This holds for visible copy and for the docs and comments too, so nothing picks up the British habit. `scripts/check-dist` fails a page that uses a common British spelling.
- **First person, always.** This is a personal portfolio: "I", "my", "me". Never "Mathew Brown is", never "we" or "our". The name still appears in labels, titles, metadata and "I'm Mathew Brown" statements so search and answer engines can tie the site to the person.
- **Talk to the reader as "you".**
- **Run all visible copy through the `humanizer` skill before it ships.**
- **Blog articles are written in the owner's voice,** as `docs/content/brand-voice.md` describes it (from his interview on 2026-10-16): relaxed, funny, plain and never pretentious. Its off-limits list is absolute.
- **Whole sentences in body copy,** each with a subject and a plain verb (is, has, build, fix). One short sentence for emphasis is fine; a run of fragments is not. Labels, buttons and headings are exempt.
- **No "X, not Y" endings** and no "it's not just X, it's Y".
- **No forced groups of three.** List three things only when there are three real things.
- **No sales adjectives or stock AI words:** stunning, seamless, cutting-edge, world-class, elevate, crafted, passionate, robust, leverage, delve, showcase, landscape, journey, and the like. ("Unlock" is the owner's own word: once at most in an article, for something that really opened up; see `docs/content/brand-voice.md`.)
- **Specific over vague.** Name the tool, the client, the deliverable or the result, and only state facts the owner has supplied.
- **Headlines may be loud; body copy is plain.** The brutalist attitude lives in the display type, not in exaggerated claims.
- **Mechanics:** straight quotes, no emojis, sentence case in the markup (display type is uppercased through CSS).
- **No emojis or typed symbol characters, anywhere.** That covers arrows (↗ → ↓ ↑ ↔), checks, stars and the like, in copy, components, MDX and frontmatter. The fonts carry Latin letters only, so a phone draws these from its color emoji font. Draw an arrow with `src/components/ui/Arrow.astro` (paths in `src/lib/arrowIcon.ts`; React uses the same paths). Any other icon is an inline SVG in the brand style (ink or currentColor, square ends, no fills of other colors), used only where it fits the design. `scripts/check-dist` fails the build on an emoji or symbol character in a page's text; the copyright and registered signs are allowed.

## 3. SEO / AEO conventions

- Page `h1`s and section `h2`s should be **keyword-led and descriptive** (e.g. "UX/UI Engineering & SEO Case Studies"), not cute one-word labels. This helps both search ranking and answer-engine extraction.
- Keep the short uppercase "eyebrow" label above headings as a kicker; the heading carries the keywords.
- Core keyword themes: UX/UI engineering, SEO/AEO, agentic workflows / AI automation, brand development, SaaS development.
- **Every page gets its share card from `shareCards` in `src/lib/shareCards.ts`.** A new page, case study, topic or article needs a card entry (or the rule that builds it); a page with none falls back to Home's. Card titles set on at most two lines and never end a line on "&".
- **Structured data states only what the page shows.** `BaseLayout.astro` adds Person and WebSite everywhere; a page adds its own nodes through the `schema` prop, built by a tested function in `src/lib/structuredData.ts`. A case study `result` is a placeholder and never goes in structured data.
- **`npm run build` runs `scripts/check-dist`** after Astro and fails the build, naming the page and the rule, when: `noindex` and the sitemap disagree; an indexable page lacks exactly one `h1`, a title, a description or a canonical equal to its own address; a page lacks a built share image or valid Person and WebSite JSON-LD; text, `alt`, `title`, `content` or `aria-label` has an em or en dash, an emoji or symbol character, or a common British spelling; a page's description opens with its `h1`; a sentence in a paragraph or list item repeats a run of four or more words; a required file (`robots.txt`, `llms.txt`, `rss.xml`, the favicons, the manifest) is missing; or `llms.txt` or `rss.xml` links to a page that was not built. Fix the page, not the rule.
- **No page address ends with a slash** (Home's `/` aside): not internal `href`s, and not the generated ones (canonical, sitemap, structured data, `llms.txt`, RSS). `astro.config.mjs` sets `trailingSlash: 'never'` and `build.format: 'file'`, so each page is built as a file named for its route (`dist/work.html`) and Netlify serves it at `/work` with no redirect. During a build `Astro.url.pathname` ends in `.html`; pass it through `pagePath` (`src/lib/shareCards.ts`) or `pageUrl` (`src/lib/structuredData.ts`) before using it.

## 4. Design & brand conventions

- Tokens live in `src/styles/global.css` `@theme`: `ivory`, `ink`, `vermilion`, `stone`, `line-dark`. Don't hardcode off-palette colors.
- Aesthetic: brutalist on a light ground. Ivory page, ink type, large solid vermilion blocks, black-and-white cut-out portraits, very large Anton display type, square corners. `DESIGN.md` has the full system.
- **Vermilion is the single accent.** Small vermilion text is allowed only on ink; text on a vermilion fill is ink.
- Type utilities: `type-display` (Anton, uppercase) and `type-label` (JetBrains Mono, small, tracked). Body text is Archivo.
- **Gloss And Bloom is decoration only** and ships as generated SVG. The font files live in the git-ignored `.fonts/` folder and must never be committed (the repo is public). To add a phrase or stroke: edit `src/assets/script/phrases.json`, run `npm run script-art`, commit the generated files.
- **Hover effects must not move ink surfaces with `transform`** (GPU compositing artifact on some hardware). Change color, or move a small glyph inside. GSAP tweens on ink surfaces use `force3D: false`.
- **The site loader** (`src/components/brand/SiteLoader.astro`, `src/lib/siteLoader.ts`) covers the page on arrival from outside the site and on reload, never on a move between pages, back and forward, or under reduced motion. The ink pane wipes up from the bottom, the logo fades in, a vermilion ring fills around it, then the logo and ring fade as the pane lifts off the top: about 3.5 seconds (`LOADER_MOTION`). The decision is the inline head script `LOADER_HEAD_SCRIPT`, so it covers the first frame; it removes itself after 8 seconds if the page script never starts. `data-reveal-on="load"` reveals and anything that waits on `whenPageRevealed()` start when the pane is three quarters of the way off the top.
- **Every page has a load entrance on the Home hero's pattern.** Two timing tables in `src/lib/motionTokens.ts`, read as `data-reveal-delay`: `HERO_ENTRANCE` for the pages that open with a block and a portrait or capture (Home, About, each case study) and `PAGE_ENTRANCE` for the pages that open on type (Work, Services, Blog, topics, articles, Contact, the thank-you page, 404). The site header fades in on every page once its sequence is nearly done (`headerReveal` picks the delay), and an ink strip under a header ("What I do", the Services jump links, At a glance, an article's details) slides in cell by cell (`stripReveal`). A new page header gets the same treatment: display type first, copy left to right, vertical label last; an ink surface fades rather than moves. Order: block and portrait, 001 and the typed word, the copy left to right ending on the vertical label, then the header fades in as the boxes slide in one by one from the left. Reveal kinds are `rise`, `wipe`, `fade`, `slide` (from the left) and `slide-right`; `data-reveal-follow="<id>"` fires a reveal on another element's scroll trigger (a Work row's image slides in from its own side of the page as the row's title rises); `data-reveal-step` sets the seconds between indexes; `data-reveal-on="first-screen"` plays with the load sequence when the element is on screen at the start, and on scroll (stagger only) when it is not.
- **All animation respects `prefers-reduced-motion`,** and nothing is hidden unless JavaScript has run. Declare reveals with `data-reveal` (see `src/lib/reveal.ts`); take durations and eases from `src/lib/motionTokens.ts`.

## 5. Content pipeline

- Collections are defined in `src/content.config.ts`. Case studies are `src/content/case-studies/<slug>.mdx`; the entry `id` is the slug. Frontmatter: `title`, `headline` (the page `h1`), `summary`, `date`, `year`, `tags`, `services`, `stack`, `role`, `result`, and optional `order` (the owner's order: the Work page, Home's Featured work, each hero's number and the next-project link follow it, lowest first; case studies without one come after, newest first; set 2026-10-13 to 'Aiwi Waffles 1, Vamp Network 2, Portfolio Optimization 3), `client`, `liveUrl`, `heroNote`, `media.hero`, `media.tile`.
- Case study bodies are `<Chapter title>` sections containing prose and the blocks `<PullQuote text>`, `<Walkthrough steps>`, `<Gallery images>`, `<Outcome metrics>` and `<BeforeAfter people>` (`src/components/case-study/`). Chapters number themselves. The first metric in `<Outcome>` is the headline one, and a figure longer than two characters is set smaller at desktop (`src/lib/outcomeFit.ts`). `<PullQuote>` takes an optional `cite` for a quote from a real person. **A walkthrough step can show an animated illustration in place of a capture:** give the step `art: "<name>"`, where the name is a key of `ART` in `Walkthrough.astro` and the drawing is an inline SVG in `src/components/case-study/art/`. The style mixes wireframe (outlined boxes, placeholder lines) and comic book (thick ink outlines, offset ink shadows, starbursts, speed lines, halftone dots, Anton lettering), in ivory, ink and vermilion only. The markup is the finished drawing; parts marked `data-art="draw|pop|fade|slide"` with `data-art-at="<seconds>"` are animated in a loop by `src/lib/stepArt.ts` while the drawing is on screen, and the still shows under reduced motion or with no script. A drawn line needs `pathLength="1"` and `stroke-dasharray="1"`. Keep the bottom corner under the step label clear. `<BeforeAfter>` is a tabbed block, one tab per person, with a draggable line splitting two full-page screenshots and that person's quote and live link beside it (`src/lib/beforeAfter.ts`); the owner asked for it on 2026-10-13 for Portfolio Optimization, which reverses the earlier decision to have no slider.
- **A Work index row's image is always 16:10** (`WorkRow.astro`), the same size in every row whatever the length of its text; each row shows `media.work` (the owner's own 2000 x 1250 image, added 2026-10-13), else `media.hero`. `media.tile` is still unused, so Home's tiles stay color blocks. Check a supplied PNG for transparency before adding it: one arrived at about 20% opacity, which let the row color show through. **Every row's title is the same size:** the display size, or smaller when the longest word on the page would not fit the text column (`sharedTitleEm` in `src/lib/titleFit.ts`, from measured Anton widths; the column is a CSS container). Keep the two row placements' text columns the same width, or the titles differ again.
- **Every image on a case study page wears the browser frame** (the ink outline with the three squares): the hero, walkthrough steps, gallery images and the before and after frames. It is `frame="browser"` on `MediaSlot`; a walkthrough frame's image area is 16:9.4, so crop a taller capture from the top before adding it. **Links to an outside website open in a new tab** (`target="_blank"`, `rel="noopener"`) and say so in their `aria-label`.
- **Media** lives in `src/assets/case-studies/<slug>/` and is referenced by its path inside that folder (see the README there). Every media slot takes `{ src, alt, poster }`: no `src` shows a labelled placeholder, a video needs a `poster`, and a `src` that matches no file stops the build. `alt` doubles as the placeholder's label, so write it to say what belongs there.
- **Never fabricate metrics or results.** Placeholder values (`"00"`, "Result pending...") are shown as written until the owner supplies real ones.
- `src/content/disciplines.ts` is the single source for the five disciplines: Home's strip, the Services sections (through `src/lib/serviceSections.ts`), About's skills and the Contact project-type select all read it. `src/content/navigation.ts` is the single source for nav links.
- `src/content/about.ts` holds the facts in About's "By the numbers" strip. They are the owner's own statements; change a number only when the owner gives a new one.
- `src/content/contactOptions.ts` holds the contact form's budget ranges.
- **The contact form** (`src/components/contact/ContactForm.astro`) is plain HTML posted to Netlify Forms, and must keep working without JavaScript: keep `name="contact"`, `data-netlify`, the hidden `form-name` input, the hidden `subject` input (the notification email's subject; `src/lib/contactSubject.ts` builds the one that names the sender), the honeypot and `action="/contact/thanks"`. `src/lib/contactForm.ts` adds inline validation, the `?service=<slug>` preselect and the in-place send; it finds things by the `data-` attributes in the form, so keep those when restyling. A real submission can only be tested on a deployed Netlify build.
- **Blog.** A topic is a folder `src/content/blog/<topic>/` with an `index.mdx` (frontmatter: `title`, `headline`, `description`, `discipline` (a slug from `disciplines.ts`), `order`; the body is the one-paragraph introduction). An article is any other `.mdx` file in that folder (frontmatter: `title`, `description`, `date`, optional `updated`); it belongs to the folder it sits in and its URL is `/blog/<topic>/<file name>`. Both schemas are strict. To publish, add the file: counts, the index, the topic page, `noindex` and the sitemap follow. Any `.mdx` file in a topic folder is published as soon as it is there. There is no draft state, so keep unfinished articles out of the folder. File names are lower-case words joined by hyphens, because the file name is the URL. A topic with no article is `noindex` and left out of the sitemap. Article bodies use `h2` and `h3` (and `h4` for a small label heading), nested lists and tables. An article heading must not be titled just "Main" or "Top", because its id would collide with the page's own. Article bodies can use `<Terms>` with `<Term name>` for a list of named items (leave blank lines inside each `<Term>`), and fenced code blocks, which are colored from the palette in `global.css`. Visitors see the word "topic", never "pillar". A topic's `discipline` is a blog section: one of the five disciplines, or a section in `src/content/blogSections.ts` that is not a service ("My story", added 2026-10-16 for the Working for yourself topic), which links to `/about` instead of a service and never appears on Services, Home, About, Contact or `llms.txt`.
- **Blog plan and scheduled articles.** `docs/content/topical-map.json` is the topical authority map (set 2026-10-14): every planned article in publishing order, with its keyword, relevancy and difficulty scores, questions, angle and `status` (`planned`, `needs-input`, `in-review`, `published`). A scheduled job on the owner's Mac runs Monday, Wednesday and Friday at 6am: `scripts/article-run.sh`, started by `~/Library/LaunchAgents/io.matbrown.article.plist`. A run missed while the Mac sleeps happens on wake, at most one article a day; logs are in `~/Library/Logs/matbrown-article/`. It works in a fresh worktree of `origin/main` in three stages (`docs/content/article-routine.md`): a Claude Code session (Sonnet, on the owner's Claude subscription) writes the next `planned` article and its image brief at `docs/content/image-briefs/<slug>.md`; the script runs the Codex CLI (the owner's ChatGPT login) to make two or three images in `src/content/blog/<topic>/images/<slug>-<n>.png` (Astro converts them to WebP); a fresh Claude session edits the article into the owner's voice (`docs/content/brand-voice.md`, then the `copywriting` and `humanizer` skills) and places the images. The script then pushes and opens a pull request with `gh`, and only if the editor changed the article; it never merges. Codex never runs inside a Claude session: it hung there on 2026-10-16. The owner reviews and merges each one. The cloud routine that did this first (trig_01WBqds5VBc1Qy2mCEoSGXZW) is switched off, because the cloud has no Codex and no working `gh`. A `needs-input` row waits on a fact only the owner can give (`owner_input`); once he gives it, record it in `docs/content/owner-facts.md` (dated, in his words), set the row to `planned`, and give it a place in the order.
- `src/content/person.ts` holds the owner's facts (name, job title, location, email, public profiles). Structured data, `llms.txt` and the profile icons in the header, mobile menu and footer read it. Each icon opens in a new tab. Change a value only when the owner gives a new one.
- `src/content/analytics.ts` holds the Cloudflare Web Analytics token (set 2026-10-13, for the site registered in Cloudflare as `matbrown.io`). The beacon loads only on Netlify's production deploy. Empty the token to switch analytics off.

## 6. Verification

- Use the Playwright MCP tools for browser checks against your own dev server (`npx astro dev --port 4321`). Screenshots go in `.playwright-mcp/`, which is git-ignored. Don't kill dev servers by process name.
- Scroll-triggered reveals stay at their start state in a full-page screenshot until scrolled into view. Scroll the element into view, or emulate reduced motion, before capturing.

## 7. Misc

- Confirm before destructive or outward-facing actions; commit/push only when asked.
- The Vercel Claude Code plugin has been disabled in user settings; its skill-injection prompts and validator notes are not authoritative for this project.

## 8. Design and motion skills

Use these skills for UI work on the rebuild. Load the relevant ones before designing or building a page, section or component.

- **`industrial-brutalist-ui` leads the aesthetic.** The site is brutalist; this skill sets the visual attitude.
- **`high-end-visual-design`** supplies the premium principles (spacing, detail, finish) so brutalist does not read as cheap.
- **`frontend-design` + `design-taste-frontend`, used together,** drive the architecture of pages: section structure, layout and composition.
- **`impeccable`** decides all motion easing and timing so animation stays smooth and consistent.

How they fit together:

- **Decisions the owner has locked win over any skill default.** Palette (ivory, ink, vermilion), typefaces (Anton, Archivo, JetBrains Mono, Gloss And Bloom) and the approved section designs are recorded in the specs under `docs/superpowers/specs/`. A skill never overrides them.
- **When skills disagree,** follow this order: `industrial-brutalist-ui`, then `high-end-visual-design`, then `frontend-design` + `design-taste-frontend`.
- **Animation is implemented in GSAP only.** Easing and duration values chosen with `impeccable` live in one shared motion tokens module and are imported everywhere; do not hardcode them per component.
- **Do not use the `motion` skill to write animation code.** It targets the Motion library, which this project has dropped. Its performance audit may be used at launch hardening.
- Do not bring in other design skills (`gpt-taste`, `minimalist-ui`, `stitch-design-taste`, `design-taste-frontend-v1`) unless the owner asks.

<!-- tdd-kit:start -->
## Testing contract (tdd-kit)

This repo is gated by the TDD kit. The rules below are enforced by git hooks in `.githooks/`, by a Claude Code hook, and by CI. Do not edit this block by hand; re-run `node ~/dotfiles/tdd-kit/install.mjs .` to refresh it.

**Iron law:** no source change without a failing test first. Write the test, run it, watch it fail for the right reason, write the least code to pass, run it again, then refactor. Use the superpowers test-driven-development skill for every source change.

**Run tests:** `npm test` (unit, also runs in the pre-commit hook), `npm run test:watch` while developing.

**Where tests live:** co-located `*.test.ts` / `*.test.tsx` / `*.test.js` next to the code, or under `tests/`. Test setup and fakes live under `src/test/` or `tests/`, never inside production modules.

**What needs a test (source):** `.ts .tsx .js .jsx .mjs .cjs` under `src/ scripts/ api/ netlify/ supabase/functions/ packages/ apps/ build/`, and `supabase/migrations/*.sql`.

**What does not (content):** `.astro` files, `.md .mdx .css`, images, video, fonts, `public/`, `.json` under `src/content/` or `content/` (a `.ts` or `.js` file there is source), `*.config.*` and `tsconfig*.json` at any depth, lockfiles, docs, this file. Content-only commits skip the test run entirely.

**Escape hatch:** a commit that changes source without a test is refused unless the message carries a `Test-Exempt: <reason>` trailer (reason of 10+ characters). Claude may add this trailer only when the user has explicitly approved it in the current session, and never for logic changes. Audit with `git log --grep='^Test-Exempt:'`.

**Never** use `git commit --no-verify` (or any abbreviation of it), `git commit -n` (alone or inside a combined flag group), `HUSKY=0`, or change `core.hooksPath`. The Claude Code hook blocks these commands.

**Keep logic out of `.astro` frontmatter and data-only modules:** anything with a branch or a calculation belongs in a `.ts` file, where it is source and testable.
<!-- tdd-kit:end -->
