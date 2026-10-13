# Services, About and Contact (Astro rebuild): Design

Date: 2026-10-12
Status: Draft, awaiting review
Scope: Sub-project 3 of the Astro rebuild.
Base: branch `feat/astro-rebuild`, after sub-project 2 (Work index and case study pages).

Visual reference: [`assets/2026-10-12-services-about-contact-approved.jpeg`](./assets/2026-10-12-services-about-contact-approved.jpeg). This is the mockup the owner approved with "change nothing". It fixes composition, proportion, attitude and copy for all three pages. Section labels (S1 to S3, A1 to A6, K1, K2) are printed on it. Exact sizes and spacing are tuned in the browser. The mockup shows desktop only.

## Purpose

These pages are for prospective freelance clients. They should build enough trust to send an enquiry, and make sending one easy. They are also the last pages the navigation links to that do not exist, so building them unblocks merging to `main`.

## Context

Home's five discipline tiles link to `/services#<slug>`. The header, footer and contact band link to `/services`, `/about` and `/contact`. None of those pages exist. `src/content/disciplines.ts` already holds each discipline's blurb, description, deliverables, skills, call to action and proof case study, and was written to feed Services, About and the Contact project-type select. The old React app (`git show 0bfb10a:src/pages/{About,Services,Contact}.tsx`) is the source for page copy and for the contact form's fields and validation rules, not for design.

## Goals

- `/services`: one page with a section per discipline.
- `/about`: who the owner is, their background, and their skills by discipline.
- `/contact`: an enquiry form that works without JavaScript and is better with it.
- `/contact/thanks`: the confirmation page for a form sent without JavaScript.

## Non-goals

- No page per discipline. The owner chose one Services page.
- No testimonials, client logos, pricing, process claims or reply-time promise. The owner supplied none, and declined a reply-time promise.
- No JSON-LD, favicon or social images (sub-project 5). No Blog (sub-project 4).
- No React on these pages beyond the shared header's mobile menu.
- No change to Home, Work or the case study pages, other than what the shared discipline copy changes on Home.

## Constraints

Everything in the sub-project 1 and 2 specs' "Constraints" still binds: the TDD kit; colours limited to ivory, ink, vermilion and stone through the theme names; small vermilion text only on ink, and text on a vermilion fill is ink; Anton, Archivo and JetBrains Mono; GSAP only, through `data-reveal`; reduced motion respected; nothing hidden without JavaScript; hover never moves an ink surface; first-person copy with no em or en dashes, passed through the `humanizer` skill; the design skills in `CLAUDE.md` section 8; the purchased script font never committed; at most two script moments a page, never beside a portrait. In addition:

- **Copy is as written in this spec.** The owner approved it in the mockup. The About background states only the facts the owner supplied on 2026-10-12, with the numbers exactly as given.
- **The form's main path must not depend on JavaScript.**

## Part 1: Shared content

### Disciplines (`src/content/disciplines.ts`)

Still the single source for the five disciplines. Three deliverable lines change to match the approved mockup:

| Discipline | Was | Now |
|---|---|---|
| UX/UI Engineering | Figma-to-code with zero quality loss | Figma designs built in code as designed |
| SEO/AEO | Technical SEO audit and remediation | Technical SEO audit and fixes |
| SaaS Development | Custom dashboards on React, Vite, and Supabase | Custom dashboards on React, Vite and Supabase |

The `description` field is no longer shown anywhere (Services uses the `blurb`) and is removed from the interface and the data. The two `TODO: owner review` comments on Brand Development and SaaS Development stay until the owner confirms that copy.

### About facts (`src/content/about.ts`)

A data-only module holding the four facts shown in A3, so the numbers live in one place:

| Label | Value | Sentence |
|---|---|---|
| Software & UX/UI | 10 | Years in software development and UX/UI design. |
| Search | 8 | Years in SEO. |
| Design & engineering | 6 | Years since I added design and engineering to the research work. |
| Based | O'ahu, Hawai'i | Most clients work with me remotely. A few are local, like 'Aiwi Waffles. |

### Contact options (`src/content/contactOptions.ts`)

A data-only module with the budget ranges, in order: "Under $1,000", "$1,000 to $3,000", "$3,000 to $7,000", "$7,000 to $10,000", "$10,000+". These are the old site's ranges, worded without hyphens. The project-type options are the five discipline titles followed by "Multiple services".

