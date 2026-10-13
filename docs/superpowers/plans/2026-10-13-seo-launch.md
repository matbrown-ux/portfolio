# SEO/AEO Layer and Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every page a share image, a favicon and structured data; add `robots.txt`, `llms.txt`, RSS, optional Cloudflare Web Analytics and a build check; then put the site live on its Netlify address, audited to a set bar.

**Architecture:** Pure, tested modules in `src/lib` build card text, card SVG, the list of share cards, structured data and `llms.txt`; thin Astro endpoints and two small head components call them. Share cards are SVGs whose text is already outlines (`fontkit`), rasterised with `sharp` at build time. A script over `dist` runs after `astro build` and fails the build on a broken search rule. The launch is a pull request, an audit of its Netlify preview, a merge the owner approves, and checks on the live address.

**Tech Stack:** Astro 7 (static), `fontkit`, `sharp`, `@astrojs/rss`, `@fontsource/anton`, `@fontsource/jetbrains-mono`, Vitest 5, Netlify, the GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-10-13-seo-launch-design.md`. Visual reference: `docs/superpowers/specs/assets/2026-10-13-share-card-favicon-approved.jpeg`. Read both before starting a task.

## Global Constraints

- Branch `feat/astro-rebuild`. Tasks 1 to 11 only commit locally. Do not push, open or close a pull request, merge, or touch Netlify inside a build task. Tasks 12 to 16 are the launch and each outward step needs the owner's go at that step.
- Test-first for every source file (`.ts`, `.mjs` under `src/` or `scripts/`): write the test, watch it fail, then implement. Never use the git skip-verification flag, never add a `Test-Exempt:` trailer. A commit that stages source must also stage a test.
- `.astro`, `.css`, `.json`, `*.config.*`, `netlify.toml` and files in `public/` are content and need no unit test. Nothing with a branch or a calculation may live in `.astro` frontmatter or in an endpoint's body: endpoints only gather collections and call a tested function.
- Structured data, `llms.txt` and card text state only what the site already says. No invented fact, metric, rating, price or claim. Case study `result` values are placeholders and never appear in structured data.
- No em dashes or en dashes in any visible copy, generated file or doc. Straight quotes, no emojis.
- Colours are the palette only: ivory `#f4f0e6`, ink `#0c0c0c`, vermilion `#f86343`. In CSS and Astro use the theme tokens; the hex values may appear only in the card and favicon generators, which run outside CSS.
- Gloss And Bloom is not used in this sub-project. Never commit anything from `.fonts/`. The `@fontsource` packages are open licence and are normal dependencies.
- Page URLs in generated files (canonical, sitemap, structured data, `llms.txt`, RSS) end with a slash, as Astro builds them: `https://matbrown.io/work/vamp-network/`. Internal `href`s stay as they are (no trailing slash) unless Task 13 finds Netlify redirects them.
- Nothing added here may load a font, script or image on a page that does not need it. Analytics renders nothing while its token is empty.
- Commit after each task with this trailer, written in one heredoc with no blank line between the two lines, whatever model writes the commit:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: <the current session URL>
  ```
- Never stage `.codex/`, `AGENTS.md`, `.fonts/`, `.superpowers/` or `.playwright-mcp/`.
- Browser checks run against your own `npx astro dev --port 4321` or a served `dist`; stop a dev server with `npx astro dev stop`. Never kill servers by name. Leave the servers on ports 4330, 4400 and 47823 alone.
- This machine's `grep` does not support `-P`. Use `perl -CSD -ne '...'` for dash checks.

## Review Focus

1. **A title too long for the card** (a 30-letter word, or a long article title). It must shrink and stay clear of the vermilion block, never run under it or off the card. Pinned in Task 2 (`fitTitle`) and looked at in Task 5.
2. **A case study whose hero is a video, or has no media.** The card must use the poster for a video and the plain card for none, and never throw. Pinned in Task 4 (`heroCapture`).
3. **A page that is not in the card list** (the 404, the thanks page, a future page). Its share image must fall back to the Home card, not point at a file that does not exist. Pinned in Task 4 (`cardFor`) and enforced by Task 10's build check.
4. **Text containing `<`, `&` or a quote** in a title, description or summary. Structured data and `llms.txt` must stay valid, and JSON-LD must not be able to close its own script tag. Pinned in Task 7 (`serializeJsonLd`) and Task 8.
5. **An enquiry sent with JavaScript on.** It must be counted, so the address changes to the thanks page after a successful send, and must not change after a failed one. Pinned in Task 9.

## Suggested model per task

Tasks 2, 3, 4, 9 and 10 carry complete code: the cheapest model. Tasks 7, 8 and 11 (complete code plus wiring across many files, or docs and audits): the mid model. Tasks 1, 5, 6 and 13 are judged by eye or need judgment on findings: the strongest model. Every per-task review: the mid model. The final whole-branch review (after Task 11, before the pull request): the strongest model.

## File map

| File | Responsibility |
|---|---|
| `src/content/person.ts` + test | The owner's facts and public profiles, one source for structured data, `llms.txt` and the header's profile icons. |
| `src/assets/icons/`, `src/components/nav/profileIcons.ts` + test | The LinkedIn and GitHub icons and the links that use them. |
| `src/components/nav/SiteHeader.astro`, `MobileMenu.tsx` + test (modify) | The icons left of the "Start a project" button, and in the mobile menu. |
| `src/lib/cardText.ts` + test | Measure, wrap, fit and outline text in a font. |
| `src/lib/cardSvg.ts` + test | Compose the card SVG; read the mark from its SVG file. |
| `src/lib/shareCards.ts` + test | Every page's card text and path; the `og:image` path for a page. |
| `src/lib/cardRender.ts` + test | Open the fonts and the mark, rasterise a card to PNG. |
| `src/types/fontkit.d.ts` | Types for the one `fontkit` call used. |
| `src/pages/og/[...path].png.ts` | The card endpoint. |
| `src/components/seo/ShareMeta.astro` | The `og:image` and `twitter:image` tags for a page. |
| `scripts/favicons/` (`icons.mjs` + test, `generate.mjs`) | Favicon SVG, PNG sizes and the ICO container. |
| `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest` | Generated or static icon files. |
| `src/lib/structuredData.ts` + test | The JSON-LD graph builders. |
| `src/components/seo/JsonLd.astro` | Serialises a graph into the head. |
| `src/lib/llmsTxt.ts` + test | The `llms.txt` text. |
| `src/pages/robots.txt.ts`, `llms.txt.ts`, `rss.xml.ts` | Endpoints. |
| `src/content/analytics.ts`, `src/lib/analytics.ts` + test | The Cloudflare token and the beacon's attributes. |
| `src/lib/contactForm.ts` + test (modify) | The address change after an in-place send. |
| `scripts/check-dist/` (`rules.mjs` + test, `run.mjs`) | The build check. |
| `src/layouts/BaseLayout.astro` (modify) | Icons, share tags, JSON-LD, RSS link, beacon. |
| `netlify.toml` (modify) | The indexing hold header. |
| `docs/superpowers/audits/2026-10-13-launch-audit.md` | Audit results. |
| `MEMORY.md`, `CLAUDE.md`, `DESIGN.md` (modify) | Docs and the domain-day checklist. |

---

### Task 1: Person facts and profile icons in the header

**Files:**
- Create: `src/content/person.ts`, `src/content/person.test.ts`
- Create: `src/assets/icons/linkedin.svg`, `src/assets/icons/github.svg`, `src/assets/icons/README.md`
- Create: `src/components/nav/profileIcons.ts`, `src/components/nav/profileIcons.test.ts`
- Modify: `src/components/nav/SiteHeader.astro`, `src/components/nav/MobileMenu.tsx`, `src/components/nav/MobileMenu.test.tsx`

**Interfaces:**
- Produces: `interface Person { name: string; alternateName: string; jobTitle: string; description: string; location: { locality: string; region: string; country: string }; email: string; profiles: { label: string; href: string }[] }` and `export const person: Person`; `interface ProfileLink { label: string; href: string; icon: string }` and `profileLinks(): ProfileLink[]` (`icon` is SVG markup).

The owner asked for the profile links to be icons in the header, to the left of the "Start a project" button. They are not in the footer. This task is judged in the browser.

- [ ] **Step 1: Write the failing tests**

`src/content/person.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { person } from './person'

describe('person', () => {
  it('names the owner as the site does', () => {
    expect(person.name).toBe('Mathew Brown')
    expect(person.alternateName).toBe('Mat Brown')
    expect(person.email).toBe('mat@matbrown.io')
  })

  it('describes the owner in the first person, with the sentence the About page opens with', () => {
    expect(person.description).toBe("I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer.")
  })

  it("places the owner on O'ahu", () => {
    expect(person.location).toEqual({ locality: "O'ahu", region: "Hawai'i", country: 'United States' })
  })

  it('lists public profiles as secure links with a label each', () => {
    expect(person.profiles).toEqual([
      { label: 'LinkedIn', href: 'https://linkedin.com/in/matbrown' },
      { label: 'GitHub', href: 'https://github.com/matbrown-ux' },
    ])
    for (const profile of person.profiles) expect(profile.href.startsWith('https://')).toBe(true)
  })

  it('has no em or en dash in any string', () => {
    expect(JSON.stringify(person)).not.toMatch(/[\u2013\u2014]/)
  })
})
```

`src/components/nav/profileIcons.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { person } from '../../content/person'
import { profileLinks } from './profileIcons'

