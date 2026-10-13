import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { disciplines } from './disciplines'

const caseStudySlugs = readdirSync('src/content/case-studies').map((file) => file.replace(/\.mdx$/, ''))

describe('disciplines', () => {
  it('has five disciplines numbered 01 to 05 in order', () => {
    expect(disciplines.map((d) => d.number)).toEqual(['01', '02', '03', '04', '05'])
  })

  it('has unique slugs and the agreed titles', () => {
    expect(new Set(disciplines.map((d) => d.slug)).size).toBe(5)
    expect(disciplines.map((d) => d.title)).toEqual([
      'UX/UI Engineering',
      'SEO/AEO',
      'Agentic Workflows',
      'Brand Development',
      'SaaS Development',
    ])
  })

  it('links every proof to a real case study', () => {
    for (const d of disciplines) expect(caseStudySlugs, d.slug).toContain(d.proofSlug)
  })

  it('writes every blurb in the first person as a whole sentence', () => {
    for (const d of disciplines) {
      expect(d.blurb, d.slug).toMatch(/^I /)
      expect(d.blurb, d.slug).toMatch(/\.$/)
    }
  })

  it('has complete copy with no em or en dashes', () => {
    for (const d of disciplines) {
      expect(d.description && d.cta).toBeTruthy()
      expect(d.deliverables.length).toBeGreaterThan(0)
      expect(d.skills.length).toBeGreaterThan(0)
    }
    expect(JSON.stringify(disciplines)).not.toMatch(/[—–]/)
  })
})
