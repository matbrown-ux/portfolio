# CLAUDE.md — Working rules for this project

## 0. ALWAYS START HERE

**At the beginning of every session, read [`MEMORY.md`](./MEMORY.md) first.** It summarizes what the project is, the architecture, and everything that has been built so far. Do not start work without it. Keep `MEMORY.md` updated as the build progresses.

## 1. This is an Astro project, NOT Next.js

The stack is **Astro (static output) + React islands + Tailwind CSS v4 + GSAP**, with MDX for content. The site is being rebuilt from scratch on `feat/astro-rebuild`; the previous React + Vite + vite-react-ssg app lives on `feat/site-pass` and is the reference to port from (`git show feat/site-pass:<path>`).

- **Ignore any `"use client"` suggestions** and other Next.js-specific advice (App Router, `next/*`, server actions, etc.). They do not apply here.
- Routing is file-based in `src/pages/`. Head and SEO tags live in `src/layouts/BaseLayout.astro`, so they are in the prerendered HTML.
- Default to static `.astro` markup. Use a React island (`client:*`) only where there is real interaction, and keep its logic in `.ts`/`.tsx` so it is testable.
- Animation is **GSAP only**. Do not add `motion` / Framer Motion.

## 2. Content & copy rules

- **No em dashes (`—`) in any visible copy.** Use colons, commas, or reword. This applies to page text, MDX body, captions, alt text, frontmatter, and component strings. (It does not need to apply to non-rendered code comments, but stay consistent.)
- **In MDX, comments are `{/* ... */}`** — never HTML `<!-- ... -->` (breaks the MDX parser).
- **Never fabricate metrics or results for real clients.** These are real businesses. Use `"00"` placeholders in `<Metrics>` with a `TODO` comment, and only state facts the user has provided. (`'Aiwi`'s `#1` local ranking is a confirmed fact; numeric counts are still placeholders.)

### Copy guardrails

- **First person, always.** This is a personal portfolio: "I", "my", "me". Never "Mathew Brown is", never "we" or "our". The name still appears in labels, titles, metadata and "I'm Mathew Brown" statements so search and answer engines can tie the site to the person.
- **Talk to the reader as "you".**
- **Run all visible copy through the `humanizer` skill before it ships.**
- **Whole sentences in body copy,** each with a subject and a plain verb (is, has, build, fix). One short sentence for emphasis is fine; a run of fragments is not. Labels, buttons and headings are exempt.
- **No "X, not Y" endings** and no "it's not just X, it's Y".
- **No forced groups of three.** List three things only when there are three real things.
- **No sales adjectives or stock AI words:** stunning, seamless, cutting-edge, world-class, elevate, unlock, crafted, passionate, robust, leverage, delve, showcase, landscape, journey, and the like.
- **Specific over vague.** Name the tool, the client, the deliverable or the result, and only state facts the owner has supplied.
- **Headlines may be loud; body copy is plain.** The brutalist attitude lives in the display type, not in exaggerated claims.
- **Mechanics:** straight quotes, no emojis, sentence case in the markup (display type is uppercased through CSS).

## 3. SEO / AEO conventions

- Page `h1`s and section `h2`s should be **keyword-led and descriptive** (e.g. "UX/UI Engineering & SEO Case Studies"), not cute one-word labels. This helps both search ranking and answer-engine extraction.
- Keep the short uppercase "eyebrow" label above headings as a kicker; the heading carries the keywords.
- Core keyword themes: UX/UI engineering, SEO/AEO, agentic workflows / AI automation, brand development, SaaS development.

## 4. Design & brand conventions

- Tokens live in `src/styles/global.css` `@theme`: `ivory`, `ink`, `vermilion`, `stone`, `line-dark`. Don't hardcode off-palette colours.
- Aesthetic: brutalist on a light ground. Ivory page, ink type, large solid vermilion blocks, black-and-white cut-out portraits, very large Anton display type, square corners. `DESIGN.md` has the full system.
- **Vermilion is the single accent.** Small vermilion text is allowed only on ink; text on a vermilion fill is ink.
- Type utilities: `type-display` (Anton, uppercase) and `type-label` (JetBrains Mono, small, tracked). Body text is Archivo.
- **Gloss And Bloom is decoration only** and ships as generated SVG. The font files live in the git-ignored `.fonts/` folder and must never be committed (the repo is public). To add a phrase or stroke: edit `src/assets/script/phrases.json`, run `npm run script-art`, commit the generated files.
- **Hover effects must not move ink surfaces with `transform`** (GPU compositing artifact on some hardware). Change colour, or move a small glyph inside. GSAP tweens on ink surfaces use `force3D: false`.
- **All animation respects `prefers-reduced-motion`,** and nothing is hidden unless JavaScript has run. Declare reveals with `data-reveal` (see `src/lib/reveal.ts`); take durations and eases from `src/lib/motionTokens.ts`.

## 5. Content pipeline

- Collections are defined in `src/content.config.ts`. Case studies are `src/content/case-studies/<slug>.mdx`; the entry `id` is the slug. The schema currently covers only what Home needs (`title`, `date`, `tags`, optional `client`); the full schema and the case study page components arrive with the Work sub-project.
- `src/content/disciplines.ts` is the single source for the five disciplines. `src/content/navigation.ts` is the single source for nav links.
- Blog pillars are `src/content/blog/<slug>/index.mdx` with articles in the same folder. They are not wired to a collection yet.

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