describe('profileLinks', () => {
  it('gives every profile its link and an icon', () => {
    const links = profileLinks()
    expect(links.map(({ label, href }) => ({ label, href }))).toEqual(person.profiles)
    for (const link of links) expect(link.icon).toContain('<svg')
  })

  it('draws each icon in the current text colour, so the header can colour it', () => {
    for (const link of profileLinks()) {
      expect(link.icon).toContain('currentColor')
      expect(link.icon).not.toMatch(/fill="#|stroke="#/)
    }
  })

  it('uses a different icon for each profile', () => {
    const icons = profileLinks().map((link) => link.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })
})
```

In `src/components/nav/MobileMenu.test.tsx` add, after the test "opens to show every link and the call to action":

```tsx
  it('shows the profile icons after the call to action, each named for a screen reader', async () => {
    const user = userEvent.setup()
    const profiles = [
      { label: 'LinkedIn', href: 'https://linkedin.com/in/matbrown', icon: '<svg viewBox="0 0 1 1"></svg>' },
      { label: 'GitHub', href: 'https://github.com/matbrown-ux', icon: '<svg viewBox="0 0 2 2"></svg>' },
    ]
    render(<MobileMenu links={links} contact={contact} pathname="/" profiles={profiles} />)
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/work',
      '/about',
      '/contact',
      'https://linkedin.com/in/matbrown',
      'https://github.com/matbrown-ux',
    ])
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('rel', 'me noopener')
    expect(screen.getByRole('link', { name: 'GitHub' }).querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('list', { name: 'Profiles' })).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/content/person.test.ts src/components/nav/profileIcons.test.ts src/components/nav/MobileMenu.test.tsx`
Expected: the first two fail to resolve their modules; the new menu test fails because `profiles` is not rendered.

- [ ] **Step 3: The person facts**

`src/content/person.ts`
```ts
/**
 * The owner's facts: the single source for structured data, llms.txt and the header's profile
 * links. Every value is something the site already states. Change one only when the owner does.
 */
export interface Person {
  name: string
  alternateName: string
  jobTitle: string
  /** The sentence the About page opens with. */
  description: string
  location: { locality: string; region: string; country: string }
  email: string
  /** Public profiles, shown as icons in the header and listed as sameAs. */
  profiles: { label: string; href: string }[]
}

export const person: Person = {
  name: 'Mathew Brown',
  alternateName: 'Mat Brown',
  jobTitle: 'Freelance UX/UI Engineer, SEO/AEO Specialist and Agentic Workflow Developer',
  description: "I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer.",
  location: { locality: "O'ahu", region: "Hawai'i", country: 'United States' },
  email: 'mat@matbrown.io',
  profiles: [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/matbrown' },
    { label: 'GitHub', href: 'https://github.com/matbrown-ux' },
  ],
}
```

- [ ] **Step 4: The icons**

The icons come from Phosphor Icons (MIT licence), copied into the repo so the build has no new dependency. Do not draw icon paths by hand.

Run: `npm install --no-save @phosphor-icons/core && ls node_modules/@phosphor-icons/core/assets/bold/ | grep -E "^(linkedin-logo|github-logo)-bold\.svg$"`
Expected: both file names. Then:

```bash
mkdir -p src/assets/icons
cp node_modules/@phosphor-icons/core/assets/bold/linkedin-logo-bold.svg src/assets/icons/linkedin.svg
cp node_modules/@phosphor-icons/core/assets/bold/github-logo-bold.svg src/assets/icons/github.svg
git status --short package.json package-lock.json
```
Expected: the last command prints nothing (the install changed `node_modules` only). Open both SVGs and confirm each has `fill="currentColor"` and a `viewBox`; if one carries a fixed colour, replace that colour with `currentColor` and say so in the report.

`src/assets/icons/README.md`
```markdown
# Icons

`linkedin.svg` and `github.svg` are the bold-weight `linkedin-logo` and `github-logo` from
[Phosphor Icons](https://phosphoricons.com), MIT licence, copied unchanged. They are drawn in
`currentColor`. Add an icon the same way, and give it a line in
`src/components/nav/profileIcons.ts`.
```

`src/components/nav/profileIcons.ts`
```ts
import github from '../../assets/icons/github.svg?raw'
import linkedin from '../../assets/icons/linkedin.svg?raw'
import { person } from '../../content/person'

/** The icon for each profile in src/content/person.ts, by its label. */
const ICONS: Record<string, string> = { LinkedIn: linkedin, GitHub: github }

export interface ProfileLink {
  label: string
  href: string
  /** SVG markup, drawn in the current text colour. */
  icon: string
}

/** The owner's profiles with their icons. A profile with no icon stops the build, so none is shown blank. */
export function profileLinks(): ProfileLink[] {
  return person.profiles.map((profile) => {
    const icon = ICONS[profile.label]
    if (!icon) throw new Error(`No icon for the profile "${profile.label}" in src/components/nav/profileIcons.ts`)
    return { ...profile, icon }
  })
}
```

- [ ] **Step 5: The header (desktop)**

In `src/components/nav/SiteHeader.astro` add `import { profileLinks } from './profileIcons'` and `const profiles = profileLinks()`, and replace the line `<div class="ml-auto hidden md:block"><Button ... /></div>` with:

```astro
    <div class="ml-auto hidden items-center gap-2 md:flex lg:gap-4">
      <ul role="list" aria-label="Profiles" class="flex">
        {
          profiles.map(({ label, href, icon }) => (
            <li>
              <a
                href={href}
                aria-label={label}
                rel="me noopener"
                class="grid size-11 place-items-center text-ink transition-colors duration-200 hover:bg-ink hover:text-ivory focus-visible:bg-ink focus-visible:text-ivory"
              >
                <span aria-hidden="true" class="block size-5 [&>svg]:block [&>svg]:size-full" set:html={icon} />
              </a>
            </li>
          ))
        }
      </ul>
      <Button href={contactLink.href} current={isCurrent(contactLink.href, pathname)}>{contactLink.label}</Button>
    </div>
```

and pass the profiles to the mobile menu: `<MobileMenu client:media="not all and (min-width: 48rem)" links={primaryNav} contact={contactLink} pathname={pathname} profiles={profiles} />`.

The hover and focus state is a colour change only (an ink square with an ivory icon): nothing moves.

- [ ] **Step 6: The mobile menu**

In `src/components/nav/MobileMenu.tsx` add to `Props`:

```ts
  /** Profile links with their SVG icons, shown beside the call to action. */
  profiles?: { label: string; href: string; icon: string }[]
```

default it to `[]` in the destructuring, and replace the call to action link at the end of the panel with a row that holds it and the icons (the link's own classes lose `mt-auto` and `self-start`, which move to the row):

```tsx
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <a
              href={contact.href}
              aria-current={contactCurrent ? 'page' : undefined}
              className={`type-label inline-flex items-center gap-2 px-5 py-3.5 text-ink focus-visible:outline-ivory ${contactCurrent ? 'bg-ivory' : 'bg-vermilion'}`}
            >
              {contact.label}
              <span aria-hidden="true">↗</span>
            </a>
            {profiles.length > 0 && (
              <ul role="list" aria-label="Profiles" className="flex">
                {profiles.map(({ label, href, icon }) => (
                  <li key={href}>
                    <a
                      href={href}
                      aria-label={label}
                      rel="me noopener"
                      className="grid size-11 place-items-center text-ivory hover:text-vermilion focus-visible:text-vermilion focus-visible:outline-ivory"
                    >
                      {/* The markup is this repo's own SVG file, not content from outside. */}
                      <span aria-hidden="true" className="block size-6 [&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: icon }} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
```

Keep the comment that sits above the call to action link.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run && npm run typecheck`
Expected: PASS, 0 errors. The existing menu tests must pass unchanged (they render no `profiles`).

- [ ] **Step 8: Look at it**

Against a dev server, at 1440x900, 1024x768, 768x1024 and 390x844:
- From 768 up: the two icons sit immediately left of the "Start a project" button, vertically centred with it and with the nav labels; the header is still one line with no overlap at 768 (if it does not fit at 768, tighten the nav's gap at `md` and say so).
- Each icon has a 44px target, a visible focus state, and an accessible name (read `aria-label` from the DOM).
- Hover and keyboard focus turn the icon's square ink with an ivory icon; nothing moves.
- The header's three scroll states still work: scroll down (hidden), scroll up (shown on its ivory bar), top.
- On `/contact` the button is in its current (ink) state and the icons do not read as part of it.
- At 390: the icons are not in the bar; they are in the open menu beside the call to action, reachable by Tab inside the focus trap, and the panel still scrolls on a short viewport (390x500).
- Compare the bold weight with the fill weight (`assets/fill/*-fill.svg`) at header size, and keep whichever sits better with the mono labels; report which and why.

Screenshots to `.playwright-mcp/sp5-t1-header-<width>.png`, `sp5-t1-header-hover.png`, `sp5-t1-header-focus.png` and `sp5-t1-menu-390.png`; look at each.

- [ ] **Step 9: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: PASS. Confirm `git status --short` lists nothing from `node_modules` and no change to `package.json`.

```bash
git add src/content/person.ts src/content/person.test.ts src/assets/icons src/components/nav/profileIcons.ts src/components/nav/profileIcons.test.ts src/components/nav/SiteHeader.astro src/components/nav/MobileMenu.tsx src/components/nav/MobileMenu.test.tsx
git commit -F - <<'EOF'
feat: add the owner's facts as one source and LinkedIn and GitHub icons in the header

<trailer lines>
EOF
```

---

### Task 2: Card text (`src/lib/cardText.ts`)

**Files:**
- Create: `src/lib/cardText.ts`, `src/lib/cardText.test.ts`

**Interfaces:**
- Produces:
  - `interface GlyphPath { scale(x: number, y: number): GlyphPath; translate(x: number, y: number): GlyphPath; toSVG(): string }`
  - `interface CardFont { unitsPerEm: number; layout(text: string): { glyphs: { path: GlyphPath }[]; positions: { xAdvance: number; xOffset: number; yOffset: number }[] } }` (a `fontkit` font satisfies this)
  - `textWidth(font: CardFont, text: string, size: number, tracking?: number): number`
  - `wrapTitle(font: CardFont, text: string, size: number, maxWidth: number): string[]`
  - `interface TitleFit { size: number; lines: string[] }`
  - `fitTitle(font: CardFont, text: string, space: { maxWidth: number; maxLines: number; sizes: readonly number[] }): TitleFit`
  - `textPath(font: CardFont, text: string, size: number, x: number, baseline: number, tracking?: number): string`

- [ ] **Step 1: Write the failing test**

`src/lib/cardText.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { fitTitle, textPath, textWidth, wrapTitle, type CardFont, type GlyphPath } from './cardText'

// A path double that only remembers where its origin ends up.
function point(x: number, y: number): GlyphPath {
  return {
    scale: (sx, sy) => point(x * sx, y * sy),
    translate: (dx, dy) => point(x + dx, y + dy),
    toSVG: () => `M${x},${y}`,
  }
}

// Every character, spaces included, is 500 units wide in a 1000-unit em: 50px at size 100.
const font: CardFont = {
  unitsPerEm: 1000,
  layout: (text) => ({
    glyphs: [...text].map(() => ({ path: point(0, 0) })),
    positions: [...text].map(() => ({ xAdvance: 500, xOffset: 0, yOffset: 0 })),
  }),
}

describe('textWidth', () => {
  it('scales the advances by the size', () => {
    expect(textWidth(font, 'ABCD', 100)).toBe(200)
    expect(textWidth(font, 'ABCD', 50)).toBe(100)
  })

  it('adds tracking after every character, in ems', () => {
    expect(textWidth(font, 'ABCD', 100, 0.1)).toBe(240)
  })

  it('is zero for an empty string', () => {
    expect(textWidth(font, '', 100)).toBe(0)
  })
})

describe('wrapTitle', () => {
  it('breaks between words when the next word would not fit', () => {
    expect(wrapTitle(font, 'AAAA BBBB CCCC', 100, 480)).toEqual(['AAAA BBBB', 'CCCC'])
  })

  it('keeps a word that is wider than the line on a line of its own', () => {
    expect(wrapTitle(font, 'AA BBBBBBBBBBBB CC', 100, 300)).toEqual(['AA', 'BBBBBBBBBBBB', 'CC'])
  })

  it('ignores extra spaces and returns nothing for an empty title', () => {
    expect(wrapTitle(font, '  AA   BB  ', 100, 1000)).toEqual(['AA BB'])
    expect(wrapTitle(font, '   ', 100, 1000)).toEqual([])
  })
})

describe('fitTitle', () => {
  const space = { maxWidth: 300, maxLines: 2, sizes: [100, 80, 60] }

  it('uses the largest size at which the title fits the width and the lines', () => {
    expect(fitTitle(font, 'AAAA BBBB', space)).toEqual({ size: 100, lines: ['AAAA', 'BBBB'] })
  })

  it('steps down when one word is too wide', () => {
    expect(fitTitle(font, 'AAAAAAAA', space)).toEqual({ size: 60, lines: ['AAAAAAAA'] })
  })

  it('steps down when the title takes too many lines', () => {
    expect(fitTitle(font, 'AA BB CC DD EE FF', space)).toEqual({ size: 60, lines: ['AA BB CC', 'DD EE FF'] })
  })

  it('falls back to the smallest size when nothing fits, without dropping any word', () => {
    const fit = fitTitle(font, 'AAAAAAAAAAAAAAA BB', space)
    expect(fit.size).toBe(60)
    expect(fit.lines).toEqual(['AAAAAAAAAAAAAAA', 'BB'])
  })
})

describe('textPath', () => {
  it('places each glyph at the pen position on the baseline', () => {
    expect(textPath(font, 'AB', 100, 10, 80)).toBe('M10,80M60,80')
  })

  it('adds the tracking between glyphs', () => {
    expect(textPath(font, 'AB', 100, 10, 80, 0.1)).toBe('M10,80M70,80')
  })

  it('flips the glyph outline, because font y points up and SVG y points down', () => {
    const upright: CardFont = {
      unitsPerEm: 1000,
      layout: () => ({ glyphs: [{ path: point(0, 700) }], positions: [{ xAdvance: 500, xOffset: 0, yOffset: 0 }] }),
    }
    expect(textPath(upright, 'A', 100, 0, 80)).toBe('M0,10')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/cardText.test.ts`
Expected: FAIL, `./cardText` cannot be resolved.

- [ ] **Step 3: Implement**

`src/lib/cardText.ts`
```ts
/** The part of a font glyph's outline this module uses. A fontkit path satisfies it. */
export interface GlyphPath {
  scale(x: number, y: number): GlyphPath
  translate(x: number, y: number): GlyphPath
  toSVG(): string
}

/** The part of a font this module uses. A fontkit font satisfies it. */
export interface CardFont {
  unitsPerEm: number
  layout(text: string): {
    glyphs: { path: GlyphPath }[]
    positions: { xAdvance: number; xOffset: number; yOffset: number }[]
  }
}

/** The width of a string set at `size` pixels, with `tracking` ems added after every character. */
export function textWidth(font: CardFont, text: string, size: number, tracking = 0): number {
  const { positions } = font.layout(text)
  const advance = positions.reduce((sum, position) => sum + position.xAdvance, 0)
  return (advance * size) / font.unitsPerEm + tracking * size * positions.length
}

/** Break a title into lines no wider than `maxWidth`, between words only. A word wider than the line stays whole. */
export function wrapTitle(font: CardFont, text: string, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && textWidth(font, next, size) > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

export interface TitleFit {
  size: number
  lines: string[]
}

/**
 * The largest of `sizes` (given largest first) at which the title wraps into at most `maxLines`
 * lines, each no wider than `maxWidth`. When none fits, the smallest size with every word kept.
 */
export function fitTitle(font: CardFont, text: string, space: { maxWidth: number; maxLines: number; sizes: readonly number[] }): TitleFit {
  for (const size of space.sizes) {
    const lines = wrapTitle(font, text, size, space.maxWidth)
    if (lines.length <= space.maxLines && lines.every((line) => textWidth(font, line, size) <= space.maxWidth)) return { size, lines }
  }
  const size = space.sizes[space.sizes.length - 1]
  return { size, lines: wrapTitle(font, text, size, space.maxWidth) }
}

/** The outline of a string as SVG path data, its first glyph's origin at (`x`, `baseline`). */
export function textPath(font: CardFont, text: string, size: number, x: number, baseline: number, tracking = 0): string {
  const run = font.layout(text)
  const scale = size / font.unitsPerEm
  let pen = x
  let d = ''
  run.glyphs.forEach((glyph, i) => {
    const position = run.positions[i]
    // Font coordinates have y pointing up; SVG has y pointing down.
    d += glyph.path
      .scale(scale, -scale)
      .translate(pen + position.xOffset * scale, baseline - position.yOffset * scale)
      .toSVG()
    pen += position.xAdvance * scale + tracking * size
  })
  return d
}
```

- [ ] **Step 4: Run the tests and the typecheck**

Run: `npx vitest run src/lib/cardText.test.ts && npm run typecheck`
Expected: PASS, 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cardText.ts src/lib/cardText.test.ts
git commit -F - <<'EOF'
feat: measure, wrap, fit and outline text for the share cards

<trailer lines>
EOF
```

---

### Task 3: Card SVG (`src/lib/cardSvg.ts`)

**Files:**
- Create: `src/lib/cardSvg.ts`, `src/lib/cardSvg.test.ts`

**Interfaces:**
- Consumes: `fitTitle`, `textPath`, `CardFont` from `./cardText`.
- Produces:
  - `const CARD` (the layout numbers) and `const COLORS = { ivory: '#f4f0e6', ink: '#0c0c0c', vermilion: '#f86343' }`
  - `interface Mark { d: string; width: number; height: number }`, `markFromSvg(source: string): Mark`
  - `captureBox(): { left: number; top: number; width: number; height: number }`
  - `interface CardText { label: string; title: string; address: string }`
  - `cardSvg(text: CardText, fonts: { display: CardFont; mono: CardFont }, mark: Mark, options?: { capture?: boolean }): string`

- [ ] **Step 1: Write the failing test**

`src/lib/cardSvg.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { CARD, captureBox, cardSvg, COLORS, markFromSvg } from './cardSvg'
import type { CardFont, GlyphPath } from './cardText'

function point(x: number, y: number): GlyphPath {
  return {
    scale: (sx, sy) => point(x * sx, y * sy),
    translate: (dx, dy) => point(x + dx, y + dy),
    toSVG: () => `M${x},${y}`,
  }
}

// Records what it was asked to set, so the tests can see the text is upper-cased.
function fakeFont(seen: string[]): CardFont {
  return {
    unitsPerEm: 1000,
    layout: (text) => {
      seen.push(text)
      return {
        glyphs: [...text].map(() => ({ path: point(0, 0) })),
        positions: [...text].map(() => ({ xAdvance: 500, xOffset: 0, yOffset: 0 })),
      }
    },
  }
}

const mark = { d: 'M0,0L369,278', width: 369, height: 278 }
const text = { label: 'Case study / 2026', title: 'Vamp Network', address: 'matbrown.io / work' }

function build(options?: { capture?: boolean }, title = text.title) {
  const display: string[] = []
  const mono: string[] = []
  const svg = cardSvg({ ...text, title }, { display: fakeFont(display), mono: fakeFont(mono) }, mark, options)
  return { svg, display, mono }
}

describe('markFromSvg', () => {
  it('reads the size from the viewBox and the outline from the path', () => {
    expect(markFromSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 369 278"><path fill="currentColor" d="M1,2L3,4"/></svg>')).toEqual({
      d: 'M1,2L3,4',
      width: 369,
      height: 278,
    })
  })

  it('says what is wrong when the file is not the mark', () => {
    expect(() => markFromSvg('<svg viewBox="0 0 10 10"></svg>')).toThrow('The mark SVG has no path')
    expect(() => markFromSvg('<svg><path d="M0,0"/></svg>')).toThrow('The mark SVG has no viewBox')
  })
})

describe('cardSvg', () => {
  it('is a 1200 by 630 card on ivory', () => {
    const { svg } = build()
    expect(svg).toContain('width="1200" height="630" viewBox="0 0 1200 630"')
    expect(svg).toContain(`<rect width="1200" height="630" fill="${COLORS.ivory}"/>`)
  })

  it('has a full-height vermilion block on the right', () => {
    expect(build().svg).toContain(`<rect x="840" y="0" width="360" height="630" fill="${COLORS.vermilion}"/>`)
  })

  it('sets the label, title and address in capitals', () => {
    const { display, mono } = build()
    expect(display).toContain('VAMP NETWORK')
    expect(mono).toContain('CASE STUDY / 2026')
    expect(mono).toContain('MATBROWN.IO / WORK')
  })

  it('draws the mark in ink in the bottom right corner, running off both edges', () => {
    const { svg } = build()
    // 312 wide from a 369-wide mark; 16 past the right edge and 22 past the bottom.
    expect(svg).toContain('<g transform="translate(904 416.94) scale(0.8455)">')
    expect(svg).toContain(`<path d="M0,0L369,278" fill="${COLORS.ink}" fill-rule="evenodd"/>`)
  })

  it('ends the title 144 above the bottom edge and stacks earlier lines above it', () => {
    // 'VAMP NETWORK' is 12 characters: 828 wide at 138, so it wraps to two lines at that size.
    const { svg } = build()
    expect(svg).toContain('M60,361.8')
    expect(svg).toContain('M60,486')
  })

  it('steps a long title down so it stays clear of the block', () => {
    const { svg } = build(undefined, 'Supercalifragilistic')
    // 20 characters must be at most 732 wide: 66 is the first size that fits (660).
    expect(svg).toContain('M60,486')
    expect(svg).not.toContain('M60,361.8')
  })

  it('has the ink rule under the title', () => {
    expect(build().svg).toContain(`<rect x="60" y="519" width="96" height="3" fill="${COLORS.ink}"/>`)
  })

  it('with a capture widens the block, frames the capture and leaves the mark out', () => {
    const { svg } = build({ capture: true })
    expect(svg).toContain(`<rect x="648" y="0" width="552" height="630" fill="${COLORS.vermilion}"/>`)
    expect(svg).toContain(`<rect x="702" y="72" width="444" height="486" fill="${COLORS.ink}"/>`)
    expect(svg).not.toContain('<g transform=')
  })

  it('escapes nothing into the markup, because all text is outlines', () => {
    const { svg } = build(undefined, 'A <b> & "c"')
    expect(svg).not.toContain('<b>')
    expect(svg).not.toContain('&')
  })
})

describe('captureBox', () => {
  it('is the area inside the frame, where the capture is placed', () => {
    expect(captureBox()).toEqual({ left: 705, top: 75, width: 438, height: 480 })
  })

  it('agrees with the layout numbers', () => {
    expect(CARD.width - CARD.captureBlockWidth + CARD.frameInsetX + CARD.frameBorder).toBe(705)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/cardSvg.test.ts`
Expected: FAIL, `./cardSvg` cannot be resolved.

- [ ] **Step 3: Implement**

`src/lib/cardSvg.ts`
```ts
import { fitTitle, textPath, type CardFont } from './cardText'

/** The share card's layout, in pixels of a 1200 by 630 card. */
export const CARD = {
  width: 1200,
  height: 630,
  margin: 60,
  /** Clear space between the title and the block. */
  gap: 48,
  blockWidth: 360,
  captureBlockWidth: 552,
  titleSizes: [138, 124, 110, 98, 86, 76, 66, 58, 50],
  maxLines: 3,
  lineHeight: 0.9,
  /** The last title baseline sits this far above the bottom edge. */
  titleBottom: 144,
  labelSize: 19,
  tracking: 0.08,
  ruleWidth: 96,
  ruleHeight: 3,
  ruleBottom: 108,
  markWidth: 312,
  /** How far the mark runs past the card's right and bottom edges. */
  markRight: 16,
  markBottom: 22,
  frameInsetX: 54,
  frameInsetY: 72,
  frameBorder: 3,
} as const

/** The palette. Kept here because the card is drawn outside CSS, where the theme tokens do not reach. */
export const COLORS = { ivory: '#f4f0e6', ink: '#0c0c0c', vermilion: '#f86343' } as const

export interface Mark {
  d: string
  width: number
  height: number
}

/** Read the MB mark's outline and size from its SVG file. */
export function markFromSvg(source: string): Mark {
  const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(source)
  if (!viewBox) throw new Error('The mark SVG has no viewBox')
  const path = /<path[^>]*\sd="([^"]+)"/.exec(source)
  if (!path) throw new Error('The mark SVG has no path')
  return { d: path[1], width: Number(viewBox[1]), height: Number(viewBox[2]) }
}

/** The area inside the frame on a card with a capture: where the capture image is placed. */
export function captureBox(): { left: number; top: number; width: number; height: number } {
  const left = CARD.width - CARD.captureBlockWidth + CARD.frameInsetX + CARD.frameBorder
  const top = CARD.frameInsetY + CARD.frameBorder
  return {
    left,
    top,
    width: CARD.captureBlockWidth - 2 * (CARD.frameInsetX + CARD.frameBorder),
    height: CARD.height - 2 * (CARD.frameInsetY + CARD.frameBorder),
  }
}

export interface CardText {
  label: string
  title: string
  address: string
}

/** Two decimals at most, so the markup is stable and small. */
const n = (value: number) => String(Math.round(value * 100) / 100)

/**
 * The share card as an SVG. All text is outlines, so nothing depends on the fonts installed where
 * it is rasterised. With `capture`, the block widens to hold a framed capture (placed by the
 * renderer inside `captureBox`) and the mark is left out.
 */
export function cardSvg(text: CardText, fonts: { display: CardFont; mono: CardFont }, mark: Mark, options: { capture?: boolean } = {}): string {
  const capture = options.capture === true
  const blockWidth = capture ? CARD.captureBlockWidth : CARD.blockWidth
  const blockX = CARD.width - blockWidth
  const fit = fitTitle(fonts.display, text.title.toUpperCase(), {
    maxWidth: blockX - CARD.margin - CARD.gap,
    maxLines: CARD.maxLines,
    sizes: CARD.titleSizes,
  })
  const lastBaseline = CARD.height - CARD.titleBottom
  const titlePaths = fit.lines
    .map((line, i) => textPath(fonts.display, line, fit.size, CARD.margin, lastBaseline - (fit.lines.length - 1 - i) * fit.size * CARD.lineHeight))
    .join('')
  const labelPath = textPath(fonts.mono, text.label.toUpperCase(), CARD.labelSize, CARD.margin, CARD.margin + CARD.labelSize, CARD.tracking)
  const addressPath = textPath(fonts.mono, text.address.toUpperCase(), CARD.labelSize, CARD.margin, CARD.height - CARD.margin, CARD.tracking)

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${CARD.height}" viewBox="0 0 ${CARD.width} ${CARD.height}">`,
    `<rect width="${CARD.width}" height="${CARD.height}" fill="${COLORS.ivory}"/>`,
    `<rect x="${blockX}" y="0" width="${blockWidth}" height="${CARD.height}" fill="${COLORS.vermilion}"/>`,
  ]

  if (capture) {
    // The frame is an ink rectangle; the renderer lays the capture over its inside.
    const frameX = blockX + CARD.frameInsetX
    parts.push(
      `<rect x="${frameX}" y="${CARD.frameInsetY}" width="${blockWidth - 2 * CARD.frameInsetX}" height="${CARD.height - 2 * CARD.frameInsetY}" fill="${COLORS.ink}"/>`,
    )
  } else {
    const scale = CARD.markWidth / mark.width
    const x = CARD.width + CARD.markRight - CARD.markWidth
    const y = CARD.height + CARD.markBottom - mark.height * scale
    parts.push(`<g transform="translate(${n(x)} ${n(y)}) scale(${Math.round(scale * 10000) / 10000})">`, `<path d="${mark.d}" fill="${COLORS.ink}" fill-rule="evenodd"/>`, '</g>')
  }

  parts.push(
    `<path d="${labelPath}" fill="${COLORS.ink}"/>`,
    `<path d="${titlePaths}" fill="${COLORS.ink}"/>`,
    `<rect x="${CARD.margin}" y="${CARD.height - CARD.ruleBottom - CARD.ruleHeight}" width="${CARD.ruleWidth}" height="${CARD.ruleHeight}" fill="${COLORS.ink}"/>`,
    `<path d="${addressPath}" fill="${COLORS.ink}"/>`,
    '</svg>',
  )
  return parts.join('')
}
```

- [ ] **Step 4: Run the tests and the typecheck**

Run: `npx vitest run src/lib/cardSvg.test.ts && npm run typecheck`
Expected: PASS, 0 errors. If an expected coordinate differs by a rounding step (for example `416.94`), work out the value by hand from the layout numbers before changing either side, and record what you found in the report.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cardSvg.ts src/lib/cardSvg.test.ts
git commit -F - <<'EOF'
feat: compose the share card as an SVG of outlines

<trailer lines>
EOF
```

---

### Task 4: The list of share cards (`src/lib/shareCards.ts`)

**Files:**
- Create: `src/lib/shareCards.ts`, `src/lib/shareCards.test.ts`

**Interfaces:**
- Consumes: `Discipline` from `../content/disciplines`; `TopicEntry`, `ArticleEntry`, `topicSlug`, `topicHref`, `articleHref`, `requireTopic`, `requireDiscipline` from `./blog`; `mediaKind` from `./media`.
- Produces:
  - `interface ShareCard { path: string; label: string; title: string; address: string; capture?: string }` (`path` is the page path without a trailing slash, `/` for Home; `capture` is a file path from the project root)
  - `interface StudyEntry { id: string; data: { title: string; year: string; media?: { hero?: { src?: string; poster?: string } } } }`
  - `pagePath(pathname: string): string`, `cardParam(pathname: string): string`, `ogImagePath(pathname: string): string`
  - `heroCapture(media: StudyEntry['data']['media']): string | undefined`
  - `shareCards(input: { disciplines: Discipline[]; caseStudies: StudyEntry[]; topics: TopicEntry[]; articles: ArticleEntry[] }): ShareCard[]`
  - `cardFor(cards: ShareCard[], pathname: string): ShareCard`

- [ ] **Step 1: Write the failing test**

`src/lib/shareCards.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import type { Discipline } from '../content/disciplines'
import { cardFor, cardParam, heroCapture, ogImagePath, pagePath, shareCards } from './shareCards'

const disciplines: Discipline[] = [
  { number: '01', slug: 'ux-ui-engineering', title: 'UX/UI Engineering', blurb: '', deliverables: [], cta: '', skills: [] },
  { number: '02', slug: 'seo-aeo', title: 'SEO/AEO', blurb: '', deliverables: [], cta: '', skills: [] },
]
const caseStudies = [
  { id: 'vamp-network', data: { title: 'Vamp Network', year: '2026' } },
  { id: 'aiwi-waffles', data: { title: "'Aiwi Waffles", year: '2025', media: { hero: { src: 'aiwi-waffles/hero.png', alt: '' } } } },
]
const topics = [
  { id: 'ux-ui-design', data: { title: 'UX/UI Design', description: '', discipline: 'ux-ui-engineering', order: 1 } },
  { id: 'technical-seo', data: { title: 'Technical SEO', description: '', discipline: 'seo-aeo', order: 1 } },
]
const articles = [
  { id: 'ux-ui-design/button-states-that-convert', data: { title: 'Button states that convert', description: '', date: new Date('2026-05-31') } },
]
const cards = shareCards({ disciplines, caseStudies, topics, articles })
const card = (path: string) => cards.find((c) => c.path === path)

describe('paths', () => {
  it('drops the trailing slash, keeping the root', () => {
    expect(pagePath('/')).toBe('/')
    expect(pagePath('/work/')).toBe('/work')
    expect(pagePath('/work/vamp-network')).toBe('/work/vamp-network')
  })

  it('names a card after its page, with index for Home', () => {
    expect(cardParam('/')).toBe('index')
    expect(cardParam('/blog/ux-ui-design/')).toBe('blog/ux-ui-design')
  })

  it('gives the image path for a page', () => {
    expect(ogImagePath('/')).toBe('/og/index.png')
    expect(ogImagePath('/work/vamp-network/')).toBe('/og/work/vamp-network.png')
  })
})

describe('heroCapture', () => {
  it('is the hero image, as a path from the project root', () => {
    expect(heroCapture({ hero: { src: 'vamp-network/hero.png' } })).toBe('src/assets/case-studies/vamp-network/hero.png')
    expect(heroCapture({ hero: { src: './vamp-network/hero.JPG' } })).toBe('src/assets/case-studies/vamp-network/hero.JPG')
  })

  it('is the poster when the hero is a video', () => {
    expect(heroCapture({ hero: { src: 'vamp-network/hero.webm', poster: 'vamp-network/poster.png' } })).toBe('src/assets/case-studies/vamp-network/poster.png')
  })

  it('is nothing when there is no usable image', () => {
    expect(heroCapture(undefined)).toBeUndefined()
    expect(heroCapture({})).toBeUndefined()
    expect(heroCapture({ hero: {} })).toBeUndefined()
    expect(heroCapture({ hero: { src: 'vamp-network/hero.webm' } })).toBeUndefined()
    expect(heroCapture({ hero: { src: 'vamp-network/hero.svg' } })).toBeUndefined()
  })
})

describe('shareCards', () => {
  it('starts with the Home card', () => {
    expect(cards[0]).toEqual({ path: '/', label: 'Mathew Brown', title: 'UX/UI engineer & SEO specialist', address: 'matbrown.io' })
  })

  it('has a card for each fixed page', () => {
    expect(card('/work')).toMatchObject({ label: 'Work', title: 'UX/UI engineering & SEO case studies', address: 'matbrown.io / work' })
    expect(card('/services')).toMatchObject({ label: 'Services', title: 'UX/UI, SEO & AI workflow services', address: 'matbrown.io / services' })
    expect(card('/about')).toMatchObject({ label: 'About', title: 'Mathew Brown', address: 'matbrown.io / about' })
    expect(card('/contact')).toMatchObject({ label: 'Contact', title: 'Start a project', address: 'matbrown.io / contact' })
    expect(card('/blog')).toMatchObject({ label: 'Blog', title: 'Articles on UX/UI, SEO & AI workflows', address: 'matbrown.io / blog' })
  })

  it('has a card for each case study, with its year and its capture when it has one', () => {
    expect(card('/work/vamp-network')).toEqual({ path: '/work/vamp-network', label: 'Case study / 2026', title: 'Vamp Network', address: 'matbrown.io / work' })
    expect(card('/work/aiwi-waffles')).toMatchObject({ label: 'Case study / 2025', capture: 'src/assets/case-studies/aiwi-waffles/hero.png' })
  })

  it('has a card for each topic, labelled with its discipline', () => {
    expect(card('/blog/technical-seo')).toEqual({ path: '/blog/technical-seo', label: 'Blog topic / SEO/AEO', title: 'Technical SEO', address: 'matbrown.io / blog' })
  })

  it('has a card for each article, labelled with its topic', () => {
    expect(card('/blog/ux-ui-design/button-states-that-convert')).toEqual({
      path: '/blog/ux-ui-design/button-states-that-convert',
      label: 'Article / UX/UI Design',
      title: 'Button states that convert',
      address: 'matbrown.io / blog',
    })
  })

  it('gives every page exactly one card', () => {
    expect(new Set(cards.map((c) => c.path)).size).toBe(cards.length)
    expect(cards).toHaveLength(6 + caseStudies.length + topics.length + articles.length)
  })
})

describe('cardFor', () => {
  it('finds a page by its path, with or without a trailing slash', () => {
    expect(cardFor(cards, '/work/vamp-network/').title).toBe('Vamp Network')
    expect(cardFor(cards, '/work/vamp-network').title).toBe('Vamp Network')
  })

  it('falls back to the Home card for a page with no card of its own', () => {
    expect(cardFor(cards, '/404').path).toBe('/')
    expect(cardFor(cards, '/contact/thanks/').path).toBe('/')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/shareCards.test.ts`
Expected: FAIL, `./shareCards` cannot be resolved.

- [ ] **Step 3: Implement**

`src/lib/shareCards.ts`
```ts
import type { Discipline } from '../content/disciplines'
import { articleHref, requireDiscipline, requireTopic, topicHref, topicSlug, type ArticleEntry, type TopicEntry } from './blog'
import { mediaKind } from './media'

/** What one page's share card says. */
export interface ShareCard {
  /** The page path without a trailing slash; "/" for Home. */
  path: string
  label: string
  title: string
  address: string
  /** A raster image to show on the card, as a path from the project root. Case studies only. */
  capture?: string
}

/** The part of a case study entry a card needs. */
export interface StudyEntry {
  id: string
  data: { title: string; year: string; media?: { hero?: { src?: string; poster?: string } } }
}

const ASSETS = 'src/assets/case-studies/'
const RASTER = /\.(png|jpe?g|webp|avif)$/i

/** A page path without its trailing slash; the root stays "/". */
export function pagePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
}

/** The card's name in its URL: the page path without slashes at the ends, or "index" for Home. */
export function cardParam(pathname: string): string {
  return pagePath(pathname).replace(/^\//, '') || 'index'
}

/** Where a page's share image is served. */
export function ogImagePath(pathname: string): string {
  return `/og/${cardParam(pathname)}.png`
}

/**
 * The image a case study's card shows: its hero when that is a raster image, the poster when the
 * hero is a video, and nothing otherwise (no media yet, or an SVG, which the card does not take).
 */
export function heroCapture(media: StudyEntry['data']['media']): string | undefined {
  const hero = media?.hero
  if (!hero?.src) return undefined
  const picture = mediaKind(hero.src) === 'video' ? hero.poster : hero.src
  if (!picture || !RASTER.test(picture)) return undefined
  return ASSETS + picture.replace(/^\.?\//, '')
}

/** One card per page that has its own. Home is first, and is the fallback for every other page. */
export function shareCards(input: { disciplines: Discipline[]; caseStudies: StudyEntry[]; topics: TopicEntry[]; articles: ArticleEntry[] }): ShareCard[] {
  const { disciplines, caseStudies, topics, articles } = input
  return [
    { path: '/', label: 'Mathew Brown', title: 'UX/UI engineer & SEO specialist', address: 'matbrown.io' },
    { path: '/work', label: 'Work', title: 'UX/UI engineering & SEO case studies', address: 'matbrown.io / work' },
    { path: '/services', label: 'Services', title: 'UX/UI, SEO & AI workflow services', address: 'matbrown.io / services' },
    { path: '/about', label: 'About', title: 'Mathew Brown', address: 'matbrown.io / about' },
    { path: '/contact', label: 'Contact', title: 'Start a project', address: 'matbrown.io / contact' },
    { path: '/blog', label: 'Blog', title: 'Articles on UX/UI, SEO & AI workflows', address: 'matbrown.io / blog' },
    ...caseStudies.map((study) => {
      const capture = heroCapture(study.data.media)
      const card: ShareCard = { path: `/work/${study.id}`, label: `Case study / ${study.data.year}`, title: study.data.title, address: 'matbrown.io / work' }
      return capture ? { ...card, capture } : card
    }),
    ...topics.map((topic) => ({
      path: topicHref(topic.id),
      label: `Blog topic / ${requireDiscipline(disciplines, topic.data.discipline).title}`,
      title: topic.data.title,
      address: 'matbrown.io / blog',
    })),
    ...articles.map((article) => ({
      path: articleHref(article.id),
      label: `Article / ${requireTopic(topics, topicSlug(article.id)).data.title}`,
      title: article.data.title,
      address: 'matbrown.io / blog',
    })),
  ]
}

/** The card for a page, or the Home card when the page has none of its own (the 404, the thanks page). */
export function cardFor(cards: ShareCard[], pathname: string): ShareCard {
  return cards.find((card) => card.path === pagePath(pathname)) ?? cards[0]
}
```

- [ ] **Step 4: Run the tests and the typecheck**

Run: `npx vitest run src/lib/shareCards.test.ts && npm run typecheck`
Expected: PASS, 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/shareCards.ts src/lib/shareCards.test.ts
git commit -F - <<'EOF'
feat: list every page's share card and its image path

<trailer lines>
EOF
```

---

### Task 5: Render the cards and wire them into the head

**Files:**
- Modify: `package.json` (dependencies), `package-lock.json`
- Create: `src/types/fontkit.d.ts`, `src/lib/cardRender.ts`, `src/lib/cardRender.test.ts`
- Create: `src/pages/og/[...path].png.ts`, `src/components/seo/ShareMeta.astro`
- Modify: `src/layouts/BaseLayout.astro`, `src/pages/work/[slug].astro`, `src/content.config.ts`, the three `src/content/case-studies/*.mdx`
- Delete: `public/images/case-studies/*/og.png`

**Interfaces:**
- Consumes: `cardSvg`, `captureBox`, `markFromSvg` from `./cardSvg`; `CardFont` from `./cardText`; `ShareCard`, `shareCards`, `cardFor`, `cardParam`, `ogImagePath` from `./shareCards`.
- Produces: `renderCard(card: ShareCard): Promise<Buffer>` (a 1200 by 630 PNG); the route `/og/<cardParam>.png`; `ShareMeta.astro` (no props).

Reference: the approved image in the spec's `assets` folder. This task is judged by looking at the PNGs.

- [ ] **Step 1: Install the fonts and prove they open**

Run: `npm install --save-dev @fontsource/anton @fontsource/jetbrains-mono`
Run: `ls node_modules/@fontsource/anton/files/ | grep "latin-400-normal"; ls node_modules/@fontsource/jetbrains-mono/files/ | grep "latin-700-normal"`
Expected: `anton-latin-400-normal.woff2` (and `.woff`) and `jetbrains-mono-latin-700-normal.woff2` (and `.woff`).
Run: `node -e "const f=require('fontkit');const a=f.openSync('node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2');console.log(a.unitsPerEm, a.layout('VAMP & CO / 2026').glyphs.length)"`
Expected: a units-per-em number and `16`. If `fontkit` cannot read `.woff2`, use the `.woff` files in Step 3 and say so in the report.

- [ ] **Step 2: Write the failing test**

`src/lib/cardRender.test.ts`
```ts
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { renderCard } from './cardRender'

const home = { path: '/', label: 'Mathew Brown', title: 'UX/UI engineer & SEO specialist', address: 'matbrown.io' }

/** The colour of one pixel of a PNG, as [r, g, b]. */
async function pixel(png: Buffer, left: number, top: number) {
  const { data } = await sharp(png).extract({ left, top, width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return [data[0], data[1], data[2]]
}

describe('renderCard', () => {
  it('renders a 1200 by 630 PNG', async () => {
    const meta = await sharp(await renderCard(home)).metadata()
    expect(meta.format).toBe('png')
    expect(meta.width).toBe(1200)
    expect(meta.height).toBe(630)
  })

  it('has an ivory ground and a vermilion block on the right', async () => {
    const png = await renderCard(home)
    expect(await pixel(png, 20, 20)).toEqual([0xf4, 0xf0, 0xe6])
    expect(await pixel(png, 1100, 60)).toEqual([0xf8, 0x63, 0x43])
  })

  it('draws ink where the title is', async () => {
    const png = await renderCard(home)
    const { data } = await sharp(png).extract({ left: 60, top: 300, width: 600, height: 200 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    let ink = 0
    for (let i = 0; i < data.length; i += 3) if (data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40) ink += 1
    expect(ink).toBeGreaterThan(5000)
  })

  it('lays a capture over the inside of the frame', async () => {
    const png = await renderCard({ ...home, capture: 'src/assets/portraits/about.png' })
    // The block is wider on a capture card, so this point is vermilion; on a plain card it is ivory.
    expect(await pixel(png, 670, 20)).toEqual([0xf8, 0x63, 0x43])
    const meta = await sharp(png).metadata()
    expect(meta.width).toBe(1200)
  })
})
```

- [ ] **Step 3: Run it, watch it fail, then implement**

Run: `npx vitest run src/lib/cardRender.test.ts`
Expected: FAIL, `./cardRender` cannot be resolved.

`src/types/fontkit.d.ts` (skip this file if `npm run typecheck` already resolves types for `fontkit`)
```ts
declare module 'fontkit' {
  /** Open a font file. The result satisfies `CardFont` in src/lib/cardText.ts. */
  export function openSync(path: string): unknown
}
```

`src/lib/cardRender.ts`
```ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as fontkit from 'fontkit'
import sharp from 'sharp'
import { captureBox, cardSvg, markFromSvg, type Mark } from './cardSvg'
import type { CardFont } from './cardText'
import type { ShareCard } from './shareCards'

// Paths are from the project root, which is where astro build and vitest both run.
const ANTON = 'node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2'
const MONO = 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2'
const MARK = 'src/assets/logo/mb-mark.svg'

let loaded: { fonts: { display: CardFont; mono: CardFont }; mark: Mark } | undefined

/** The fonts and the mark, opened once for the whole build. */
function assets() {
  loaded ??= {
    fonts: {
      display: fontkit.openSync(join(process.cwd(), ANTON)) as CardFont,
      mono: fontkit.openSync(join(process.cwd(), MONO)) as CardFont,
    },
    mark: markFromSvg(readFileSync(join(process.cwd(), MARK), 'utf8')),
  }
  return loaded
}

/** Rasterise a page's share card to a 1200 by 630 PNG. A capture is cropped to fill the frame. */
export async function renderCard(card: ShareCard): Promise<Buffer> {
  const { fonts, mark } = assets()
  const svg = Buffer.from(cardSvg(card, fonts, mark, { capture: card.capture !== undefined }))
  if (card.capture === undefined) return sharp(svg).png().toBuffer()

  const box = captureBox()
  const capture = await sharp(join(process.cwd(), card.capture)).resize(box.width, box.height, { fit: 'cover' }).toBuffer()
  return sharp(svg)
    .composite([{ input: capture, left: box.left, top: box.top }])
    .png()
    .toBuffer()
}
```

Run: `npx vitest run src/lib/cardRender.test.ts && npm run typecheck`
Expected: PASS, 0 errors.

- [ ] **Step 4: The endpoint**

`src/pages/og/[...path].png.ts`
```ts
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'
import { disciplines } from '../../content/disciplines'
import { renderCard } from '../../lib/cardRender'
import { cardParam, shareCards, type ShareCard } from '../../lib/shareCards'

// One PNG per page that has its own share card. Card URLs mirror page URLs.
export const getStaticPaths: GetStaticPaths = async () => {
  const cards = shareCards({
    disciplines,
    caseStudies: await getCollection('caseStudies'),
    topics: await getCollection('blogTopics'),
    articles: await getCollection('blogArticles'),
  })
  return cards.map((card) => ({ params: { path: cardParam(card.path) }, props: { card } }))
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderCard(props.card as ShareCard)), { headers: { 'Content-Type': 'image/png' } })
```

- [ ] **Step 5: The head tags**

`src/components/seo/ShareMeta.astro`
```astro
---
import { getCollection } from 'astro:content'
import { disciplines } from '../../content/disciplines'
import { cardFor, ogImagePath, shareCards } from '../../lib/shareCards'

// A page with no card of its own (the 404, the thanks page) shares the Home card.
const cards = shareCards({
  disciplines,
  caseStudies: await getCollection('caseStudies'),
  topics: await getCollection('blogTopics'),
  articles: await getCollection('blogArticles'),
})
const card = cardFor(cards, Astro.url.pathname)
const image = new URL(ogImagePath(card.path), Astro.site)
const alt = `${card.label}: ${card.title}`
---

<meta property="og:image" content={image} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content={alt} />
<meta name="twitter:image" content={image} />
<meta name="twitter:image:alt" content={alt} />
```

In `src/layouts/BaseLayout.astro`: import `ShareMeta`, remove the `ogImage` prop from `Props` and from the destructuring, delete the two `{ogImage && ...}` lines, and put `<ShareMeta />` where the `og:image` line was (after `og:url`). Move nothing else.

In `src/pages/work/[slug].astro` remove `ogImage={entry.data.ogImage}` from the `<BaseLayout>` tag. In `src/content.config.ts` remove the `ogImage` line from the `caseStudies` schema. Remove the `ogImage:` line from the three case study MDX files. Run `git rm public/images/case-studies/*/og.png`, then `grep -rn "ogImage\|og\.png" src public` and expect no output.

- [ ] **Step 6: Build and look at every card**

Run: `npm run build && npx vitest run && npm run typecheck`
Expected: PASS. `find dist/og -name "*.png" | wc -l` prints 19 (6 fixed pages, 3 case studies, 9 topics, 1 article).
Run: `grep -o '<meta property="og:image" content="[^"]*"' dist/index.html dist/404.html dist/contact/thanks/index.html dist/work/vamp-network/index.html dist/blog/ux-ui-design/button-states-that-convert/index.html`
Expected: Home, the 404 and the thanks page point at `https://matbrown.io/og/index.png`; the other two at their own PNGs.

Open every PNG in `dist/og` with the Read tool and compare with the approved image. Confirm on each: ivory ground; full-height vermilion block on the right; the mark large in the block's bottom right corner, trimmed slightly by the right and bottom edges and still reading as "MB"; label top left; the title clear of the block by a visible gap; the ink rule and the address under it; nothing clipped or overlapping. Tune the numbers in `CARD` (in `src/lib/cardSvg.ts`, test-first: change the expected values in its test, watch them fail, then change `CARD`) until the cards match the approved image. Report every number you changed.

Then check four hard cases with temporary files you delete before committing:
- A long article title: add `src/content/blog/ux-ui-design/zz-temp.mdx` titled "Supercalifragilisticexpialidocious titles and how to set them on a card", build, and look at its PNG: the long word is scaled to stay left of the block and the title is at most three lines.
- A case study capture: copy `src/assets/portraits/about.png` to `src/assets/case-studies/vamp-network/zz-temp-hero.png`, add `media: { hero: { src: "vamp-network/zz-temp-hero.png", alt: "Temporary" } }` to `vamp-network.mdx`, build, and look at `dist/og/work/vamp-network.png`: the block is wider, the capture fills an ink frame, there is no mark, and the title sits left of the block. Revert the MDX and delete the file.
- The shortest title ("Mathew Brown" on About) and the longest fixed one ("Articles on UX/UI, SEO & AI workflows" on Blog).
- Save copies of six representative PNGs to `.playwright-mcp/sp5-t5-*.png` and list them in the report.

Confirm `git status --short` shows no temporary file.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/types/fontkit.d.ts src/lib/cardRender.ts src/lib/cardRender.test.ts src/lib/cardSvg.ts src/lib/cardSvg.test.ts "src/pages/og/[...path].png.ts" src/components/seo/ShareMeta.astro src/layouts/BaseLayout.astro "src/pages/work/[slug].astro" src/content.config.ts src/content/case-studies public/images/case-studies
git commit -F - <<'EOF'
feat: draw a share card for every page at build time

<trailer lines>
EOF
```

---

### Task 6: Favicon and manifest

**Files:**
- Create: `scripts/favicons/icons.mjs`, `scripts/favicons/icons.test.mjs`, `scripts/favicons/generate.mjs`
- Create (generated, committed): `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`
- Create: `public/site.webmanifest`
- Modify: `package.json` (a `favicons` script), `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `faviconSvg(mark: { d: string; width: number; height: number }): string`, `icoFromPng(png: Buffer, size: number): Buffer`, `const ICON_SIZES = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 }`.

- [ ] **Step 1: Write the failing test**

`scripts/favicons/icons.test.mjs`
```js
import { describe, expect, it } from 'vitest'
import { faviconSvg, ICON_SIZES, icoFromPng } from './icons.mjs'

const mark = { d: 'M0,0L369,278', width: 369, height: 278 }

describe('faviconSvg', () => {
  it('is a square vermilion tile with the ink mark', () => {
    const svg = faviconSvg(mark)
    expect(svg).toContain('viewBox="0 0 64 64"')
    expect(svg).toContain('<rect width="64" height="64" fill="#f86343"/>')
    expect(svg).toContain('fill="#0c0c0c"')
    expect(svg).toContain('d="M0,0L369,278"')
  })

  it('sets the mark at 80% of the tile width, centred', () => {
    // 51.2 wide from 369: scale 0.1388; 38.57 high, so 6.4 from the left and 12.71 from the top.
    expect(faviconSvg(mark)).toContain('transform="translate(6.4 12.71) scale(0.1388)"')
  })
})

describe('icoFromPng', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4])
  const ico = icoFromPng(png, 32)

  it('writes an icon directory with one image', () => {
    expect(ico.readUInt16LE(0)).toBe(0) // reserved
    expect(ico.readUInt16LE(2)).toBe(1) // type: icon
    expect(ico.readUInt16LE(4)).toBe(1) // one image
  })

  it('describes the image and points at the PNG data after the 22-byte header', () => {
    expect(ico.readUInt8(6)).toBe(32) // width
    expect(ico.readUInt8(7)).toBe(32) // height
    expect(ico.readUInt16LE(10)).toBe(1) // colour planes
    expect(ico.readUInt16LE(12)).toBe(32) // bits per pixel
    expect(ico.readUInt32LE(14)).toBe(png.length)
    expect(ico.readUInt32LE(18)).toBe(22)
    expect(ico.subarray(22).equals(png)).toBe(true)
  })

  it('writes 0 for a 256-pixel image, as the format asks', () => {
    expect(icoFromPng(png, 256).readUInt8(6)).toBe(0)
  })
})

describe('ICON_SIZES', () => {
  it('names the PNG icons and their sizes', () => {
    expect(ICON_SIZES).toEqual({ 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 })
  })
})
```

- [ ] **Step 2: Run it, watch it fail, then implement**

Run: `npx vitest run scripts/favicons/icons.test.mjs`
Expected: FAIL, `./icons.mjs` cannot be resolved.

`scripts/favicons/icons.mjs`
```js
const TILE = 64
/** The mark's share of the tile's width. Tuned so "MB" still reads at 16 pixels. */
const MARK_SHARE = 0.8
const VERMILION = '#f86343'
const INK = '#0c0c0c'

const n = (value) => String(Math.round(value * 100) / 100)

/** The favicon: the ink MB mark on a vermilion square. */
export function faviconSvg(mark) {
  const width = TILE * MARK_SHARE
  const scale = width / mark.width
  const x = (TILE - width) / 2
  const y = (TILE - mark.height * scale) / 2
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}">` +
    `<rect width="${TILE}" height="${TILE}" fill="${VERMILION}"/>` +
    `<path transform="translate(${n(x)} ${n(y)}) scale(${Math.round(scale * 10000) / 10000})" d="${mark.d}" fill="${INK}" fill-rule="evenodd"/>` +
    '</svg>\n'
  )
}

/** The PNG icons to write beside the SVG, by file name. */
export const ICON_SIZES = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 }

/** Wrap one PNG in an ICO container, for browsers that only ask for /favicon.ico. */
export function icoFromPng(png, size) {
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  header.writeUInt8(size >= 256 ? 0 : size, 6)
  header.writeUInt8(size >= 256 ? 0 : size, 7)
  header.writeUInt8(0, 8)
  header.writeUInt8(0, 9)
  header.writeUInt16LE(1, 10)
  header.writeUInt16LE(32, 12)
  header.writeUInt32LE(png.length, 14)
  header.writeUInt32LE(22, 18)
  return Buffer.concat([header, png])
}
```

Run: `npx vitest run scripts/favicons/icons.test.mjs`
Expected: PASS.

- [ ] **Step 3: The generator**

`scripts/favicons/generate.mjs`
```js
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { faviconSvg, ICON_SIZES, icoFromPng } from './icons.mjs'

const MARK = 'src/assets/logo/mb-mark.svg'
const OUT = 'public'

const source = readFileSync(MARK, 'utf8')
const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(source)
const path = /<path[^>]*\sd="([^"]+)"/.exec(source)
if (!viewBox || !path) {
  console.error(`favicons: ${MARK} is not the mark (no viewBox or path)`)
  process.exit(1)
}

const svg = faviconSvg({ d: path[1], width: Number(viewBox[1]), height: Number(viewBox[2]) })
writeFileSync(`${OUT}/favicon.svg`, svg)
console.log(`favicons: wrote ${OUT}/favicon.svg`)

const png = (size) => sharp(Buffer.from(svg), { density: 72 * (size / 64) }).resize(size, size).png().toBuffer()

for (const [name, size] of Object.entries(ICON_SIZES)) {
  writeFileSync(`${OUT}/${name}`, await png(size))
  console.log(`favicons: wrote ${OUT}/${name} (${size} x ${size})`)
}

writeFileSync(`${OUT}/favicon.ico`, icoFromPng(await png(32), 32))
console.log(`favicons: wrote ${OUT}/favicon.ico (32 x 32)`)
```

Add to `package.json` scripts: `"favicons": "node scripts/favicons/generate.mjs"`. Run `npm run favicons`.

`public/site.webmanifest`
```json
{
  "name": "Mathew Brown",
  "short_name": "MB",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#f86343",
  "background_color": "#f4f0e6",
  "display": "browser"
}
```

- [ ] **Step 4: Link them**

In the head of `src/layouts/BaseLayout.astro`, after the `<link rel="sitemap" ...>` line:

```astro
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#f86343" />
```

- [ ] **Step 5: Look at it**

Run: `npm run build`. Open `public/favicon.svg`, `public/apple-touch-icon.png` and `public/icon-512.png` with the Read tool. Then, with a browser script against a served `dist`, render `/favicon.svg` at 16, 32 and 64 pixels on a white and a dark ground (an HTML page of `<img>` tags is enough) and screenshot it to `.playwright-mcp/sp5-t6-favicon-sizes.png` at device scale factor 2. Judge the 16px one: "MB" must still read. If it does not, raise `MARK_SHARE` (test-first), regenerate, and say what you chose. Confirm no page in `dist` logs a 404 for `/favicon.ico` any more.

- [ ] **Step 6: Commit**

```bash
git add scripts/favicons package.json public/favicon.svg public/favicon.ico public/apple-touch-icon.png public/icon-192.png public/icon-512.png public/site.webmanifest src/layouts/BaseLayout.astro
git commit -F - <<'EOF'
feat: add the favicon, touch icons and web manifest

<trailer lines>
EOF
```

---

### Task 7: Structured data

**Files:**
- Create: `src/lib/structuredData.ts`, `src/lib/structuredData.test.ts`, `src/components/seo/JsonLd.astro`
- Modify: `src/layouts/BaseLayout.astro` and the pages `src/pages/index.astro`, `about.astro`, `services.astro`, `work/index.astro`, `work/[slug].astro`, `contact/index.astro`, `blog/index.astro`, `blog/[topic]/index.astro`, `blog/[topic]/[article].astro`

**Interfaces:**
- Consumes: `Person` from `../content/person`; `Discipline` from `../content/disciplines`; `ogImagePath` from `./shareCards`.
- Produces (all from `src/lib/structuredData.ts`):
  - `type Node = Record<string, unknown>`, `const SITE = 'https://matbrown.io'`, `const PERSON_ID`, `const WEBSITE_ID`, `const BLOG_ID`
  - `pageUrl(path: string): string`
  - `personNode(person: Person, knowsAbout: string[], image: string): Node`, `websiteNode(): Node`
  - `webPageNode(type: string, path: string, name: string, extra?: Node): Node`
  - `breadcrumbNode(path: string, trail: { name: string; path: string }[]): Node`
  - `servicesNode(disciplines: Discipline[]): Node`
  - `workListNode(studies: { id: string; data: { title: string } }[]): Node`
  - `caseStudyNode(study: { id: string; data: { title: string; headline: string; summary: string; date: Date; tags: string[] } }): Node`
  - `blogNode(description: string): Node`
  - `articleNode(article: { id: string; data: { title: string; description: string; date: Date; updated?: Date } }, topicTitle: string): Node`
  - `graph(nodes: Node[]): Node`, `serializeJsonLd(value: unknown): string`

- [ ] **Step 1: Write the failing test**

`src/lib/structuredData.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { person } from '../content/person'
import {
  articleNode,
  BLOG_ID,
  blogNode,
  breadcrumbNode,
  caseStudyNode,
  graph,
  pageUrl,
  PERSON_ID,
  personNode,
  serializeJsonLd,
  servicesNode,
  webPageNode,
  WEBSITE_ID,
  websiteNode,
  workListNode,
} from './structuredData'

describe('pageUrl', () => {
  it('is the absolute address with a trailing slash, as the pages are built', () => {
    expect(pageUrl('/')).toBe('https://matbrown.io/')
    expect(pageUrl('/work/vamp-network')).toBe('https://matbrown.io/work/vamp-network/')
    expect(pageUrl('/work/vamp-network/')).toBe('https://matbrown.io/work/vamp-network/')
  })

  it('leaves a fragment and a file alone', () => {
    expect(pageUrl('/services#seo-aeo')).toBe('https://matbrown.io/services/#seo-aeo')
    expect(pageUrl('/og/index.png')).toBe('https://matbrown.io/og/index.png')
  })
})

describe('personNode', () => {
  const node = personNode(person, ['UX/UI Engineering', 'SEO/AEO'], 'https://matbrown.io/_astro/about.png')

  it('states who the owner is, from the one source', () => {
    expect(node).toMatchObject({
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Mathew Brown',
      alternateName: 'Mat Brown',
      jobTitle: person.jobTitle,
      description: person.description,
      email: 'mailto:mat@matbrown.io',
      url: 'https://matbrown.io/',
      image: 'https://matbrown.io/_astro/about.png',
      knowsAbout: ['UX/UI Engineering', 'SEO/AEO'],
      sameAs: ['https://linkedin.com/in/matbrown', 'https://github.com/matbrown-ux'],
    })
  })

  it('gives the location as a place', () => {
    expect(node.homeLocation).toEqual({
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: "O'ahu", addressRegion: "Hawai'i", addressCountry: 'United States' },
    })
  })
})

describe('websiteNode', () => {
  it('names the site and ties it to the person', () => {
    expect(websiteNode()).toEqual({
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: 'Mathew Brown',
      url: 'https://matbrown.io/',
      inLanguage: 'en',
      publisher: { '@id': PERSON_ID },
      author: { '@id': PERSON_ID },
    })
  })
})

describe('webPageNode', () => {
  it('describes a page as part of the site', () => {
    expect(webPageNode('ProfilePage', '/about', 'About Mathew Brown', { mainEntity: { '@id': PERSON_ID } })).toEqual({
      '@type': 'ProfilePage',
      '@id': 'https://matbrown.io/about/#webpage',
      url: 'https://matbrown.io/about/',
      name: 'About Mathew Brown',
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: { '@id': PERSON_ID },
    })
  })
})

describe('breadcrumbNode', () => {
  it('numbers the trail from one', () => {
    expect(breadcrumbNode('/work/vamp-network', [{ name: 'Work', path: '/work' }, { name: 'Vamp Network', path: '/work/vamp-network' }])).toEqual({
      '@type': 'BreadcrumbList',
      '@id': 'https://matbrown.io/work/vamp-network/#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Work', item: 'https://matbrown.io/work/' },
        { '@type': 'ListItem', position: 2, name: 'Vamp Network', item: 'https://matbrown.io/work/vamp-network/' },
      ],
    })
  })
})

describe('servicesNode', () => {
  it('lists each discipline as a service the person provides', () => {
    const node = servicesNode([{ number: '02', slug: 'seo-aeo', title: 'SEO/AEO', blurb: 'I fix the foundations.', deliverables: [], cta: '', skills: [] }])
    expect(node).toEqual({
      '@type': 'ItemList',
      '@id': 'https://matbrown.io/services/#services',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: { '@type': 'Service', name: 'SEO/AEO', description: 'I fix the foundations.', url: 'https://matbrown.io/services/#seo-aeo', provider: { '@id': PERSON_ID } },
        },
      ],
    })
  })
})

describe('workListNode', () => {
  it('lists the case studies by address', () => {
    expect(workListNode([{ id: 'vamp-network', data: { title: 'Vamp Network' } }])).toEqual({
      '@type': 'ItemList',
      '@id': 'https://matbrown.io/work/#case-studies',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Vamp Network', url: 'https://matbrown.io/work/vamp-network/' }],
    })
  })
})

describe('caseStudyNode', () => {
  const study = { id: 'vamp-network', data: { title: 'Vamp Network', headline: 'A creator platform', summary: 'What I built.', date: new Date('2026-04-01'), tags: ['UX/UI Engineering', 'SEO/AEO'], result: 'Result pending' } }

  it('describes the work without its result', () => {
    const node = caseStudyNode(study)
    expect(node).toEqual({
      '@type': 'CreativeWork',
      '@id': 'https://matbrown.io/work/vamp-network/#work',
      name: 'Vamp Network',
      headline: 'A creator platform',
      description: 'What I built.',
      dateCreated: '2026-04-01',
      keywords: 'UX/UI Engineering, SEO/AEO',
      url: 'https://matbrown.io/work/vamp-network/',
      image: 'https://matbrown.io/og/work/vamp-network.png',
      creator: { '@id': PERSON_ID },
    })
    expect(JSON.stringify(node)).not.toContain('Result pending')
  })
})

describe('blogNode and articleNode', () => {
  it('describes the blog', () => {
    expect(blogNode('Articles on design and search.')).toEqual({
      '@type': 'Blog',
      '@id': BLOG_ID,
      name: 'Mathew Brown: articles',
      description: 'Articles on design and search.',
      url: 'https://matbrown.io/blog/',
      author: { '@id': PERSON_ID },
    })
  })

  const article = { id: 'ux-ui-design/button-states', data: { title: 'Button states', description: 'A guide.', date: new Date('2026-05-31') } }

  it('describes an article, with its publication date as the modified date until it is updated', () => {
    expect(articleNode(article, 'UX/UI Design')).toEqual({
      '@type': 'BlogPosting',
      '@id': 'https://matbrown.io/blog/ux-ui-design/button-states/#article',
      headline: 'Button states',
      description: 'A guide.',
      datePublished: '2026-05-31',
      dateModified: '2026-05-31',
      articleSection: 'UX/UI Design',
      url: 'https://matbrown.io/blog/ux-ui-design/button-states/',
      mainEntityOfPage: 'https://matbrown.io/blog/ux-ui-design/button-states/',
      image: 'https://matbrown.io/og/blog/ux-ui-design/button-states.png',
      author: { '@id': PERSON_ID },
      isPartOf: { '@id': BLOG_ID },
    })
  })

  it('uses the updated date when there is one', () => {
    const updated = { ...article, data: { ...article.data, updated: new Date('2026-07-01') } }
    expect(articleNode(updated, 'UX/UI Design').dateModified).toBe('2026-07-01')
  })
})

describe('graph and serializeJsonLd', () => {
  it('wraps nodes in one schema.org graph', () => {
    expect(graph([{ '@type': 'Thing' }])).toEqual({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Thing' }] })
  })

  it('cannot close its own script tag, whatever the text says', () => {
    const out = serializeJsonLd({ name: 'A </script><script>alert(1)</script> & "B"' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<')
    expect(JSON.parse(out)).toEqual({ name: 'A </script><script>alert(1)</script> & "B"' })
  })
})
```

- [ ] **Step 2: Run it, watch it fail, then implement**

Run: `npx vitest run src/lib/structuredData.test.ts`
Expected: FAIL, `./structuredData` cannot be resolved.

`src/lib/structuredData.ts`
```ts
import type { Discipline } from '../content/disciplines'
import type { Person } from '../content/person'
import { ogImagePath } from './shareCards'

/** One schema.org node. */
export type Node = Record<string, unknown>

export const SITE = 'https://matbrown.io'
export const PERSON_ID = `${SITE}/#person`
export const WEBSITE_ID = `${SITE}/#website`
export const BLOG_ID = `${SITE}/blog/#blog`

/** A page's absolute address as it is built: with a trailing slash. A file path and a fragment are kept. */
export function pageUrl(path: string): string {
  const [route, fragment] = path.split('#')
  const isFile = /\.[a-z0-9]+$/i.test(route)
  const withSlash = isFile || route.endsWith('/') ? route : `${route}/`
  return SITE + withSlash + (fragment ? `#${fragment}` : '')
}

/** A date as schema.org wants it, read in UTC so the build machine cannot shift the day. */
const day = (date: Date) => date.toISOString().slice(0, 10)

export function personNode(person: Person, knowsAbout: string[], image: string): Node {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: person.name,
    alternateName: person.alternateName,
    jobTitle: person.jobTitle,
    description: person.description,
    email: `mailto:${person.email}`,
    url: pageUrl('/'),
    image,
    homeLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: person.location.locality,
        addressRegion: person.location.region,
        addressCountry: person.location.country,
      },
    },
    knowsAbout,
    sameAs: person.profiles.map((profile) => profile.href),
  }
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Mathew Brown',
    url: pageUrl('/'),
    inLanguage: 'en',
    publisher: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID },
  }
}

/** A page of the site: WebPage, ProfilePage, ContactPage or CollectionPage. */
export function webPageNode(type: string, path: string, name: string, extra: Node = {}): Node {
  return { '@type': type, '@id': `${pageUrl(path)}#webpage`, url: pageUrl(path), name, isPartOf: { '@id': WEBSITE_ID }, ...extra }
}

export function breadcrumbNode(path: string, trail: { name: string; path: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(path)}#breadcrumb`,
    itemListElement: trail.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: pageUrl(crumb.path) })),
  }
}

