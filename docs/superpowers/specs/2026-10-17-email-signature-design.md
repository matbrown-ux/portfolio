# Animated email signature: design

Date: 2026-10-17. Owner: Mat Brown. Status: draft, awaiting the owner's approval.

## Intent

Mat wants an email signature for his portfolio identity (mat@matbrown.io, sent from Gmail) where his name, "Mat Brown", writes itself in the Gloss And Bloom script as if a pen were moving through each letter. He made an animated signature for Vamp Network and liked two things about it: the animation was clean, and the loop was clean, with no visible jump at the restart. Those are the quality bar here.

## What the reader sees

From top to bottom:

1. **"Mat Brown"** in Gloss And Bloom, vermilion (`#f86343`), animated.
2. **"UX Engineer | SEO Nerd"**, plain HTML text.
3. **`matbrown.io`**, plain HTML text, linked to `https://matbrown.io`.
4. **Two icons, LinkedIn then GitHub,** animated, in vermilion line art, each linked to the profile in `src/content/person.ts` (`https://www.linkedin.com/in/mathewbrownux/`, `https://github.com/matbrown-ux`), opening in a new tab.

Mat approved this order and these words. The domain line was his addition on 2026-10-17.

## The animation

### The pen moves through the letterforms

The name is revealed by a pen that travels along the center line of each letter in writing order: up the first stroke of the M and over its peaks, around the bowl of the a, the stem of the t before its crossbar, and so on through "Brown". A straight left-to-right wipe is not acceptable: Mat looked at that and asked specifically for the ink to move through the letter forms.

A spike on 2026-10-17 showed this works with the real font, and Mat confirmed it is what he pictured. The method, as spiked (Python, throwaway, in the session scratchpad):

- Render the text large (4x supersampled), threshold to a solid mask.
- Skeletonize the mask to get each stroke's center line.
- Walk each connected piece of the skeleton depth first, left to right across pieces, starting each at its leftmost end, preferring at every step the neighbor that keeps the current direction (so loops are drawn one way around). The visit order is the pen's time.
- Each ink pixel takes the time of its nearest center-line pixel. A frame at progress `p` shows every ink pixel whose time is at most `p`.
- Leave a short pause between pieces, as if the pen lifted.

**The letters are the site's alternates (Mat, 2026-10-17):** the name is outlined by the site's own script-art shaping, `phraseShape` in `scripts/script-art/shape.mjs` (Alternates for layout and kerning, lowercase b from Regular), so it matches the script phrases on the site. Mat compared this side by side with the plain Regular letters and chose the alternates. Reuse `phraseShape` rather than copying it. In the spike the outline was rasterized with `sharp` to a mask 692 px tall at 4x (about 173 px of ink at 2x), giving a 761 x 253 px 2x image with padding, shown at about 380 px wide. The spike script is kept at `docs/superpowers/specs/2026-10-17-email-signature-spike.py` for reference; it rendered the Regular font directly, and the alternates run fed it that mask instead.

The builder may improve on this (pruning skeleton spurs, a better start point per piece) as long as the result still reads as one pen writing in order.

### The icons

After the name is written, the same pen draws the LinkedIn icon and then the GitHub icon, as one continuous line each, square ends, in the site's brand icon style. They un-draw before the name un-writes.

### The loop, and the first frame

One shared timeline for the name and both icons, so nothing drifts:

- **Frame 1 is the finished state:** the full name and both icons. This was Mat's choice, so Outlook on Windows, which shows only the first frame, displays the complete signature. (Vamp Network did the opposite.)
- Hold, un-draw the icons, un-write the name (the pen runs back to the start), short pause with nothing shown, write the name, draw LinkedIn, draw GitHub, and back to the hold.

Spike timings, to start from and tune: write 2.4 s, hold 3.6 s, erase 1.2 s, gap 0.6 s, gentle ease in and out. Mat asked for "hold for a few seconds, then erase and rewrite it". The exact numbers are the builder's call, to be checked with Mat when he sees the result.

