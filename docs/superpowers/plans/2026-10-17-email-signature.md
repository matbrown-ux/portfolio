# Animated Email Signature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate three in-step animated GIFs (the pen-written name and the LinkedIn and GitHub icons) plus the HTML signature that uses them, so Mat can paste it into Gmail.

**Architecture:** A Node generator in `scripts/email-signature/` outlines "Mat Brown" with the site's `phraseShape`, rasterizes it with `sharp`, thins it to a center line, orders that line into pen time, and renders frames on one shared timeline; the icons are hand-drawn polylines drawn by stroke length. A small encoder on `omggif` writes 1-bit transparent GIFs with cropped delta frames. A tested renderer builds the signature table HTML for a given base address, and a second command writes a local copy page.

**Tech Stack:** Node 24 ESM (`.mjs`, imports `.ts` directly), `fontkit`, `sharp`, `omggif` (new dev dependency), Vitest.

**Spec:** `docs/superpowers/specs/2026-10-17-email-signature-design.md` (read it first). The spike it describes is `docs/superpowers/specs/2026-10-17-email-signature-spike.py`.

## Global Constraints

- Every source file starts with a failing test (TDD kit). Tests are co-located `*.test.mjs`. Files that use `sharp` start with `// @vitest-environment node`.
- Never commit `.fonts/`. The generator fails with the `missingFonts` message pattern from `scripts/script-art/artList.mjs` when fonts are missing.
- Colors: animated parts are vermilion `#f86343` on a transparent background. GIF transparency is 1-bit.
- Display sizes: name about 380 px wide from a 2x image; icons 24 x 24 from 48 x 48.
- Output: `public/email/v1/name.gif`, `public/email/v1/linkedin.gif`, `public/email/v1/github.gif`, committed. Total about 300 KB or less.
- Frame 1 of every GIF is the finished state (name and both icons fully drawn).
- All three GIFs share one cycle of exactly 940 centiseconds.
- Visible copy, exactly: `Mat Brown` (image alt), `UX Engineer | SEO Nerd`, `matbrown.io`. No em or en dashes, no symbol characters, American English.
- Links: name and domain go to `https://matbrown.io`; icons go to the `person.profiles` hrefs in `src/content/person.ts`. All open in a new tab.
- The signature HTML and copy page are never under `public/` or `src/pages/`.
- Work on branch `feat/email-signature`. Do not push to `main`. Pushing the branch and opening a PR need Mat's go-ahead.

## Review Focus

1. **Loop wrap:** a decoder that does not clear the canvas when the loop restarts must still show a clean first frame. The first frame is drawn as a full frame (Task 6 test `first frame is a full frame`).
2. **Erasing:** un-writing removes pixels, which a plain delta frame cannot do; stray vermilion left behind would ruin the loop (Task 6 round-trip test over a write-then-erase sequence).
3. **Drift:** three GIFs with different total durations drift out of step after a few loops (Task 6 test `total delay is preserved when frames merge`, Task 7 check that all three sum to 940).
4. **Base address typos:** a trailing slash or `http://` base produces `//email` paths or blocked images in Gmail (Task 8 tests for trailing slash and non-https).
5. **Missing fonts on another machine:** a vague crash instead of the copy-the-fonts message (Task 7 test).

---

### Task 1: Shared timeline

**Files:**
- Create: `scripts/email-signature/timeline.mjs`
- Test: `scripts/email-signature/timeline.test.mjs`

**Interfaces:**
- Produces: `CYCLE_CS = 940`, `STEP_CS = 2`, `progressAt(t: number) -> { name: number, linkedin: number, github: number }` (t in seconds, each value 0..1), `frameSchedule() -> { t: number, delayCs: number }[]`, `ease(x: number) -> number`.

Timeline, from t = 0 (seconds): `[0, 3.6)` everything 1; `[3.6, 3.9)` github 1 to 0; `[3.9, 4.2)` linkedin 1 to 0; `[4.2, 5.4)` name 1 to 0; `[5.4, 6.0)` everything 0; `[6.0, 8.4)` name 0 to 1; `[8.4, 8.9)` linkedin 0 to 1; `[8.9, 9.4)` github 0 to 1. Every transition uses `ease(x) = 3x^2 - 2x^3`. Keep the segment lengths in one exported `SEGMENTS` table so Mat's timing tweaks are one edit.

- [ ] **Step 1: Write the failing tests**

