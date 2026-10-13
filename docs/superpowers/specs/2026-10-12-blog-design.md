# Blog (Astro rebuild): Design

Date: 2026-10-12
Status: Draft, awaiting review
Scope: Sub-project 4 of the Astro rebuild.
Base: branch `feat/astro-rebuild` at `a7bdafb`, after sub-project 3 (Services, About and Contact).

Visual reference: [`assets/2026-10-12-blog-approved.jpeg`](./assets/2026-10-12-blog-approved.jpeg). This is the mockup the owner approved with "looks great, change nothing". It fixes composition, proportion and attitude for all three page types. Section labels (B1 to B4, P1 to P3, R1 to R3) are printed on it. Exact sizes and spacing are tuned in the browser. The mockup shows desktop only, and its body copy is superseded by the copy tables in this spec.

## Purpose

The blog exists to earn search and answer-engine traffic on the five keyword themes, and to show a prospective client that the owner knows the subject. It is also the last page the navigation links to that does not exist, so building it removes the last blocker the owner set on merging to `main`.

## Context

`/blog` is in `src/content/navigation.ts` and returns a 404. Ten MDX files sit under `src/content/blog/`: nine topic files (`<topic>/index.mdx`, about 65 words each) and one article (`ux-ui-design/button-states-that-convert.mdx`, 231 words). None is wired to a collection. They were written for the old dark site: eight topic descriptions contain em dashes, the article's code sample uses colour tokens that no longer exist, and every topic points at a cover SVG drawn for the dark design.

In the code and in this spec a "topic" is what the old app called a pillar. Visitors only ever see the word "topic".

## Decisions the owner made in the brainstorm

- **Full structure, honest empties.** Build the index, all nine topic pages and the article template. A topic with no articles says so plainly, carries `noindex` and stays out of the sitemap until it has one.
- **The index is grouped by the five disciplines,** with the latest article featured above the groups.
- **The existing article is kept and revised.** Same URL, code sample on current tokens, the copy guardrails applied, the advice unchanged.
- **An article page has** a contents list, a reading time, highlighted code blocks and "where next" links, plus the shared contact band.
- **Type only.** No cover images. The nine old cover SVGs and the `coverImage` frontmatter lines are deleted. Images inside an article body remain possible.

## Goals

- `/blog`: the latest article, then nine topics grouped under five disciplines.
- `/blog/<topic>`: one page per topic, listing its articles or saying there are none.
- `/blog/<topic>/<article>`: one page per article.
- Publishing an article is adding one MDX file to a topic folder. Nothing else needs editing.

## Non-goals

- No RSS feed, JSON-LD or social images. They belong to sub-project 5.
- No new articles. The eight empty topics stay empty until the owner writes for them.
- No search, tags, pagination, comments, author pages or newsletter signup.
- No React. All three page types are static Astro; the only script is the small contents-list marker.
- No cover image slot on topics or articles.

## Constraints

- Palette, typefaces and the approved layouts are locked. Tokens come from `src/styles/global.css`; nothing off-palette is hardcoded.
- Vermilion is the single accent. Small vermilion text appears only on ink, and text on a vermilion fill is ink.
- At most two handwritten moments a page. The index has two (the header and the contact band); topic and article pages have one (the contact band).
- All visible copy follows the guardrails in `CLAUDE.md` section 2 and goes through the `humanizer` skill before it ships. No em dashes.
- Reveals use `data-reveal` and the shared motion tokens, respect `prefers-reduced-motion`, and hide nothing unless JavaScript has run. Hover effects do not move ink surfaces with `transform`.
- Every source change is test-first (tdd-kit). Anything with a branch or a calculation lives in a `.ts` module, not in `.astro` frontmatter.

## Part 1: Content

### Collections (`src/content.config.ts`)

Two collections, both glob loaders over `src/content/blog`:

- **`blogTopics`** reads `*/index.mdx`. The entry `id` is the folder name, which is the topic slug.
- **`blogArticles`** reads every other `.mdx` file one level down. The entry `id` is `<topic>/<article>`, so an article belongs to the folder it sits in.

Both schemas are strict, so a mistyped or retired key (such as `slug`, `pillar` or `coverImage`) stops the build.

**Topic frontmatter**

