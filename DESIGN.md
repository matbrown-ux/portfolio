<!-- SEED — re-run $impeccable document once there's code to capture the actual tokens and components. -->

---
name: Mathew Brown Portfolio
description: Premium freelance portfolio — UX/UI engineer, SEO specialist, agentic workflow developer.
---

# Design System: Mathew Brown Portfolio

## 1. Overview

**Creative North Star: "The Director's Cut"**

This system is built on the premise that the portfolio IS the work. Every layout decision, typographic scale, and motion sequence is a credential — a live demonstration of the UX/UI engineering on offer. There is no separation between showing and telling.

The visual language draws from the same authority as Blind Studios and Nike.com: near-black surfaces, geometric type at bold scale, high-contrast white, and one committed accent color used with complete conviction. The motion is choreographed — not decorative, but structural. Orchestrated entrances and scroll-driven sequences signal that someone with a director's hand is in control of every frame.

The system rejects the SaaS cream aesthetic (Inter on white, identical feature cards, indigo accents, skill bars), portfolio bravado (Dribbble-style over-design, gradient text, hero-metric templates), and anything that reads as template-first. A visitor should not be able to identify the grid. They should only feel that everything is exactly where it belongs.

**Key Characteristics:**
- Near-black dominant surface (30–60% of any screen) reads as immediate authority
- One committed accent — warm, saturated, used with purpose not decoration
- Geometric sans at aggressive scale — size IS the hierarchy
- Choreographed motion as a design statement, not an effect
- Radical whitespace discipline — negative space is not emptiness, it is confidence
- Zero decorative elements that don't carry meaning

## 2. Colors

A high-contrast two-surface system — near-black and near-white — anchored by one committed accent in the warm register.

### Primary
- **Director's Black** (oklch — near-black with a near-zero warm tint, [to be resolved during implementation]): The dominant surface. Used for hero sections, full-bleed backgrounds, and anywhere the work needs to announce itself. Never pure `#000` — always tinted toward the accent hue at chroma 0.006–0.010.

### Secondary
- **Committed Accent** (oklch — warm register: amber, garnet, or deep vermilion family, [to be resolved during implementation]): The signature mark. Used at 30–50% visual weight — this is the "committed" color. Appears in large type, section backgrounds, active states, and the primary CTA. Must feel like a deliberate choice, not a brand color added by committee.

