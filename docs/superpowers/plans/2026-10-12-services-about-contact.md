# Services, About and Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/services`, `/about`, `/contact` and `/contact/thanks` in the approved brutalist design, with an enquiry form that works without JavaScript and is better with it.

**Architecture:** Static Astro pages with no React. Services and About read the five disciplines from `src/content/disciplines.ts`; a tested module turns them into Services sections. The contact form is plain HTML posted to Netlify Forms, and one tested TypeScript module (`contactForm.ts`) adds inline validation, the `?service=` preselect, an in-place send and the confirmation.

**Tech Stack:** Astro 7 (static, content collections, `astro:assets`), Tailwind CSS 4, GSAP reveals through `data-reveal`, Vitest 5 + jsdom, Netlify Forms.

**Spec:** `docs/superpowers/specs/2026-10-12-services-about-contact-design.md`. Visual reference: `docs/superpowers/specs/assets/2026-10-12-services-about-contact-approved.jpeg` (section labels S1 to S3, A1 to A6, K1, K2 are printed on it; desktop only). Read both before any task. The sub-project 1 and 2 specs in the same folder define the design system and the patterns these pages reuse.

## Global Constraints

- Work on branch `feat/astro-rebuild`. Do not push.
- **TDD kit:** every `.ts`, `.tsx`, `.mjs` under `src/` or `scripts/` gets a failing test first, including data modules under `src/content/`. The pre-commit hook refuses source without a test. Never add a `Test-Exempt:` trailer. Never skip the git hooks in any way.
- `.astro`, `.css`, `.mdx`, `.md`, `.json`, images and `*.config.*` are content: no unit test, verified by `npm run typecheck`, `npm run build` and the browser.
- Keep logic out of `.astro` frontmatter. Anything with a branch or a calculation goes in a `.ts` file. A lookup object of class names is fine.
- Logic modules must not share a basename with a component case-insensitively (macOS).
- Every commit message ends with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01D79s9xirtfhJAjjmYsQLVp`
- Colours: ivory `#f4f0e6`, ink `#0c0c0c`, vermilion `#f86343`, stone `#e4dfd3`, through the theme names only. No other colours. Tints are a theme colour mixed with `transparent` (Tailwind's `/15` opacity modifier does this).
- Small vermilion text (numbers, labels, error messages) only on ink, in every state. Text on a vermilion fill is ink. Large display type may be vermilion on ivory or stone.
- Type: Anton (`type-display`), Archivo (body), JetBrains Mono (`type-label`). Gloss And Bloom only as generated SVG; never commit a `.ttf`, `.otf`, `.woff` or `.woff2` of it.
- At most two script moments a page, never in a section with a portrait.
- **No React on these pages.** No `client:` directive anywhere in this sub-project.
- Animation is GSAP only, declared with `data-reveal` (`rise`, `wipe`, `fade`), optional `data-reveal-delay` (seconds), `data-reveal-index` (stagger) and `data-reveal-on="load"`. Do not move ink surfaces with `transform` on hover.
- All motion respects `prefers-reduced-motion`. Nothing is hidden unless JavaScript has run and motion is allowed.
- **Copy is exactly as written in this plan.** The owner approved it. First person, no em or en dashes, straight quotes. Never fabricate a fact, a metric or a promise. No reply time is promised anywhere.
- **The contact form's main path must not depend on JavaScript.**
- If a task forces you to add a visible string this plan does not give, run it through the `humanizer` skill, keep it to the copy rules in `CLAUDE.md` section 2, and list it in your report for the owner.
- Design skills (load before any `.astro` styling task): `industrial-brutalist-ui` leads, then `high-end-visual-design`, then `frontend-design` + `design-taste-frontend`; `impeccable` for easing and timing. Locked decisions in the specs and the approved mockup override any skill default.
- The site header is `absolute` at the top of the page, not fixed, so anchors need no scroll offset.
- Do not kill dev servers by process name. Start your own with `npx astro dev --port 4321` and stop that one. Never run the test suite while your dev server is running.
- Browser checks use the Playwright MCP tools if they connect. If they do not, build, serve `dist` with `python3 -m http.server 4488 --directory dist --bind 127.0.0.1`, and take screenshots with headless Chrome (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --window-size=<w>,<h> --screenshot=<file> <url>`); then list every interactive check (hover, focus, keyboard, form behaviour) as NOT RUN in your report. Screenshots go under `.playwright-mcp/`.
- Built pages are single minified lines: count matches with `grep -o '<pattern>' <file> | wc -l`, not `grep -c`.

## Review Focus

1. **A required field holding only spaces.** A person who taps the space bar in "Company" expects to be told it is empty, not to send a blank enquiry. Pinned in Task 2.
2. **A double click on "Send enquiry".** A person on a slow connection expects one enquiry to be sent, not two. Pinned in Task 2.
3. **A send that fails.** A person whose connection drops expects what they typed to still be there, the button to work again, and a way to reach the owner. Pinned in Task 2.
4. **A `?service=` value that matches nothing.** A person following an old or mistyped link expects the form to load normally with nothing selected. Pinned in Task 2.
5. **A discipline whose proof case study has been removed.** A person who deletes a case study expects Services to build and simply drop that proof card. Pinned in Task 1.

---

### Task 1: Shared content and the Services section logic

**Files:**
- Modify: `src/content/disciplines.ts`, `src/content/disciplines.test.ts`
- Create: `src/content/about.ts`, `src/content/about.test.ts`, `src/content/contactOptions.ts`, `src/content/contactOptions.test.ts`, `src/lib/serviceSections.ts`, `src/lib/serviceSections.test.ts`

**Interfaces:**
- Consumes: the existing `Discipline` interface and `disciplines` array.
- Produces:
  - `Discipline` without the `description` field.
  - `src/content/about.ts`: `interface AboutFact { label: string; value: string; kind: 'number' | 'place'; sentence: string }`; `aboutFacts: AboutFact[]` (four entries).
  - `src/content/contactOptions.ts`: `budgetRanges: string[]`; `MULTIPLE_SERVICES = 'Multiple services'`.
  - `src/lib/serviceSections.ts`: `type ServiceSurface = 'ivory' | 'stone' | 'ink' | 'vermilion'`; `interface ProofStudy { id: string; data: { title: string } }`; `interface ServiceSection { discipline: Discipline; surface: ServiceSurface; titleSide: 'left' | 'right'; button: 'accent' | 'ink'; contactHref: string; proof: { title: string; href: string } | null }`; `serviceSections(disciplines: Discipline[], caseStudies: ProofStudy[]): ServiceSection[]`.

- [ ] **Step 1: Write the failing tests**

In `src/content/disciplines.test.ts`, replace the last test ("has complete copy with no em or en dashes") with these two:

```ts
  it('has complete copy with no em or en dashes and no unused description', () => {
    for (const d of disciplines) {
      expect(d.cta, d.slug).toBeTruthy()
      expect(d.deliverables, d.slug).toHaveLength(4)
      expect(d.skills.length, d.slug).toBeGreaterThan(0)
      expect(d, d.slug).not.toHaveProperty('description')
    }
    expect(JSON.stringify(disciplines)).not.toMatch(/[—–]/)
  })

  it('uses the deliverable wording the owner approved', () => {
    const lines = disciplines.flatMap((d) => d.deliverables)
    expect(lines).toContain('Figma designs built in code as designed')
    expect(lines).toContain('Technical SEO audit and fixes')
    expect(lines).toContain('Custom dashboards on React, Vite and Supabase')
    expect(lines).not.toContain('Figma-to-code with zero quality loss')
    expect(lines).not.toContain('Technical SEO audit and remediation')
  })
```

`src/content/about.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { aboutFacts } from './about'

describe('aboutFacts', () => {
  it('states the four facts the owner supplied, in order', () => {
    expect(aboutFacts.map((fact) => [fact.label, fact.value, fact.kind])).toEqual([
      ['Software & UX/UI', '10', 'number'],
      ['Search', '8', 'number'],
      ['Design & engineering', '6', 'number'],
      ['Based', "O'ahu, Hawai'i", 'place'],
    ])
  })

  it('gives every fact one whole sentence with no em or en dashes', () => {
    for (const fact of aboutFacts) {
      expect(fact.sentence, fact.label).toMatch(/\.$/)
      expect(fact.sentence, fact.label).not.toMatch(/[—–]/)
    }
  })
})
```

`src/content/contactOptions.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { budgetRanges, MULTIPLE_SERVICES } from './contactOptions'

describe('contact options', () => {
  it('lists the budget ranges from smallest to largest, without hyphens or dashes', () => {
    expect(budgetRanges).toEqual(['Under $1,000', '$1,000 to $3,000', '$3,000 to $7,000', '$7,000 to $10,000', '$10,000+'])
    expect(budgetRanges.join(' ')).not.toMatch(/[-—–]/)
  })

  it('has no duplicate range', () => {
    expect(new Set(budgetRanges).size).toBe(budgetRanges.length)
  })

  it('names the option for more than one service', () => {
    expect(MULTIPLE_SERVICES).toBe('Multiple services')
  })
})
```

`src/lib/serviceSections.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { Discipline } from '../content/disciplines'
import { serviceSections } from './serviceSections'

const discipline = (slug: string, proofSlug?: string): Discipline => ({
  number: '01',
  slug,
  title: slug.toUpperCase(),
  blurb: 'I do it.',
  deliverables: ['One', 'Two', 'Three', 'Four'],
  cta: 'Start',
  skills: ['Skill'],
  proofSlug,
})

const studies = [
  { id: 'vamp-network', data: { title: 'Vamp Network' } },
  { id: 'aiwi-waffles', data: { title: "'Aiwi Waffles" } },
]

describe('serviceSections', () => {
  it('cycles the four surfaces, alternates the title side and picks a button that contrasts', () => {
    const five = ['a', 'b', 'c', 'd', 'e'].map((slug) => discipline(slug))
    expect(serviceSections(five, studies).map((s) => [s.discipline.slug, s.surface, s.titleSide, s.button])).toEqual([
      ['a', 'ivory', 'left', 'accent'],
      ['b', 'stone', 'right', 'ink'],
      ['c', 'ink', 'left', 'accent'],
      ['d', 'vermilion', 'right', 'ink'],
      ['e', 'ivory', 'left', 'accent'],
    ])
  })

  it('links the button to Contact with the service preselected', () => {
    expect(serviceSections([discipline('seo-aeo')], studies)[0].contactHref).toBe('/contact?service=seo-aeo')
  })

  it('takes the proof title from the case study, not from a copy of it', () => {
    expect(serviceSections([discipline('brand', 'aiwi-waffles')], studies)[0].proof).toEqual({
      title: "'Aiwi Waffles",
      href: '/work/aiwi-waffles',
    })
  })

  it('has no proof when the discipline names none or the case study is gone', () => {
    expect(serviceSections([discipline('a')], studies)[0].proof).toBeNull()
    expect(serviceSections([discipline('a', 'removed-study')], studies)[0].proof).toBeNull()
    expect(serviceSections([discipline('a', 'vamp-network')], [])[0].proof).toBeNull()
  })

  it('is empty for no disciplines', () => {
    expect(serviceSections([], studies)).toEqual([])
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/content src/lib/serviceSections.test.ts`
Expected: FAIL. `about`, `contactOptions` and `serviceSections` cannot be resolved; the two `disciplines` tests fail on the `description` property and the old wording.

- [ ] **Step 3: Implement**

In `src/content/disciplines.ts`:

- Remove the `description: string` line from the `Discipline` interface and the `description:` property (both lines of it) from all five entries.
- Change the header comment's second line to: ` * and for Services, About and the Contact project-type select.`
- Change three deliverable strings: `'Figma-to-code with zero quality loss'` to `'Figma designs built in code as designed'`; `'Technical SEO audit and remediation'` to `'Technical SEO audit and fixes'`; `'Custom dashboards on React, Vite, and Supabase'` to `'Custom dashboards on React, Vite and Supabase'`.
- Leave both `// TODO: owner review` comments in place.

`src/content/about.ts`:

```ts
/** A fact shown in the About "By the numbers" strip. Only what the owner has stated. */
export interface AboutFact {
  label: string
  /** A count of years, or a place name. */
  value: string
  kind: 'number' | 'place'
  sentence: string
}

export const aboutFacts: AboutFact[] = [
  { label: 'Software & UX/UI', value: '10', kind: 'number', sentence: 'Years in software development and UX/UI design.' },
  { label: 'Search', value: '8', kind: 'number', sentence: 'Years in SEO.' },
  {
    label: 'Design & engineering',
    value: '6',
    kind: 'number',
    sentence: 'Years since I added design and engineering to the research work.',
  },
  {
    label: 'Based',
    value: "O'ahu, Hawai'i",
    kind: 'place',
    sentence: "Most clients work with me remotely. A few are local, like 'Aiwi Waffles.",
  },
]
```

`src/content/contactOptions.ts`:

```ts
/** Budget ranges for the contact form, smallest first. Each is also the value sent. */
export const budgetRanges: string[] = ['Under $1,000', '$1,000 to $3,000', '$3,000 to $7,000', '$7,000 to $10,000', '$10,000+']

/** The project-type option for an enquiry that spans more than one discipline. */
export const MULTIPLE_SERVICES = 'Multiple services'
```

`src/lib/serviceSections.ts`:

```ts
import type { Discipline } from '../content/disciplines'

export type ServiceSurface = 'ivory' | 'stone' | 'ink' | 'vermilion'

/** The part of a case study entry a proof card needs. */
export interface ProofStudy {
  /** The case study slug. */
  id: string
  data: { title: string }
}

export interface ServiceSection {
  discipline: Discipline
  surface: ServiceSurface
  titleSide: 'left' | 'right'
  /** The button that contrasts with the surface: vermilion on ivory and ink, ink on stone and vermilion. */
  button: 'accent' | 'ink'
  contactHref: string
  proof: { title: string; href: string } | null
}

const SURFACES: ServiceSurface[] = ['ivory', 'stone', 'ink', 'vermilion']

/** One Services section per discipline. A proof whose case study is missing is left out. */
export function serviceSections(disciplines: Discipline[], caseStudies: ProofStudy[]): ServiceSection[] {
  return disciplines.map((discipline, i) => {
    const surface = SURFACES[i % SURFACES.length]
    const study = caseStudies.find((entry) => entry.id === discipline.proofSlug)
    return {
      discipline,
      surface,
      titleSide: i % 2 === 0 ? 'left' : 'right',
      button: surface === 'ivory' || surface === 'ink' ? 'accent' : 'ink',
      contactHref: `/contact?service=${discipline.slug}`,
      proof: study ? { title: study.data.title, href: `/work/${study.id}` } : null,
    }
  })
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `npx vitest run src/content src/lib/serviceSections.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify nothing read the removed field, then commit**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all tests pass, 0 type errors, the build completes. A type error naming `description` means something still reads it: report it, do not put the field back.

```bash
git add src/content/disciplines.ts src/content/disciplines.test.ts src/content/about.ts src/content/about.test.ts src/content/contactOptions.ts src/content/contactOptions.test.ts src/lib/serviceSections.ts src/lib/serviceSections.test.ts
git commit -m "feat: add the About facts, contact options and Services section logic"
```

(Add the two trailer lines from Global Constraints to every commit in this plan.)

---

### Task 2: Contact form validation and behaviour

**Files:**
- Create: `src/lib/contactValidation.ts`, `src/lib/contactValidation.test.ts`, `src/lib/contactForm.ts`, `src/lib/contactForm.test.ts`

**Interfaces:**
- Produces:
  - `src/lib/contactValidation.ts`: `type ContactField = 'name' | 'email' | 'company' | 'projectType' | 'budget' | 'message'`; `REQUIRED_CONTACT_FIELDS: ContactField[]` (form order); `validateContactField(field: ContactField, value: string): string | null`; `serviceFromQuery(search: string, items: { slug: string; title: string }[]): string | null`.
  - `src/lib/contactForm.ts`: `interface ContactFormOptions { search?: string; send?: typeof fetch }`; `initContactForm(root?: ParentNode, options?: ContactFormOptions): () => void`.
  - **Markup contract** (Task 6 builds it; the tests below build the same shape):
    - A wrapper `[data-contact-panel]` containing `form[data-contact-form]` and a sibling `[data-contact-confirmation]` that starts `hidden` and contains a focusable `[data-confirmation-heading]`.
    - Each field is a control whose `name` is its `ContactField`, with an error element `[data-error-for="<field>"]` that has an `id` and starts `hidden`.
    - The project-type `select` has one `option` per discipline with `value` the title and `data-slug` the slug.
    - `[data-form-error]` starts `hidden`; `button[data-submit]` is the submit button.

- [ ] **Step 1: Write the failing tests**

`src/lib/contactValidation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { REQUIRED_CONTACT_FIELDS, serviceFromQuery, validateContactField } from './contactValidation'

describe('validateContactField', () => {
  it('has a message for each empty required field', () => {
    expect(validateContactField('name', '')).toBe('Please enter your name.')
    expect(validateContactField('email', '')).toBe('Please enter your email.')
    expect(validateContactField('company', '')).toBe('Please enter your company.')
    expect(validateContactField('projectType', '')).toBe('Please choose a project type.')
    expect(validateContactField('budget', '')).toBe('Please choose a budget range.')
  })

  it('treats a value of only spaces as empty', () => {
    expect(validateContactField('company', '   ')).toBe('Please enter your company.')
    expect(validateContactField('email', ' \t ')).toBe('Please enter your email.')
  })

  it('accepts filled fields', () => {
    expect(validateContactField('name', 'Ada')).toBeNull()
    expect(validateContactField('projectType', 'SEO/AEO')).toBeNull()
    expect(validateContactField('budget', '$10,000+')).toBeNull()
  })

  it('checks the shape of an email address', () => {
    expect(validateContactField('email', 'ada@example.com')).toBeNull()
    expect(validateContactField('email', '  ada@example.co.uk  ')).toBeNull()
    for (const bad of ['ada', 'ada@', '@example.com', 'ada@example', 'a da@example.com']) {
      expect(validateContactField('email', bad), bad).toBe('Please enter a valid email address.')
    }
  })

  it('never requires the message', () => {
    expect(validateContactField('message', '')).toBeNull()
    expect(validateContactField('message', 'Hello')).toBeNull()
  })
})

describe('REQUIRED_CONTACT_FIELDS', () => {
  it('lists the required fields in form order, without the message', () => {
    expect(REQUIRED_CONTACT_FIELDS).toEqual(['name', 'email', 'company', 'projectType', 'budget'])
  })
})

describe('serviceFromQuery', () => {
  const items = [
    { slug: 'seo-aeo', title: 'SEO/AEO' },
    { slug: 'saas-development', title: 'SaaS Development' },
  ]

  it('gives the title for a known slug', () => {
    expect(serviceFromQuery('?service=seo-aeo', items)).toBe('SEO/AEO')
    expect(serviceFromQuery('?utm=x&service=saas-development', items)).toBe('SaaS Development')
  })

  it('is null for an unknown slug, a different case, no parameter or no query', () => {
    expect(serviceFromQuery('?service=nope', items)).toBeNull()
    expect(serviceFromQuery('?service=SEO-AEO', items)).toBeNull()
    expect(serviceFromQuery('?service=', items)).toBeNull()
    expect(serviceFromQuery('?other=1', items)).toBeNull()
    expect(serviceFromQuery('', items)).toBeNull()
  })
})
```

`src/lib/contactForm.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { initContactForm } from './contactForm'

const FIELD = (name: string, control: string) =>
  `<div>${control}<p id="${name}-error" data-error-for="${name}" hidden></p></div>`

function mount() {
  document.body.innerHTML = `
    <div data-contact-panel>
      <form name="contact" method="POST" action="/contact/thanks/" data-contact-form>
        <input type="hidden" name="form-name" value="contact" />
        <p hidden><input name="bot-field" /></p>
        ${FIELD('name', '<input id="name" name="name" type="text" required />')}
        ${FIELD('email', '<input id="email" name="email" type="email" required />')}
        ${FIELD('company', '<input id="company" name="company" type="text" required />')}
        ${FIELD(
          'projectType',
          `<select id="projectType" name="projectType" required>
            <option value="">Select a service</option>
            <option value="SEO/AEO" data-slug="seo-aeo">SEO/AEO</option>
            <option value="SaaS Development" data-slug="saas-development">SaaS Development</option>
            <option value="Multiple services">Multiple services</option>
          </select>`,
        )}
        ${FIELD(
          'budget',
          `<select id="budget" name="budget" required>
            <option value="">Select a range</option>
            <option value="$10,000+">$10,000+</option>
          </select>`,
        )}
        <textarea id="message" name="message"></textarea>
        <p data-form-error role="alert" hidden>Something went wrong.</p>
        <button type="submit" data-submit>Send enquiry</button>
      </form>
      <div data-contact-confirmation hidden><h2 data-confirmation-heading tabindex="-1">Got it.</h2></div>
    </div>`
  const form = document.querySelector('form') as HTMLFormElement
  const el = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T
  return {
    form,
    input: (name: string) => el<HTMLInputElement>(`[name="${name}"]`),
    error: (name: string) => el<HTMLElement>(`[data-error-for="${name}"]`),
    formError: el<HTMLElement>('[data-form-error]'),
    button: el<HTMLButtonElement>('[data-submit]'),
    confirmation: el<HTMLElement>('[data-contact-confirmation]'),
    heading: el<HTMLElement>('[data-confirmation-heading]'),
  }
}

function fill(ui: ReturnType<typeof mount>) {
  ui.input('name').value = 'Ada Lovelace'
  ui.input('email').value = 'ada@example.com'
  ui.input('company').value = 'Analytical & Co'
  ui.input('projectType').value = 'SEO/AEO'
  ui.input('budget').value = '$10,000+'
  ui.input('message').value = 'Rank #1 & stay there?'
}

const submit = (form: HTMLFormElement) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
const leave = (el: HTMLElement) => el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))
const ok = () => vi.fn().mockResolvedValue({ ok: true, status: 200 })

afterEach(() => {
  document.body.innerHTML = ''
})

describe('initContactForm', () => {
  it('does nothing and does not throw when there is no form', () => {
    document.body.innerHTML = '<p>No form here</p>'
    expect(() => initContactForm()()).not.toThrow()
  })

  it('takes over validation from the browser', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    expect(ui.form.noValidate).toBe(true)
  })

  it('shows a field its error when the visitor leaves it empty, and ties the two together', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    leave(ui.input('name'))
    expect(ui.error('name').hidden).toBe(false)
    expect(ui.error('name').textContent).toBe('Please enter your name.')
    expect(ui.input('name').getAttribute('aria-invalid')).toBe('true')
    expect(ui.input('name').getAttribute('aria-describedby')).toBe('name-error')
  })

  it('treats a field of only spaces as empty', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    ui.input('company').value = '   '
    leave(ui.input('company'))
    expect(ui.error('company').textContent).toBe('Please enter your company.')
  })

  it('clears the error once the field is valid', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    leave(ui.input('email'))
    ui.input('email').value = 'ada@example.com'
    leave(ui.input('email'))
    expect(ui.error('email').hidden).toBe(true)
    expect(ui.error('email').textContent).toBe('')
    expect(ui.input('email').hasAttribute('aria-invalid')).toBe(false)
    expect(ui.input('email').hasAttribute('aria-describedby')).toBe(false)
  })

  it('never complains about the optional message', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    leave(ui.input('message'))
    expect(ui.input('message').hasAttribute('aria-invalid')).toBe(false)
  })

  it('on submit shows every error, focuses the first invalid field and sends nothing', () => {
    const ui = mount()
    const send = ok()
    initContactForm(document, { search: '', send })
    submit(ui.form)
    for (const name of ['name', 'email', 'company', 'projectType', 'budget']) expect(ui.error(name).hidden, name).toBe(false)
    expect(document.activeElement).toBe(ui.input('name'))
    expect(send).not.toHaveBeenCalled()
  })

  it('focuses the first invalid field even when earlier ones are fine', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    fill(ui)
    ui.input('email').value = 'ada@'
    submit(ui.form)
    expect(ui.error('email').textContent).toBe('Please enter a valid email address.')
    expect(document.activeElement).toBe(ui.input('email'))
  })

  it('preselects the project type named by ?service=', () => {
    const ui = mount()
    initContactForm(document, { search: '?service=saas-development', send: ok() })
    expect(ui.input('projectType').value).toBe('SaaS Development')
  })

  it('selects nothing for a ?service= that matches no option', () => {
    const ui = mount()
    initContactForm(document, { search: '?service=not-a-service', send: ok() })
    expect(ui.input('projectType').value).toBe('')
    expect(ui.error('projectType').hidden).toBe(true)
  })

  it('sends a valid form once, url-encoded, to its own page', async () => {
    const ui = mount()
    const send = ok()
    initContactForm(document, { search: '', send })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(send).toHaveBeenCalledTimes(1)
    const [url, init] = send.mock.calls[0]
    expect(url).toBe(window.location.pathname)
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' })
    const sent = new URLSearchParams(init.body)
    expect(sent.get('form-name')).toBe('contact')
    expect(sent.get('name')).toBe('Ada Lovelace')
    expect(sent.get('company')).toBe('Analytical & Co')
    expect(sent.get('projectType')).toBe('SEO/AEO')
    expect(sent.get('budget')).toBe('$10,000+')
    expect(sent.get('message')).toBe('Rank #1 & stay there?')
    expect(sent.has('bot-field')).toBe(true)
  })

  it('shows the confirmation in place of the form and moves focus to it', async () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(ui.form.hidden).toBe(true)
    expect(ui.confirmation.hidden).toBe(false)
    expect(document.activeElement).toBe(ui.heading)
  })

  it('disables the button while sending and sends only once on a double submit', async () => {
    const ui = mount()
    let finish: (value: { ok: boolean; status: number }) => void = () => {}
    const send = vi.fn(() => new Promise<{ ok: boolean; status: number }>((resolve) => (finish = resolve)))
    initContactForm(document, { search: '', send: send as unknown as typeof fetch })
    fill(ui)
    submit(ui.form)
    submit(ui.form)
    expect(send).toHaveBeenCalledTimes(1)
    expect(ui.button.disabled).toBe(true)
    expect(ui.button.textContent).toBe('Sending')
    finish({ ok: true, status: 200 })
    await settle()
    expect(ui.confirmation.hidden).toBe(false)
  })

  it('keeps what was typed and offers another way when the network fails', async () => {
    const ui = mount()
    initContactForm(document, { search: '', send: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(ui.formError.hidden).toBe(false)
    expect(ui.form.hidden).toBe(false)
    expect(ui.confirmation.hidden).toBe(true)
    expect(ui.input('name').value).toBe('Ada Lovelace')
    expect(ui.input('message').value).toBe('Rank #1 & stay there?')
    expect(ui.button.disabled).toBe(false)
    expect(ui.button.textContent).toBe('Send enquiry')
  })

  it('treats a response that is not ok as a failure, and can be sent again', async () => {
    const ui = mount()
    const send = vi.fn().mockResolvedValueOnce({ ok: false, status: 404 }).mockResolvedValueOnce({ ok: true, status: 200 })
    initContactForm(document, { search: '', send })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(ui.formError.hidden).toBe(false)
    expect(ui.confirmation.hidden).toBe(true)
    submit(ui.form)
    await settle()
    expect(send).toHaveBeenCalledTimes(2)
    expect(ui.formError.hidden).toBe(true)
    expect(ui.confirmation.hidden).toBe(false)
  })

  it('hands validation back and stops listening on cleanup', () => {
    const ui = mount()
    const send = ok()
    const cleanup = initContactForm(document, { search: '', send })
    cleanup()
    expect(ui.form.noValidate).toBe(false)
    leave(ui.input('name'))
    expect(ui.error('name').hidden).toBe(true)
    submit(ui.form)
    expect(send).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/contactValidation.test.ts src/lib/contactForm.test.ts`
Expected: FAIL, neither module resolves.

- [ ] **Step 3: Implement**

`src/lib/contactValidation.ts`:

```ts
export type ContactField = 'name' | 'email' | 'company' | 'projectType' | 'budget' | 'message'

/** Required fields, in form order (focus goes to the first invalid one). */
export const REQUIRED_CONTACT_FIELDS: ContactField[] = ['name', 'email', 'company', 'projectType', 'budget']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY_MESSAGE: Record<Exclude<ContactField, 'email' | 'message'>, string> = {
  name: 'Please enter your name.',
  company: 'Please enter your company.',
  projectType: 'Please choose a project type.',
  budget: 'Please choose a budget range.',
}

/** Error message for a contact field value, or null when it is valid. */
export function validateContactField(field: ContactField, value: string): string | null {
  const v = value.trim()
  if (field === 'message') return null
  if (field === 'email') {
    if (!v) return 'Please enter your email.'
    return EMAIL.test(v) ? null : 'Please enter a valid email address.'
  }
  return v ? null : EMPTY_MESSAGE[field]
}

/** The discipline title named by `?service=<slug>`, for preselecting the project type. */
export function serviceFromQuery(search: string, items: { slug: string; title: string }[]): string | null {
  const slug = new URLSearchParams(search).get('service')
  return items.find((item) => item.slug === slug)?.title ?? null
}
```

`src/lib/contactForm.ts`:

```ts
import { REQUIRED_CONTACT_FIELDS, serviceFromQuery, validateContactField, type ContactField } from './contactValidation'

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export interface ContactFormOptions {
  /** The query string to read `?service=` from. Defaults to the page's. */
  search?: string
  /** How to send the form. Defaults to `fetch`. */
  send?: typeof fetch
}

const SENDING = 'Sending'

/**
 * Enhance the contact form: inline errors on leaving a field and on submit, the `?service=`
 * preselect, an in-place send to Netlify Forms and the confirmation. Without this script the
 * form still posts by itself and the browser validates it. Returns a cleanup function.
 */
export function initContactForm(root: ParentNode = document, options: ContactFormOptions = {}): () => void {
  const form = root.querySelector<HTMLFormElement>('form[data-contact-form]')
  if (!form) return () => {}

  const search = options.search ?? window.location.search
  const send: typeof fetch = options.send ?? ((input, init) => fetch(input, init))
  const panel = form.closest('[data-contact-panel]')
  const confirmation = panel?.querySelector<HTMLElement>('[data-contact-confirmation]') ?? null
  const formError = form.querySelector<HTMLElement>('[data-form-error]')
  const button = form.querySelector<HTMLButtonElement>('[data-submit]')
  const buttonLabel = button?.textContent ?? ''
  let sending = false

  const control = (field: ContactField) => form.elements.namedItem(field) as Control | null
  const isRequired = (name: string): name is ContactField => (REQUIRED_CONTACT_FIELDS as string[]).includes(name)

  /** Show or clear one field's error. True when the field is valid. */
  function check(field: ContactField): boolean {
    const el = control(field)
    if (!el) return true
    const message = validateContactField(field, el.value)
    const error = form!.querySelector<HTMLElement>(`[data-error-for="${field}"]`)
    if (message) {
      el.setAttribute('aria-invalid', 'true')
      if (error) {
        error.textContent = message
        error.hidden = false
        el.setAttribute('aria-describedby', error.id)
      }
    } else {
      el.removeAttribute('aria-invalid')
      el.removeAttribute('aria-describedby')
      if (error) {
        error.textContent = ''
        error.hidden = true
      }
    }
    return !message
  }

  function onLeave(event: Event) {
    const name = (event.target as Partial<Control> | null)?.name
    if (name && isRequired(name)) check(name)
  }

  async function onSubmit(event: Event) {
    event.preventDefault()
    if (sending) return

    const invalid = REQUIRED_CONTACT_FIELDS.filter((field) => !check(field))
    if (invalid.length > 0) {
      control(invalid[0])?.focus()
      return
    }

    sending = true
    if (formError) formError.hidden = true
    if (button) {
      button.disabled = true
      button.textContent = SENDING
    }

    const body = new URLSearchParams()
    for (const [key, value] of new FormData(form!)) if (typeof value === 'string') body.append(key, value)

    try {
      const response = await send(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!response.ok) throw new Error(`The form responded ${response.status}`)
      form!.hidden = true
      if (confirmation) {
        confirmation.hidden = false
        confirmation.querySelector<HTMLElement>('[data-confirmation-heading]')?.focus()
      }
    } catch {
      // What the visitor typed stays in the form; the message gives them the email address.
      if (formError) formError.hidden = false
      if (button) {
        button.disabled = false
        button.textContent = buttonLabel
      }
    } finally {
      sending = false
    }
  }

  form.noValidate = true

  const projectType = control('projectType')
  if (projectType instanceof HTMLSelectElement) {
    const items = Array.from(projectType.options).flatMap((option) =>
      option.dataset.slug ? [{ slug: option.dataset.slug, title: option.value }] : [],
    )
    const title = serviceFromQuery(search, items)
    if (title) projectType.value = title
  }

  form.addEventListener('focusout', onLeave)
  form.addEventListener('submit', onSubmit)

  return () => {
    form.removeEventListener('focusout', onLeave)
    form.removeEventListener('submit', onSubmit)
    form.noValidate = false
  }
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `npx vitest run src/lib/contactValidation.test.ts src/lib/contactForm.test.ts`
Expected: PASS, with no warnings and no unhandled rejections.

- [ ] **Step 5: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all pass. If `astro check` rejects a type in `contactForm.ts` (for example iterating `FormData`, or the `send` default), fix the typing without `any`, without a ts-ignore comment and without weakening a test, and say what changed in your report.

```bash
git add src/lib/contactValidation.ts src/lib/contactValidation.test.ts src/lib/contactForm.ts src/lib/contactForm.test.ts
git commit -m "feat: validate and send the contact form with a tested enhancement"
```

---

### Task 3: Script artwork and shared shell changes

**Files:**
- Modify: `src/assets/script/phrases.json`, `src/components/ui/Button.astro`, `src/components/nav/SiteHeader.astro`, `astro.config.mjs`
- Generated: `public/script/what-i-do.svg`, `public/script/always-building.svg`, `src/assets/script/art.json`

**Interfaces:**
- Consumes: `npm run script-art` (needs the local, git-ignored `.fonts/` folder); `isCurrent` and `contactLink` from `src/content/navigation.ts`.
- Produces:
  - `ScriptArt` names `what-i-do` (ivory edge) and `always-building` (stone edge).
  - `Button` props gain `variant: 'ink'` (ink fill, ivory text, for stone and vermilion surfaces) and `current?: boolean` (marks the page the button points at: `aria-current="page"`, ink fill, ivory text).
  - The header's "Start a project" button is `current` on `/contact`.
  - `/contact/thanks/` is left out of the sitemap.

- [ ] **Step 1: Generate the two script phrases**

Replace `src/assets/script/phrases.json` with:

```json
[
  { "name": "memorable", "text": "memorable", "fill": "#f86343", "edge": "#0c0c0c" },
  { "name": "lets-talk", "text": "let's talk", "fill": "#f86343", "edge": "#f4f0e6" },
  { "name": "strike", "stroke": "e", "fill": "#f86343" },
  { "name": "selected", "text": "selected", "fill": "#f86343", "edge": "#f4f0e6" },
  { "name": "case-study", "text": "case study", "fill": "#f86343", "edge": "#f4f0e6" },
  { "name": "what-i-do", "text": "what I do", "fill": "#f86343", "edge": "#f4f0e6" },
  { "name": "always-building", "text": "always building", "fill": "#f86343", "edge": "#e4dfd3" }
]
```

Run: `npm run script-art && git status --short public/script src/assets/script`
Expected: seven "wrote" lines; `public/script/what-i-do.svg` and `public/script/always-building.svg` are new; `art.json` gains both keys. If the command reports missing fonts, stop and report BLOCKED.

Confirm no font file is tracked: `git ls-files | grep -iE "\.(ttf|otf|woff2?)$"` prints nothing.

- [ ] **Step 2: Extend Button**

Replace the frontmatter and the opening `<a>` tag of `src/components/ui/Button.astro` so the file reads:

```astro
---
interface Props {
  href: string
  variant?: 'accent' | 'outline' | 'ink'
  /** The background the button sits on; decides the hover colours. */
  on?: 'light' | 'dark'
  /** This button points at the page being viewed. */
  current?: boolean
  class?: string
}

const { href, variant = 'accent', on = 'light', current = false, class: className } = Astro.props

const styles = {
  accent: on === 'dark' ? 'bg-vermilion text-ink hover:bg-ivory focus-visible:outline-ivory' : 'bg-vermilion text-ink hover:bg-ink hover:text-ivory focus-visible:outline-ink',
  outline: 'border-2 border-ink text-ink hover:bg-ink hover:text-ivory focus-visible:outline-ink',
  ink: 'bg-ink text-ivory hover:bg-ivory hover:text-ink focus-visible:outline-ink',
}
// On its own page the button is ink, so it reads as the current location rather than a call to action.
const look = current ? styles.ink : styles[variant]
---

<a
  href={href}
  aria-current={current ? 'page' : undefined}
  class:list={[
    'type-label group inline-flex items-center gap-2 px-5 py-3.5 transition-colors duration-200',
    look,
    className,
  ]}
>
  <slot />
  <span
    aria-hidden="true"
    class="inline-block transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"
    >↗</span
  >
</a>
```

- [ ] **Step 3: Mark the header button on its own page**

In `src/components/nav/SiteHeader.astro` change the desktop button line to:

```astro
    <div class="ml-auto hidden md:block"><Button href={contactLink.href} current={isCurrent(contactLink.href, pathname)}>{contactLink.label}</Button></div>
```

- [ ] **Step 4: Keep the thanks page out of the sitemap**

In `astro.config.mjs` change `sitemap()` to:

```js
sitemap({ filter: (page) => !page.includes('/contact/thanks') }),
```

- [ ] **Step 5: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`, then:

```bash
grep -o 'aria-current="page"' dist/index.html | wc -l
grep -o 'aria-current="page"' dist/work/index.html | wc -l
```

Expected: all pass; Home has 0 (no nav item is current on Home and the button is not), `/work` has at least 1 (the Work nav link) and the header button there is still vermilion. Look at Home and `/work` in the browser at 1440x900: the header button is unchanged on both.

```bash
git add src/assets/script public/script src/components/ui/Button.astro src/components/nav/SiteHeader.astro astro.config.mjs
git status --short | grep -iE "\.(ttf|otf|woff2?)$" ; echo "font files staged: $?"
git commit -m "feat: add two script phrases, an ink button and the current state for the header button"
```

Expected: `font files staged: 1`.

---

### Task 4: Services page

**Files:**
- Create: `src/components/services/ServicesHeader.astro`, `src/components/services/ServiceJumpNav.astro`, `src/components/services/ServiceSection.astro`, `src/pages/services.astro`

**Interfaces:**
- Consumes: `disciplines` from `src/content/disciplines.ts`; `serviceSections`, `ServiceSection` type from `src/lib/serviceSections.ts`; the `caseStudies` collection; `ScriptArt` (name `what-i-do`); `VerticalLabel`; `Button` (variants `accent`, `ink`; `on="dark"`); `ContactBand` from `src/components/sections/`; `BaseLayout`.
- Produces: `/services`, with a `section` whose `id` is each discipline's slug.

Target: sections S1 to S3 of the reference.

- [ ] **Step 1: Create the header**

`src/components/services/ServicesHeader.astro`:

```astro
---
import ScriptArt from '../brand/ScriptArt.astro'
import VerticalLabel from '../ui/VerticalLabel.astro'

interface Props {
  /** How many disciplines the page lists. */
  count: number
}

const { count } = Astro.props
---

<section class="relative isolate overflow-hidden bg-ivory pb-10 pt-36 md:pt-44 lg:pb-14 lg:pt-[max(11rem,13vw)]">
  <div class="relative mx-auto grid max-w-[1600px] items-end gap-8 px-6 md:px-12 lg:grid-cols-[1fr_auto]">
    {/* Decorative: the h1 beside it carries the keywords. */}
    <p class="type-display relative inline-block justify-self-start text-[clamp(4.25rem,17.5vw,17.5rem)] leading-[0.82]" aria-hidden="true">
      Services<span class="text-vermilion">.</span>
      <ScriptArt name="what-i-do" class="absolute -top-[0.3em] left-[52%] w-[42%] -rotate-[7deg]" reveal="wipe" delay={0.3} />
    </p>
    <h1 class="type-label max-w-xs pb-4 before:mb-3 before:block before:h-0.5 before:w-10 before:bg-ink">
      UX/UI Engineering, SEO &amp; AI Workflow Services
    </h1>
    <VerticalLabel class="absolute -top-8 right-6 border-r-2 border-ink pr-2 md:right-12 lg:top-0 lg:text-sm">
      {count} disciplines<br />one person
    </VerticalLabel>
  </div>
</section>
```

- [ ] **Step 2: Create the jump strip**

`src/components/services/ServiceJumpNav.astro`:

```astro
---
import type { Discipline } from '../../content/disciplines'

interface Props {
  disciplines: Discipline[]
}

const { disciplines } = Astro.props
---

<nav aria-label="Services on this page" class="bg-ink text-ivory">
  <ul role="list" class="mx-auto grid max-w-[1600px] grid-cols-2 overflow-hidden md:grid-cols-3 xl:grid-cols-5">
    {
      disciplines.map((d) => (
        <li class="-ml-px -mt-px border-l border-t border-line-dark">
          <a
            href={`#${d.slug}`}
            class="group block h-full px-6 py-6 transition-colors duration-200 hover:bg-ivory hover:text-ink focus-visible:bg-ivory focus-visible:text-ink focus-visible:-outline-offset-4 md:px-12 xl:px-7"
          >
            <span class="type-label text-vermilion transition-colors duration-200 group-hover:text-ink group-focus-visible:text-ink">{d.number}</span>
            <span class="type-display mt-2 block text-[clamp(1.25rem,1.6vw,1.75rem)]">{d.title}</span>
          </a>
        </li>
      ))
    }
  </ul>
</nav>
```

The vermilion number turns ink when the link turns ivory, because small vermilion text is only allowed on ink.

- [ ] **Step 3: Create a discipline section**

`src/components/services/ServiceSection.astro`:

```astro
---
import Button from '../ui/Button.astro'
import type { ServiceSection } from '../../lib/serviceSections'

interface Props {
  section: ServiceSection
}

const { discipline: d, surface, titleSide, button, contactHref, proof } = Astro.props.section

// Small vermilion text is only allowed on ink, so only the ink section has vermilion labels.
const looks = {
  ivory: { section: 'bg-ivory text-ink', number: 'text-stone', label: '', rule: 'border-ink/15', proof: 'hover:bg-ink hover:text-ivory focus-visible:bg-ink focus-visible:text-ivory' },
  stone: { section: 'bg-stone text-ink', number: 'text-ivory', label: '', rule: 'border-ink/15', proof: 'hover:bg-ink hover:text-ivory focus-visible:bg-ink focus-visible:text-ivory' },
  ink: { section: 'bg-ink text-ivory', number: 'text-ivory/10', label: 'text-vermilion', rule: 'border-line-dark', proof: 'hover:bg-ivory hover:text-ink focus-visible:bg-ivory focus-visible:text-ink' },
  vermilion: { section: 'bg-vermilion text-ink', number: 'text-ink/15', label: '', rule: 'border-ink/25', proof: 'hover:bg-ink hover:text-ivory focus-visible:bg-ink focus-visible:text-ivory' },
} as const
const look = looks[surface]
const headingId = `${d.slug}-heading`
---

<section id={d.slug} class:list={['relative isolate overflow-hidden', look.section]} aria-labelledby={headingId}>
  <div class="mx-auto grid max-w-[1600px] lg:min-h-[31vw] lg:grid-cols-2">
    <div class:list={['relative px-6 pb-6 pt-16 md:px-12 lg:py-24', titleSide === 'right' && 'lg:order-2']}>
      {/* Decorative giant number behind the title. */}
      <span
        class:list={[
          'type-display pointer-events-none absolute -bottom-[0.1em] -z-10 select-none text-[clamp(9rem,19vw,19rem)] leading-[0.8]',
          look.number,
          titleSide === 'right' ? 'left-0 lg:-left-[0.1em]' : 'right-0 lg:-right-[0.1em]',
        ]}
        aria-hidden="true"
      >
        {d.number}
      </span>
      <h2 id={headingId} class="type-display max-w-[9ch] text-[clamp(3rem,6.2vw,6.25rem)]" data-reveal="rise">{d.title}</h2>
      <p class="mt-5 max-w-md text-lg leading-snug lg:text-xl">{d.blurb}</p>
    </div>
    <div class="relative px-6 pb-16 pt-6 md:px-12 lg:py-24">
      <p class:list={['type-label', look.label]}>
        <span aria-hidden="true">// </span>What you get
      </p>
      <ol role="list" class="mt-4">
        {
          d.deliverables.map((item, i) => (
            <li class:list={['grid grid-cols-[3rem_1fr] items-baseline border-t py-3.5 text-lg leading-snug', look.rule]}>
              <span class:list={['type-label', look.label]} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          ))
        }
      </ol>
      {
        proof && (
          <a
            href={proof.href}
            class:list={['group mt-8 grid grid-cols-[1fr_auto] items-center gap-4 border-2 border-current px-5 py-4 transition-colors duration-200 motion-reduce:transition-none', look.proof]}
          >
            <span>
              <span class="type-label block">Proof: case study</span>
              <span class="type-display mt-1 block text-[clamp(1.5rem,1.9vw,2rem)]">{proof.title}</span>
            </span>
            <span class="text-2xl" aria-hidden="true">
              ↗
            </span>
          </a>
        )
      }
      <div class="mt-6">
        <Button href={contactHref} variant={button} on={surface === 'ink' ? 'dark' : 'light'}>{d.cta}</Button>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Create the page**

`src/pages/services.astro`:

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../layouts/BaseLayout.astro'
import ServicesHeader from '../components/services/ServicesHeader.astro'
import ServiceJumpNav from '../components/services/ServiceJumpNav.astro'
import ServiceSection from '../components/services/ServiceSection.astro'
import ContactBand from '../components/sections/ContactBand.astro'
import { disciplines } from '../content/disciplines'
import { serviceSections } from '../lib/serviceSections'

const sections = serviceSections(disciplines, await getCollection('caseStudies'))
---

<BaseLayout
  title="UX/UI Engineering, SEO & AI Workflow Services"
  description="I offer UX/UI engineering, SEO and AEO, agentic workflows, brand development and SaaS development as a freelancer. See what each one includes and the work behind it."
>
  <ServicesHeader count={disciplines.length} />
  <ServiceJumpNav disciplines={disciplines} />
  {sections.map((section) => <ServiceSection section={section} />)}
  <ContactBand />
</BaseLayout>
```

- [ ] **Step 5: Load the design skills, then tune in the browser**

At 1440x900, then 1024x768 and 390x844, compare `/services` with S1 to S3 of the reference and adjust until:

- **S1:** giant "Services" with a vermilion full stop; "what I do" written over the top right corner of the word, clear of the full stop, of the `h1` block and of the site header; the keyword `h1` in the small block at the lower right; the rotated "5 disciplines / one person" label at the right.
- **Jump strip:** five cells on ink with a vermilion number and Anton title; each jumps to its section. On hover and focus the cell turns ivory and nothing moves.
- **S2:** five sections on ivory, stone, ink, vermilion, ivory, with the title on the left, right, left, right, left. Each shows the Anton title, the one-sentence blurb, the numbered "What you get" list with hairlines, the outlined proof card and the button. The giant number sits behind the title and is cut off by the section's bottom edge, as in the reference.
- **Contrast:** no small vermilion text on ivory, stone or vermilion. The button is vermilion on ivory and ink, and ink on stone and vermilion. On the vermilion section every word is ink.
- **Proof card:** one link; on hover and focus it inverts; nothing moves.
- Each button's `href` is `/contact?service=<slug>` for its own discipline.
- Following `/#what-i-do` on Home and clicking a discipline tile lands with that section's title visible below the header.
- **Mobile:** each section stacks title, blurb, list, proof card, button; the jump strip is two columns; the header's script stays on screen; no horizontal scroll at any width from 320 up.
- The page has one `h1` and five discipline `h2`s plus the contact band's.
- Keyboard: Tab goes header, the five jump links, then proof card and button for each section in order, then the contact band; every focus ring is complete and visible on its surface.

You may restructure markup and classes, provided: sections come from `serviceSections` in that order with `id` the slug; the decorative word and numbers are `aria-hidden`; the proof card is absent when `proof` is null; no copy changes.

- [ ] **Step 6: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`, then:

```bash
f=dist/services/index.html
printf "h1:%s h2:%s dashes:%s islands:%s\n" "$(grep -o '<h1' $f | wc -l | tr -d ' ')" "$(grep -o '<h2' $f | wc -l | tr -d ' ')" "$(grep -o '[—–]' $f | wc -l | tr -d ' ')" "$(grep -o 'astro-island' $f | wc -l | tr -d ' ')"
for s in $(grep -o 'href="/services#[a-z-]*"' dist/index.html | sort -u | sed 's/.*#//;s/"//'); do grep -q "id=\"$s\"" $f && echo "ok $s" || echo "MISSING $s"; done
grep -o 'href="/contact?service=[a-z-]*"' $f | sort -u
grep -o 'astro-island' dist/index.html | wc -l
```

Expected: `h1:1 h2:6 dashes:0`; five `ok` lines and no `MISSING`; five distinct `?service=` links; the island count equals Home's.

```bash
git add src/components/services src/pages/services.astro
git commit -m "feat: add the Services page"
```

---

### Task 5: About page

**Files:**
- Create: `src/components/about/AboutHero.astro`, `AboutBio.astro`, `AboutFacts.astro`, `AboutBackground.astro`, `AboutSkills.astro`, `src/pages/about.astro`

**Interfaces:**
- Consumes: `aboutFacts` from `src/content/about.ts`; `disciplines` from `src/content/disciplines.ts`; `ScriptArt` (name `always-building`); `VerticalLabel`; `ContactBand`; `BaseLayout`; `src/assets/portraits/about.png`.
- Produces: `/about`.

Target: sections A1 to A6 of the reference.

- [ ] **Step 1: Create the hero**

`src/components/about/AboutHero.astro`:

```astro
---
import { Image } from 'astro:assets'
import portrait from '../../assets/portraits/about.png'
import VerticalLabel from '../ui/VerticalLabel.astro'
---

<section class="relative isolate overflow-hidden bg-ivory lg:h-[52.5vw] lg:max-h-[860px] lg:min-h-[600px]">
  {/* Decorative: the h1 below carries the keywords. */}
  <p class="type-display relative z-10 px-6 pt-32 text-[clamp(4.5rem,15vw,15rem)] leading-[0.86] md:px-12 lg:absolute lg:left-0 lg:top-[21%] lg:pt-0" aria-hidden="true">
    Mathew<br />Brown
  </p>

  <h1 class="type-label relative z-10 mt-6 max-w-sm px-6 before:mb-3 before:block before:h-0.5 before:w-10 before:bg-ink md:px-12 lg:absolute lg:bottom-[8%] lg:left-0 lg:mt-0 lg:max-w-[26%]">
    About Mathew Brown: UX/UI Engineer &amp; SEO Specialist
  </h1>

  <div class="relative mt-10 h-[110vw] max-h-[640px] lg:absolute lg:inset-y-0 lg:left-[52%] lg:right-0 lg:mt-0 lg:h-auto lg:max-h-none">
    <div class="absolute inset-x-0 bottom-0 top-[27%] bg-vermilion" data-reveal="wipe" data-reveal-on="load"></div>
    <Image
      src={portrait}
      alt="Mathew Brown in profile"
      widths={[480, 720, 1000, 1252]}
      sizes="(min-width: 1024px) 40vw, 90vw"
      loading="eager"
      class="absolute bottom-0 right-[18%] h-[92%] w-auto max-w-none"
    />
    {/* Tints the part of the cut-out that overlaps the block. */}
    <div class="absolute inset-x-0 bottom-0 top-[27%] bg-vermilion mix-blend-multiply" aria-hidden="true"></div>
  </div>

  <VerticalLabel class="absolute right-6 top-28 z-10 border-r-2 border-ink pr-2 md:right-12 lg:top-[31%] lg:text-sm">
    O'ahu, Hawai'i<br />Working remotely
  </VerticalLabel>
</section>
```

- [ ] **Step 2: Create the bio**

`src/components/about/AboutBio.astro`:

```astro
<section class="bg-ivory" aria-labelledby="about-bio-heading">
  <div class="mx-auto grid max-w-[1600px] gap-10 px-6 py-16 md:px-12 lg:grid-cols-2 lg:gap-20 lg:py-24">
    <h2 id="about-bio-heading" class="type-display text-[clamp(2.5rem,4.3vw,4.5rem)] leading-[1.02]" data-reveal="rise">
      One person across design, code <span class="text-vermilion">and</span> search.
    </h2>
    <div class="max-w-xl space-y-5 text-lg leading-relaxed">
      <p>
        I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer. I design interfaces, build them in production
        React, set them up to rank in search, and connect them to AI workflows.
      </p>
      <p>
        I work with founders and businesses who want one person across design, code and search. You talk to the person doing the work, so decisions are
        quick and nothing gets lost in a handoff.
      </p>
      <p>
        When I'm not building, I write about design engineering, technical SEO and agentic tooling on
        <a href="/blog" class="underline decoration-vermilion decoration-2 underline-offset-4 hover:decoration-ink focus-visible:decoration-ink">my blog</a>.
      </p>
    </div>
  </div>
</section>
```

The vermilion "and" is large display type on ivory, which is allowed.

- [ ] **Step 3: Create the facts strip**

`src/components/about/AboutFacts.astro`:

```astro
---
import VerticalLabel from '../ui/VerticalLabel.astro'
import { aboutFacts } from '../../content/about'
---

<section class="bg-ink text-ivory" aria-labelledby="about-facts-heading">
  <h2 id="about-facts-heading" class="sr-only">By the numbers</h2>
  <div class="mx-auto flex max-w-[1600px]">
    <div class="hidden w-20 shrink-0 items-center justify-center lg:flex" aria-hidden="true">
      <VerticalLabel>By the numbers</VerticalLabel>
    </div>
    <dl class="grid flex-1 grid-cols-2 overflow-hidden lg:grid-cols-4">
      {
        aboutFacts.map((fact) => (
          <div class="-ml-px -mt-px border-l border-t border-line-dark px-6 py-8 lg:px-7 lg:py-10">
            <dt class="type-label text-vermilion">{fact.label}</dt>
            <dd class="mt-3">
              <span
                class:list={[
                  'type-display block',
                  fact.kind === 'number' ? 'text-[clamp(4rem,6.4vw,6.5rem)] leading-[0.9] text-vermilion' : 'text-[clamp(1.75rem,2.3vw,2.4rem)] leading-none',
                ]}
              >
                {fact.value}
              </span>
              <span class="mt-3 block max-w-[17rem] leading-snug">{fact.sentence}</span>
            </dd>
          </div>
        ))
      }
    </dl>
  </div>
</section>
```

- [ ] **Step 4: Create the background section**

`src/components/about/AboutBackground.astro`:

```astro
---
import ScriptArt from '../brand/ScriptArt.astro'
---

<section class="overflow-hidden bg-stone" aria-labelledby="about-background-heading">
  <div class="mx-auto grid max-w-[1600px] gap-10 px-6 py-16 md:px-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-24">
    <div>
      <h2 id="about-background-heading" class="type-display relative inline-block text-[clamp(2.75rem,5.6vw,5.75rem)] leading-[0.94]" data-reveal="rise">
        Research first.<br />Self-taught.
        <ScriptArt name="always-building" class="absolute -bottom-[0.55em] left-[4%] w-[78%] -rotate-6" reveal="wipe" delay={0.2} />
      </h2>
    </div>
    <div class="max-w-xl text-lg leading-relaxed">
      <p>
        I started on the research side of both UX/UI and SEO. Over the past six years I added design and engineering, so I can take a project from the
        first question to shipped code.
      </p>
      <p class="mt-5">
        I'm self-taught, and studying the industries I work in is one of my hobbies. I follow where AI is heading and how people can use it to move
        their careers forward and get time back for the people and things they love.
      </p>
      <div class="mt-9 bg-ink px-6 py-7 text-ivory lg:px-8">
        <p class="type-label text-vermilion">
          <span aria-hidden="true">// </span>Off the clock
        </p>
        <p class="mt-3">
          I spend an unhealthy amount of time building personal projects. One of them is my own version of Tony Stark's Jarvis. I'm turning it into a
          full operating system that automates my own business, so I can get more done for clients.
        </p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Create the skills section**

`src/components/about/AboutSkills.astro`:

```astro
---
import { disciplines } from '../../content/disciplines'
---

<section class="bg-ivory" aria-labelledby="about-skills-heading">
  <div class="mx-auto max-w-[1600px] px-6 pb-14 pt-16 md:px-12 lg:pb-16 lg:pt-24">
    <h2 id="about-skills-heading" class="type-display max-w-[14ch] text-[clamp(2.75rem,5.6vw,5.75rem)]" data-reveal="rise">Skills across five disciplines</h2>
    <ul role="list" class="mt-10 grid border-t-2 border-ink sm:grid-cols-2 lg:mt-12 lg:grid-cols-5">
      {
        disciplines.map((d, i) => (
          <li class="border-b border-ink/15 py-6 sm:pr-6 lg:border-b-0 lg:border-r lg:pl-5 lg:first:pl-0 lg:last:border-r-0" data-reveal="rise" data-reveal-index={i}>
            <span class="type-label" aria-hidden="true">
              {d.number}
            </span>
            <h3 class="type-display mt-2 text-[clamp(1.5rem,1.9vw,2rem)]">{d.title}</h3>
            <ul role="list" class="mt-4">
              {d.skills.map((skill) => <li class="type-label border-t border-ink/15 py-1.5 font-medium">{skill}</li>)}
            </ul>
            <a
              href={`/services#${d.slug}`}
              class="type-label mt-4 inline-block underline-offset-8 decoration-vermilion decoration-2 hover:underline focus-visible:underline"
              aria-label={`See the ${d.title} service`}
            >
              See the service <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))
      }
    </ul>
  </div>
