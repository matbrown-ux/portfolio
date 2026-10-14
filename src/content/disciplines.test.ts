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

  it('cites the case study that shows each discipline', () => {
    expect(Object.fromEntries(disciplines.map((d) => [d.slug, d.proofSlug]))).toEqual({
      'ux-ui-engineering': 'vamp-network',
      'seo-aeo': 'aiwi-waffles',
      'agentic-workflows': 'vamp-network',
      'brand-development': 'aiwi-waffles',
      'saas-development': 'aiwi-waffles',
    })
  })

  it('writes every blurb in the first person as a whole sentence', () => {
    for (const d of disciplines) {
      expect(d.blurb, d.slug).toMatch(/^I /)
      expect(d.blurb, d.slug).toMatch(/\.$/)
    }
  })

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
})