```js
it('opens on the finished signature', () => {
  expect(progressAt(0)).toEqual({ name: 1, linkedin: 1, github: 1 })
})
it('erases icons before the name, github first', () => {
  expect(progressAt(3.75)).toMatchObject({ name: 1, linkedin: 1 })
  expect(progressAt(3.75).github).toBeGreaterThan(0)
  expect(progressAt(3.75).github).toBeLessThan(1)
  expect(progressAt(4.1)).toMatchObject({ name: 1, github: 0 })
})
it('is blank during the gap', () => {
  expect(progressAt(5.7)).toEqual({ name: 0, linkedin: 0, github: 0 })
})
it('writes the name, then linkedin, then github', () => {
  expect(progressAt(7.2).name).toBeCloseTo(0.5)
  expect(progressAt(8.6)).toMatchObject({ name: 1, github: 0 })
  expect(progressAt(9.39).github).toBeGreaterThan(0.99)
})
it('schedules 2 cs frames that sum to one cycle', () => {
  const s = frameSchedule()
  expect(s.every((f) => f.delayCs === STEP_CS)).toBe(true)
  expect(s.reduce((n, f) => n + f.delayCs, 0)).toBe(CYCLE_CS)
  expect(s[0].t).toBe(0)
})
it('eases symmetrically', () => {
  expect(ease(0)).toBe(0); expect(ease(1)).toBe(1); expect(ease(0.5)).toBe(0.5)
})
```

- [ ] **Step 2: Run** `npx vitest run scripts/email-signature/timeline.test.mjs`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement** `timeline.mjs`. `frameSchedule` returns 470 samples at `t = k * 0.02`; merging identical frames is the encoder's job (Task 6).
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `git add scripts/email-signature/timeline.* && git commit -m "Email signature: shared timeline"`

### Task 2: Center line (thinning)

**Files:**
- Create: `scripts/email-signature/skeleton.mjs`
- Test: `scripts/email-signature/skeleton.test.mjs`

**Interfaces:**
- Produces: `thin(mask: Uint8Array, width: number, height: number) -> Uint8Array` (1 = center-line pixel; `mask` is 1 for ink, 0 for background; row-major).

Use Zhang-Suen thinning (two sub-iterations until no change). Treat pixels outside the image as background.

- [ ] **Step 1: Write the failing tests** (build masks with a small `fromRows(['.###.', ...])` helper in the test file)
  - `a 5 px thick horizontal bar thins to a single row`: a 30 x 9 mask with rows 2..6 inked over x 2..27 thins to pixels all in one row, at least 20 of them.
  - `a ring stays one closed loop`: a 21 x 21 ring (outer radius 9, inner 5) thins to a set where every pixel has exactly 2 eight-neighbors in the set.
  - `never adds ink`: every output pixel is inked in the input.
  - `separate blobs stay separate`: two bars 4 px apart give two 8-connected pieces.
- [ ] **Step 2: Run** `npx vitest run scripts/email-signature/skeleton.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement** `thin`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Email signature: center-line thinning"` (with both files added).

### Task 3: Pen time

**Files:**
- Create: `scripts/email-signature/penTimes.mjs`
- Test: `scripts/email-signature/penTimes.test.mjs`

**Interfaces:**
- Consumes: `thin` (Task 2).
- Produces: `penTimes(mask: Uint8Array, width: number, height: number, { liftPx: number, minPiecePx: number }) -> Float32Array` (per pixel: 0..1 for ink, `Infinity` for background).

The spike's method (spec, "The pen moves through the letterforms"), in JS:

```text
skel = thin(mask)
pieces = 8-connected components of skel with >= minPiecePx pixels, sorted by their min x
step = 0
for each piece:
  start = among endpoints (exactly one skel neighbor), or all pixels if none:
          smallest x, then largest y
  depth-first walk from start, direction (0, 1); on visiting p: order[p] = step++
  push unvisited neighbors sorted so the one with the largest dot product
  with the current direction is popped first
  step += liftPx
times on skeleton = order / (step - liftPx)
ink pixels take the time of their nearest skeleton pixel: multi-source BFS
  over ink pixels (8-neighbors), seeded from every ordered skeleton pixel
```

