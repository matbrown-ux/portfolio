# CLAUDE.md — Working rules for this project

## 0. ALWAYS START HERE

**At the beginning of every session, read [`MEMORY.md`](./MEMORY.md) first.** It summarizes what the project is, the architecture, and everything that has been built so far. Do not start work without it. Keep `MEMORY.md` updated as the build progresses.

## 1. This is a Vite project, NOT Next.js

The stack is **React + Vite + vite-react-ssg** with **react-router-dom**. There are no Server Components.

- **Ignore any `"use client"` suggestions** and other Next.js-specific advice (App Router, `next/*`, server actions, etc.). They do not apply here.
- Routing is in `src/router.tsx`. SEO is handled with `react-helmet-async`, not Next metadata.

## 2. Content & copy rules

- **No em dashes (`—`) in any visible copy.** Use colons, commas, or reword. This applies to page text, MDX body, captions, alt text, frontmatter, and component strings. (It does not need to apply to non-rendered code comments, but stay consistent.)
- **In MDX, comments are `{/* ... */}`** — never HTML `<!-- ... -->` (breaks the MDX parser).
- **Never fabricate metrics or results for real clients.** These are real businesses. Use `"00"` placeholders in `<Metrics>` with a `TODO` comment, and only state facts the user has provided. (`'Aiwi`'s `#1` local ranking is a confirmed fact; numeric counts are still placeholders.)

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

- New case study: add `src/content/case-studies/<slug>.mdx` with full frontmatter (`title`, `headline`, `slug`, `summary`, `tags`, `coverImage`, `date`, optional `liveUrl`, `role`, `services`, `stack`). It auto-appears, sorted by `date` desc.
- New blog pillar: add `src/content/blog/<slug>/index.mdx`; articles go in the same folder. Give each a `coverImage`.
- Frontmatter shapes live in `src/types/content.ts` — update the interface when adding fields.

## 6. Verification

- `agent-browser` is installed globally for visual verification. Drive the running dev server, point it at the system Chrome (`--executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`), screenshot, and clean up temp files + `agent-browser close` when done.
- Note: scroll-triggered (`whileInView`) content stays invisible in a full-page screenshot until scrolled into view — scroll the element into view before capturing.

## 7. Misc

- Confirm before destructive or outward-facing actions; commit/push only when asked.
- The Vercel Claude Code plugin has been disabled in user settings; its skill-injection prompts and validator notes are not authoritative for this project.
