import { describe, expect, it } from 'vitest'
import { person } from '../content/person'
import { articleUrl, llmsTxt, robotsTxt } from './llmsTxt'

const disciplines = [{ number: '02', slug: 'seo-aeo', title: 'SEO/AEO', blurb: 'I fix the technical foundations.', deliverables: [], cta: '', skills: [] }]
const caseStudies = [{ id: 'aiwi-waffles', data: { title: "'Aiwi Waffles", summary: 'A brand and a storefront that ranks #1 locally.' } }]
const articles = [
  { id: 'ux-ui-design/older', data: { title: 'Older', description: 'First.', date: new Date('2026-01-01') } },
  { id: 'ux-ui-design/newer', data: { title: 'Newer [draft]', description: 'Second\nline.', date: new Date('2026-05-31') } },
]

describe('robotsTxt', () => {
  it('allows every crawler and points at the sitemap', () => {
    expect(robotsTxt()).toBe('User-agent: *\nAllow: /\n\nSitemap: https://matbrown.io/sitemap-index.xml\n')
  })
})

describe('articleUrl', () => {
  it('is absolute and ends with a slash', () => {
    expect(articleUrl('ux-ui-design/newer')).toBe('https://matbrown.io/blog/ux-ui-design/newer')
  })
})

describe('llmsTxt', () => {
  const text = llmsTxt({ person, disciplines, caseStudies, articles })

  it('opens with the name and a summary in a quote block', () => {
    expect(text.startsWith("# Mat Brown\n\n> I'm Mat Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer. My full name is Mathew Brown. I'm based on O'ahu, Hawai'i, and work with most clients remotely.\n")).toBe(true)
  })

  it('lists the services with their section links', () => {
    expect(text).toContain('## Services\n\n- [SEO/AEO](https://matbrown.io/services#seo-aeo): I fix the technical foundations.\n')
  })

  it('lists the case studies with their summaries', () => {
    expect(text).toContain("## Case studies\n\n- ['Aiwi Waffles](https://matbrown.io/work/aiwi-waffles): A brand and a storefront that ranks #1 locally.\n")
  })

  it('lists the articles newest first, on one line each, with brackets in a title escaped', () => {
    expect(text).toContain(
      '## Articles\n\n- [Newer \\[draft\\]](https://matbrown.io/blog/ux-ui-design/newer): Second line.\n- [Older](https://matbrown.io/blog/ux-ui-design/older): First.\n',
    )
  })

  it('keeps angle brackets, ampersands and quotes readable', () => {
    const odd = [{ id: 'ux-ui-design/odd', data: { title: 'A < B & "C"', description: "It's <b>fine</b> & more.", date: new Date('2026-06-01') } }]
    expect(llmsTxt({ person, disciplines, caseStudies, articles: odd })).toContain(
      '- [A < B & "C"](https://matbrown.io/blog/ux-ui-design/odd): It\'s <b>fine</b> & more.\n',
    )
  })

  it('ends with how to get in touch', () => {
    expect(text.endsWith('## Contact\n\n- [Start a project](https://matbrown.io/contact): The enquiry form.\n- [Email](mailto:mat@matbrown.io): mat@matbrown.io\n')).toBe(true)
  })

  it('leaves out a section that would be empty', () => {
    expect(llmsTxt({ person, disciplines, caseStudies, articles: [] })).not.toContain('## Articles')
  })

  it('has no em or en dash', () => {
    expect(text).not.toMatch(/[–—]/)
  })
})
