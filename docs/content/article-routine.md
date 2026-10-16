# Scheduled article routine

A scheduled job on the owner's Mac (`scripts/article-run.sh`, started by launchd) runs this file on Monday, Wednesday and Friday, in a fresh worktree of `origin/main`. Each run writes ONE blog article from the topical map, generates two or three supporting images with Codex, and opens a pull request for the owner to review. It never merges, and it never pushes to `main`: an article reaches matbrown.io only when the owner merges its pull request.

The job runs in three stages, and the script starts each one:

1. **Writer** (a Claude session): sections 1 to 3, the image brief (section 4, steps 1 to 3), the first checks (section 5, steps 1 to 3) and one local commit (section 6, steps 1 to 3). It does not run Codex, does not push and does not open the pull request.
2. **Images** (the script itself): runs Codex on the brief, with its own time limit, and logs what Codex prints.
3. **Editor** (a fresh Claude session): the voice pass (section 5, step 4), the images (section 4, steps 5 to 7), and amends the commit. The script then checks that the editor really changed the article, pushes the branch and opens the pull request (section 6, steps 4 and 5).

Read `CLAUDE.md` sections 2, 3 and 5 and **`docs/content/brand-voice.md`** before you write. Every rule there applies. The rules below repeat the ones that matter most, and add the ones specific to this job.

## 1. Pick the article

1. The map is `docs/content/topical-map.json`. Its `articles` array is in publishing order (`order`, lowest first).
2. List the article branches already open: `git ls-remote --heads origin 'article/*'`. A slug with a branch is taken.
3. Take the first article whose `status` is `planned` and whose slug has no branch. If none is left, stop and say so in the run's final message.
4. `planned_run` is a guide to the pace, not a rule: if earlier pull requests are still waiting for review, still take the next article in order.

## 2. Research before writing