</section>
```

- [ ] **Step 6: Create the page**

`src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import AboutHero from '../components/about/AboutHero.astro'
import AboutBio from '../components/about/AboutBio.astro'
import AboutFacts from '../components/about/AboutFacts.astro'
import AboutBackground from '../components/about/AboutBackground.astro'
import AboutSkills from '../components/about/AboutSkills.astro'
import ContactBand from '../components/sections/ContactBand.astro'
---

<BaseLayout
  title="About Mathew Brown: UX/UI Engineer & SEO Specialist"
  description="I'm Mathew Brown, a freelance UX/UI engineer and SEO specialist based on O'ahu, Hawai'i, with 10 years in software development and UX/UI design."
>
  <AboutHero />
  <AboutBio />
  <AboutFacts />
  <AboutBackground />
  <AboutSkills />
  <ContactBand />
</BaseLayout>
```

- [ ] **Step 7: Load the design skills, then tune in the browser**

At 1440x900, then 1024x768 and 390x844, compare `/about` with A1 to A6 of the reference and adjust until:

- **A1:** "Mathew Brown" in Anton on two lines at the left; the cut-out portrait on the vermilion block at the right, tinted where it overlaps the block, with the cap breaking out above the block untinted; the name may cross onto the block and stays fully legible; the keyword `h1` at the lower left; the rotated "O'ahu, Hawai'i / Working remotely" label at the right in ink, legible on the block. No script in this section. The hero fits the first viewport at 1440x900 and nothing collides with the site header.
- **A2:** the Anton statement on the left with "and" in vermilion; three paragraphs on the right at a comfortable measure; "my blog" is a visible link.
- **A3:** an ink strip with the rotated "By the numbers" label and four cells: vermilion labels, giant vermilion 10, 8 and 6, "O'ahu, Hawai'i" in ivory Anton, one sentence each.
- **A4:** on stone; "Research first." and "Self-taught." on two lines; "always building" written below the heading's lower left, overlapping its last line slightly, never reaching the right column or covering the paragraphs; the "Off the clock" panel in ink with a vermilion label.
- **A5:** the Anton heading; five columns with a number, title, six skills and a "See the service" link each.
- **A6:** the shared contact band. The page has exactly two script moments ("always building" and "let's talk"), and they are not in adjacent sections.
- **Mobile:** the hero stacks name, `h1`, then the portrait on its block; the facts strip is two columns; the skills are two columns, one below 400px; the script in A4 stays on screen and off the body text; no horizontal scroll from 320 up.
- No flash on load: the block is held until its reveal starts, and with reduced motion everything is simply there.
- Keyboard: Tab goes header, "my blog", the five "See the service" links, then the contact band, with a visible ring on each.

You may restructure markup and classes, provided: the `h1` text is as written; the decorative name is `aria-hidden`; the portrait keeps its `alt`; the facts come from `aboutFacts` and stay a `dl`; the skills come from `disciplines`; no copy changes.

- [ ] **Step 8: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`, then:

```bash
f=dist/about/index.html
printf "h1:%s h2:%s dashes:%s curly:%s\n" "$(grep -o '<h1' $f | wc -l | tr -d ' ')" "$(grep -o '<h2' $f | wc -l | tr -d ' ')" "$(grep -o '[—–]' $f | wc -l | tr -d ' ')" "$(grep -o '[’‘“”]' $f | wc -l | tr -d ' ')"
grep -o 'href="/services#[a-z-]*"' $f | sort -u | wc -l
grep -o 'script/[a-z-]*\.svg' $f | sort -u
```

Expected: `h1:1 h2:5 dashes:0 curly:0` (bio, facts, background, skills, contact band); 5 service links; exactly `script/always-building.svg` and `script/lets-talk.svg`.

```bash
git add src/components/about src/pages/about.astro
git commit -m "feat: add the About page"
```

---

### Task 6: Contact page, form and confirmation

**Files:**
- Create: `src/components/contact/ContactIntro.astro`, `ContactForm.astro`, `Confirmation.astro`, `src/pages/contact/index.astro`, `src/pages/contact/thanks.astro`

**Interfaces:**
- Consumes: `initContactForm` from `src/lib/contactForm.ts` and its markup contract (Task 2); `disciplines`; `budgetRanges`, `MULTIPLE_SERVICES` from `src/content/contactOptions.ts`; `ScriptArt` (name `lets-talk`); `Button` (variant `ink`); `BaseLayout` (prop `noindex`).
- Produces: `/contact` and `/contact/thanks`.