/** The five disciplines as services the person provides. */
export function servicesNode(disciplines: Discipline[]): Node {
  return {
    '@type': 'ItemList',
    '@id': `${pageUrl('/services')}#services`,
    itemListElement: disciplines.map((discipline, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: discipline.title,
        description: discipline.blurb,
        url: pageUrl(`/services#${discipline.slug}`),
        provider: { '@id': PERSON_ID },
      },
    })),
  }
}

export function workListNode(studies: { id: string; data: { title: string } }[]): Node {
  return {
    '@type': 'ItemList',
    '@id': `${pageUrl('/work')}#case-studies`,
    itemListElement: studies.map((study, i) => ({ '@type': 'ListItem', position: i + 1, name: study.data.title, url: pageUrl(`/work/${study.id}`) })),
  }
}

/** A case study. Its result is left out on purpose: results are placeholders until the owner supplies them. */
export function caseStudyNode(study: { id: string; data: { title: string; headline: string; summary: string; date: Date; tags: string[] } }): Node {
  const path = `/work/${study.id}`
  return {
    '@type': 'CreativeWork',
    '@id': `${pageUrl(path)}#work`,
    name: study.data.title,
    headline: study.data.headline,
    description: study.data.summary,
    dateCreated: day(study.data.date),
    keywords: study.data.tags.join(', '),
    url: pageUrl(path),
    image: pageUrl(ogImagePath(path)),
    creator: { '@id': PERSON_ID },
  }
}