| Field | Type | Use |
|---|---|---|
| `title` | string | The display name and the label everywhere the topic is named. |
| `headline` | string | The page `h1`, keyword-led. |
| `description` | string | The meta description and the topic's line in the index. One sentence. |
| `discipline` | one of the five slugs in `disciplines.ts` | Which discipline the topic sits under. An unknown slug stops the build. |
| `order` | number | Position within its discipline, lowest first. |
| `keywords` | string array, optional | Kept from the old files, not rendered. |

The MDX body of a topic is its introduction: one short paragraph shown under the heading on the topic page. The old `## What this section covers` heading is removed from each body.

**Article frontmatter**

| Field | Type | Use |
|---|---|---|
| `title` | string | The page `h1` and the article's name in every list. Sentence case. |
| `description` | string | The meta description, the line under the `h1`, and the summary in lists. |
| `date` | date | Publication date. Sorts articles newest first. |
| `updated` | date, optional | Shown beside the date when present. |
| `keywords` | string array, optional | Not rendered. |

### Topic assignments and order

| Discipline | Topics, in order |
|---|---|
| UX/UI Engineering (`ux-ui-engineering`) | UX/UI Design, Design Systems |
| SEO/AEO (`seo-aeo`) | Technical SEO, Answer Engine Optimization |
| Agentic Workflows (`agentic-workflows`) | Agentic Workflows, AI Automation |
| Brand Development (`brand-development`) | Brand Identity, Brand Strategy |
| SaaS Development (`saas-development`) | SaaS Development |

### Topic copy (draft for the owner to correct)

Each row is rewritten from the owner's existing text: em dashes and sales words removed, fragments turned into sentences, nothing added. The headlines are new.

| Topic | `headline` | `description` | Body |
|---|---|---|---|
| UX/UI Design | UX/UI Design Articles: Components, Accessibility & Design Engineering | I write about design engineering, component architecture and where design meets code. | These articles are about building interfaces that are technically solid and visually precise. They cover component design patterns, accessibility, animation and the handoff between design and engineering. |
| Design Systems | Design System Articles: Tokens, Component Libraries & Naming | I write about design tokens, component libraries and the patterns that keep design and code in sync. | These articles are about building design systems that scale. They cover design tokens, reusable component libraries, naming conventions and the workflows that keep design and engineering in step. |
| Technical SEO | Technical SEO Articles: Core Web Vitals, Crawlability & Site Architecture | I write about Core Web Vitals, crawlability, indexation and the site architecture that earns rankings. | These articles cover the infrastructure side of search: Core Web Vitals, crawl budget, indexation, structured data and the site architecture decisions that earn rankings through relevance. |
| Answer Engine Optimization | Answer Engine Optimization Articles: AEO & GEO for AI Search | I write about answer engine optimization and how to get cited by ChatGPT, Perplexity and Google's AI Overviews. | These articles are about getting surfaced and cited by AI search. They cover answer engine optimization (AEO) and generative engine optimization (GEO) for ChatGPT, Perplexity, Claude and Google's AI Overviews. |
| Agentic Workflows | Agentic Workflow Articles: Tool Use & Orchestration with Claude | I write about building agentic workflows on Claude and the AI SDK: tool use, orchestration and automation that ships. | These articles are about designing and shipping agentic systems. They cover tool use, multi-step orchestration and the patterns that turn Claude and the AI SDK into automation a business can rely on. |
| AI Automation | AI Automation Articles: Pipelines, MCP Servers & n8n | I write about AI pipelines, MCP servers and workflow automation that save hours every week. | These articles are about automating the repetitive work in a business. They cover AI pipelines, MCP server development and tools like n8n wired together to save hours every week. |
| Brand Identity | Brand Identity Articles: Logo Design & Visual Systems | I write about logo design, visual systems and the details that keep a brand consistent everywhere it appears. | These articles are about building a brand identity from the ground up. They cover logo design, visual systems, signage and the details that keep a brand consistent on every surface it appears on. |
| Brand Strategy | Brand Strategy Articles: Positioning, Messaging & Voice | I write about positioning, messaging and the story behind a brand's visuals. | These articles are about the thinking beneath the visuals. They cover positioning, messaging, brand voice and the decisions that help a brand reach the right audience. |
| SaaS Development | SaaS Development Articles: React, Supabase & Product Architecture | I write about building SaaS products end to end: React, Supabase, authentication, dashboards and the architecture behind them. | These articles are about shipping SaaS products end to end. They cover React front ends, Supabase back ends, authentication, dashboards and the architecture decisions behind software that scales. |

