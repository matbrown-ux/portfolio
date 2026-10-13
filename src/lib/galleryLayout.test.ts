import { describe, expect, it } from 'vitest'
import { galleryLayout } from './galleryLayout'

describe('galleryLayout', () => {
  it('returns one item per image, for any count', () => {
    for (const count of [0, 1, 2, 3, 4, 5, 6, 7, 12]) expect(galleryLayout(count).items).toHaveLength(count)
  })

  it('makes the first item large when there are three or five', () => {
    expect(galleryLayout(3).items[0].span).toContain('row-span-2')
    expect(galleryLayout(5).items[0].span).toContain('row-span-2')
    expect(galleryLayout(5).items.slice(1).every((item) => !item.span.includes('row-span-2'))).toBe(true)
  })

  it('gives the smaller items beside a large one their own shape, so the rows cannot collapse', () => {
    for (const count of [3, 5]) {
      const [lead, ...rest] = galleryLayout(count).items
      // The large item has no shape of its own from md up: it stretches across the two rows.
      expect(lead.span).toContain('md:aspect-auto')
      for (const item of rest) {
        expect(item.span).toContain('md:aspect-[16/9]')
        expect(item.span).not.toContain('md:aspect-auto')
      }
    }
  })

  it('keeps even counts as a plain grid with no large item', () => {
    for (const count of [2, 4, 6]) expect(galleryLayout(count).items.every((item) => !item.span.includes('row-span-2'))).toBe(true)
  })

  it('alternates light and dark placeholder tones', () => {
    expect(galleryLayout(4).items.map((item) => item.tone)).toEqual(['light', 'dark', 'light', 'dark'])
  })

  it('always gives a grid class', () => {
    for (const count of [1, 2, 3, 5, 9]) expect(galleryLayout(count).grid).toMatch(/grid-cols/)
  })
})