If the name and icons are separate GIFs (the builder's call, see below), every GIF must have the same total cycle length, so they stay in step the way the Vamp Network ones do.

## Constraints

- **GIF only** for anything that moves. It is the only animation format that plays in Gmail, and Outlook on Windows falls back to the first frame.
- **Transparent background** on every GIF, so nothing sits in a white box in dark mode. GIF transparency is 1-bit: every pixel is either solid or clear. The brush texture in Gloss And Bloom makes edges ragged, so check that the name still looks clean at display size on both white and a dark background (around `#1f1f1f`). Rendering at 2x and displaying at half size is the expected way to keep edges tidy.
- **Colors:** vermilion for the animated parts. The text lines must stay readable on white and on a dark email background; the builder chooses their color and checks both.
- **Weight:** about 300 KB for all GIFs together. The spike was 1.6 MB, full-frame and antialiased on white; a two-color palette with transparency and frame-to-frame cropping should come in far under that.
- **Hosting:** the GIFs are served from `https://matbrown.io/email/v1/` (`public/email/v1/` in the repo). The folder is versioned because Gmail's image proxy caches by address for a long time; a later change to the art goes in `v2/` so it reaches pasted signatures. (Builder check, my call.) Gmail needs public image URLs, so the signature works only after a deploy. Per Mat's standing rule, the work goes on a branch with a deploy preview; nothing is pushed to `main` until he says so.
- **Base address is a setting** of the HTML renderer and the copy page, so the signature can be tested in Gmail against the deploy preview's address, then rendered again with `https://matbrown.io` after the merge for the copy Mat keeps. (My call.)
- **Release timing (Mat, 2026-10-17):** no production deploy until Monday's blog article is merged; the signature ships with that batch. Until then Mat uses the signature in Gmail pointing at the branch's deploy preview, and pastes it again from the copy page, pointing at `https://matbrown.io`, after the merge. The builder confirms the preview is publicly reachable (no password protection) before Mat pastes it, since Gmail must be able to fetch the images.
- **Name size:** shown at about 380 px wide, as in the spike Mat approved, from a 2x image. The name links to `https://matbrown.io` in a new tab. (My calls.)
- **Dependencies:** a small GIF encoder such as `gifenc` may be added as a dev dependency, for control over the palette, transparency and per-frame cropping that the weight budget depends on. The skeleton step is written in the repo, with tests. (My call.)
- **Fonts in email:** Gmail does not load web fonts. The text lines need a fallback stack that still looks right (for example the site's monospace label style falling back to Menlo, Consolas, monospace). The script name is safe because it is an image.
- **The font files never enter the repo** (`.fonts/` is git-ignored; the repo is public). The generator reads them from `.fonts/` and fails with a clear message if they are missing, like `npm run script-art` does.
- **The generated GIFs are committed,** like the script-art SVGs, so a deploy does not need the fonts.
- **Project rules apply:** TDD for every source file (`scripts/` is source), the copy rules in `CLAUDE.md` (no em dashes, American English, no symbol characters in visible text; the `|` in the tagline is a plain ASCII pipe and is fine).
- **Not a page on the public site.** The signature is not under `src/pages/`, is not in the sitemap and is not deployed as HTML.

## How it is built (decided)

- **A generator script in the repo** (`scripts/`), run by an npm script, makes the GIFs from the font, so Mat can change the timing or wording and regenerate. It runs on the repo's Node toolchain (`fontkit` and `sharp` are already dependencies); the Python spike was throwaway.
- **The signature HTML is rendered by a tested function,** following the Vamp Network pattern (`vamp-network/src/admin/signature/renderSignature.ts`): table layout, inline styles, absolute image URLs, `width` and `height` on every image, `alt` text on every image, links on the icons.
- **Installing it:** a local HTML page, opened in a browser, shows the rendered signature; Mat selects and copies it and pastes it into Gmail's signature settings. The page lives outside `public/` and `src/pages/` so it is never deployed.

## What is left to the builder

- One GIF for name plus icons, or separate GIFs (separate ones let each icon be its own link; one GIF cannot hold two links).
- Skeleton cleanup, start points and pen speed, as long as it reads as one pen writing in order.
- Exact timing within "a few seconds" of hold.
- The icon line drawings, in the brand style.
- Text colors and the font fallback stack, checked in light and dark.
- How the local copy page is generated and where it lives, within the constraints above.

## Non-goals

- No static PNG fallback set, and no plain-text version of the signature.
- No signature for Vamp Network or anyone else; this is Mat's own.
- No animation of the tagline or the domain.

## Anti-goals

- A plain left-to-right wipe instead of a pen moving through the letters.
- A visible jump or stutter at the loop point.
- A white or colored box around the name in dark mode.
- Outlook showing an empty or half-written first frame.
- The font files committed to the repo.

## Done when

- The GIFs are generated by the script, committed, and served from `/email/v1/` on a deploy preview.
- Pasted into Gmail, the signature shows the name writing through the letters, then the icons, then holds, un-writes and loops with no jump, on white and in dark mode.
- An Outlook-style first-frame view shows the complete signature.
- The total GIF weight is about 300 KB or less.
- Tests pass, and `npm run build` passes.