### Script artwork

Add two phrases to `src/assets/script/phrases.json` and regenerate with `npm run script-art`:

- `what-i-do`, text "what I do", vermilion with an ivory edge (Services header).
- `always-building`, text "always building", vermilion with a stone edge `#e4dfd3` (About background, which sits on stone).

`lets-talk` already exists and is reused on Contact.

## Part 2: Services (`src/pages/services.astro`)

- **S1. Header.** Same pattern as the Work header. Giant Anton "Services" with a vermilion full stop, decorative. Script "what I do" over the top right corner of the word, clear of the full stop and of the site header. The keyword `h1`, "UX/UI Engineering, SEO & AI Workflow Services", in the small text block with a rule above it. A rotated label: "5 disciplines" and "one person"; the count is computed from the data.
- **Jump strip.** An ink strip under the header with one link per discipline: vermilion number, Anton title, each linking to `#<slug>` on the same page. It is a `nav` with an accessible name ("Services on this page").
- **S2. Discipline sections.** One `section` per discipline with `id="<slug>"`, so Home's links and the jump strip land on it. Each holds: the Anton title as an `h2`; the `blurb`; a "What you get" list of the deliverables, numbered 01 to 04; a proof card naming the proof case study and linking to `/work/<proofSlug>`; and a button with the discipline's `cta` text linking to `/contact?service=<slug>`. A giant decorative Anton number sits behind the title, `aria-hidden`.
  - Surfaces cycle ivory, stone, ink, vermilion, then repeat. The title side alternates left and right.
  - On the ink section the small numbers and the "What you get" label are vermilion. On every other surface they are ink.
  - The button is vermilion on ivory and ink, and ink on stone and vermilion, so it always contrasts with its surface.
  - The proof card's title comes from the case study collection, not from a copy of the name. A discipline whose `proofSlug` matches no case study shows no proof card and the build still passes.
  - Each section's top is offset for the fixed site header when reached by its anchor.
- **S3.** The shared contact band and footer.
- **Head.** Title "UX/UI Engineering, SEO & AI Workflow Services". Description: "I offer UX/UI engineering, SEO and AEO, agentic workflows, brand development and SaaS development as a freelancer. See what each one includes and the work behind it."
- **Mobile.** The jump strip becomes a two-column grid. Each section stacks: title, blurb, list, proof card, button. The decorative number stays behind the title and never causes horizontal scroll.

## Part 3: About (`src/pages/about.astro`)

- **A1. Hero.** "Mathew Brown" in Anton on two lines, decorative. The About cut-out portrait (`src/assets/portraits/about.png`) on a vermilion block to the right, tinted by a vermilion `multiply` layer, with the top of the portrait breaking out above the block. The keyword `h1`, "About Mathew Brown: UX/UI Engineer & SEO Specialist", in the small text block at the lower left. A rotated label: "O'ahu, Hawai'i" and "Working remotely". No script in this section, because it has a portrait.
- **A2. Bio.** Left, an Anton statement as an `h2`: "One person across design, code and search." with "and" in vermilion (large display type, so vermilion on ivory is allowed). Right, three paragraphs (copy below). "my blog" links to `/blog`.
- **A3. By the numbers.** An ink strip built like the case study at-a-glance strip: a rotated "By the numbers" label and four cells from `src/content/about.ts`. Each cell has a vermilion label, a giant vermilion Anton number (or the Anton place name in ivory for "Based"), and one sentence. It is a `dl`, with a visually hidden `h2` "By the numbers".
- **A4. Background.** On stone. Left, an `h2` in Anton on two lines: "Research first." and "Self-taught." with script "always building" below the heading's lower left, overlapping its last line slightly and staying inside the left column. Right, two paragraphs, then an ink panel labelled "// Off the clock" with the Jarvis paragraph (copy below).
- **A5. Skills.** An `h2`, "Skills across five disciplines". Five columns, one per discipline: number, the title as an `h3`, the six skills as a list, and a "See the service" link to `/services#<slug>`. The link's accessible name includes the discipline, for example "See the UX/UI Engineering service".
- **A6.** The shared contact band and footer.
- **Head.** Title "About Mathew Brown: UX/UI Engineer & SEO Specialist". Description: "I'm Mathew Brown, a freelance UX/UI engineer and SEO specialist based on O'ahu, Hawai'i, with 10 years in software development and UX/UI design."
- **Mobile.** The hero stacks: name, `h1`, then the portrait on its block. The bio stacks statement then paragraphs. The facts strip becomes two columns. Background stacks heading then text. Skills become two columns, then one on narrow phones.