Target: sections K1 and K2 of the reference.

- [ ] **Step 1: Create the confirmation**

`src/components/contact/Confirmation.astro`:

```astro
---
import Button from '../ui/Button.astro'

interface Props {
  /** `h1` on the thanks page, `h2` inside the contact page. */
  as?: 'h1' | 'h2'
}

const { as: Heading = 'h2' } = Astro.props
---

<div class="bg-vermilion px-6 py-12 text-ink md:px-12 lg:py-16">
  <Heading class="type-display text-[clamp(3rem,8vw,8rem)] leading-[0.9]" tabindex="-1" data-confirmation-heading>Got it.<br />Thank you.</Heading>
  <p class="mt-6 max-w-md text-lg leading-relaxed">Your message is on its way to me. I'll be in touch.</p>
  <Button href="/work" variant="ink" class="mt-8">See my work</Button>
</div>
```

- [ ] **Step 2: Create the form**

`src/components/contact/ContactForm.astro`:

```astro
---
import Confirmation from './Confirmation.astro'
import { disciplines } from '../../content/disciplines'
import { budgetRanges, MULTIPLE_SERVICES } from '../../content/contactOptions'

const label = 'type-label mb-2 block'
const control =
  'block w-full rounded-none border-2 border-ivory bg-ink px-4 py-3 text-base text-ivory placeholder:text-ivory/55 focus-visible:outline-ivory aria-[invalid=true]:border-vermilion'
const error = 'type-label mt-2 font-medium normal-case tracking-normal text-vermilion'
---

<div data-contact-panel class="bg-ink text-ivory">
  <form
    name="contact"
    method="POST"
    action="/contact/thanks/"
    data-netlify="true"
    netlify-honeypot="bot-field"
    data-contact-form
    class="grid gap-x-5 gap-y-6 px-6 py-12 md:px-12 lg:grid-cols-2 lg:py-16"
  >
    <input type="hidden" name="form-name" value="contact" />
    <p hidden>
      <label>Do not fill this out: <input name="bot-field" tabindex="-1" autocomplete="off" /></label>
    </p>

    <div>
      <label for="name" class={label}>Name <span class="text-vermilion" aria-hidden="true">*</span></label>
      <input id="name" name="name" type="text" required autocomplete="name" placeholder="Your name" class={control} />
      <p id="name-error" data-error-for="name" class={error} hidden></p>
    </div>
    <div>
      <label for="email" class={label}>Email <span class="text-vermilion" aria-hidden="true">*</span></label>
      <input id="email" name="email" type="email" required autocomplete="email" placeholder="you@company.com" class={control} />
      <p id="email-error" data-error-for="email" class={error} hidden></p>
    </div>
    <div class="lg:col-span-2">
      <label for="company" class={label}>Company <span class="text-vermilion" aria-hidden="true">*</span></label>
      <input id="company" name="company" type="text" required autocomplete="organization" placeholder="Company or project name" class={control} />
      <p id="company-error" data-error-for="company" class={error} hidden></p>
    </div>
    <div>
      <label for="projectType" class={label}>Project type <span class="text-vermilion" aria-hidden="true">*</span></label>
      <div class="relative">
        <select id="projectType" name="projectType" required class:list={[control, 'appearance-none pr-10']}>
          <option value="">Select a service</option>
          {disciplines.map((d) => <option value={d.title} data-slug={d.slug}>{d.title}</option>)}
          <option value={MULTIPLE_SERVICES}>{MULTIPLE_SERVICES}</option>
        </select>
        <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm" aria-hidden="true">▾</span>
      </div>
      <p id="projectType-error" data-error-for="projectType" class={error} hidden></p>
    </div>
    <div>
      <label for="budget" class={label}>Budget <span class="text-vermilion" aria-hidden="true">*</span></label>
      <div class="relative">
        <select id="budget" name="budget" required class:list={[control, 'appearance-none pr-10']}>
          <option value="">Select a range</option>
          {budgetRanges.map((range) => <option value={range}>{range}</option>)}
        </select>
        <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm" aria-hidden="true">▾</span>
      </div>
      <p id="budget-error" data-error-for="budget" class={error} hidden></p>
    </div>
    <div class="lg:col-span-2">
      <label for="message" class={label}>Message <span class="font-medium normal-case tracking-normal opacity-70">(optional)</span></label>
      <textarea id="message" name="message" rows="5" placeholder="What are you trying to get done?" class:list={[control, 'resize-y']}></textarea>
    </div>

    <div class="lg:col-span-2">
      <p data-form-error role="alert" class="mb-5 max-w-md leading-relaxed" hidden>
        Something went wrong. Email me at
        <a href="mailto:mat@matbrown.io" class="underline decoration-vermilion decoration-2 underline-offset-4">mat@matbrown.io</a>.
      </p>
      <div class="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          data-submit
          class="type-label bg-vermilion px-7 py-4 text-sm text-ink transition-colors duration-200 hover:bg-ivory focus-visible:outline-ivory disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
        >
          Send enquiry
        </button>
        <span class="type-label font-medium opacity-75"><span aria-hidden="true">* </span>Required</span>
      </div>
    </div>
  </form>

  <div data-contact-confirmation hidden>
    <Confirmation />
  </div>
</div>
```

