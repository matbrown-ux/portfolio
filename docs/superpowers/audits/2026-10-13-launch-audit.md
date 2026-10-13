# Launch audit, 2026-10-13

Sub-project 5, Task 11. Every number below was measured in this session against the built site (`npm run build`, then `python3 -m http.server 4488 --directory dist --bind 127.0.0.1`, stopped by its own PID afterwards). The server is a plain file server, so the `X-Robots-Tag` header from `netlify.toml` is not served and SEO is measured without it. Performance is not measured here; it is measured on the Netlify preview.

## Local build

### Lighthouse

Command per page and preset, with the installed Chrome (Lighthouse run through `npx`):

```
npx lighthouse http://127.0.0.1:4488<path> --only-categories=seo,accessibility,best-practices --chrome-flags="--headless=new" --output=json --output-path=<file> --quiet [--preset=desktop]
```

Scores are SEO / accessibility / best practices. The phone preset is Lighthouse's default.

| Page | Phone | Desktop |
|------|-------|---------|
| `/` | 100 / 100 / 100 | 100 / 100 / 100 |
| `/work/` | 100 / 100 / 100 | 100 / 100 / 100 |
| `/work/vamp-network/` | 100 / **96** / 100 | 100 / 100 / 100 |
| `/services/` | 100 / 100 / 100 | 100 / 100 / 100 |
| `/about/` | 100 / 100 / 100 | 100 / **96** / 100 |
| `/contact/` | 100 / 100 / 100 | 100 / 100 / 100 |
| `/blog/` | 100 / 100 / 100 | 100 / 100 / 100 |
| `/blog/ux-ui-design/` | 100 / 100 / 100 | 100 / 100 / 100 |
| `/blog/ux-ui-design/button-states-that-convert/` | 100 / 100 / 100 | 100 / 100 / 100 |
| `/blog/technical-seo/` | **66** / 100 / 100 | **66** / 100 / 100 |
| `/404.html` | **66** / 100 / 100 | **66** / 100 / 100 |

Failing audits:

- **SEO 66 on `/blog/technical-seo/` and `/404.html`:** the `is-crawlable` audit fails because both pages carry `<meta name="robots" content="noindex">`. That is the intended result. `/blog/technical-seo/` is a topic with no article, and `/404.html` is an error page; the build check requires `noindex` on both. Left as designed: the audit is correct and the pages are meant to fail it. Every other SEO audit passes on both.
- **Accessibility 96 on `/work/vamp-network/` (phone) and `/about/` (desktop):** the `color-contrast` audit. See the axe findings below, which are the same two elements.

### axe

axe-core (installed with `npm install --no-save axe-core`; `git status --short` afterwards showed no change to `package.json` or the lockfile), run with `playwright-core` on the installed Chrome, reduced motion on, at 1440x900 (desktop) and 412x915 (phone). All eleven pages at both sizes were scanned. Result: every page is clean except these three findings.

| Page and size | Rule | Impact | Nodes | Element |
|---------------|------|--------|-------|---------|
| `/about/`, desktop and phone | `color-contrast` | serious | 1 | the word "and" in the About bio heading (`#about-bio-heading > .text-vermilion`) |
| `/work/vamp-network/`, phone | `color-contrast` | serious | 3 (the report lists the first two selectors in full) | the vermilion step numbers "01", "02" and so on in the Walkthrough (`.cs-step` number, `aria-hidden`) |

There are no critical violations. Nothing else was reported, including `link-in-text-block`: axe does not flag the article link underline.

Lighthouse and axe agree on the same elements: vermilion `#f86343` display type on the ivory `#f4f0e6` ground, measured at 2.69:1 against the 3:1 asked of large text. The heading word is 58px Anton and the step numbers are 56px Anton.

## Findings

| Finding | Status |
|---------|--------|
| SEO 66 on the two `noindex` pages | By design. Nothing to fix. |
| Vermilion "and" in the About bio heading, 2.69:1 on ivory | Left for the owner: see below |
| Vermilion Walkthrough step numbers on Vamp Network, 2.69:1 on ivory | Left for the owner: see below |
| Article link underline is vermilion, 2.69:1 on ivory | Recorded, decided earlier (see sub-project 4 owner inputs). axe and Lighthouse do not flag it. |
| Any finding needing new copy | None found. |

No source file was changed by this audit, so no fix commit exists.

## Left for the owner

Both contrast findings are large vermilion display type on the ivory ground. Making them pass means taking them out of vermilion, which changes a section the owner approved and the single accent's use on ivory.

1. **About bio heading, the word "and" (`src/components/about/AboutBio.astro`).** Measured 2.69:1 (needs 3:1). Smallest fix: set the span to ink like the rest of the heading, or put the word on an ink or vermilion block. This changes the approved heading treatment, and the word is decorative emphasis, so the owner decides.
2. **Walkthrough step numbers (`src/components/case-study/Walkthrough.astro`).** Measured 2.69:1. The numbers are `aria-hidden` and decorative, but axe still scores them. Smallest fix: make the numbers ink (with the vermilion kept as a rule or block beside them), or set them on an ink ground where vermilion is allowed. This changes an approved section.
3. **Article link underline.** Already recorded in MEMORY.md under sub-project 4: an ink underline that turns vermilion on hover would pass.

Until one of the first two is decided, the bar (accessibility 100 and no serious axe violation) is not met on `/about/` (axe at both sizes, Lighthouse at desktop) and `/work/vamp-network/` (phone). It is met on the other nine pages at both sizes and presets, apart from the SEO score of the two `noindex` pages.

## NOT RUN

- Performance: measured on the Netlify preview, not here.
- The `X-Robots-Tag: noindex` header: the local file server does not serve `netlify.toml` headers. It is checked on the deployed preview.
- Safari, Firefox, a real phone and a real browser tab strip.