### About copy

A2:

> I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer. I design interfaces, build them in production React, set them up to rank in search, and connect them to AI workflows.
>
> I work with founders and businesses who want one person across design, code and search. You talk to the person doing the work, so decisions are quick and nothing gets lost in a handoff.
>
> When I'm not building, I write about design engineering, technical SEO and agentic tooling on my blog.

A4:

> I started on the research side of both UX/UI and SEO. Over the past six years I added design and engineering, so I can take a project from the first question to shipped code.
>
> I'm self-taught, and studying the industries I work in is one of my hobbies. I follow where AI is heading and how people can use it to move their careers forward and get time back for the people and things they love.

A4, "Off the clock":

> I spend an unhealthy amount of time building personal projects. One of them is my own version of Tony Stark's Jarvis. I'm turning it into a full operating system that automates my own business, so I can get more done for clients.

The owner's notes said "100x more efficient". The approved copy says "get more done for clients", in line with the rule that body copy makes no exaggerated claims.

## Part 4: Contact

### Page (`src/pages/contact/index.astro`)

- **K1. Intro, left.** "Start a project" in Anton on two lines with a vermilion full stop, decorative. Script "let's talk" over the top right corner of "Start a", staying in the left column. The keyword `h1`, "Hire a UX/UI Engineer & SEO Specialist". One sentence: "Tell me about your project and I'll be in touch." Then two facts: Email, `mat@matbrown.io` as a `mailto:` link in Anton; Based, "O'ahu, Hawai'i. I work with most clients remotely."
- **K1. Form, right.** An ink panel holding the form (below).
- No contact band on this page; the footer follows directly.
- The site header's "Start a project" button shows its current-page state on `/contact`: ink fill with ivory text and `aria-current="page"`.
- **Head.** Title "Hire a UX/UI Engineer & SEO Specialist". Description: "Tell me about your UX/UI, SEO, AI workflow, brand or SaaS project. Send the form or email mat@matbrown.io."
- **Mobile.** Intro first, then the form panel full width. The two-column field rows become one column.

### The form

Static markup, posted to Netlify Forms:

- `<form name="contact" method="POST" action="/contact/thanks/" data-netlify="true" netlify-honeypot="bot-field">` with a hidden `form-name` input and a honeypot field hidden from sight and from assistive technology.
- Fields, in order: Name (text, required, `autocomplete="name"`); Email (email, required, `autocomplete="email"`); Company (text, required, `autocomplete="organization"`); Project type (select, required: "Select a service", the five discipline titles, "Multiple services"); Budget (select, required: "Select a range", then the ranges in Part 1); Message (textarea, optional).
- Every field has a visible `label`. Required fields are marked with an asterisk and the form carries a "* Required" note. Message is marked "(optional)".
- The submit button reads "Send enquiry".
- Inputs are square, with a 2px ivory outline on ink; an invalid field's outline turns vermilion and its message appears below it in vermilion monospace (small vermilion text on ink is allowed).

**Without JavaScript:** the browser's own validation runs from the `required` and `type` attributes, the form posts to Netlify, and the visitor lands on `/contact/thanks/`.