export function blogNode(description: string): Node {
  return { '@type': 'Blog', '@id': BLOG_ID, name: 'Mathew Brown: articles', description, url: pageUrl('/blog'), author: { '@id': PERSON_ID } }
}

export function articleNode(article: { id: string; data: { title: string; description: string; date: Date; updated?: Date } }, topicTitle: string): Node {
  const path = `/blog/${article.id}`
  return {
    '@type': 'BlogPosting',
    '@id': `${pageUrl(path)}#article`,
    headline: article.data.title,
    description: article.data.description,
    datePublished: day(article.data.date),
    dateModified: day(article.data.updated ?? article.data.date),
    articleSection: topicTitle,
    url: pageUrl(path),
    mainEntityOfPage: pageUrl(path),
    image: pageUrl(ogImagePath(path)),
    author: { '@id': PERSON_ID },
    isPartOf: { '@id': BLOG_ID },
  }
}

export function graph(nodes: Node[]): Node {
  return { '@context': 'https://schema.org', '@graph': nodes }
}

/** JSON for a script tag. "<" is written as an escape so no text can close the tag. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
```

Run: `npx vitest run src/lib/structuredData.test.ts && npm run typecheck`
Expected: PASS, 0 errors.

- [ ] **Step 3: The component and the layout**

`src/components/seo/JsonLd.astro`
```astro
---
import { graph, serializeJsonLd, type Node } from '../../lib/structuredData'

interface Props {
  nodes: Node[]
}

const json = serializeJsonLd(graph(Astro.props.nodes))
---

<script type="application/ld+json" set:html={json} />
```

In `src/layouts/BaseLayout.astro` add a `schema?: Node[]` prop (default `[]`), and these imports and frontmatter lines:

```astro
import portrait from '../assets/portraits/about.png'
import JsonLd from '../components/seo/JsonLd.astro'
import { disciplines } from '../content/disciplines'
import { person } from '../content/person'
import { personNode, websiteNode, type Node } from '../lib/structuredData'
```
```astro
const siteNodes = [personNode(person, disciplines.map((discipline) => discipline.title), new URL(portrait.src, Astro.site).href), websiteNode()]
```

and, just before `<slot name="head" />`:

```astro
    <JsonLd nodes={[...siteNodes, ...schema]} />
```

- [ ] **Step 4: Pass each page's nodes**

Add a `schema` attribute to each page's `<BaseLayout>`, importing the builders it uses from `src/lib/structuredData`. Use each page's existing title for `name`.

| Page | `schema={[...]}` |
|---|---|
| `index.astro` | `webPageNode('WebPage', '/', 'UX/UI Engineer, SEO Specialist & AI Workflow Developer', { about: { '@id': PERSON_ID } })` |
| `about.astro` | `webPageNode('ProfilePage', '/about', 'About Mathew Brown: UX/UI Engineer & SEO Specialist', { mainEntity: { '@id': PERSON_ID } })` |
| `services.astro` | `webPageNode('WebPage', '/services', 'UX/UI Engineering, SEO & AI Workflow Services')`, `servicesNode(disciplines)` |
| `work/index.astro` | `webPageNode('CollectionPage', '/work', 'UX/UI Engineering & SEO Case Studies')`, `workListNode(rows.map((row) => row.entry))` |
| `work/[slug].astro` | `caseStudyNode(entry)`, `breadcrumbNode('/work/' + entry.id, [{ name: 'Work', path: '/work' }, { name: entry.data.title, path: '/work/' + entry.id }])` |
| `contact/index.astro` | `webPageNode('ContactPage', '/contact', 'Hire a UX/UI Engineer & SEO Specialist')` |
| `blog/index.astro` | `blogNode('Articles on UX/UI engineering, SEO and AEO, agentic workflows, brand development and SaaS development by Mathew Brown.')` |
| `blog/[topic]/index.astro` | `webPageNode('CollectionPage', '/blog/' + topic.id, topic.data.headline)`, `breadcrumbNode('/blog/' + topic.id, [{ name: 'Blog', path: '/blog' }, { name: topic.data.title, path: '/blog/' + topic.id }])` |
| `blog/[topic]/[article].astro` | `articleNode(article, topic.data.title)`, `breadcrumbNode('/blog/' + article.id, [{ name: 'Blog', path: '/blog' }, { name: topic.data.title, path: '/blog/' + topic.id }, { name: article.data.title, path: '/blog/' + article.id }])` |

The 404 and the thanks page pass nothing and get the two site-wide nodes.

- [ ] **Step 5: Verify and commit**

Run: `npm run build && npx vitest run && npm run typecheck`
Run:
```bash
for f in dist/index.html dist/about/index.html dist/services/index.html dist/work/index.html dist/work/vamp-network/index.html dist/contact/index.html dist/blog/index.html dist/blog/ux-ui-design/index.html dist/blog/ux-ui-design/button-states-that-convert/index.html dist/404.html; do
  node -e "const h=require('fs').readFileSync('$f','utf8');const m=[...h.matchAll(/<script type=\"application\/ld\+json\">(.*?)<\/script>/g)];const g=JSON.parse(m[0][1])['@graph'];console.log('$f', m.length, g.map(n=>n['@type']).join(', '))"
done
```
Expected: one block per page; every line starts `Person, WebSite`; then the page's own types (for the article: `BlogPosting, BreadcrumbList`). Put the output in the report. Check that `grep -o 'Result pending' dist/work/*/index.html` matches only visible page text, never inside the JSON-LD block.

```bash
git add src/lib/structuredData.ts src/lib/structuredData.test.ts src/components/seo/JsonLd.astro src/layouts/BaseLayout.astro src/pages
git commit -F - <<'EOF'
feat: add structured data for the person, the site and each page type

