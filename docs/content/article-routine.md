# Scheduled article routine

A cloud routine runs this file on Monday, Wednesday and Friday. Each run writes ONE blog article from the topical map, and opens a pull request for the owner to review. It never merges, and it never pushes to `main`.

Read `CLAUDE.md` sections 2, 3 and 5 before you write. Every rule there applies. The rules below repeat the ones that matter most, and add the ones specific to this job.

## 1. Pick the article

1. The map is `docs/content/topical-map.json`. Its `articles` array is in publishing order (`order`, lowest first).
2. List the article branches already open: `git ls-remote --heads origin 'article/*'`. A slug with a branch is taken.
3. Take the first article whose `status` is `planned` and whose slug has no branch. If none is left, stop and say so in the run's final message.
4. `planned_run` is a guide to the pace, not a rule: if earlier pull requests are still waiting for review, still take the next article in order.

## 2. Research before writing

- Search the live web for the primary keyword and two or three of the `questions_to_answer`. Read what ranks and what AI answers say. Your article must add something the top results do not: the `angle` in the map row is the starting point.
- Check every technical claim against a primary source (MDN, W3C/WCAG, Google Search Central, web.dev, schema.org, Anthropic docs, the tool's own docs). Link to the source.
- Never state a number you cannot source. Never invent a client result. The only client facts you may use are in `src/content/case-studies/*.mdx` and `src/content/about.ts`; quote them as they are written there.
- The map's `angle` is a plan written before research, not a source of facts. Any first-hand claim ("I built", "I use", "on this site") must be checkable in this repo: the case studies, `src/content/disciplines.ts`, or the site's own code and config. If it is not, write the point as general advice instead, or leave it out. Known limits: Home Base for 'Aiwi Waffles is in build and runs on Astro, React and the Square API, not Supabase; Vamp Network's dashboard runs on React, Vite and Supabase; Vamp Network has no campaign analytics.
- Rows with `status: "needs-input"` wait on something only the owner can supply (`owner_input`). Skip them. The owner changes the status to `planned` when he has supplied it.

## 3. Write it

- File: `src/content/blog/<topic>/<slug>.mdx`, using the map's `topic` and `slug`.
- Frontmatter, exactly these keys: `title` (sentence case), `description` (one sentence, 140 to 160 characters, first person or plain statement, includes the primary keyword), `date` (today, `"YYYY-MM-DD"`), `keywords` (the primary keyword, then the secondary ones). The schema is strict: any other key breaks the build.
- Length: the map's `word_count`, plus or minus 15%.
- Structure for search and answer engines:
  - Open with a 40 to 60 word paragraph that answers the primary question directly.
  - `h2` sections, one per question in `questions_to_answer` where it fits, phrased the way a person would ask it. Put a direct 40 to 60 word answer straight under each `h2`, then the detail.
  - Use `h3` under an `h2`, and `h4` only for a small label heading. Never title a heading just "Main" or "Top".
  - Use a table for a comparison, a numbered list for steps, `<Terms>` with `<Term name="...">` for named items (blank lines inside each `<Term>`), and fenced code blocks with a language for code.
  - Close with a short section that ties the topic to the owner's work: link the map's `proof_link` and say plainly what was done there, using only facts from that case study.
- Links:
  - Internal links: link two or three related pages from the map's `internal_links` that exist (a published article, a topic page `/blog/<topic>`, `/services`, a case study `/work/<slug>`). No address ends with a slash.
  - External links open in a new tab. Write them as `<a href="https://..." target="_blank" rel="noopener" aria-label="<link text>, opens in a new tab">link text</a>`.
- Voice and copy (from `CLAUDE.md`):
  - First person ("I", "my"), talking to the reader as "you". Never "we" or "our".
  - Whole sentences with a subject and a plain verb. No runs of fragments.
  - **No em dashes or en dashes anywhere** (the build fails on them). Use colons, commas or full stops.
  - No "X, not Y" endings, no "it's not just X, it's Y", no forced groups of three.
  - None of these words: stunning, seamless, cutting-edge, world-class, elevate, unlock, crafted, passionate, robust, leverage, delve, showcase, landscape, journey, game-changer, supercharge, harness, navigate (figuratively), realm, tapestry, testament, pivotal, crucial, vital, in today's.
  - Straight quotes, no emojis, sentence case.
  - Be specific: name the tool, the property, the number and its source.
- MDX: comments are `{/* ... */}`, never `<!-- -->`.

## 4. Check it

1. `npm ci` (only on the first command of the run), then `npm run build`. The build runs `scripts/check-dist`, which fails on dashes, a missing title or description, and broken pages. Fix the article until the build passes.
2. Read the article once more as an editor: cut filler, check that each `h2` answer stands on its own, and confirm that every claim has a source or comes from the owner's case studies.

## 5. Ship it as a pull request

1. Branch `article/<slug>` from `origin/main`.
2. In `docs/content/topical-map.json`, set this article's `status` to `in-review` and `branch` to the branch name.
3. Commit the article and the map change together with the message `content: article "<title>"`, ending with the line `Co-Authored-By: Claude <noreply@anthropic.com>`. Never use `--no-verify` or bypass hooks.
4. Push the branch and open a pull request against `main`, titled `Article: <title>`. The body lists: the topic, primary keyword, relevancy and difficulty scores, the questions answered, every external source used, and anything the owner should check (an opinion stated in his voice, a claim about his own work). Netlify posts a deploy preview link on the pull request.
5. Do not merge. The owner merges it, which publishes the article.

## 6. After the owner merges

When an article's pull request is merged, its row's `status` is still `in-review` on `main`. At the start of each run, set `status` to `published` for every `in-review` row whose file now exists on `main`, and include that map change in this run's pull request.