The mockup's index rows used shorter lines written for the mockup. The built index uses `description`, so there is one string to maintain per topic.

### The revised article (`ux-ui-design/button-states-that-convert.mdx`)

Frontmatter: `title: Button states that convert`, `description: A practical guide to designing button states that communicate clearly and drive action.`, `date: "2026-05-31"`, `keywords` as they are.

Body, as it will ship unless the owner corrects it:

> **Why button states matter**
>
> Most buttons have five states: default, hover, focus, active and disabled. Most implementations only style two of them.
>
> That leaves keyboard users without a visible focus state, and it leaves out the small details that make an interface feel finished.
>
> **The five states**
>
> - **Default.** This is the button at rest. It should be clean and readable, with enough visual weight to show it can be clicked.
> - **Hover.** This is the button responding to the cursor. Use one subtle change: a colour change, a slight lift with `translateY(-2px)`, or a shadow. Don't use all three at once.
> - **Focus.** This state matters most for keyboard navigation and accessibility. Use a visible `outline` or ring that passes WCAG 4.5:1 contrast against the background. Never set `outline: none` without a replacement.
> - **Active.** This is the button being pressed. A slight compress with `scale(0.98)` tells the user the press registered.
> - **Disabled.** This is the button that can't be clicked. Reduce opacity to 40 to 50%, change the cursor to `not-allowed`, and remove all hover effects.
>
> **Implementation**
>
> Here are all five states on one button, written with this site's colour tokens.
>
> ```tsx
> <button
>   className="px-6 py-3 bg-vermilion text-ink
>     hover:bg-ink hover:text-ivory
>     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink
>     active:scale-[0.98]
>     disabled:opacity-40 disabled:cursor-not-allowed
>     transition-colors duration-200"
> >
>   Click me
> </button>
> ```
>
> Each state tells the user something specific, so design all five together as one system.

The five states are written with the `<Terms>` block (Part 4), which draws the ruled list in the mockup.

### Script artwork

One new phrase in `src/assets/script/phrases.json`: `{ "name": "notes", "text": "notes", "fill": "#f86343" }`, with no `edge`. `npm run script-art` generates `public/script/notes.svg` and updates the manifest; the generated files are committed, the font files are not.

### Removed

- `public/images/blog-*-cover.svg` (nine files).
- The `slug`, `coverImage` and `pillar` frontmatter lines.

## Part 2: Blog index (`src/pages/blog/index.astro`)

Page title "Blog", description "Articles on UX/UI engineering, SEO and AEO, agentic workflows, brand development and SaaS development by Mathew Brown."

- **B1, `BlogHeader`.** The Work and Services header pattern: the display word "Blog" with a vermilion full stop, the `notes` script artwork, the mono `h1` "UX/UI Engineering, SEO & AI Workflow Articles", and a rotated label with the topic and article counts ("9 topics", "1 article"), both counted from the collections.
- **B2, `LatestArticle`.** The newest article, full width: a vermilion panel with the label "Latest article", the topic name and the title in display type; an ink panel with the label "What it covers", the description, the publication date, the reading time and a vermilion button "Read the article". The whole block is one link to the article. When there are more articles, the next two newest follow as `ArticleRow`s (Part 3) under the block. With no articles at all the section is not rendered.
- **B3, `TopicIndex`.** The `h2` "Articles by discipline and topic" with the line "Nine topics across the five disciplines I work in. I add to them as I write." (the number word comes from the topic count). Below it, one ruled group per discipline in `disciplines.ts` order. Each group has `id="<discipline slug>"`, the discipline's number and title, and a "See the service" link to `/services#<slug>`. Each topic is one row linking to its page: title, `description`, and a status. A topic with articles shows a solid ink status ("1 article", "3 articles"); an empty topic shows an outlined "Nothing yet" and its text is quieter, while still meeting AA contrast on ivory.
- **B4.** The shared `ContactBand`.

## Part 3: Topic page (`src/pages/blog/[topic]/index.astro`)

Page title is the topic's `headline`; description is its `description`. `noindex` is set when the topic has no articles.