<trailer lines>
EOF
```

---

### Task 8: `robots.txt`, `llms.txt` and RSS

**Files:**
- Modify: `package.json`, `package-lock.json` (`@astrojs/rss`)
- Create: `src/lib/llmsTxt.ts`, `src/lib/llmsTxt.test.ts`
- Create: `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`, `src/pages/rss.xml.ts`
- Modify: `src/layouts/BaseLayout.astro`, `src/components/blog/TopicIndex.astro`

**Interfaces:**
- Consumes: `person`; `Discipline`; `pageUrl` from `./structuredData`; `sortArticles`, `articleHref` from `./blog`.
- Produces: `robotsTxt(): string`; `llmsTxt(input: { person: Person; disciplines: Discipline[]; caseStudies: { id: string; data: { title: string; summary: string } }[]; articles: { id: string; data: { title: string; description: string; date: Date } }[] }): string`.

- [ ] **Step 1: Write the failing test**

`src/lib/llmsTxt.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { person } from '../content/person'
import { llmsTxt, robotsTxt } from './llmsTxt'

const disciplines = [{ number: '02', slug: 'seo-aeo', title: 'SEO/AEO', blurb: 'I fix the technical foundations.', deliverables: [], cta: '', skills: [] }]
const caseStudies = [{ id: 'aiwi-waffles', data: { title: "'Aiwi Waffles", summary: 'A brand and a storefront that ranks #1 locally.' } }]
const articles = [
  { id: 'ux-ui-design/older', data: { title: 'Older', description: 'First.', date: new Date('2026-01-01') } },
  { id: 'ux-ui-design/newer', data: { title: 'Newer [draft]', description: 'Second\nline.', date: new Date('2026-05-31') } },
]

