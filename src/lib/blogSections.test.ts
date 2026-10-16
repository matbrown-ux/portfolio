import { describe, expect, it } from 'vitest'
import type { Discipline } from '../content/disciplines'
import { extraBlogSections } from '../content/blogSections'
import { blogSections, requireSection } from './blogSections'

const disciplines: Discipline[] = [
  { number: '01', slug: 'seo-aeo', title: 'SEO/AEO', blurb: 'SEO blurb.', deliverables: [], cta: '', skills: [], proofSlug: 'aiwi-waffles' },
  { number: '02', slug: 'saas-development', title: 'SaaS Development', blurb: 'SaaS blurb.', deliverables: [], cta: '', skills: [] },
]

describe('blogSections', () => {
  const sections = blogSections(disciplines, extraBlogSections)

  it('has one service section per discipline, then the extra sections', () => {
    expect(sections.map((s) => s.slug)).toEqual(['seo-aeo', 'saas-development', 'my-story'])
  })

  it('links a discipline to its service', () => {
    expect(sections[0]).toEqual({
      number: '01',
      slug: 'seo-aeo',
      title: 'SEO/AEO',
      blurb: 'SEO blurb.',
      proofSlug: 'aiwi-waffles',
      href: '/services#seo-aeo',
      linkLabel: 'See the service',
      nextLabel: 'The service behind it',
      emptyLabel: 'See the SEO/AEO service',
      isService: true,
    })
    expect(sections[1].proofSlug).toBeUndefined()
  })

  it('links My story to About', () => {
    expect(sections[2]).toEqual({
      number: '06',
      slug: 'my-story',
      title: 'My story',
      blurb: 'I write about working for myself: switching careers, freelancing and running my business from Hawaii.',
      href: '/about',
      linkLabel: 'About me',
      nextLabel: 'The person behind it',
      emptyLabel: 'About me',
      isService: false,
    })
  })

  it('finds a section or names the unknown slug', () => {
    expect(requireSection(sections, 'my-story').title).toBe('My story')
    expect(() => requireSection(sections, 'nope')).toThrow('Unknown blog section "nope"')
  })
})