- **P1, `TopicHeader`.** A breadcrumb (Part 5), the topic `title` in display type, the mono `h1` (`headline`), the topic body as the introduction, and an ink card: the label "Part of", the discipline title, and "See the service" linking to `/services#<slug>`.
- **P2, with articles.** The `h2` "Articles on {title}" with the article count beside it, then one `ArticleRow` per article, newest first. An `ArticleRow` is one link: the date and reading time, the title in display type, the description and an arrow. Below the rows, a two-cell stone strip: "Also in {discipline}" with each sibling topic's title and description linking to it (the cell is omitted when the discipline has one topic, and the remaining cell takes the full width), and "Everything else" linking to `/blog` with the label "All {count as a word} topics".
- **P3, without articles.** `EmptyTopic` replaces P2: an ink panel with the label "0 articles", the `h2` "Nothing published here yet.", and the paragraph "I haven't written anything on this topic yet. The {discipline} service page explains how I work on it, and the {case study} case study shows it on a real business." The second clause is dropped when the discipline has no proof case study. Two buttons: "See the {discipline} service" (vermilion, to `/services#<slug>`) and "All topics" (outlined, to `/blog`).
- The shared `ContactBand`.

The mockup's P3 omits the mono `h1`. The built page keeps it, because every page needs an `h1`.

## Part 4: Article page (`src/pages/blog/[topic]/[article].astro`)

Page title is the article `title`; description is its `description`; `type="article"`.

- **R1, `ArticleHeader`.** The breadcrumb, the `title` as the `h1` in display type (scaled down for long titles with the existing `titleFit` module), and the description. Then an ink strip of four cells, in the manner of the case study "at a glance": Published (and "Updated" when set), Reading time, Topic (links to the topic page) and Discipline (links to `/services#<slug>`). Dates are written as "31 May 2026" and carried in a `<time datetime>`.
- **R2, body.** Two columns from `xl`: the contents list on the left and one reading column of about 68 characters on the right. Below `xl` the contents list sits above the article as a plain list.
  - **`ArticleContents`.** A `nav` labelled "In this article" listing the article's `h2` headings as links to their ids. It stays in view with CSS `position: sticky`. It is not rendered for an article with fewer than two `h2`s. The `tocSpy` script (Part 5) marks the link for the section being read with `aria-current="location"` and an ink bar; without JavaScript the list is plain links.
  - **Prose styles.** `h2` and `h3` in display type, paragraphs, links, lists, block quotes, inline code on stone, images and horizontal rules, scoped so they do not reach into block components (the `:not(.cs-block)` lesson from the case studies).
  - **Code blocks.** Ink ground, ivory text, a top bar showing the language. Syntax colours come only from the palette: vermilion for tags and keywords, ivory for strings and text, a muted ivory for attributes and comments. Long lines scroll horizontally inside the block and the block is keyboard focusable so it can be scrolled without a mouse.
  - **`<Terms>` and `<Term name>`.** An MDX block for a list of named items: a ruled definition list with the name in display type and the text beside it. Used for the five states.
- **R3, `ArticleNext`.** Three tiles on stone, the middle one vermilion:
  1. "More on this topic". When the topic has another article, the tile shows the newest other article's title and description and reads "Read the article". Otherwise it shows the topic title, the line "Other articles on this topic appear here as I publish them." and "See the topic".
  2. "The service behind it": the discipline title, its `blurb` from `disciplines.ts`, and "See the service".
  3. "Keep reading": "All articles", the line "{Count as a word} topics across five disciplines." and "Back to the blog".
- The shared `ContactBand`.

## Part 5: Logic (all test-first)

Pure modules in `src/lib/`, each with a co-located test. The `.astro` files only call them.