**With JavaScript** (`src/lib/contactForm.ts`, started from the page's script):

- Turns off the browser's validation bubbles (`novalidate`) and validates itself.
- **On leaving a field** it shows that field's error, or clears it. **On submit** it validates every required field, shows all errors, and moves focus to the first invalid field.
- Each error is tied to its field with `aria-describedby` and the field gets `aria-invalid="true"`. Errors are removed when the field becomes valid.
- **Preselect:** `?service=<slug>` selects the matching project type on load. An unknown slug selects nothing.
- **Send:** posts the form as `application/x-www-form-urlencoded` to the form's own page, as Netlify Forms expects. While sending, the button is disabled and reads "Sending". A second submit cannot start while one is in flight.
- **Success:** the form is replaced by the K2 confirmation inside the same panel, and focus moves to its heading.
- **Failure** (network error or a non-2xx response): the form stays filled in, the button is restored, and a message appears above the button: "Something went wrong. Email me at mat@matbrown.io." with the address as a `mailto:` link. The message is announced to assistive technology (`role="alert"`).
- The script never reads or validates the honeypot field; it is sent with the rest of the form and Netlify discards a submission that filled it.

Error messages: "Please enter your name.", "Please enter your email.", "Please enter a valid email address.", "Please enter your company.", "Please choose a project type.", "Please choose a budget range."

### Confirmation (K2)

One component used in two places: inside the form panel after a JavaScript send, and as the body of `/contact/thanks/`. Vermilion block, ink text: Anton "Got it. Thank you." on two lines; "Your message is on its way to me. I'll be in touch."; an ink button "See my work" to `/work`. No reply time is stated.

### Thanks page (`src/pages/contact/thanks.astro`)

The confirmation as a full page, with the heading as its `h1`. `noindex`, and left out of the sitemap.

## Part 5: Logic (all test-first)

| Unit | Purpose |
|---|---|
| `src/lib/contactValidation.ts` | `validateContactField(field, value)` returning a message or `null`; `REQUIRED_CONTACT_FIELDS` in form order; `serviceFromQuery(search, disciplines)` returning the discipline title for a `?service=` slug or `null`. Ported from the old app |
| `src/lib/contactForm.ts` | `initContactForm(root?)`: the enhancement described in Part 4 (blur and submit validation, focus on the first invalid field, preselect, send, success, failure, no double send). Returns a cleanup function. Takes its `fetch` from the environment so tests can stub it |
| `src/lib/serviceSections.ts` | `serviceSections(disciplines, caseStudies)`: one entry per discipline with its surface (ivory, stone, ink, vermilion, cycling), title side, button variant, the contact link, and the proof case study's title and link or `null` when there is none |
| `src/content/disciplines.test.ts` | Updated for the copy changes and the removed `description` field |

`src/content/about.ts` and `src/content/contactOptions.ts` are data-only and need a test only for shape (the facts are four, the budget list is not empty and has no duplicates).

## Docs

Update `MEMORY.md` (roadmap row 3, what exists, owner inputs) and `CLAUDE.md` section 5 (where the About facts, contact options and discipline copy live; that the contact form posts to Netlify Forms and must keep working without JavaScript).

## Testing and verification

- **Unit (Vitest, test-first):** every unit in Part 5. `contactForm` is tested in jsdom against the real form markup shape: each failure message, focus on the first invalid field, `aria-invalid` and `aria-describedby`, preselect with a known and an unknown slug, a successful send, a failed send (rejected and non-2xx), and no second request while one is in flight.
- **Static checks:** `npm run typecheck`, `npm run build`. The build emits `/services/`, `/about/`, `/contact/` and `/contact/thanks/`; each has exactly one `h1` and no em or en dashes; the sitemap lists the first three and not the thanks page; the thanks page carries `noindex`; the built form has `data-netlify`, the hidden `form-name` input and all six named fields.
- **Links:** every `/services#<slug>` on Home lands on a section; every service button carries the right `?service=`; every proof card resolves; no nav or footer link is left pointing at a missing page except `/blog`.
- **Browser:** 1440x900, 1024x768 and 390x844; reduced motion; keyboard pass through each page from a fresh load, including the whole form; JavaScript disabled (the form still validates natively and its `action` is the thanks page); section-by-section comparison with the reference image.
- **Form end to end:** the network request is checked locally for method, URL and encoded body. A real submission can only be confirmed on a deployed Netlify build.

## Risks and mitigations

- **Netlify Forms is not enabled or the form is not detected.** The form must be in the built HTML (it is, as static markup). Enabling form detection and the notification email is a setting in the owner's Netlify dashboard; until a deploy proves it, the failure message with the email address is the fallback.
- **A long discipline title or call to action.** Sections are tuned for the five current titles; the build checks a deliberately long one for overflow.
- **`description` removed from disciplines.** Nothing else reads it; the build and typecheck prove that.
- **Vermilion section.** Body text and numbers on the vermilion Brand Development section are ink, and its button is ink, so nothing small is vermilion on vermilion.

## Owner inputs needed

- Enable Netlify Forms for the site and set where submissions are sent, then send one test enquiry after the first deploy.
- Confirm the Brand Development and SaaS Development copy in `src/content/disciplines.ts`, still marked for review.
- A larger About portrait when one is found (`about.png` is 626x874); the hero is built to take it.