The email placeholder "you@company.com" is an input hint, not a claim. The `hidden` attribute on the honeypot paragraph keeps it from sight and from assistive technology; Netlify still reads the field from the built HTML.

- [ ] **Step 3: Create the intro**

`src/components/contact/ContactIntro.astro`:

```astro
---
import ScriptArt from '../brand/ScriptArt.astro'
---

<div class="px-6 pb-14 pt-32 md:px-12 lg:pb-20 lg:pt-[max(9rem,10vw)]">
  {/* Decorative: the h1 below carries the keywords. */}
  <p class="type-display relative inline-block text-[clamp(4rem,12.4vw,12.5rem)] leading-[0.86]" aria-hidden="true">
    Start a<br />project<span class="text-vermilion">.</span>
    <ScriptArt name="lets-talk" class="absolute -top-[0.34em] left-[46%] w-[58%] -rotate-[7deg]" reveal="wipe" delay={0.3} />
  </p>
  <h1 class="type-label mt-12 max-w-xs before:mb-3 before:block before:h-0.5 before:w-10 before:bg-ink lg:mt-16">
    Hire a UX/UI Engineer &amp; SEO Specialist
  </h1>
  <p class="mt-6 max-w-md text-xl leading-snug">Tell me about your project and I'll be in touch.</p>
  <dl class="mt-10 space-y-6">
    <div>
      <dt class="type-label">Email</dt>
      <dd class="mt-1">
        <a
          href="mailto:mat@matbrown.io"
          class="type-display text-[clamp(1.5rem,2.1vw,2.25rem)] underline-offset-8 decoration-vermilion decoration-2 hover:underline focus-visible:underline"
          >mat@matbrown.io</a
        >
      </dd>
    </div>
    <div>
      <dt class="type-label">Based</dt>
      <dd class="mt-1 max-w-sm leading-snug">O'ahu, Hawai'i. I work with most clients remotely.</dd>
    </div>
  </dl>
</div>
```

