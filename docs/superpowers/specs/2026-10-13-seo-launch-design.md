# SEO/AEO layer and launch (Astro rebuild): Design

Date: 2026-10-13
Status: Draft, awaiting review
Scope: Sub-project 5 of the Astro rebuild, the last one.
Base: branch `feat/astro-rebuild` at `9c4fbd0`, after sub-project 4 (Blog).

Visual reference: [`assets/2026-10-13-share-card-favicon-approved.jpeg`](./assets/2026-10-13-share-card-favicon-approved.jpeg). This is the third revision of the share card, which the owner approved with "Perfect", and favicon F2. It fixes the card's composition. Exact sizes are tuned against the rendered PNGs.

## Purpose

Someone searching for, or asking an AI assistant about, a freelance UX/UI engineer or SEO specialist should be able to find the owner and get accurate facts about them. A shared link should look like the site. And the rebuilt site should be live, on a Netlify address, checked against a set bar, so that pointing `matbrown.io` at it is one DNS change the owner makes when they are ready.

## Context

Every page already has a title, description, canonical, Open Graph and Twitter tags, and the site has a sitemap. The site has no favicon, no `robots.txt`, no structured data, no RSS feed and no `llms.txt`. Only the three case studies have a share image, and those are PNGs rendered from the old dark design.

`netlify.toml` builds with `npm run build` and publishes `dist`. A Netlify site is linked to the GitHub repo: a merge to `main` deploys, and a pull request gets its own preview address. `main` still holds the old React app. `matbrown.io` currently answers with a registrar parking redirect to `/lander`, so the domain is not pointed at Netlify.

Earlier sub-projects left these owed: an automated check that `noindex` pages stay out of the sitemap, a performance, accessibility and reduced-motion audit, a real Netlify Forms submission, and checks in Safari, Firefox and on a phone.

## Decisions the owner made in the brainstorm

- **Where it ends:** live on a Netlify address. The domain switch is the owner's, afterwards.
- **Answer-engine depth:** structured data for what the site already says, plus `robots.txt`, `llms.txt` and RSS. No new visible copy and no questions section.
- **Share images:** one template filled in for every page at build time. A case study swaps to its real hero capture once that media exists.
- **Share card design:** type on ivory; the vermilion block runs the full height of the card on the right; the MB mark is large in the block's bottom right corner and bleeds a little off the right and bottom edges. (The owner rejected the mark centred in the block, and rejected it small in the top right corner.)
- **Favicon:** the ink MB mark on vermilion.
- **Share image rendering:** drawn in the build with the tools the project already has (`fontkit` for outlines, `sharp` for the PNG). No card-rendering library.
- **Audits:** set a bar and fix to it. Anything that needs the owner's decision is listed, not changed.
- **Analytics:** Cloudflare Web Analytics, which is cookieless and free. Off by default, switched on by one setting once the owner has a site token. No Google Analytics, no cookie banner.
- **The open pull request #1** ("Productized SEO/AEO Services offer", from the old app's `feat/services-offer-seo`): closed with a one-line note when the launch pull request opens. Its branch is left on GitHub.

## Goals

- A share image, a favicon and structured data on every page.
- `robots.txt`, `llms.txt` and `rss.xml`, all generated from the site's content.
- A build that fails when a page breaks one of the search rules.
- The site live on its Netlify address, audited to the bar, with a short written list of what is left for the day the domain moves.

## Non-goals

- Pointing `matbrown.io` at Netlify, and anything that needs the live domain: Google Search Console, Bing Webmaster Tools.
- New visible copy, a questions section, testimonials, pricing.
- Google Analytics, a consent banner, any cookie.
- Offline support. The web manifest only names the site and its icons.
- New case study media, new articles, and the owner decisions parked in sub-project 4 (the prose link underline, the repeated breadcrumb name, the copy items).

## Constraints