describe('robotsTxt', () => {
  it('allows every crawler and points at the sitemap', () => {
    expect(robotsTxt()).toBe('User-agent: *\nAllow: /\n\nSitemap: https://matbrown.io/sitemap-index.xml\n')
  })
})

describe('llmsTxt', () => {
  const text = llmsTxt({ person, disciplines, caseStudies, articles })

  it('opens with the name and a summary in a quote block', () => {
    expect(text.startsWith("# Mathew Brown\n\n> I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer. I'm based on O'ahu, Hawai'i, and work with most clients remotely.\n")).toBe(true)
  })

  it('lists the services with their section links', () => {
    expect(text).toContain('## Services\n\n- [SEO/AEO](https://matbrown.io/services/#seo-aeo): I fix the technical foundations.\n')
  })

  it('lists the case studies with their summaries', () => {
    expect(text).toContain("## Case studies\n\n- ['Aiwi Waffles](https://matbrown.io/work/aiwi-waffles/): A brand and a storefront that ranks #1 locally.\n")
  })

  it('lists the articles newest first, on one line each, with brackets in a title escaped', () => {
    expect(text).toContain(
      '## Articles\n\n- [Newer \\[draft\\]](https://matbrown.io/blog/ux-ui-design/newer/): Second line.\n- [Older](https://matbrown.io/blog/ux-ui-design/older/): First.\n',
    )
  })

  it('ends with how to get in touch', () => {
    expect(text.endsWith('## Contact\n\n- [Start a project](https://matbrown.io/contact/): The enquiry form.\n- [Email](mailto:mat@matbrown.io): mat@matbrown.io\n')).toBe(true)
  })

  it('leaves out a section that would be empty', () => {
    expect(llmsTxt({ person, disciplines, caseStudies, articles: [] })).not.toContain('## Articles')
  })

  it('has no em or en dash', () => {
    expect(text).not.toMatch(/[\u2013\u2014]/)
  })
})
```

- [ ] **Step 2: Run it, watch it fail, then implement**

Run: `npx vitest run src/lib/llmsTxt.test.ts`
Expected: FAIL, `./llmsTxt` cannot be resolved.

`src/lib/llmsTxt.ts`
```ts
import type { Discipline } from '../content/disciplines'
import type { Person } from '../content/person'
import { articleHref, sortArticles } from './blog'
import { pageUrl, SITE } from './structuredData'

/** robots.txt: every crawler is welcome, AI assistants included, and the sitemap is named. */
export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap-index.xml\n`
}

/** Text for a Markdown link label or a list line: one line, with square brackets escaped. */
const inline = (text: string) => text.replace(/\s+/g, ' ').trim().replace(/([[\]])/g, '\\$1')

const item = (label: string, href: string, note: string) => `- [${inline(label)}](${href}): ${inline(note)}\n`

const section = (heading: string, lines: string[]) => (lines.length > 0 ? `\n## ${heading}\n\n${lines.join('')}` : '')

/**
 * llms.txt: a plain summary of the site for AI assistants, in the llms.txt convention. Every line
 * comes from content the site already shows.
 */
export function llmsTxt(input: {
  person: Person
  disciplines: Discipline[]
  caseStudies: { id: string; data: { title: string; summary: string } }[]
  articles: { id: string; data: { title: string; description: string; date: Date } }[]
}): string {
  const { person, disciplines, caseStudies, articles } = input
  const where = `I'm based on ${person.location.locality}, ${person.location.region}, and work with most clients remotely.`
  return (
    `# ${person.name}\n\n> ${person.description} ${where}\n` +
    section('Services', disciplines.map((discipline) => item(discipline.title, pageUrl(`/services#${discipline.slug}`), discipline.blurb))) +
    section('Case studies', caseStudies.map((study) => item(study.data.title, pageUrl(`/work/${study.id}`), study.data.summary))) +
    section('Articles', sortArticles(articles).map((article) => item(article.data.title, pageUrl(articleHref(article.id)), article.data.description))) +
    section('Contact', [item('Start a project', pageUrl('/contact'), 'The enquiry form.'), item('Email', `mailto:${person.email}`, person.email)])
  )
}
```

Run: `npx vitest run src/lib/llmsTxt.test.ts && npm run typecheck`
Expected: PASS, 0 errors.

- [ ] **Step 3: The endpoints**

Run: `npm install @astrojs/rss`

`src/pages/robots.txt.ts`
```ts
import type { APIRoute } from 'astro'
import { robotsTxt } from '../lib/llmsTxt'