- Search the live web for the primary keyword and two or three of the `questions_to_answer`. Then open and read (with WebFetch) at least three of the pages that rank, so you know what the article has to beat. Your article must add something the top results do not: the `angle` in the map row is the starting point.
- Check every technical claim against a primary source (MDN, W3C/WCAG, Google Search Central, web.dev, schema.org, Anthropic docs, the tool's own docs). Link to the source.
- **Only cite a page you opened and read in this run.** A search result snippet is not a source. Every external link in the article must be a page you fetched, and the claim it supports must be on that page. Keep a list of the pages you read; it goes in the pull request.
- **If you cannot read your sources, stop.** If WebFetch fails for most pages (network errors, blocked hosts), do not write the article from snippets or memory. Push nothing, and end the run with a message saying which fetches failed and with what error.
- Never state a number you cannot source. Never invent a client result. The only client facts you may use are in `src/content/case-studies/*.mdx` and `src/content/about.ts`; quote them as they are written there.
- The map's `angle` is a plan written before research, not a source of facts. Any first-hand claim ("I built", "I use", "on this site") must be checkable in this repo: the case studies, `src/content/disciplines.ts`, `docs/content/owner-facts.md` (facts the owner confirmed in conversation, used exactly as written there), or the site's own code and config. If it is not, write the point as general advice instead, or leave it out. Known limits: Home Base for 'Aiwi Waffles is in build and runs on Astro, React and the Square API, not Supabase; Vamp Network's dashboard runs on React, Vite and Supabase; Vamp Network has no campaign analytics.
- Rows with `status: "needs-input"` wait on something only the owner can supply (`owner_input`). Skip them. The owner changes the status to `planned` when he has supplied it.

## 3. Write it

- File: `src/content/blog/<topic>/<slug>.mdx`, using the map's `topic` and `slug`.
- Frontmatter, exactly these keys: `title` (sentence case), `description` (one sentence, 140 to 160 characters, first person or plain statement, includes the primary keyword; it shows directly under the headline on the page, so it must never repeat the title: say what the title does not, such as who it is for or what they walk away with. The build fails a description that opens with the headline), `date` (today, `"YYYY-MM-DD"`), `keywords` (the primary keyword, then the secondary ones). The schema is strict: any other key breaks the build.
- Length: the map's `word_count`, plus or minus 15%, counted on the body without frontmatter, comments or code blocks. This is a floor as much as a ceiling: if the draft is short, add substance (a worked example, a table, a step the top results skip, a sourced detail), never filler or repetition.
- Structure for search and answer engines:
  - Open with a 40 to 60 word paragraph that answers the primary question directly.
  - `h2` sections, one per question in `questions_to_answer` where it fits, phrased the way a person would ask it. Put a direct 40 to 60 word answer straight under each `h2`, then the detail.
  - Use `h3` under an `h2`, and `h4` only for a small label heading. Never title a heading just "Main" or "Top".
  - Use a table for a comparison, a numbered list for steps, `<Terms>` with `<Term name="...">` for named items (blank lines inside each `<Term>`), and fenced code blocks with a language for code.
  - Close with a short section that ties the topic to the owner's work: link the map's `proof_link` and say plainly what was done there, using only facts from that case study.
- Links:
  - Internal links: link two or three related pages from the map's `internal_links` that exist (a published article, a topic page `/blog/<topic>`, `/services`, a case study `/work/<slug>`). No address ends with a slash.
  - External links open in a new tab. Write them as `<a href="https://..." target="_blank" rel="noopener" aria-label="<link text>, opens in a new tab">link text</a>`.
- Voice and copy (from `CLAUDE.md` and `docs/content/brand-voice.md`):
  - **Write in Mat's voice as `brand-voice.md` describes it**: relaxed, warm, plain, funny, never pretentious; explain a concept by what it does before naming it; one short first-hand moment from an allowed source; a close that speaks to the owner and to the designer or developer reading. Its off-limits list is absolute.
  - First person ("I", "my"), talking to the reader as "you". Never "we" or "our".
  - Whole sentences with a subject and a plain verb. No runs of fragments.
  - **No em dashes or en dashes anywhere** (the build fails on them). Use colons, commas or full stops.
  - No "X, not Y" endings, no "it's not just X, it's Y", no forced groups of three.
  - None of these words: stunning, seamless, cutting-edge, world-class, elevate, crafted, passionate, robust, leverage, delve, showcase, landscape, journey, game-changer, supercharge, harness, navigate (figuratively), realm, tapestry, testament, pivotal, crucial, vital, in today's, and corporate speak (synergy, circle back, value-add, best-in-class, move the needle, low-hanging fruit). "Unlock" is allowed once at most, as `brand-voice.md` section 5 says.
  - **Never write a sentence that repeats a phrase**, and never edit with a find-and-replace script that could leave one behind ("For each creator I design a logo for each creator"). Edit with the Edit tool and read the whole sentence after. The build fails a sentence that repeats a run of four or more words.
  - **American English spelling.** The owner is an American designer: color, behavior, favorite, center, gray, organize, optimize, realize, analyze, license, catalog, canceled, labeled, judgment. The build fails on common British spellings.
  - Straight quotes and sentence case. **No emojis and no symbol characters** (arrows such as → or ↗, checkmarks, stars), in the article, its frontmatter, tables or the image brief. Write "to" or use a list instead of an arrow. The build fails on them.
  - Be specific: name the tool, the property, the number and its source.
- MDX: comments are `{/* ... */}`, never `<!-- -->`.

## 4. Plan the images

This run generates the images itself with the Codex CLI, which is signed in to the owner's ChatGPT account on this Mac. It also keeps a brief, so an image can be redone by hand.

1. Choose two or three places where a picture helps the reader understand something: a process, a comparison, a structure, a before and after of a pattern. Skip decoration. Never put an image directly under the opening answer paragraph.
2. At each place, put an MDX comment on its own line: `{/* IMAGE <n>: <one line saying what it shows> */}`. Comments do not render, so the article builds and reads fine before the images exist.
3. Write `docs/content/image-briefs/<slug>.md` with, for each image:
   - `File`: `src/content/blog/<topic>/images/<slug>-<n>.png`
   - `Placement`: the heading it sits under and the marker comment it replaces
   - `Alt text`: one plain sentence saying what the image shows, no dashes
   - `Prompt`: a self-contained prompt for GPT Image, written to the style below
   - `Size`: 1536 x 1024 (landscape) unless a tall diagram needs 1024 x 1536
4. **The script generates the images, not a Claude session.** Never run `codex` from inside a Claude session: on 2026-10-16 it hung there with no output until the session's time limit, and the article shipped with no images. Between the writer and the editor the script runs Codex on the brief and saves each PNG at its `File` path. To redo one by hand from a terminal: `command codex exec -C "$PWD" -s workspace-write --skip-git-repo-check "Read docs/content/image-briefs/<slug>.md. Generate each image ..."`.
5. (Editor) Look at each image (Read the PNG). An image with lettering, a person, a logo, a color outside the palette, or a drawing that does not match its place in the article is rejected: delete the file, keep its marker, and list it in the commit body so the owner can regenerate it. For each image you keep, rewrite its alt text to say what the image actually shows.
6. (Editor) Replace each kept image's marker with `![<alt text>](./images/<slug>-<n>.png)`. Astro converts the PNG files to WebP at build time.
7. If Codex made no images, keep the markers and say so in the commit body; the article ships without images and the owner can generate them from the brief.

**Image style (put it in every prompt):** flat editorial illustration in a brutalist style on a warm ivory ground (#F4F0E6), with near-black ink (#0C0C0C) linework and solid shapes and a single vermilion accent (#F86343); no other colors, no gradients, square corners, thick outlines. It may mix wireframe (outlined boxes, placeholder lines) with comic book touches (offset ink shadows, halftone dots, speed lines). Diagrams, abstract interface wireframes, objects and metaphors only.

**Never ask for:** text, labels or numbers inside the image (generated lettering is unreliable; put words in the article instead); real people or anyone's likeness; real logos or brand marks; screenshots, dashboards or charts that look like real data; any client's product, site or interface, which would read as a fabricated capture of real work.

## 5. Check it

1. `npm ci` (only on the first command of the run), then `npm run build`. The build runs `scripts/check-dist`, which fails on dashes, emojis and symbol characters, British spellings, a missing title or description, and broken pages. Fix the article until the build passes.
2. Count the words: `awk '/^---$/ && fm<2 {fm++; next} fm<2 {next} /^```/ {code=!code; next} code {next} /^\{\/\*/ {next} {print}' <file> | wc -w` (body only, no frontmatter, code or comments). If the count is outside the range in section 3, fix the article and count again.
3. Read the article once more as an editor: cut filler, check that each `h2` answer stands on its own, and confirm that every claim has a source you read or comes from the owner's case studies.
4. **The editor's voice pass (stage 3).** This is the editor session's main job, and the script refuses to open a pull request if the article comes back unchanged. Loading a skill is not applying it: after each step, the article file must show the edits.
   1. Read `docs/content/brand-voice.md` in full, then read the whole article once as Mat would hear it.
   2. `copywriting`: load the skill and apply it to the title, the description, the opening answer and the closing section, so they are clear and specific and lead to the next step. It must not add claims, numbers or sales adjectives, and the rules in section 3 still win.
   3. `humanizer`: load the skill and apply it to the whole article body (file mode) and to the image alt text. Keep every fact, quote, link and code block as it is.
   4. Rewrite the body in Mat's voice (`brand-voice.md` sections 4 to 7): the explanation shape, his humor, one short story from an allowed source, his words used sparingly.
   5. Go through the editor checklist in `brand-voice.md` section 9, item by item, and fix what fails.
   Then build and count the words again.

## 6. Ship it as a pull request

1. Branch `article/<slug>` from `origin/main`.
2. In `docs/content/topical-map.json`, set this article's `status` to `in-review` and `branch` to the branch name.
3. (Writer) Make ONE commit with the article, the image brief and the map change. (Editor) Amend that same commit to add the images and your edits, and update its body: whether the images were generated and kept, and that the voice pass ran. Its message is the pull request, because GitHub fills a new pull request's title and description from a branch's only commit:
   - Subject line: `Article: <title>`
   - Body: the topic, primary keyword, relevancy and difficulty scores, word count, the questions answered, every external source you read (one per line, with its address), whether the images were generated, and anything the owner should check (an opinion stated in his voice, a claim about his own work). End the body with this checklist:
     - `- [ ] Images look right (brief: docs/content/image-briefs/<slug>.md)`
     - `- [ ] Read on the deploy preview`
     - `- [ ] Facts and first-hand claims checked`
   - Last line: `Co-Authored-By: Claude <noreply@anthropic.com>`

   Never use `--no-verify` or bypass hooks.
4. (Script) Push the branch: `git push -u origin article/<slug>`. Neither Claude session pushes.
5. (Script) Open the pull request: `gh pr create --base main --head article/<slug> --fill` (`--fill` takes the title and body from the one commit). Netlify posts a deploy preview on it.
6. Do not merge. The owner reviews the deploy preview, asks for changes if he wants them, and merges it himself, which publishes the article.

## 7. After the owner merges

When an article's pull request is merged, its row's `status` is still `in-review` on `main`. At the start of each run, set `status` to `published` for every `in-review` row whose file now exists on `main`, and include that map change in this run's pull request.