- Structured data and `llms.txt` state only what is visibly on the site. No invented fact, metric, rating, price or claim.
- Palette and typefaces are locked. The card and favicon use `ivory`, `ink` and `vermilion` only. Gloss And Bloom is not used on the card. The Anton and JetBrains Mono font packages are open licence and may be dependencies; the Gloss And Bloom files stay in the git-ignored `.fonts/` folder.
- All visible copy follows `CLAUDE.md` section 2. No em dashes.
- Every source change is test-first (tdd-kit). Logic lives in `.ts` or `.mjs` modules with tests, not in `.astro` frontmatter, endpoints' bodies or config.
- No merge to `main`, no close of pull request #1 and no change in the Netlify dashboard without the owner saying so at that step.
- Performance is part of the bar: nothing added here may load a web font, script or image on a page that does not need it.

## Part 1: Share images

### The card (1200 x 630)

| Element | Specification |
|---|---|
| Ground | Ivory, full card. |
| Block | Vermilion, 360 wide, full height, flush right. |
| Mark | The MB mark in ink, about 312 wide, in the block's bottom right corner, overhanging the card by about 16 on the right and 22 at the bottom, so the outer curve of the B and the feet of both letters are trimmed. It must still read as "MB". |
| Label | JetBrains Mono bold, uppercase, tracked, about 19 high, 60 from the left and top. Says what kind of page it is. |
| Title | Anton, uppercase, ink, line height 0.9, left edge at 60, last baseline ending about 144 above the bottom edge. Starts at 138 and steps down until its longest line is at most 732 wide (a 48 gap before the block) and it is at most two lines. |
| Rule | Ink, 96 wide and 3 high, 60 from the left, about 108 above the bottom edge. |
| Address | JetBrains Mono bold, uppercase, tracked, 60 from the left and bottom. |

The line limit was three in the first draft; it became two when the rendered cards were compared with the approved image, where every title sets on two lines.

**With a hero capture (case studies only):** the block widens to 552, the capture fills it inside a 3px ink frame inset 72 from the block's top and bottom and 54 from its sides (cropped to cover), there is no mark, and the title's widest line is 540. A case study gets this version when its `media.hero` has an image `src` (or a video with a `poster`); otherwise it gets the plain card.

### What each page's card says

| Page | Label | Title | Address |
|---|---|---|---|
| Home | Mathew Brown | UX/UI engineer & SEO specialist | matbrown.io |
| Work index | Work | UX/UI engineering & SEO case studies | matbrown.io / work |
| Case study | Case study / {year} | {title} | matbrown.io / work |
| Services | Services | UX/UI, SEO & AI workflow services | matbrown.io / services |
| About | About | Mathew Brown | matbrown.io / about |
| Contact | Contact | Start a project | matbrown.io / contact |
| Blog index | Blog | Articles on UX/UI, SEO & AI workflows | matbrown.io / blog |
| Blog topic | Blog topic / {discipline title} | {topic title} | matbrown.io / blog |
| Article | Article / {topic title} | {article title} | matbrown.io / blog |
| 404, contact thanks | (the Home card) | | |

### How they are made

- `src/pages/og/[...path].png.ts` is a static endpoint. Its paths come from one list of every page and its card text, so a new case study, topic or article gets a card with no other edit. Card URLs mirror page URLs: `/og/index.png`, `/og/work/vamp-network.png`, `/og/blog/ux-ui-design/button-states-that-convert.png`.
- The card is composed as an SVG string in which all text is already outlines (set with `fontkit` from the Anton and JetBrains Mono files in `@fontsource/anton` and `@fontsource/jetbrains-mono`), then rasterised with `sharp`. No text rendering is left to the build machine's installed fonts.
- `BaseLayout.astro` sets `og:image` and `twitter:image` on every page from the page's path, with `og:image:width`, `og:image:height`, and `og:image:alt` (the label and title). The `ogImage` prop, the `ogImage` frontmatter field on case studies, and `public/images/case-studies/*/og.png` are removed.

## Part 2: Favicon and manifest