export const GET: APIRoute = () => new Response(robotsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
```

`src/pages/llms.txt.ts`
```ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { disciplines } from '../content/disciplines'
import { person } from '../content/person'
import { sortCaseStudies } from '../lib/caseStudies'
import { llmsTxt } from '../lib/llmsTxt'

export const GET: APIRoute = async () =>
  new Response(
    llmsTxt({ person, disciplines, caseStudies: sortCaseStudies(await getCollection('caseStudies')), articles: await getCollection('blogArticles') }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
```

`src/pages/rss.xml.ts`
```ts
import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { articleHref, sortArticles } from '../lib/blog'

export const GET: APIRoute = async (context) =>
  rss({
    title: 'Mathew Brown: articles',
    description: 'Articles on UX/UI engineering, SEO and AEO, agentic workflows, brand development and SaaS development by Mathew Brown.',
    site: context.site!,
    items: sortArticles(await getCollection('blogArticles')).map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.date,
      link: `${articleHref(article.id)}/`,
    })),
  })
```

- [ ] **Step 4: Link the feed**

In the head of `src/layouts/BaseLayout.astro`, after the manifest link:

```astro
    <link rel="alternate" type="application/rss+xml" title="Mathew Brown: articles" href="/rss.xml" />
```

In `src/components/blog/TopicIndex.astro`, after the `<div class="mt-10 border-t-[3px] border-ink">...</div>` that holds the groups, and inside the same max-width container:

```astro
    <p class="mt-8">
      <a href="/rss.xml" class="type-label underline-offset-8 decoration-vermilion decoration-2 hover:underline focus-visible:underline">RSS feed <span aria-hidden="true">↗</span></a>
    </p>
```

- [ ] **Step 5: Verify and commit**

Run: `npm run build && npx vitest run && npm run typecheck`
Run: `cat dist/robots.txt; cat dist/llms.txt; head -c 900 dist/rss.xml; echo; perl -CSD -ne 'print "$ARGV:$.\n" if /[\x{2013}\x{2014}]/' dist/llms.txt dist/rss.xml dist/robots.txt`
Expected: the three files as designed; `llms.txt` lists five services, three case studies and one article; the RSS item link is `https://matbrown.io/blog/ux-ui-design/button-states-that-convert/`; the perl line prints nothing. Put the full `llms.txt` in the report. Look at `/blog` at 1440 and 390 to confirm the "RSS feed" link sits under the topic index without crowding the contact band (screenshot `.playwright-mcp/sp5-t8-rss-link-1440.png`).

```bash
git add package.json package-lock.json src/lib/llmsTxt.ts src/lib/llmsTxt.test.ts src/pages/robots.txt.ts src/pages/llms.txt.ts src/pages/rss.xml.ts src/layouts/BaseLayout.astro src/components/blog/TopicIndex.astro
git commit -F - <<'EOF'
feat: add robots.txt, llms.txt and an RSS feed, all built from the site's content

<trailer lines>
EOF
```

---

### Task 9: Cloudflare Web Analytics, off by default

**Files:**
- Create: `src/content/analytics.ts`, `src/lib/analytics.ts`, `src/lib/analytics.test.ts`
- Modify: `src/lib/contactForm.ts`, `src/lib/contactForm.test.ts`, `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `export const analytics: { cloudflareToken: string }`; `beacon(config: { cloudflareToken: string }, env: { context?: string }): { src: string; 'data-cf-beacon': string } | null`.

- [ ] **Step 1: Write the failing tests**

`src/lib/analytics.test.ts`
```ts
import { describe, expect, it } from 'vitest'
import { analytics } from '../content/analytics'
import { beacon } from './analytics'

describe('beacon', () => {
  it('is nothing while there is no token', () => {
    expect(beacon({ cloudflareToken: '' }, { context: 'production' })).toBeNull()
    expect(beacon({ cloudflareToken: '   ' }, { context: 'production' })).toBeNull()
  })

  it('is nothing outside a production deploy, so previews and local builds are not counted', () => {
    expect(beacon({ cloudflareToken: 'abc123' }, { context: 'deploy-preview' })).toBeNull()
    expect(beacon({ cloudflareToken: 'abc123' }, { context: 'branch-deploy' })).toBeNull()
    expect(beacon({ cloudflareToken: 'abc123' }, {})).toBeNull()
  })

  it('is the Cloudflare script with the token in a production deploy', () => {
    expect(beacon({ cloudflareToken: ' abc123 ' }, { context: 'production' })).toEqual({
      src: 'https://static.cloudflareinsights.com/beacon.min.js',
      'data-cf-beacon': '{"token":"abc123"}',
    })
  })
})

describe('analytics setting', () => {
  it('ships switched off', () => {
    expect(analytics).toEqual({ cloudflareToken: '' })
  })
})
```

In `src/lib/contactForm.test.ts`, add to the existing `afterEach`: `window.history.replaceState({}, '', '/')`. Then add these tests inside `describe('initContactForm', ...)`, after the test "shows the confirmation in place of the form and moves focus to it":

```ts
  it('after a successful send, moves the address to the thanks page so the enquiry is counted as a view', async () => {
    window.history.replaceState({}, '', '/contact')
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(window.location.pathname).toBe('/contact/thanks/')
    expect(ui.confirmation.hidden).toBe(false)
  })

  it('leaves the address alone when the send fails', async () => {
    window.history.replaceState({}, '', '/contact')
    const ui = mount()
    initContactForm(document, { search: '', send: vi.fn().mockResolvedValue({ ok: false, status: 500 }) })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(window.location.pathname).toBe('/contact')
  })

  it('posts to the page it was sent from, not to the thanks page', async () => {
    window.history.replaceState({}, '', '/contact')
    const ui = mount()
    const send = ok()
    initContactForm(document, { search: '', send })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(send.mock.calls[0][0]).toBe('/contact')
  })
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/lib/analytics.test.ts src/lib/contactForm.test.ts`
Expected: `analytics.test.ts` fails to resolve its imports; the first new contact form test fails with the pathname still `/contact`. The other two new tests pass already; that is fine, they pin behaviour the change must keep.

- [ ] **Step 3: Implement**

`src/content/analytics.ts`
```ts
/**
 * Cloudflare Web Analytics. Leave the token empty to keep analytics off: nothing is loaded and
 * nothing is sent. To switch it on, paste the site token from the Cloudflare dashboard here.
 */
export const analytics = { cloudflareToken: '' }
```

`src/lib/analytics.ts`
```ts
/**
 * The attributes of the Cloudflare Web Analytics script, or null when it must not be rendered:
 * no token, or a build that is not Netlify's production deploy (`context` is Netlify's CONTEXT).
 */
export function beacon(config: { cloudflareToken: string }, env: { context?: string }): { src: string; 'data-cf-beacon': string } | null {
  const token = config.cloudflareToken.trim()
  if (token === '' || env.context !== 'production') return null
  return { src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': JSON.stringify({ token }) }
}
```

In `src/lib/contactForm.ts`, in the success branch, after `form!.hidden = true` and before the `if (confirmation)` block:

```ts
      // Cloudflare Web Analytics counts page views only. Moving the address to the thanks page,
      // without a reload, is what lets an enquiry sent in place be counted as one.
      const thanks = form!.getAttribute('action')
      if (thanks && window.location.pathname !== thanks) window.history.pushState({}, '', thanks)
```

Update the function's doc comment to mention the address change in one clause.

- [ ] **Step 4: Render the beacon**

In `src/layouts/BaseLayout.astro` frontmatter:

```astro
import { analytics } from '../content/analytics'
import { beacon } from '../lib/analytics'
```
```astro
const cloudflare = beacon(analytics, { context: process.env.CONTEXT })
```

and at the end of `<body>`, after the existing closing `<script>`:

```astro
    {cloudflare && <script is:inline defer src={cloudflare.src} data-cf-beacon={cloudflare['data-cf-beacon']} />}
```

- [ ] **Step 5: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`
Run: `grep -c "cloudflareinsights" dist/index.html; CONTEXT=production npm run build >/dev/null && grep -c "cloudflareinsights" dist/index.html`
Expected: `0` both times (the token is empty). Then prove the switch works without committing it: set the token to `test-token` in `src/content/analytics.ts`, run `CONTEXT=production npm run build`, expect `grep -o 'data-cf-beacon="[^"]*"' dist/index.html` to print the token; run a plain `npm run build`, expect no match; set the token back to `''`, rebuild, and confirm `git diff --stat src/content/analytics.ts` is empty.

In the browser against a dev server: fill and send the contact form with the request intercepted to return 200; confirm the address bar reads `/contact/thanks/`, the confirmation panel is shown, focus is on its heading, and Back returns to `/contact` with the form visible. Intercept with a 500: the address stays `/contact`. Report what you saw.

```bash
git add src/content/analytics.ts src/lib/analytics.ts src/lib/analytics.test.ts src/lib/contactForm.ts src/lib/contactForm.test.ts src/layouts/BaseLayout.astro
git commit -F - <<'EOF'
feat: add Cloudflare Web Analytics behind an empty token and count in-place enquiries

<trailer lines>
EOF
```

---

### Task 10: The build check

**Files:**
- Create: `scripts/check-dist/rules.mjs`, `scripts/check-dist/rules.test.mjs`, `scripts/check-dist/run.mjs`
- Modify: `package.json` (`build` script)

**Interfaces:**
- Produces: `pageFacts(html: string, url: string): Facts`, `pageProblems(facts: Facts, site: { sitemap: Set<string>; files: Set<string> }): string[]`, `siteProblems(site: { pages: Facts[]; sitemap: Set<string>; files: Set<string>; links: { file: string; urls: string[] }[] }): string[]`, `linksIn(text: string): string[]`.

- [ ] **Step 1: Write the failing test**

`scripts/check-dist/rules.test.mjs`
```js
import { describe, expect, it } from 'vitest'
import { linksIn, pageFacts, pageProblems, siteProblems } from './rules.mjs'

const ld = (types) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': types.map((t) => ({ '@type': t })) })}</script>`

function page({ noindex = false, h1 = 1, canonical = 'https://matbrown.io/work/', image = 'https://matbrown.io/og/work.png', jsonLd = ld(['Person', 'WebSite']), body = 'Hello', title = 'Work', description = 'About work.' } = {}) {
  return (
    `<html><head><title>${title}</title><meta name="description" content="${description}">` +
    `<link rel="canonical" href="${canonical}">${noindex ? '<meta name="robots" content="noindex">' : ''}` +
    `<meta property="og:image" content="${image}">${jsonLd}<style>.a{content:"\u2014"}</style></head>` +
    `<body>${'<h1>T</h1>'.repeat(h1)}<p>${body}</p><script>var dash="\u2014"</script></body></html>`
  )
}

const url = 'https://matbrown.io/work/'
const site = { sitemap: new Set([url]), files: new Set(['/og/work.png']) }
const problems = (options, where = site) => pageProblems(pageFacts(page(options), url), where)

describe('pageFacts', () => {
  it('reads what the rules need from a page', () => {
    expect(pageFacts(page(), url)).toMatchObject({
      url,
      noindex: false,
      h1: 1,
      title: 'Work',
      description: 'About work.',
      canonical: url,
      image: 'https://matbrown.io/og/work.png',
    })
  })

  it('reads the text without scripts, styles or tags', () => {
    expect(pageFacts(page({ body: 'A <b>bold</b> word' }), url).text).toContain('A bold word')
    expect(pageFacts(page(), url).text).not.toContain('\u2014')
  })
})

describe('pageProblems', () => {
  it('passes a sound page', () => {
    expect(problems()).toEqual([])
  })

  it('catches a noindex page in the sitemap', () => {
    expect(problems({ noindex: true })).toEqual([`${url}: is noindex but is in the sitemap`])
  })

  it('catches an indexable page missing from the sitemap', () => {
    expect(problems({}, { ...site, sitemap: new Set() })).toEqual([`${url}: is indexable but is not in the sitemap`])
  })

  it('lets a noindex page stay out of the sitemap, whatever its canonical', () => {
    expect(problems({ noindex: true, canonical: 'https://matbrown.io/elsewhere/' }, { ...site, sitemap: new Set() })).toEqual([])
  })

  it('catches a wrong heading count, canonical, title or description', () => {
    expect(problems({ h1: 2 })).toEqual([`${url}: has 2 h1 elements, expected 1`])
    expect(problems({ h1: 0 })).toEqual([`${url}: has 0 h1 elements, expected 1`])
    expect(problems({ canonical: 'https://matbrown.io/work' })).toEqual([`${url}: canonical is https://matbrown.io/work`])
    expect(problems({ title: '' })).toEqual([`${url}: has no title`])
    expect(problems({ description: '' })).toEqual([`${url}: has no description`])
  })

  it('catches a share image that is missing or was not built', () => {
    expect(problems({ image: 'https://matbrown.io/og/missing.png' })).toEqual([`${url}: share image /og/missing.png was not built`])
    expect(pageProblems(pageFacts(page().replace(/<meta property="og:image"[^>]*>/, ''), url), site)).toEqual([`${url}: has no share image`])
  })

  it('catches structured data that is broken or lacks the site-wide nodes', () => {
    expect(problems({ jsonLd: '<script type="application/ld+json">{not json</script>' })).toEqual([`${url}: structured data does not parse`])
    expect(problems({ jsonLd: ld(['Person']) })).toEqual([`${url}: structured data lacks WebSite`])
    expect(problems({ jsonLd: '' })).toEqual([`${url}: has no structured data`])
  })

  it('catches an em or en dash in the visible text', () => {
    expect(problems({ body: 'One \u2014 two' })).toEqual([`${url}: has an em or en dash in its text`])
    expect(problems({ body: '2018\u20132026' })).toEqual([`${url}: has an em or en dash in its text`])
  })
})

describe('linksIn', () => {
  it('finds the site links in a text or XML file', () => {
    expect(linksIn('- [A](https://matbrown.io/a/): x\n<link>https://matbrown.io/b/</link> mailto:mat@matbrown.io https://example.com/c')).toEqual([
      'https://matbrown.io/a/',
      'https://matbrown.io/b/',
    ])
  })
})

describe('siteProblems', () => {
  const required = ['/robots.txt', '/llms.txt', '/rss.xml', '/favicon.svg', '/favicon.ico', '/site.webmanifest', '/og/work.png']
  const base = { pages: [pageFacts(page(), url)], sitemap: new Set([url]), files: new Set(required), links: [] }

  it('passes a sound site', () => {
    expect(siteProblems(base)).toEqual([])
  })

  it('catches a missing file', () => {
    expect(siteProblems({ ...base, files: new Set(required.filter((f) => f !== '/llms.txt')) })).toEqual(['/llms.txt was not built'])
  })

  it('catches a sitemap entry with no page', () => {
    expect(siteProblems({ ...base, sitemap: new Set([url, 'https://matbrown.io/gone/']) })).toEqual(['https://matbrown.io/gone/: is in the sitemap but was not built'])
  })

  it('catches a link in llms.txt or the feed that goes nowhere', () => {
    expect(siteProblems({ ...base, links: [{ file: '/llms.txt', urls: [url, 'https://matbrown.io/services/#seo-aeo', 'https://matbrown.io/nope/'] }] })).toEqual([
      '/llms.txt: links to https://matbrown.io/services/, which was not built',
      '/llms.txt: links to https://matbrown.io/nope/, which was not built',
    ])
  })

  it('reports page problems too', () => {
    expect(siteProblems({ ...base, pages: [pageFacts(page({ h1: 2 }), url)] })).toEqual([`${url}: has 2 h1 elements, expected 1`])
  })
})
```

- [ ] **Step 2: Run it, watch it fail, then implement**

Run: `npx vitest run scripts/check-dist/rules.test.mjs`
Expected: FAIL, `./rules.mjs` cannot be resolved.

`scripts/check-dist/rules.mjs`
```js
const SITE = 'https://matbrown.io'
/** Files every build must produce besides its pages. */
const REQUIRED = ['/robots.txt', '/llms.txt', '/rss.xml', '/favicon.svg', '/favicon.ico', '/site.webmanifest']
const SITE_WIDE = ['Person', 'WebSite']

const attr = (html, pattern) => pattern.exec(html)?.[1] ?? ''

/** What the rules need to know about one built page. */
export function pageFacts(html, url) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, '')
  return {
    url,
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
    h1: (html.match(/<h1[\s>]/g) ?? []).length,
    title: attr(html, /<title>([^<]*)<\/title>/).trim(),
    description: attr(html, /<meta name="description" content="([^"]*)"/).trim(),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    image: attr(html, /<meta property="og:image" content="([^"]*)"/),
    jsonLd: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]),
    text,
  }
}