### Neutral
- **Page White** (oklch — near-white with a near-zero warm tint, [to be resolved during implementation]): Type on dark, backgrounds on light sections. Never pure `#fff`. Tinted toward the accent hue at chroma 0.004–0.008.
- **Muted Prose** (oklch — mid-range lightness, low chroma, [to be resolved during implementation]): Secondary text, labels, metadata. Readable without competing with primary type.
- **Border Line** (oklch — slightly above Director's Black, [to be resolved during implementation]): Dividers and subtle containers. Barely visible on dark surfaces, structural on light.

### Named Rules
**The One Accent Rule.** There is one committed accent color in this system. It is used boldly — not sprinkled. When it appears, it commands attention. Introducing a second accent color is prohibited.

**The Tinted Neutral Rule.** No pure black. No pure white. Every neutral is tinted toward the accent hue. The difference is invisible at a glance and unmistakable as a system.

## 3. Typography

**Display Font:** A geometric sans-serif — precise, rational, structural. [Font pairing to be chosen at implementation — candidates: Neue Haas Grotesk, Aktiv Grotesk, Monument Grotesk, Suisse Int'l. Avoid Inter; too common.]

**Body Font:** Same geometric sans at regular weight — single-family system. The hierarchy lives entirely in scale and weight contrast, not in a family change.

**Character:** A single geometric sans at extreme scale contrast. The display size is aggressive — the kind of headline that takes up half the viewport. The body is disciplined and restrained. The pairing signals complete typographic control, which is itself a credential.

### Hierarchy
- **Display** (700–800 weight, `clamp(3.5rem, 9vw, 7rem)`, line-height 0.9–0.95, tracking -0.02em to -0.04em): Hero headlines, section-opening statements. One thought, no line breaks. The typography announces a decision-maker.
- **Headline** (600–700 weight, `clamp(2rem, 5vw, 3.5rem)`, line-height 1.0–1.1): Page titles, major section headers. Bold but not shouting.
- **Title** (500–600 weight, `clamp(1.25rem, 2.5vw, 1.75rem)`, line-height 1.2): Case study titles, service headings, card headlines.
- **Body** (400 weight, 1rem/16px, line-height 1.65–1.7, max-width 65ch): Prose content. Never centered. Never wider than 65ch. The restraint signals craft.
- **Label** (500 weight, 0.6875rem–0.75rem, letter-spacing 0.08–0.12em, uppercase): Tags, captions, metadata, navigation items. The geometric family at small scale with tracking reads as authoritative.

### Named Rules
**The Scale-as-Hierarchy Rule.** Weight and size are the only typographic tools. No font mixing, no color differences in body type, no italic as emphasis. If it needs emphasis, it needs to be bigger or bolder — not decorated.

**The Aggressive Display Rule.** Display type should feel almost too large on first impression. Then correct. Pulling back from "too large" produces "fine." Staying at "too large" produces memorable.

## 4. Elevation

Flat by default on light surfaces. On dark surfaces, layering is achieved through opacity and subtle border lines rather than shadows. Shadows are reserved for interactive state response only — an element earning its lift through user action, not decoration.

### Shadow Vocabulary
- **Hover Lift** (`0 8px 40px rgba(0,0,0,0.18)`, [accent color ambient glow at very low opacity to be resolved]): Cards and interactive elements on hover only. Not present at rest.

### Named Rules
**The Flat-By-Default Rule.** Nothing casts a shadow at rest. Shadows are a state change, not a style. A shadow at rest means the element is always asking for attention — that is the designer admitting they don't trust the layout to do the work.

## 5. Components

*Omitted in seed mode — no components exist yet. Re-run `$impeccable document` after implementation to capture real component tokens.*

## 6. Do's and Don'ts

### Do:
- **Do** use Director's Black for hero sections and full-bleed moments. The dark surface is the brand signal.
- **Do** let display type occupy 40–60% of the viewport height in hero sections. The scale is the statement.
- **Do** use the committed accent boldly — large text, CTA backgrounds, active section backgrounds. When it appears it should feel intentional and generous, not sprinkled.
- **Do** leave generous whitespace between sections. The gap is not emptiness — it is the breath between statements.
- **Do** choreograph page transitions and section entrances. The motion sequence should feel like an editorial director decided the timing.
- **Do** respect `prefers-reduced-motion` without collapsing the layout — static states must be as considered as animated ones.
- **Do** cap body text at 65ch and left-align it. Centered prose is an amateur signal.
- **Do** test every screen by asking: "Could someone tell this was designed by AI?" If yes, redesign until the answer is no.

### Don't:
- **Don't** use the SaaS cream aesthetic: white backgrounds, Inter, indigo/teal accents, feature card grids, skill bars. Per PRODUCT.md: this is a named anti-reference.
- **Don't** use gradient text (`background-clip: text`). Prohibited without exception.
- **Don't** use `border-left` or `border-right` greater than 1px as a decorative colored stripe on cards or callouts. Rewrite with background tint or full border.
- **Don't** use glassmorphism decoratively. Blur effects are not a substitute for compositional thinking.
- **Don't** use the hero-metric template (big number, small label, supporting stats, gradient accent). SaaS cliché, per the AI slop test.
- **Don't** repeat the same card pattern more than twice on one page. Identical grids signal template-first thinking.
- **Don't** introduce a second accent color. The system has one committed accent. A second creates competition, not richness.
- **Don't** animate layout CSS properties (width, height, top, left, margin). Animate `transform` and `opacity` only.
- **Don't** use bounce or elastic easing. Ease out with exponential curves (ease-out-quart, ease-out-expo). Premium motion is decisive, not playful.
- **Don't** make this feel like it was designed by an AI. Per PRODUCT.md: the system must be unmistakably hand-directed. Custom compositions, deliberate exceptions, evidence of a designer's judgment at every decision point.