- `public/favicon.svg`: a vermilion square with the ink MB mark, sized so the mark reads at 16px.
- `public/favicon.ico` (32px), `public/apple-touch-icon.png` (180px), `public/icon-192.png`, `public/icon-512.png`.
- `public/site.webmanifest`: name "Mathew Brown", short name "MB", the two PNG icons, `theme_color` vermilion and `background_color` ivory.
- The PNG and ICO files are generated from the SVG by `npm run favicons` (a script under `scripts/`, with its pure parts tested) and committed, as the script artwork is. `BaseLayout.astro` links all of them and sets `theme-color`.

## Part 3: Structured data

One `<script type="application/ld+json">` per page holding a `@graph`. Builders are pure functions; a small `JsonLd.astro` serialises the graph (escaping `<`).

**On every page**

- `Person`, `@id` `https://matbrown.io/#person`.
- `WebSite`, `@id` `https://matbrown.io/#website`, `name` "Mathew Brown", `url`, `publisher` and `author` the person, `inLanguage` "en".

**Person facts (for the owner to confirm)**

| Property | Value | Where the site states it |
|---|---|---|
| `name` | Mathew Brown | Throughout |
| `alternateName` | Mat Brown | The email address and domain |
| `jobTitle` | Freelance UX/UI Engineer, SEO/AEO Specialist and Agentic Workflow Developer | About, first paragraph |
| `description` | The About page's first sentence | About |
| `homeLocation` | O'ahu, Hawai'i, United States | About facts, Contact |
| `email` | mat@matbrown.io | Contact band on every page |
| `url` | https://matbrown.io | |
| `image` | The About portrait | About |
| `sameAs` | https://linkedin.com/in/matbrown, https://github.com/matbrown-ux | The old site's footer; added to the header as icons in this sub-project |
| `knowsAbout` | The five discipline titles | Services |

Because `sameAs` must point at things the site also shows, the header gains two icon links, LinkedIn and GitHub, immediately to the left of the "Start a project" button (the owner's instruction: icons, in the navbar, left of the button; not text links in the footer). Each is a 44px target in ink with an accessible name, and turns into an ink square with an ivory icon on hover and focus. Below the `md` breakpoint, where the bar holds only the logo and the menu button, the icons sit in the open menu beside the call to action. The icons are Phosphor Icons (MIT), copied into the repo. With the RSS link on the blog index, this is the only visible addition in this sub-project.

**Per page type**

| Page | Added to the graph |
|---|---|
| Home | `WebPage` with `about` the person. |
| About | `ProfilePage` with `mainEntity` the person. |
| Services | `ItemList` of five `Service` items: `name` (discipline title), `description` (its blurb), `url` (`/services#<slug>`), `provider` the person. |
| Work index | `CollectionPage` with an `ItemList` of the case studies. |
| Case study | `CreativeWork`: `name`, `headline`, `description` (summary), `dateCreated`, `creator` the person, `keywords` (tags), `url`, `image` (its share card). `BreadcrumbList`: Work, then the case study. |
| Contact | `ContactPage`. |
| Blog index | `Blog` with `author` the person. |
| Blog topic | `CollectionPage`. `BreadcrumbList`: Blog, then the topic. |
| Article | `BlogPosting`: `headline`, `description`, `datePublished`, `dateModified` (`updated`, else the date), `author` the person, `image` (its share card), `articleSection` (topic title), `mainEntityOfPage`, `isPartOf` the blog. `BreadcrumbList`: Blog, topic, article. |
| 404, contact thanks | Only the two site-wide nodes. |

No `result`, metric or rating is put in structured data: the case study results are placeholders until the owner supplies them.

## Part 4: Crawler and feed files

- **`/robots.txt`** (endpoint): `User-agent: *`, `Allow: /`, and `Sitemap: https://matbrown.io/sitemap-index.xml`. All crawlers are allowed, AI assistants included; being quoted by them is the point.
- **`/llms.txt`** (endpoint), in the llms.txt convention: an `# Mathew Brown` heading; a one-paragraph summary taken from the About page's first paragraph and location; then sections of links, each with a one-line description from existing content: Services (five), Case studies (each with its `summary`), Articles (each with its `description`), and Contact. Empty blog topics are left out.
- **`/rss.xml`** (endpoint, using `@astrojs/rss`): title "Mathew Brown: articles", the blog index description, one item per article, newest first, with title, description, link and date. Linked from every page's head with `rel="alternate"`, and by one small mono link, "RSS feed", at the end of the blog index's topic section.

## Part 5: Analytics

The owner chose Cloudflare Web Analytics. It needs a Cloudflare account and a site token; the domain does not have to be on Cloudflare.

- `src/content/analytics.ts` holds one setting: `{ cloudflareToken: '' }`.
- While the token is empty, nothing is rendered and nothing is sent.
- When set, `BaseLayout.astro` renders Cloudflare's beacon script with `defer` and the token, only in a production deploy (`CONTEXT` is `production` in Netlify's build), so previews and local builds are never counted.
- No cookie is set and no banner is shown.
- **Counting enquiries.** Cloudflare Web Analytics counts page views only; it has no custom goals. An enquiry is therefore read as a view of `/contact/thanks`. A form sent without JavaScript lands on that page already. A form sent in place does not change page today, so it would never be counted. To fix that, a successful in-place send also sets the address to `/contact/thanks/` with `history.pushState`, which the beacon records as a view. Nothing reloads and the confirmation panel is shown exactly as it is now; the visible differences are the address bar, and that the Back button returns to the form. `/contact/thanks` stays `noindex` and out of the sitemap.

