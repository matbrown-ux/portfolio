import { describe, expect, it } from 'vitest'
import { featuredWork, type WorkEntry } from './featuredWork'

const entry = (id: string, date: string, tags: string[] = ['A', 'B', 'C']): WorkEntry => ({
  id,
  data: { title: id.toUpperCase(), date: new Date(date), tags },
})

describe('featuredWork', () => {
  it('returns the three newest, newest first, numbered and assigned tile variants', () => {
    const tiles = featuredWork([
      entry('old', '2023-01-01'),
      entry('newest', '2025-11-01'),
      entry('middle', '2025-06-01'),
      entry('older', '2024-01-01'),
    ])
    expect(tiles.map((t) => [t.number, t.variant, t.href])).toEqual([
      ['01', 'tall', '/work/newest'],
      ['02', 'accent', '/work/middle'],
      ['03', 'dark', '/work/older'],
    ])
  })

  it('carries the title and the first two tags', () => {
    expect(featuredWork([entry('a', '2025-01-01', ['Branding', 'Local SEO', 'Shopify'])])[0]).toEqual({
      number: '01',
      variant: 'tall',
      title: 'A',
      href: '/work/a',
      tags: ['Branding', 'Local SEO'],
    })
  })

  it('copes with fewer than three entries', () => {
    expect(featuredWork([])).toEqual([])
    expect(featuredWork([entry('a', '2025-01-01'), entry('b', '2024-01-01')]).map((t) => t.variant)).toEqual([
      'tall',
      'accent',
    ])
  })

  it('breaks date ties by id so the order is stable', () => {
    const tiles = featuredWork([entry('b', '2025-01-01'), entry('a', '2025-01-01')])
    expect(tiles.map((t) => t.href)).toEqual(['/work/a', '/work/b'])
  })

  it('does not reorder the list it was given', () => {
    const entries = [entry('old', '2023-01-01'), entry('new', '2025-01-01')]
    featuredWork(entries)
    expect(entries.map((e) => e.id)).toEqual(['old', 'new'])
  })
})
