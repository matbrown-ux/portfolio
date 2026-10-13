# CLAUDE.md — Working rules for this project

## 0. ALWAYS START HERE

**At the beginning of every session, read [`MEMORY.md`](./MEMORY.md) first.** It summarizes what the project is, the architecture, and everything that has been built so far. Do not start work without it. Keep `MEMORY.md` updated as the build progresses.

## 1. This is an Astro project, NOT Next.js

The stack is **Astro (static output) + React islands + Tailwind CSS v4 + GSAP**, with MDX for content. The site is being rebuilt from scratch on `feat/astro-rebuild`; the previous React + Vite + vite-react-ssg app lives on `feat/site-pass` and is the reference to port from (`git show feat/site-pass:<path>`).

- **Ignore any `"use client"` suggestions** and other Next.js-specific advice (App Router, `next/*`, server actions, etc.). They do not apply here.
- Routing is file-based in `src/pages/`. Head and SEO tags live in `src/layouts/BaseLayout.astro`, so they are in the prerendered HTML.
- Default to static `.astro` markup. Use a React island (`client:*`) only where there is real interaction, and keep its logic in `.ts`/`.tsx` so it is testable.
- Animation is **GSAP only**. Do not add `motion` / Framer Motion.
- Sections 4 and 5 below describe the pre-rebuild site (tokens, components, content pipeline). Treat them as history until they are rewritten for the new design.

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

- Use the brand tokens from `src/styles/globals.css` `@theme` (`directors-black`, `secondary-dark`, `vermilion`, `cream`, `muted-prose`, `border-line`). Don't hardcode off-palette colors.
- Aesthetic: dark, editorial, big display type (clamp sizing, tight tracking), vermilion accents, numbered sections, generous spacing, alternating left/centered section alignment.
- **Vermilion is the single accent** — use it for active states, hover, section numbers, required-field `*`, and small rules.
- **Hover lifts must not use `transform`/GPU promotion on dark cards** — it triggers a compositing black-bar artifact on some hardware. Use a `position: top` lift instead (see `src/components/ui/Card.tsx`). Pair with a vermilion border + glow.
- **All animation must respect `prefers-reduced-motion`** (use the `useReducedMotion` hook, as the animation components do).
- Cover/placeholder images are **hand-built SVGs at 1600×900 (16:9)** matching the existing cover system in `public/images/`.

## 5. Content pipeline

- New case study: add `src/content/case-studies/<slug>.mdx` with full frontmatter (`title`, `headline`, `slug`, `summary`, `tags`, `coverImage`, `date`, `year`, `result`, optional `client`, `ogImage`, `liveUrl`, `role`, `services`, `stack`). It auto-appears, sorted by `date` desc. Case study bodies are built from `<Chapter>` sections with `<Walkthrough>`, `<Gallery>`, `<BeforeAfter>`, `<Outcome>`, and `<PullQuote>` (see `src/components/mdx/case-study/`).
- New blog pillar: add `src/content/blog/<slug>/index.mdx`; articles go in the same folder. Give each a `coverImage`.
- Frontmatter shapes live in `src/types/content.ts` — update the interface when adding fields.

## 6. Verification

- `agent-browser` is installed globally for visual verification. Drive the running dev server, point it at the system Chrome (`--executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`), screenshot, and clean up temp files + `agent-browser close` when done.
- Note: scroll-triggered (`whileInView`) content stays invisible in a full-page screenshot until scrolled into view — scroll the element into view before capturing.

## 7. Misc

- Confirm before destructive or outward-facing actions; commit/push only when asked.
- The Vercel Claude Code plugin has been disabled in user settings; its skill-injection prompts and validator notes are not authoritative for this project.

<!-- tdd-kit:start -->
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