## Part 6: The build check

`npm run build` becomes `astro build` followed by a check of `dist`. A failure stops the build, locally and on Netlify, and names the page and the rule.

For every HTML page in `dist`:

- A page with `noindex` is not in the sitemap, and every sitemap URL is a page without `noindex`. (This is the check owed from sub-project 4.)
- An indexable page has exactly one `h1`, a non-empty title and description, and a canonical equal to its own sitemap URL.
- Every page's `og:image` points at a PNG that exists in `dist`.
- Every `application/ld+json` block parses, and contains the Person and WebSite nodes.
- No page contains an em dash or en dash in its text.

And once: `robots.txt`, `llms.txt`, `rss.xml`, `favicon.svg` and `site.webmanifest` exist, and every link in `llms.txt` and `rss.xml` is a page in `dist`.

The rules are pure functions over parsed pages, with tests; a thin runner reads `dist`.

## Part 7: Launch

1. **Build** Parts 1 to 6 on `feat/astro-rebuild`, with the usual per-task and whole-branch reviews.
2. **Hold indexing.** Add an `X-Robots-Tag: noindex` header for all paths in `netlify.toml`. Canonicals point at `matbrown.io`, which is still a parking page, so without this the Netlify address could be indexed in its place. Removing the header is on the domain-day list.
3. **Open the pull request** into `main`, and close pull request #1 with the note "Superseded by the Astro rebuild in #<n>." Netlify builds a preview.
4. **Audit the preview** against the bar:
   - Lighthouse, phone and desktop, on nine pages (Home, Work, one case study, Services, About, Contact, Blog, one topic with an article, the article): accessibility 100, best practices 100, performance 90 or above on phone.
   - Lighthouse SEO at 100, run against a local `astro preview` with the indexing header left out, because Netlify addresses are deliberately not crawlable.
   - An automated axe scan of the same nine pages plus an empty topic and the 404: no serious or critical violation.
   - By browser script: reduced motion (nothing animates, nothing hidden), JavaScript off (every page complete, the form posts), keyboard order and focus on every page type.
   - Safari and Firefox on this Mac: the three portrait blocks, the header's hide and return, the contact form, the article page.
   - Links without a trailing slash: if Netlify answers them with a redirect, internal links gain the slash (through the link helpers in `src/lib` and `src/content/navigation.ts`, test-first) so no visitor or crawler takes an extra hop.
   - Fix what falls short. Record every result, and every finding left for the owner, in `docs/superpowers/audits/2026-10-13-launch-audit.md`.