- [ ] **Step 4: Create the two pages**

`src/pages/contact/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro'
import ContactIntro from '../../components/contact/ContactIntro.astro'
import ContactForm from '../../components/contact/ContactForm.astro'
---

<BaseLayout
  title="Hire a UX/UI Engineer & SEO Specialist"
  description="Tell me about your UX/UI, SEO, AI workflow, brand or SaaS project. Send the form or email mat@matbrown.io."
>
  <div class="mx-auto grid max-w-[1600px] bg-ivory lg:grid-cols-[1fr_1.02fr]">
    <ContactIntro />
    <div class="lg:mt-[max(6.5rem,8vw)]">
      <ContactForm />
    </div>
  </div>
</BaseLayout>

<script>
  import { initContactForm } from '../../lib/contactForm'
  initContactForm()
</script>
```

`src/pages/contact/thanks.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro'
import Confirmation from '../../components/contact/Confirmation.astro'
---

<BaseLayout title="Message sent" description="Your message is on its way to me." noindex>
  <div class="bg-vermilion pt-28">
    <div class="mx-auto max-w-[1600px]">
      <Confirmation as="h1" />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 5: Load the design skills, then tune in the browser**

At 1440x900, then 1024x768 and 390x844, compare `/contact` with K1 and K2 of the reference and adjust until:

- **K1 left:** "Start a project" in Anton on two lines with a vermilion full stop; "let's talk" written over the top right corner of "Start a", inside the left column, never on the ink panel and clear of the site header; the keyword `h1`; the sentence; the email in Anton as a link; the location line.
- **K1 right:** the ink panel starts below the site header and runs to the footer; six labelled fields in the order Name, Email, Company (full width), Project type, Budget, Message (full width); square inputs with a 2px ivory outline; both selects show a caret and their placeholder option; the vermilion "Send enquiry" button and the "* Required" note.
- The header's "Start a project" button is ink with ivory text on this page.
- No contact band; the footer follows the page.
- **Form behaviour with JavaScript:**
  - Tab out of an empty Name: its message appears below it in vermilion and the outline turns vermilion. Type a name and Tab out: both clear.
  - Press "Send enquiry" on an empty form: five messages appear and focus is on Name.
  - Open `/contact?service=seo-aeo`: Project type shows "SEO/AEO". Open `/contact?service=nope`: it shows "Select a service" and no error.
  - Fill the form validly and send. On the dev server the request fails (there is no Netlify): the "Something went wrong" message with the email link appears above the button, every field keeps its value, and the button reads "Send enquiry" again. Check the request in the network panel: `POST` to `/contact` or `/contact/`, `Content-Type: application/x-www-form-urlencoded`, and a body holding `form-name=contact` and all six fields.
  - To see the success state, run in the page console: `document.querySelector('[data-contact-form]').hidden = true; document.querySelector('[data-contact-confirmation]').hidden = false`. The vermilion confirmation fills the panel's place and reads as K2.
- **Without JavaScript** (disable it, or read the built HTML): every field and label is visible, the `required` and `type="email"` attributes are present so the browser validates, and the form's `action` is `/contact/thanks/`.
- **`/contact/thanks`:** the confirmation as a full-width vermilion page below the header, with "See my work" in ink.
- **Mobile:** the intro first, then the form panel full width; every field is one column; inputs are at least 44px tall and their text is at least 16px, so iOS does not zoom on focus; no horizontal scroll from 320 up.
- **Keyboard:** Tab goes header, the email link, then the six fields in order, then the button, then the footer. Every control shows a visible focus ring on ink.

You may restructure markup and classes, provided: the markup contract in Task 2 holds exactly (the data attributes, field names, error element ids and `data-error-for`, option `data-slug`, the `hidden` starting states); the form keeps `name="contact"`, `method`, `action`, `data-netlify`, `netlify-honeypot` and the hidden `form-name` input; every field keeps a visible `label`; no copy changes.

- [ ] **Step 6: Verify and commit**

Run: `npx vitest run && npm run typecheck && npm run build`, then:

```bash
f=dist/contact/index.html
printf "h1:%s dashes:%s islands:%s\n" "$(grep -o '<h1' $f | wc -l | tr -d ' ')" "$(grep -o '[—–]' $f | wc -l | tr -d ' ')" "$(grep -o 'astro-island' $f | wc -l | tr -d ' ')"
for a in 'data-netlify="true"' 'netlify-honeypot="bot-field"' 'name="form-name"' 'action="/contact/thanks/"' 'name="name"' 'name="email"' 'name="company"' 'name="projectType"' 'name="budget"' 'name="message"' 'name="bot-field"'; do printf "%s %s\n" "$(grep -o "$a" $f | wc -l | tr -d ' ')" "$a"; done
grep -o 'data-slug="[a-z-]*"' $f | sort -u | wc -l
grep -o 'aria-current="page"' $f | wc -l
t=dist/contact/thanks/index.html
printf "thanks h1:%s noindex:%s\n" "$(grep -o '<h1' $t | wc -l | tr -d ' ')" "$(grep -o 'name="robots" content="noindex"' $t | wc -l | tr -d ' ')"
grep -c "contact/thanks" dist/sitemap-0.xml ; grep -o '<loc>[^<]*contact[^<]*</loc>' dist/sitemap-0.xml
```

Expected: `h1:1 dashes:0` and the island count equal to Home's; every attribute line starts with `1`; 5 `data-slug` values; at least 1 `aria-current="page"` (the header button, plus the mobile menu's contact link if it marks one); `thanks h1:1 noindex:1`; the sitemap has 0 lines naming the thanks page and lists `/contact/`.

```bash
git add src/components/contact src/pages/contact
git commit -m "feat: add the Contact page, its form and the confirmation"
```

---

### Task 7: Docs

**Files:**
- Modify: `CLAUDE.md`, `MEMORY.md`

- [ ] **Step 1: Update `CLAUDE.md` section 5**

In section 5, replace the bullet that begins "`src/content/disciplines.ts` is the single source" with these four bullets:

```markdown
- `src/content/disciplines.ts` is the single source for the five disciplines: Home's strip, the Services sections (through `src/lib/serviceSections.ts`), About's skills and the Contact project-type select all read it. `src/content/navigation.ts` is the single source for nav links.
- `src/content/about.ts` holds the facts in About's "By the numbers" strip. They are the owner's own statements; change a number only when the owner gives a new one.
- `src/content/contactOptions.ts` holds the contact form's budget ranges.
- **The contact form** (`src/components/contact/ContactForm.astro`) is plain HTML posted to Netlify Forms, and must keep working without JavaScript: keep `name="contact"`, `data-netlify`, the hidden `form-name` input, the honeypot and `action="/contact/thanks/"`. `src/lib/contactForm.ts` adds inline validation, the `?service=<slug>` preselect and the in-place send; it finds things by the `data-` attributes in the form, so keep those when restyling. A real submission can only be tested on a deployed Netlify build.
```

Change nothing else in `CLAUDE.md`.

- [ ] **Step 2: Update `MEMORY.md`**

In the "Astro rebuild" section:

- Set sub-project 3's roadmap row to status "Built; awaiting owner review" with the spec path `docs/superpowers/specs/2026-10-12-services-about-contact-design.md`.
- Correct anything this build made false (for example the list of pages, and any line saying Services, About or Contact do not exist).
- Add a short "What sub-project 3 added" paragraph listing what now exists, from the code: the pages `services.astro`, `about.astro`, `contact/index.astro` and `contact/thanks.astro`; the components under `src/components/services/`, `src/components/about/` and `src/components/contact/`; the modules `serviceSections`, `contactValidation` and `contactForm` in `src/lib/`; `about.ts` and `contactOptions.ts` in `src/content/`; the `ink` variant and `current` prop on `Button`; the two new script phrases. Run `ls` on those folders first and describe what is there.
- Add an "Owner inputs still needed for sub-project 3" paragraph: enable Netlify Forms for the site and set where submissions go, then send one test enquiry after the first deploy; confirm the Brand Development and SaaS Development copy in `disciplines.ts`; a larger About portrait.
- Under the Astro rebuild gotchas, add any real gotcha met during this build, each with cause and fix. Read this plan's ledger at `.superpowers/sdd/2026-10-12-services-about-contact/progress.md` and the task reports in the same folder for them. Do not invent any.
- If the ledger holds `Ruling:` lines that changed what a page does or says, add a "Decisions made during the sub-project 3 build, for the owner to confirm" paragraph with one plain sentence each.

No em or en dashes in anything you add.

- [ ] **Step 3: Commit**

```bash
npm run typecheck
git add CLAUDE.md MEMORY.md
git commit -m "docs: describe the Services, About and Contact pages and the contact form"
```

---

### Task 8: Whole-page verification

**Files:**
- Modify: any file from Tasks 1 to 6 that a check below shows to be wrong.

- [ ] **Step 1: Automated suite**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: every test passes with no warnings, 0 type errors and 0 hints, the build completes with 10 pages.

- [ ] **Step 2: Static HTML**

```bash
for p in services about contact contact/thanks; do f=dist/$p/index.html; printf "%s h1:%s dashes:%s curly:%s islands:%s\n" $p "$(grep -o '<h1' $f | wc -l | tr -d ' ')" "$(grep -o '[—–]' $f | wc -l | tr -d ' ')" "$(grep -o '[’‘“”]' $f | wc -l | tr -d ' ')" "$(grep -o 'astro-island' $f | wc -l | tr -d ' ')"; done
grep -o 'astro-island' dist/index.html | wc -l
git ls-files | grep -iE "\.(ttf|otf|woff2?)$" ; echo "tracked font files: $?"
```

Expected: `h1:1 dashes:0 curly:0` on all four, each island count equal to Home's; `tracked font files: 1`.

- [ ] **Step 3: Every internal link resolves**

```bash
for page in index work/index services/index about/index contact/index contact/thanks/index; do
  for h in $(grep -o 'href="/[^"#?]*' dist/$page.html | sed 's/href="//' | sort -u); do
    case "$h" in /_astro/*|/script/*|/images/*|/sitemap*|/favicon*) continue;; esac
    test -f "dist${h%/}/index.html" || test -f "dist$h" || echo "MISSING $h (from $page)"
  done
done
for s in $(grep -oh 'href="/services#[a-z-]*"' dist/index.html dist/about/index.html | sort -u | sed 's/.*#//;s/"//'); do grep -q "id=\"$s\"" dist/services/index.html && echo "ok #$s" || echo "MISSING #$s"; done
```

Expected: the only `MISSING` lines are for `/blog` (sub-project 4); five `ok` anchors.

- [ ] **Step 4: Visual pass**

With reduced motion, take full-page screenshots of `/services`, `/about`, `/contact` and `/contact/thanks` at 1440x900, 1024x768 and 390x844, saved as `.playwright-mcp/sp3-<page>-<width>.png`. For each: section order matches the reference; no horizontal scroll; no clipped or overlapping text; no script artwork covering copy or sitting on a vermilion fill; no small vermilion text off ink. At 1440 compare section by section with the reference image and list every difference you see, intended or not. Also take `/` and `/work` at 1440 and confirm the header is unchanged there.

- [ ] **Step 5: Motion, keyboard and no-JavaScript passes**

- Motion allowed, fresh load of each page: load reveals animate in with no flash; scrolling reveals each heading and list once; nothing is left transparent at the bottom of the page.
- Keyboard, from a fresh load without scrolling first, on all three pages: Tab from the skip link to the footer. Every link and control takes focus in document order with a complete visible ring on its surface, and every focused element is fully opaque.
- The form, with JavaScript: repeat every behaviour check in Task 6 Step 5.
- JavaScript disabled: every section's content is visible on all four pages, and the form shows all six fields.
- From Home: each of the five discipline tiles lands on its Services section; "More about me" opens About; every "Start a project" opens Contact.

- [ ] **Step 6: Long-content check**

Temporarily change one discipline in `src/content/disciplines.ts` to `title: 'Conversational Interface Engineering'` and `cta: 'Start a conversational interface project'`. Check its Services section, the jump strip, its About column, the Contact select and Home's strip at 1440 and 390: nothing overflows horizontally or covers other text. Fix what breaks in the components, then restore the file exactly (`git diff src/content` shows nothing).

- [ ] **Step 7: Commit any fixes**

```bash
git status --short
git add <the files you changed, by name>
git commit -m "fix: correct Services, About and Contact layout issues found in browser verification"
```

Skip the commit if there is nothing to commit. A fix to a `.ts` file needs a failing test first, in the same commit.
