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