5. **The owner looks at the preview.** Nothing merges until they say so.
6. **Merge to `main`.** Netlify deploys to its own address.
7. **Check the live address:** every page type loads; the build check passed in Netlify's log; one real contact form submission arrives (the owner switches on Netlify Forms and its notification first); share cards render in LinkedIn's Post Inspector and one general preview tool; structured data passes Google's Rich Results Test and the Schema.org validator for Home, a case study and the article.
8. **Docs:** `MEMORY.md`, `CLAUDE.md` and `DESIGN.md` updated, and a "Domain day" checklist written into `MEMORY.md`: point the domain at Netlify, remove the indexing header, confirm the Netlify address redirects to the domain, set up Google Search Console and Bing Webmaster Tools and submit the sitemap, switch on analytics by adding the Cloudflare token.

## Logic (all test-first)

| Module | Responsibility |
|---|---|
| `src/lib/shareCards.ts` | The list of every page with its card path, label, title and address; the `og:image` path for a page path. |
| `src/lib/cardText.ts` | Measure a string in a font, wrap a title into lines within a width, and step its size down to fit two lines. |
| `src/lib/cardSvg.ts` | Compose the card SVG from text outlines, the mark and an optional capture. |
| `src/lib/structuredData.ts` | The graph builders, one per page type. |
| `src/lib/llmsTxt.ts` | The `llms.txt` text from disciplines, case studies and articles. |
| `src/lib/analytics.ts` | Whether to render the beacon and with what attributes. The in-place address change after a send is added to `src/lib/contactForm.ts`, with tests. |
| `scripts/check-dist/` | The page rules, and the runner. |
| `scripts/favicons/` | Icon sizes and the ICO container; the generator. |

## Testing and verification

- Unit tests for every module above. `npm test`, `npm run typecheck` and `npm run build` (which now includes the check) clean.
- Card PNGs looked at for: the shortest and longest real titles, a three-line title, a deliberately long single word, and a case study with a temporary hero image (not committed).
- The favicon looked at in a real tab at 16px in Chrome and Safari, light and dark.
- The audit in Part 7, written up.

## Risks and mitigations

- **Rasterising on Netlify.** `sharp` is already used by Astro's image pipeline in the same build, and the card has no text for the rasteriser to set, so the build machine's fonts cannot change the result.
- **Reading font files in the build.** The plan's first task proves `fontkit` can open the font package's files from an endpoint during `astro build`. If it cannot, the fonts are read by a path resolved from the package at config time.
- **Build time.** About 22 cards at launch, each a single SVG rasterised once. If the build slows noticeably as articles are added, cards are cached by a hash of their text.
- **The Netlify address being indexed before the domain moves.** The indexing header in step 2.
- **Analytics counted on previews.** The beacon renders only in a production deploy.
- **Enquiries are an approximation.** A view of the thanks page is counted, including a visitor who reloads it or opens it directly. Netlify's own form submissions list remains the true count.
- **A long title on the card.** The fit steps down to a floor; the build check does not judge appearance, so the long-word case is looked at by eye.
- **Trailing slashes.** Decided on evidence from the preview, with a stated rule, rather than assumed.

## Owner inputs needed

- Confirm the Person facts table, including the two profile addresses the header icons link to.
- Switch on Netlify Forms and its notification email before the live form test, and confirm the test message arrives.
- Look at the preview and say when to merge.
- Create the Cloudflare Web Analytics site and supply its token, whenever ready. The site launches with analytics off. Confirm the in-place form send may change the address to `/contact/thanks/`, which is what lets an enquiry be counted.
- A check on a real phone. Still owed from earlier sub-projects.
- Case study hero captures, whenever they exist; the cards pick them up.