- **`blog.ts`**
  - `topicSlug(articleId)` and `articleSlug(articleId)`: split `<topic>/<article>`.
  - `articlesByTopic(articles)`: articles grouped by topic slug, each group newest first.
  - `latestArticles(articles, n)`: the newest `n` across all topics.
  - `topicGroups(disciplines, topics, articles)`: one group per discipline in `disciplines.ts` order, each with its topics sorted by `order` and each topic's article count. A discipline with no topics yields no group.
  - `siblingTopics(topics, topic)`: other topics in the same discipline, by `order`.
  - `breadcrumb(discipline, topic, page)`: the trail. On a topic page it is Blog (`/blog`), the discipline (`/blog#<discipline slug>`) and the topic as the current, unlinked item. On an article page the topic is linked and the article itself is not listed.
  - `nextTile(articles, article)`: the newest other article in the same topic, or nothing.
  - `countLabel(n, singular, plural)`: "1 article", "3 articles", "9 topics".
  - `numberWord(n)`: "nine" for 9. Words for zero to twelve, digits above. Used where a count opens or sits inside a sentence ("Nine topics across...", "All nine topics").
  - `formatDate(date)`: "31 May 2026", computed in UTC so the build machine's time zone cannot shift the day.
- **`readingTime.ts`**: `readingMinutes(body)` counts whitespace-separated words in the raw MDX body and returns `ceil(words / 200)`, never less than 1. The label is "{n} min read".
- **`emptyTopics.ts`**: `emptyTopicSlugs(blogDir)` reads the blog folder and returns the topic folders that hold no `.mdx` file other than `index.mdx`. `astro.config.mjs` uses it in the sitemap filter to drop `/blog/<slug>/` for each one. The topic page sets `noindex` from the collection data; a test asserts both rules agree on the real content folder.
- **`tocSpy.ts`**: `initTocSpy(root)` finds the contents list by a `data-` attribute, watches the article's `h2`s with an `IntersectionObserver`, sets `aria-current="location"` on the link for the topmost heading that has passed the top of the viewport, and returns a cleanup function. It is started from the closing script in `BaseLayout.astro` and does nothing on pages without a contents list.

## Docs

Update `MEMORY.md` (the roadmap table, a "What sub-project 4 added" section, owner inputs, and the stale gotcha about a static multiply layer hiding a reveal), `CLAUDE.md` section 5 (how to add a topic and an article; replace the line that says the blog is not wired to a collection) and `DESIGN.md` (the three blog page types and the prose and code styles).

## Testing and verification

- Unit tests for `blog.ts`, `readingTime.ts`, `emptyTopics.ts` and `tocSpy.ts`; `npm test` and `npm run typecheck` clean.
- `npm run build` produces 11 new pages: `/blog/`, nine topic pages and one article. In `dist`: the eight empty topic pages contain `noindex` and are absent from the sitemap; `/blog/`, `/blog/ux-ui-design/` and the article are present in it; no page contains an em dash; no `blog-*-cover.svg` remains.
- Browser checks at 1440x900, 1024x768 and 390x844, and with reduced motion: the three page types, an empty topic page, keyboard order and focus rings on every row and tile, the contents list marker while scrolling, the code block scrolling by keyboard, and the header behaviour on a long article.
- A temporary second and third article (not committed) to check the index's extra rows, a topic with several rows, the "More on this topic" tile, a long title and a wide code line.

## Risks and mitigations

- **Syntax highlighting under this project's Markdown processor.** The site uses `satteri`, not Astro's default pipeline, and it is not yet confirmed that a palette-only highlighter theme can be set through it. The plan's first task checks this. If it cannot, code blocks ship as plain ivory text on ink and the owner is told before that is built.
- **Heading list for the contents.** Expected from Astro's `render()`; if the processor does not supply it, headings are read from the MDX body by a small tested function instead.
- **`emptyTopics.ts` imported by `astro.config.mjs`.** If the config cannot import a `.ts` module, the function moves to a `.mjs` file under `scripts/` with the same test.
- **An empty topic gains its first article.** Nothing is switched by hand: the count, the index status, `noindex` and the sitemap all follow from the file being there, and the agreement test guards it.
- **Thin pages.** Empty topic pages are `noindex` and out of the sitemap, so they cannot dilute the site while they wait for content.
- **A long article title or topic name.** Display titles use `titleFit`; the build checks a deliberately long one for overflow at 390px.

## Owner inputs needed

- Correct or approve the nine topic rows in the copy table, and the nine new headlines in particular.
- Correct or approve the revised article. One point to check: the article says a focus ring should pass 4.5:1 contrast. WCAG asks 3:1 for a focus indicator; 4.5:1 is the figure for body text. The text is left as the owner wrote it until they say which they mean.
- Approve "notes" as the handwritten word on the index.
- Articles for the eight empty topics, whenever they are written. None blocks this build.
