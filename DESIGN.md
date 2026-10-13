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
- A vermilion block with `mix-blend-mode: multiply` tints the part of a black-and-white cut-out portrait it covers.

## Type

- Anton for display, always uppercase except the lowercase hero word. One weight: hierarchy comes from size and colour.
- Archivo for body text. JetBrains Mono for small uppercase labels.
- Gloss And Bloom is decoration only and ships as generated SVG (`npm run script-art`). At most two script moments per page, never in adjacent sections, never competing with a portrait.

## Devices

- Large solid vermilion blocks; cut-out portraits breaking out of them.
- Script written over the corner of a heading, with an edge in the background colour.
- Brush strikethrough (Extras stroke `e`) with the correction handwritten above.
- Monospace numbering on list items. No numbered labels on section headings.
- Rotated monospace labels on section edges.
- Square corners. Square ink arrow button, filled vermilion button, outlined ink button.

## Motion

- GSAP only. Durations and eases come from `src/lib/motionTokens.ts`.
- Reveals are declared in markup with `data-reveal` and run by `src/lib/reveal.ts`.
- Everything is visible without JavaScript and static under reduced motion.
