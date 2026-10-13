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