Use an explicit stack, never recursion (the name's skeleton is thousands of pixels).

- [ ] **Step 1: Write the failing tests**
  - `a bar is written left to right`: for a 40 x 7 bar, the time of the inked pixel at x = 5 is less than at x = 20, which is less than at x = 35.
  - `pieces are written left to right with a lift`: two bars side by side; max time on the left bar < min time on the right bar.
  - `background is Infinity and ink is 0..1`: every value is `Infinity` where `mask` is 0, and in [0, 1] where it is 1, with both 0 and 1 present.
  - `specks smaller than minPiecePx take their neighbors' time`: a 1 px speck touching a bar gets a finite time.
- [ ] **Step 2: Run** `npx vitest run scripts/email-signature/penTimes.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement** `penTimes`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Email signature: pen time through the letters"`

### Task 4: Name art

**Files:**
- Create: `scripts/email-signature/nameArt.mjs`
- Test: `scripts/email-signature/nameArt.test.mjs`

**Interfaces:**
- Consumes: `phraseShape(text, fonts)` from `scripts/script-art/shape.mjs` (returns `{ d, box }`), `penTimes` (Task 3).
- Produces:
  - `NAME = { text: 'Mat Brown', inkHeight2x: 173, pad2x: 20, ss: 4 }`
  - `nameMask(shape: { d, box }) -> Promise<{ mask: Uint8Array, width: number, height: number }>`: the outline rasterized with `sharp` at `ss` times the 2x size (ink height `inkHeight2x * ss`, padding `pad2x * ss` on every side, width and height rounded up to multiples of `ss`), 1 where coverage >= 50%.
  - `nameFrame(times: Float32Array, width: number, height: number, ss: number, progress: number) -> { bits: Uint8Array, width: number, height: number }`: downsample by `ss`; an output pixel is 1 when at least half of its `ss * ss` source pixels are ink with time <= `progress`.

- [ ] **Step 1: Write the failing tests** (`// @vitest-environment node`; use a square path `M0 0H100V100H0Z` as the shape)
  - `rasterizes to the 2x size times ss`: `height === (173 + 40) * 4` and the mask has ink.
  - `progress 0 is empty and progress 1 is the whole shape`: `nameFrame(..., 0).bits` sums to 0; at 1 it equals the downsampled mask.
  - `progress only ever adds pixels`: every pixel set at 0.4 is set at 0.6.
- [ ] **Step 2: Run** `npx vitest run scripts/email-signature/nameArt.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement** both functions. Build the SVG the same way the spike did: `viewBox` from `box`, `fill="#fff"` on black, `sharp(...).flatten({ background: '#000' }).greyscale().raw()`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Email signature: name mask and frames"`

### Task 5: Icon art

**Files:**
- Create: `scripts/email-signature/iconArt.mjs`
- Test: `scripts/email-signature/iconArt.test.mjs`

**Interfaces:**
- Produces:
  - `ICONS: Record<'linkedin' | 'github', number[][][]>`: each icon is a list of strokes, each stroke a list of `[x, y]` points on a 24 x 24 grid, in drawing order. Design them in the brand style (straight segments, square ends, miter joins), as few strokes as the shape allows: LinkedIn is a square frame with "in" inside; GitHub is the Octocat silhouette. Approximate curves with short segments.
  - `iconLength(strokes) -> number` (sum of segment lengths).
  - `iconSvg(strokes, progress: number) -> string`: a 48 x 48 SVG, `viewBox="0 0 24 24"`, white strokes on black, `stroke-width="2"`, `stroke-linecap="square"`, `stroke-linejoin="miter"`, one `<polyline>` per stroke, each with `stroke-dasharray` and `stroke-dashoffset` so the first `progress * iconLength` units are drawn in stroke order. A stroke with nothing drawn yet is omitted, so square caps never leave a dot.
  - `iconFrame(strokes, progress) -> Promise<{ bits: Uint8Array, width: 48, height: 48 }>`: rasterize `iconSvg` with `sharp`, 1 where coverage >= 50%.

- [ ] **Step 1: Write the failing tests** (`// @vitest-environment node`)
  - `both icons stay inside the grid`: every point is within [1, 23].
  - `progress 0 draws nothing`: `iconSvg(ICONS.linkedin, 0)` has no `<polyline`; `iconFrame` bits sum to 0.
  - `strokes draw in order`: for two strokes of length 10 each, at progress 0.5 the first is fully drawn and the second is absent.
  - `progress 1 draws every stroke`: polyline count equals stroke count, and the frame has ink.
- [ ] **Step 2: Run** `npx vitest run scripts/email-signature/iconArt.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement**, including the two icon drawings.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Email signature: drawn LinkedIn and GitHub icons"`

### Task 6: GIF encoder

**Files:**
- Modify: `package.json` (add `omggif` to devDependencies: `npm i -D omggif@1.0.10`)
- Create: `scripts/email-signature/gif.mjs`
- Test: `scripts/email-signature/gif.test.mjs`, with a compositing decoder helper in `tests/gifComposite.mjs`

**Interfaces:**
- Produces: `encodeGif(frames: { bits: Uint8Array, delayCs: number }[], width: number, height: number, color: string) -> Buffer`. Palette: index 0 transparent, index 1 `color`. Loops forever.

Algorithm (decided, because a plain delta frame cannot remove pixels):

```text
merge consecutive frames with identical bits, summing delayCs
frame 0: full width x height, disposal 1 (keep)
for frame k > 0:
  changed = pixels that differ from frame k-1
  rect_k  = bbox(changed U (rect_{k-1} if frame k-1 was disposed with 2))
  pixels  = the full truth of frame k inside rect_k (1 -> index 1, 0 -> index 0)
for every frame k: disposal 2 (clear its rect) if frame k+1 turns any pixel
  1 -> 0, and in that case rect_k is widened to include those pixels;
  otherwise disposal 1
an empty rect (no change) cannot happen after merging
```

`tests/gifComposite.mjs` exports `composite(buffer) -> { bits: Uint8Array, delayCs: number }[]`: decode with `omggif`'s `GifReader`, blit each frame onto a canvas that applies the previous frame's disposal (2 clears that frame's rect), and read back 1 where alpha > 0.

- [ ] **Step 1: Write the failing tests**
  - `round trip of a write then erase`: 12 frames of an 8 x 4 image where pixels turn on left to right, then off left to right; `composite(encodeGif(...))` equals the input frames exactly.
  - `round trip of an un-write`: pixels turn on, then off right to left.
  - `first frame is a full frame`: the first image descriptor in the output is at 0, 0 with the full width and height.
  - `total delay is preserved when frames merge`: 5 frames where 3 in the middle are identical; delays sum to the same total, and there are 3 decoded frames.
  - `loops forever`: `new GifReader(buf).loopCount()` is 0.
- [ ] **Step 2: Run** `npx vitest run scripts/email-signature/gif.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement** `encodeGif` with `omggif`'s `GifWriter` (`addFrame(x, y, w, h, indexed, { palette, delay, disposal, transparent: 0 })`; palette `[0x000000, color]` padded to a power of two).
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `git add package.json package-lock.json scripts/email-signature/gif.* tests/gifComposite.mjs && git commit -m "Email signature: 1-bit GIF encoder with erase-safe delta frames"`

### Task 7: Generator and the committed GIFs

**Files:**
- Create: `scripts/email-signature/generate.mjs`, `scripts/email-signature/fontCheck.mjs`
- Test: `scripts/email-signature/fontCheck.test.mjs`
- Modify: `package.json` (script `"email-signature": "node scripts/email-signature/generate.mjs"`)
- Create (generated): `public/email/v1/name.gif`, `public/email/v1/linkedin.gif`, `public/email/v1/github.gif`, `scripts/email-signature/nameSize.json` (`{ "width": <2x px>, "height": <2x px> }` of `name.gif`)

**Interfaces:**
- Consumes: Tasks 1 to 6, `FONT_FILES` and `missingFonts` from `scripts/script-art/artList.mjs`.
- Produces: `fontError(missing: string[]) -> string | null` in `fontCheck.mjs` (null when none are missing; otherwise names each file and says to copy the purchased Gloss And Bloom files into `.fonts/`, which must never be committed). The GIFs, which Task 8 references by file name.

`generate.mjs` (not unit tested; it is the wiring): check fonts and exit 1 with `fontError` text; open Regular and Alternates with `fontkit`; `phraseShape(NAME.text, fonts)`; `nameMask`; `penTimes` with `liftPx: 40 * NAME.ss`, `minPiecePx: 6 * NAME.ss`; for each `frameSchedule()` sample render `nameFrame` and both `iconFrame`s at the sample's progress; `encodeGif` each with `#f86343`; write the three files and `nameSize.json`; print each file's size and the total, and a warning line when the total is over 300 KB.

- [ ] **Step 1: Write the failing test** `fontError names each missing file`: `fontError(['Gloss_And_Bloom.ttf'])` contains `Gloss_And_Bloom.ttf` and `.fonts/`; `fontError([])` is `null`.
- [ ] **Step 2: Run** `npx vitest run scripts/email-signature/fontCheck.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement** `fontCheck.mjs` and `generate.mjs`; add the npm script.
- [ ] **Step 4: Run** the test (PASS), then `npm run email-signature`. Expected: three files written, total printed, no warning.
- [ ] **Step 5: Verify the output.** Using `tests/gifComposite.mjs` in a one-off script in the scratchpad (not committed): each GIF's delays sum to 940; frame 1 of each is fully drawn; save frames from the name GIF at about 10, 30, 50, 70 and 90 percent of the write as a contact sheet, on white and on `#1f1f1f`, and look at them. The pen must move through the letters in writing order, and the edges must look clean at 1x.
- [ ] **Step 6: Show Mat** the three GIFs on white and dark backgrounds (the visual companion, or an Artifact) and tune `SEGMENTS` if he asks. Regenerate after any change.
- [ ] **Step 7: Commit** `git add package.json scripts/email-signature/ public/email/v1/ && git commit -m "Email signature: generator and GIFs"`

### Task 8: Signature HTML and the copy page

**Files:**
- Create: `scripts/email-signature/signatureHtml.mjs`, `scripts/email-signature/copyPage.mjs`
- Test: `scripts/email-signature/signatureHtml.test.mjs`
- Modify: `package.json` (script `"email-signature:page": "node scripts/email-signature/copyPage.mjs"`), `.gitignore` (add `.email-signature/`)

**Interfaces:**
- Consumes: `person` from `src/content/person.ts` (import with the `.ts` extension; Node 24 strips types); `nameSize.json` (Task 7).
- Produces: `renderSignature(base: string) -> string` (the signature table HTML); `copyPage.mjs` takes `--base <url>` (default `https://matbrown.io`) and writes `.email-signature/index.html`, a page showing the signature with a one-line instruction to select it, copy it and paste it into Gmail's signature settings.

Layout, following `vamp-network/src/admin/signature/renderSignature.ts` at commit `41f9b3d`: one `role="presentation"` table, inline styles only, one row each for: the name image (`${base}/email/v1/name.gif`, `width` and `height` half of `nameSize.json`'s, which comes to about 380 wide, alt `Mat Brown`, linked to `https://matbrown.io`); the tagline `UX Engineer | SEO Nerd`; the domain `matbrown.io` linked to `https://matbrown.io`; the two icons in one row (`linkedin.gif`, `github.gif`, `width="24" height="24"`, alt `LinkedIn` and `GitHub`, linked to the profile hrefs, 8 px apart). Every link has `target="_blank"`. Text uses a fallback stack (tagline: `Menlo, Consolas, 'Courier New', monospace`, uppercase, tracked; domain: `Arial, Helvetica, sans-serif`) and a color you choose and check on white and on `#1f1f1f`.

- [ ] **Step 1: Write the failing tests**
  - `sizes the name from nameSize.json`: contains `width="${nameSize.width / 2}"` and `height="${nameSize.height / 2}"` (round to whole pixels).
  - `uses the base for every image`: `renderSignature('https://example.netlify.app')` contains `https://example.netlify.app/email/v1/name.gif`, `.../linkedin.gif` and `.../github.gif`.
  - `drops a trailing slash`: `renderSignature('https://matbrown.io/')` contains `https://matbrown.io/email/v1/name.gif` and no `//email`.
  - `rejects a non-https base`: `renderSignature('http://matbrown.io')` throws.
  - `has the exact copy`: contains `UX Engineer | SEO Nerd`, `>matbrown.io<`, `alt="Mat Brown"`, `alt="LinkedIn"`, `alt="GitHub"`, and no em or en dash.
  - `links the profiles from person.ts in new tabs`: contains each `person.profiles` href, and every `<a ` has `target="_blank"`.
  - `domain appears in the right order`: index of the tagline < index of `>matbrown.io<` < index of `linkedin.gif`.
- [ ] **Step 2: Run** `npx vitest run scripts/email-signature/signatureHtml.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement** `renderSignature` and `copyPage.mjs`; add the npm script and the `.gitignore` line.
- [ ] **Step 4: Run** the tests (PASS), then `npm test` and `npm run build`. Expected: all pass; `dist/email/v1/` holds the three GIFs and no signature HTML.
- [ ] **Step 5: Commit** `git commit -m "Email signature: HTML and local copy page"` (with the files above).

### Task 9: Preview check and Gmail (with Mat)

No code. Needs Mat's go-ahead for each outward step.

- [ ] **Step 1:** Ask Mat before pushing `feat/email-signature` and opening a PR. Once he agrees, push and open the PR; wait for the Netlify deploy preview.
- [ ] **Step 2:** Fetch `<preview>/email/v1/name.gif` with `curl -sI`. Expected: `200` and `content-type: image/gif` with no password prompt. If the preview is password-protected, stop and tell Mat.
- [ ] **Step 3:** Run `npm run email-signature:page -- --base <preview address>` and give Mat the path to `.email-signature/index.html`. He copies it into Gmail, sends a test email to himself and to a second account, and checks it on white, in dark mode on his phone, and (if he can) in Outlook, where only the finished first frame should show.
- [ ] **Step 4:** Record in `MEMORY.md` that after Monday's merge he must regenerate the page with the default base (`npm run email-signature:page`) and paste it again.
