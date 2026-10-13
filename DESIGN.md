---
name: Mathew Brown Portfolio
description: Brutalist freelance portfolio on a light ground. UX/UI engineer, SEO specialist, agentic workflow developer.
colors:
  ivory: "#f4f0e6"
  ink: "#0c0c0c"
  vermilion: "#f86343"
  stone: "#e4dfd3"
typography:
  display:
    fontFamily: "Anton, Impact, sans-serif"
    fontWeight: 400
    textTransform: uppercase
    lineHeight: 0.98
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.08em"
    textTransform: uppercase
---

# Design

Source of truth: `docs/superpowers/specs/2026-10-12-design-foundation-home-design.md` and its reference image in `docs/superpowers/specs/assets/`.

## Colour

- Ivory is the page. Ink is text on ivory and the background of dark sections. Vermilion is the only accent. Stone is a neutral fill.
- There is no dark theme. Dark is a section style.
- Small vermilion text appears only on ink. Text on a vermilion fill is ink.
- All three portraits (Home hero, Home About teaser, About hero) sit on a solid vermilion block, and the black-and-white cut-out itself carries `mix-blend-mode: multiply`. The portrait takes the vermilion where it overlaps the block and sits on ivory outside it, and the block is exact brand vermilion `#f86343`. Do not tint a portrait with a vermilion multiply layer over the page: that layer samples about `#ed5d3c`. The owner asked for exact vermilion on 2026-10-12.

## Type

- Anton for display, always uppercase except the lowercase hero word. One weight: hierarchy comes from size and colour.
- Archivo for body text. JetBrains Mono for small uppercase labels.
- Gloss And Bloom is decoration only and ships as generated SVG (`npm run script-art`). At most two script moments per page, never in adjacent sections, never competing with a portrait.

## Devices

- Large solid vermilion blocks; cut-out portraits breaking out of them.
- Script written over the corner of a heading, with no outline: the vermilion lettering sits directly on the letters it crosses.
- Brush strikethrough (Extras stroke `e`) with the correction handwritten above.
- Monospace numbering on list items. No numbered labels on section headings.
- Rotated monospace labels on section edges.
- Square corners. Square ink arrow button, filled vermilion button, outlined ink button.
- The `ink` button variant has an ink fill and becomes an ink outline on hover, with a permanent 2px border so it never changes size. The `current` state is an ink fill for the button that points at the page you are on.

## Motion

- GSAP only. Durations and eases come from `src/lib/motionTokens.ts`.
- Reveals are declared in markup with `data-reveal` and run by `src/lib/reveal.ts`.
- Everything is visible without JavaScript and static under reduced motion.
- The header has three states. At the top of a page it sits over the hero with no background. It leaves the screen on the way down, and on the way up it comes back fixed to the top edge on a solid ivory bar with a 1px ink rule along the bottom, so it reads on ink, vermilion, stone and ivory. The slide is a 0.2s CSS transition in step with `DURATION.fast`; under reduced motion it appears and disappears, and without JavaScript it stays in the first state.

## Blog

Source of truth: `docs/superpowers/specs/2026-10-12-blog-design.md` and its approved mockup in `docs/superpowers/specs/assets/`. Three page types, none with a React island. Every blog page ends with the shared contact band.

- **Index (`/blog`).** The header follows the Work and Services pattern: the display word "Blog" with a vermilion full stop, the `notes` script artwork over it (the blog's one script moment besides the contact band), a mono `h1` and a rotated label with the topic and article counts. The latest article is one link made of a vermilion panel (topic name and title in display type) and an ink panel (what it covers, date, reading time, a vermilion button); further new articles follow as article rows. Below it, the topics are a ruled index grouped by discipline in `disciplines.ts` order. A topic with articles shows a solid ink status, an empty topic an outlined "Nothing yet" with quieter text that still passes AA on ivory.
- **Topic page.** A breadcrumb above the topic title in display type (scaled by `titleFit`, `leading-[0.92]`), the mono `h1`, the introduction, and an ink "Part of" card that links to the service. Articles are ruled rows: date and reading time, title in display type, description and an arrow. Under the rows a two-cell stone strip lists sibling topics in the discipline and links to all topics; with one cell it takes the full width. A topic with no article shows an ink panel instead of the rows, with a "0 articles" label, a heading, one sentence and two buttons, one vermilion and one outlined.
- **Article page.** The title is the `h1` in display type, followed by the description and an ink strip of four cells (Published, Reading time, Topic, Discipline) in the manner of the case study "at a glance". From `xl` the body has a sticky contents list on the left and one reading column of `64ch` on the right; below `xl` the list sits above the article. The list marks the section being read with an ink bar and `aria-current="location"`. The prose scale sets `h2` and `h3` in display type, with links, lists, block quotes, rules, images and inline code on stone, scoped so it does not reach into block components. A nested list keeps the marker and indent of the list around it, an `h4` is a mono label, and a table has mono label head cells over a 2px ink rule, 1px rules between rows, and scrolls sideways inside itself when it is wider than the column. A long path or URL breaks inside the column.
- **Code block.** Ink ground, ivory text, a top bar that shows the language only. Colours come from the palette alone: vermilion for tags and keywords, ivory for strings and text, a muted ivory for attributes and comments. Long lines scroll inside the block, which takes keyboard focus. In print the block is ink text inside a 1px ink border with no fill, and long lines wrap.
- **`<Terms>`.** A ruled list of named items, the name in display type and the text beside it.
- **Where next.** Three tiles on stone after the article: "More on this topic", "The service behind it" (the middle tile, solid vermilion with ink text) and "Keep reading". Focus rings sit inside each tile.
- **Rules that held.** Small vermilion text appears only on ink, the breadcrumb sits on `relative z-10` so a display title's glyph box cannot cover it, and hover changes colour only, never an ink surface's position.

## Share card and favicon

Source of truth: `docs/superpowers/specs/2026-10-13-seo-launch-design.md` and the approved reference in `docs/superpowers/specs/assets/2026-10-13-share-card-favicon-approved.jpeg`. Both are generated, so neither is hand-drawn. Their hex values are the only place the palette is written as literals, because they are built outside CSS.

- **Share card.** 1200x630 PNG, one per page, served at `/og/<path>.png`. Ivory ground with a full-height solid vermilion block on the right. The mono label sits top left, the Anton title below it, and a short ink rule and the mono address at the foot; all type is ink. The ink MB mark sits at the bottom right of the block. A case study with a raster hero (or a video poster) gets a wider block holding the capture inside an ink frame, and no mark. The title is set as outlines on at most two lines, never ends a line on "&", and steps down in size until it fits, to a floor of 24. No Gloss And Bloom.
- **Favicon.** The ink MB mark on a solid vermilion square, as an SVG plus an ICO, a 180px apple-touch icon and 192px and 512px PNGs, listed in `site.webmanifest` (`theme_color` vermilion, `background_color` ivory). The mark fills 92% of the square (`MARK_SHARE` in `scripts/favicons/icons.mjs`), tighter than the approved mock so it holds its strokes at 16px. Regenerate with `npm run favicons`.
- **Header profile icons.** LinkedIn and GitHub in the header bar and the mobile menu, in ink on ivory at 20px, bold-weight outlines that match the mono labels. Hover fills the square ink, and focus is an ink ring (the default `currentColor` ring would be ivory on ivory).