function structuredDataProblem(blocks) {
  if (blocks.length === 0) return 'has no structured data'
  const types = []
  for (const block of blocks) {
    try {
      const data = JSON.parse(block)
      for (const node of data['@graph'] ?? [data]) types.push(node['@type'])
    } catch {
      return 'structured data does not parse'
    }
  }
  const missing = SITE_WIDE.find((type) => !types.includes(type))
  return missing ? `structured data lacks ${missing}` : null
}

/** The rules one page must meet. Returns a line per broken rule. */
export function pageProblems(facts, site) {
  const problems = []
  const say = (message) => problems.push(`${facts.url}: ${message}`)
  const listed = site.sitemap.has(facts.url)

  if (facts.noindex && listed) say('is noindex but is in the sitemap')
  if (!facts.noindex && !listed) say('is indexable but is not in the sitemap')

  if (!facts.noindex) {
    if (facts.h1 !== 1) say(`has ${facts.h1} h1 elements, expected 1`)
    if (facts.title === '') say('has no title')
    if (facts.description === '') say('has no description')
    if (facts.canonical !== facts.url) say(`canonical is ${facts.canonical}`)
  }

  if (facts.image === '') say('has no share image')
  else if (!site.files.has(new URL(facts.image).pathname)) say(`share image ${new URL(facts.image).pathname} was not built`)

  const data = structuredDataProblem(facts.jsonLd)
  if (data) say(data)

  if (/[\u2013\u2014]/.test(facts.text)) say('has an em or en dash in its text')
  return problems
}

/** The site's own page links in a text or XML file. */
export function linksIn(text) {
  return [...text.matchAll(/https:\/\/matbrown\.io\/[^\s)<"']*/g)].map((match) => match[0])
}

/** Every rule, over the whole build. Returns a line per broken rule; empty means the build is sound. */
export function siteProblems(site) {
  const problems = []
  for (const file of REQUIRED) if (!site.files.has(file)) problems.push(`${file} was not built`)

  const built = new Set(site.pages.map((page) => page.url))
  for (const url of site.sitemap) if (!built.has(url)) problems.push(`${url}: is in the sitemap but was not built`)

  for (const { file, urls } of site.links) {
    for (const url of urls) {
      const page = url.split('#')[0]
      if (!built.has(page) && !site.files.has(new URL(page).pathname)) problems.push(`${file}: links to ${page}, which was not built`)
    }
  }

  for (const page of site.pages) problems.push(...pageProblems(page, site))
  return problems
}

export { SITE }
```

Run: `npx vitest run scripts/check-dist/rules.test.mjs`
Expected: PASS.

- [ ] **Step 3: The runner**

`scripts/check-dist/run.mjs`
```js
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { linksIn, pageFacts, SITE, siteProblems } from './rules.mjs'

const DIST = 'dist'

if (!existsSync(DIST)) {
  console.error('check-dist: there is no dist folder. Run astro build first.')
  process.exit(1)
}

/** Every file under dist, as a URL path. */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => (item.isDirectory() ? walk(join(dir, item.name)) : [join(dir, item.name)]))
}

const paths = walk(DIST).map((file) => '/' + relative(DIST, file).split(sep).join('/'))
const read = (path) => readFileSync(join(DIST, path), 'utf8')

// A page is an index.html (its URL is its folder) or the 404.
const pages = paths
  .filter((path) => path.endsWith('.html'))
  .map((path) => pageFacts(read(path), SITE + (path.endsWith('/index.html') ? path.slice(0, -'index.html'.length) : path)))

const sitemapFiles = paths.filter((path) => /^\/sitemap-\d+\.xml$/.test(path))
const sitemap = new Set(sitemapFiles.flatMap((path) => [...read(path).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])))

const links = ['/llms.txt', '/rss.xml'].filter((path) => paths.includes(path)).map((path) => ({ file: path, urls: linksIn(read(path)) }))

const problems = siteProblems({ pages, sitemap, files: new Set(paths), links })

if (problems.length > 0) {
  console.error(`check-dist: ${problems.length} problem${problems.length === 1 ? '' : 's'} in the build:\n` + problems.map((line) => `  - ${line}`).join('\n'))
  process.exit(1)
}
console.log(`check-dist: ${pages.length} pages, ${sitemap.size} in the sitemap, no problems.`)
```

In `package.json` change `"build": "astro build"` to `"build": "astro build && node scripts/check-dist/run.mjs"`.

- [ ] **Step 4: Run it on the real build, and prove it fails when it should**

Run: `npm run build`
Expected: ends with `check-dist: 21 pages, 11 in the sitemap, no problems.` (the 404, the thanks page and the eight empty topics are `noindex`, so they are checked for a share image, structured data and dashes but not for the indexable rules). If it reports a problem, the problem is real until shown otherwise: fix the page, not the rule, and say what you found.

Then prove it fails when it should, undoing each change straight after:

1. Add an em dash to a paragraph in `src/components/about/AboutBio.astro`, run `npm run build; echo "exit $?"`. Expected: `exit 1` and a line naming `https://matbrown.io/about/` and the dash.
2. Add a second `<h1>x</h1>` inside the `<BaseLayout>` of `src/pages/services.astro`, build. Expected: `exit 1` and "has 2 h1 elements, expected 1" for `/services/`.
3. Delete the `noindex` attribute from `src/pages/contact/thanks.astro`, build. Expected: `exit 1` and "is indexable but is not in the sitemap" for `/contact/thanks/` (the sitemap filter still leaves it out, which is exactly the disagreement this check exists to catch).

Put each output in the report, then run `git diff --stat` and confirm only this task's files differ.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-dist package.json
git commit -F - <<'EOF'
feat: fail the build when a page breaks a search rule

<trailer lines>
EOF
```

---

### Task 11: Indexing hold, local audit and docs

**Files:**
- Modify: `netlify.toml`, `MEMORY.md`, `CLAUDE.md`, `DESIGN.md`
- Create: `docs/superpowers/audits/2026-10-13-launch-audit.md`

- [ ] **Step 1: Hold indexing on Netlify addresses**

Append to `netlify.toml`:

```toml

# Until matbrown.io points here, keep search engines off the Netlify address: the canonical links
# name matbrown.io, which is still a parking page. Remove this block on the day the domain moves.
[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "noindex"
```

- [ ] **Step 2: Local audit**

Build and serve the site locally (`npm run build`, then `python3 -m http.server 4488 --directory dist --bind 127.0.0.1`, stopped by its own PID afterwards). On these eleven pages: `/`, `/work/`, `/work/vamp-network/`, `/services/`, `/about/`, `/contact/`, `/blog/`, `/blog/ux-ui-design/`, `/blog/ux-ui-design/button-states-that-convert/`, `/blog/technical-seo/`, `/404.html`:

- Lighthouse SEO, accessibility and best practices, phone and desktop presets, with the installed Chrome: `npx lighthouse <url> --only-categories=seo,accessibility,best-practices --chrome-flags="--headless=new" --output=json --output-path=<file> --quiet` (add `--preset=desktop` for desktop). Performance is measured on the Netlify preview in Task 13, not on a local file server.
- An axe scan: run `npm install --no-save axe-core` (it changes `node_modules` only; confirm `git status --short` shows no change to `package.json` or the lockfile), then with a `playwright-core` script (see the browser how-to) load each page, add the script with `page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' })`, run `await page.evaluate(() => axe.run())`, and record each violation's id, impact, and the number of nodes.

Write `docs/superpowers/audits/2026-10-13-launch-audit.md` with a "Local build" section: one table of scores per page and preset, the axe violations by page and impact, and for each finding either "fixed in <commit>" or "left for the owner: <why>". Fix what falls short of the bar (SEO 100, accessibility 100, best practices 100, no serious or critical axe violation) in this task, test-first where the fix is in source. Two findings are already decided and are recorded, not fixed: the prose link underline contrast, and anything that needs new copy. The `X-Robots-Tag` header is not served by the local server, so SEO is measured without it.

- [ ] **Step 3: Docs**

- `MEMORY.md`: roadmap row 5 becomes "Built; live on the Netlify address after Task 15" with the spec path. Add "What sub-project 5 added" (share cards and how to change card text; the favicon generator; `person.ts`; structured data and how a new page type gets its node; `robots.txt`, `llms.txt`, RSS; analytics and how to switch it on; the build check and its rules; the indexing hold). Add gotchas met during the build. Add a "Domain day" checklist: point the domain at Netlify; delete the `X-Robots-Tag` block from `netlify.toml`; confirm the Netlify address redirects to the domain; set up Google Search Console and Bing Webmaster Tools and submit `https://matbrown.io/sitemap-index.xml`; paste the Cloudflare token into `src/content/analytics.ts`; re-run LinkedIn's Post Inspector on the home page.
- `CLAUDE.md`: section 3 gains the rules a future change must keep (every page gets its card from `shareCards`; structured data states only what the page shows; `npm run build` runs the check and what it enforces). Section 5 gains `person.ts` and `analytics.ts` as single sources.
- `DESIGN.md`: the share card and the favicon, as built.

- [ ] **Step 4: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`
Run: `perl -CSD -ne 'print "$ARGV:$.\n" if /[\x{2013}\x{2014}]/' docs/superpowers/audits/2026-10-13-launch-audit.md CLAUDE.md DESIGN.md` (no line you added may appear).

```bash
git add netlify.toml docs/superpowers/audits/2026-10-13-launch-audit.md MEMORY.md CLAUDE.md DESIGN.md
git commit -F - <<'EOF'
chore: hold indexing on Netlify addresses, record the local audit and update the docs

<trailer lines>
EOF
```

---

## Launch

Tasks 12 to 16 are run by the controller, not dispatched as build tasks, because each has a step that reaches outside this repository. The whole-branch review of Tasks 1 to 11 happens before Task 12.

### Task 12: Open the pull request (owner's go required)

- [ ] **Step 1:** Ask the owner for the go to push, open the pull request and close #1.
- [ ] **Step 2:** `git push origin feat/astro-rebuild`
- [ ] **Step 3:** `gh pr create --base main --head feat/astro-rebuild --title "Rebuild the site in Astro" --body-file <file>` where the body summarises the five sub-projects, links the five specs, lists what is still owed by the owner, and ends with the attribution line.
- [ ] **Step 4:** `gh pr close 1 --comment "Superseded by the Astro rebuild in #<n>."` The branch `feat/services-offer-seo` is left in place.
- [ ] **Step 5:** Wait for Netlify's deploy preview (`gh pr checks <n> --watch`), read its address from the pull request's checks, and confirm the build log ends with the `check-dist` line.

### Task 13: Audit the preview and fix to the bar

**Files:** whatever the findings need; `docs/superpowers/audits/2026-10-13-launch-audit.md`.

- [ ] **Step 1: Performance.** Lighthouse performance, phone and desktop, on the nine pages in the spec, against the preview address, three runs each, taking the median. Bar: 90 or above on phone.
- [ ] **Step 2: Accessibility and best practices** on the preview, same pages. Bar: 100 and 100. (Lighthouse's SEO category will report the page as blocked from indexing on a Netlify address; that is the hold from Task 11 and is expected. SEO was measured locally.)
- [ ] **Step 3: Trailing slashes.** `curl -sI <preview>/work` and `<preview>/blog/ux-ui-design`. If either answers 301 or 308, add the trailing slash to internal links: the hrefs built in `src/lib/blog.ts` (`topicHref`, `articleHref`), `src/lib/caseStudies.ts` (`workRows`), `src/lib/serviceSections.ts` and `src/content/navigation.ts`, each test-first, and `isCurrent` must still match. If they answer 200, change nothing and record it.
- [ ] **Step 4: Behaviour by script** on the preview: reduced motion (no element animates, none stays hidden), JavaScript off (every page complete, the contact form posts and lands on the thanks page), keyboard order and a visible focus ring on every interactive element of each page type.
- [ ] **Step 5: Safari and Firefox on this Mac.** Open the preview in each (`open -a Safari <url>`, `open -a Firefox <url>` if installed) and check, by screenshot through the system or by asking the owner to look: the three portrait blocks' colour, the header's hide and return, the contact form, the article page. Record plainly which of these were looked at by whom, and which were not run.
- [ ] **Step 6: Fix what falls short,** each fix test-first where it touches source, each pushed so the preview rebuilds; re-measure the page that failed. Record every result and every finding left for the owner in the audit document's "Netlify preview" section.

### Task 14: Owner review and merge (owner's go required)

- [ ] **Step 1:** Give the owner the preview address, the audit summary and the list of what is owed, and ask them to look.
- [ ] **Step 2:** Apply any change they ask for through the normal loop (brief, implement, review).
- [ ] **Step 3:** On their go: `gh pr merge <n> --merge`. Do not delete `feat/astro-rebuild`.
- [ ] **Step 4:** Wait for Netlify's production deploy and read the site's Netlify address from `gh` or the deploy log.

### Task 15: Check the live address

- [ ] **Step 1:** Every page type answers 200; `/robots.txt`, `/llms.txt`, `/rss.xml`, `/sitemap-index.xml`, `/favicon.ico` and one `/og/*.png` answer 200 with the right content type; a made-up path answers the 404 page with status 404; `curl -sI` shows `X-Robots-Tag: noindex`.
- [ ] **Step 2:** Ask the owner to switch on Netlify Forms and its notification email, then send one real enquiry through the form and ask them to confirm it arrived.
- [ ] **Step 3:** Share cards: the general preview at `https://www.opengraph.xyz/url/<encoded address>` for Home, a case study and the article. LinkedIn's Post Inspector needs the owner's login: give them the three links to paste. Structured data: the Schema.org validator (`https://validator.schema.org/#url=<address>`) for Home, a case study and the article; Google's Rich Results Test cannot fetch a `noindex` address reliably, so it is on the domain-day list.
- [ ] **Step 4:** Record all of it in the audit document's "Live address" section.

### Task 16: Close out

- [ ] **Step 1:** Update `MEMORY.md` with the live Netlify address, the audit's final scores and what remains for the owner; confirm the domain-day checklist is complete and current.
- [ ] **Step 2:** Commit and push the docs to `main` through a small pull request, or directly if the owner prefers; ask which.
- [ ] **Step 3:** Report to the owner: what is live, every ruling made during the build, what was not checked, and the domain-day list.
