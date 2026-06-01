import { describe, it, expect } from 'vitest'
import { personSchema, articleSchema, breadcrumbSchema, serviceSchema } from './seo'

describe('personSchema', () => {
  it('returns correct type and fields', () => {
    const s = personSchema('Mathew Brown', 'https://matbrown.io')
    expect(s['@type']).toBe('Person')
    expect(s.name).toBe('Mathew Brown')
    expect(s.url).toBe('https://matbrown.io')
  })
})

describe('articleSchema', () => {
  it('maps all fields', () => {
    const s = articleSchema({
      title: 'Test Article',
      description: 'A description',
      datePublished: '2026-01-01',
      url: 'https://matbrown.io/blog/ux/test',
    })
    expect(s['@type']).toBe('Article')
    expect(s.headline).toBe('Test Article')
    expect(s.datePublished).toBe('2026-01-01')
  })
})

describe('breadcrumbSchema', () => {
  it('generates list items with correct positions', () => {
    const s = breadcrumbSchema([
      { name: 'Blog', url: 'https://matbrown.io/blog' },
      { name: 'UX/UI Design', url: 'https://matbrown.io/blog/ux-ui-design' },
    ])
    expect(s['@type']).toBe('BreadcrumbList')
    expect(s.itemListElement).toHaveLength(2)
    expect(s.itemListElement[0].position).toBe(1)
    expect(s.itemListElement[1].name).toBe('UX/UI Design')
  })
})

describe('serviceSchema', () => {
  it('sets provider name', () => {
    const s = serviceSchema('UX/UI Engineering', 'Design systems', 'Mathew Brown')
    expect(s['@type']).toBe('Service')
    expect(s.provider.name).toBe('Mathew Brown')
  })
})
