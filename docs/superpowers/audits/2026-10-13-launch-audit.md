# Launch audit, 2026-10-13

Sub-project 5, Task 11. Every number below was measured in this session against the built site (`npm run build`, then `python3 -m http.server 4488 --directory dist --bind 127.0.0.1`, stopped by its own PID afterwards). The server is a plain file server, so the `X-Robots-Tag` header from `netlify.toml` is not served and SEO is measured without it. Performance is not measured here; it is measured on the Netlify preview.

## Local build

### Lighthouse

Command per page and preset, with the installed Chrome (Lighthouse run through `npx`):

```
npx lighthouse http://127.0.0.1:4488<path> --only-categories=seo,accessibility,best-practices --chrome-flags="--headless=new" --output=json --output-path=<file> --quiet [--preset=desktop]
```

Scores are SEO / accessibility / best practices. The phone preset is Lighthouse's default. Lighthouse's accessibility score is taken at page load, before scroll reveals fire, so it can under-report contrast failures in elements that are still at their reveal start state. The axe scan below, taken with reveals settled, is the stronger evidence.

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
- **Accessibility 96 on `/work/vamp-network/` (phone) and `/about/` (desktop):** the `color-contrast` audit. These are two of the elements axe reports below. Lighthouse scored `/about/` 100 on phone and `/work/vamp-network/` 100 on desktop although axe flags the same elements there, which is why the settled axe scan is the evidence to trust.

### axe

axe-core (installed with `npm install --no-save axe-core`; `git status --short` afterwards showed no change to `package.json` or the lockfile), run with `playwright-core` on the installed Chrome at 1440x900 (desktop) and 412x915 (phone), on all eleven pages, in two settled states:

- **Reduced motion:** `reducedMotion: 'reduce'` in the browser context, so every reveal is at its end state and nothing animates.
- **Motion allowed:** the page scrolled top to bottom in 300px steps (150ms apart), then 2.5s for tweens to finish. Before `axe.run()` the script counted `[data-reveal]` elements with computed opacity below 1. The count was 0 on every page, both sizes, both states, so every scan counts.

Both states gave the same result on every page. All other pages are clean at both sizes. Violations, all `color-contrast`, impact serious, none critical:

| Page and size | Nodes | Element | Ratio | Computed size |
|---------------|-------|---------|-------|---------------|
| `/about/`, desktop | 1 | "and" in the bio heading, `#about-bio-heading > .text-vermilion` | 2.69:1 | 61.92px |
| `/about/`, phone | 1 | the same | 2.69:1 | 40px |
| `/work/vamp-network/`, phone | 3 | Walkthrough step numbers "01" and "02" (2 nodes) | 2.69:1 | 56px |
| `/work/vamp-network/`, phone | | the Outcome chapter's giant metric figure (`.-mb-[0.22em]`, 1 node) | 2.69:1 | 112px |

On `/work/vamp-network/` at desktop (1440) axe reports nothing; the step numbers there are 86.4px and the Outcome figure is positioned differently (it is absolutely placed from `xl`), and axe does not flag them. The reason was not investigated; they are the same vermilion on the same classes.

All violations are vermilion `#f86343` display type on ivory `#f4f0e6`, 2.69:1 against the 3:1 asked of large text.

## Findings

| Finding | Status |
|---------|--------|
| SEO 66 on the two `noindex` pages | By design. Nothing to fix. |
| Vermilion "and" in the About bio heading, 2.69:1 on ivory | Left for the owner: see below |
| Vermilion Walkthrough step numbers on Vamp Network (phone), 2.69:1 on ivory | Left for the owner: see below |
| Vermilion Outcome figure on Vamp Network (phone), 2.69:1 on ivory | Left for the owner: see below |
| Article link underline is vermilion, 2.69:1 on ivory | Recorded, decided earlier (see sub-project 4 owner inputs). axe and Lighthouse do not flag it. |
| Any finding needing new copy | None found. |

No source file was changed by this audit, so no fix commit exists.

## Left for the owner

The three contrast findings are large vermilion display type on the ivory ground. Making them pass means taking them out of vermilion, which changes a section the owner approved and the single accent's use on ivory.

1. **About bio heading, the word "and" (`src/components/about/AboutBio.astro:4`).** Measured 2.69:1 (needs 3:1). Smallest fix: set the span to ink like the rest of the heading, or put the word on an ink or vermilion block. This changes the approved heading treatment, and the word is decorative emphasis, so the owner decides.
2. **Walkthrough step numbers (`src/components/case-study/Walkthrough.astro:48`).** Measured 2.69:1. The numbers are `aria-hidden` and decorative, but axe still scores them. Smallest fix: make the numbers ink (with the vermilion kept as a rule or block beside them), or set them on an ink ground where vermilion is allowed. This changes an approved section.
3. **Outcome figure (`src/components/case-study/Outcome.astro:20`).** Measured 2.69:1 at 112px on phone, a decorative `aria-hidden` metric figure. Smallest fix: `text-ink` in place of `text-vermilion` on that element, or keep it vermilion only where it sits on ink. Approved section, so the owner decides.
4. **Article link underline.** Already recorded in MEMORY.md under sub-project 4: an ink underline that turns vermilion on hover would pass.

Until the first three are decided, the bar (accessibility 100 and no serious axe violation) is not met on `/about/` (both sizes) and `/work/vamp-network/` (phone). It is met on the other nine pages at both sizes, apart from the SEO score of the two `noindex` pages.

## NOT RUN

- Performance: measured on the Netlify preview, not here.
- The `X-Robots-Tag: noindex` header: the local file server does not serve `netlify.toml` headers. It is checked on the deployed preview.
- Safari, Firefox, a real phone and a real browser tab strip.
- The spec's JavaScript-off pass and keyboard-order pass: both belong to the preview audit and were not run locally.
- Share cards on the Netlify address: `og:image` addresses are built on `https://matbrown.io`, which is still a parking page, so a link-preview tool (LinkedIn's Post Inspector, for one) pointed at the Netlify address will show no image until the domain moves. That is not a failure of launch step 7. Until then, check a card by opening `/og/<path>.png` on the Netlify address directly.
