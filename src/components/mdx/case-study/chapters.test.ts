import { describe, it, expect } from 'vitest'
import { slugifyChapter, uniqueSlug, activeChapter, measureTops } from './chapters'

describe('slugifyChapter', () => {
  it.each([
    ['The challenge', 'the-challenge'],
    ["'Aiwi Waffles", 'aiwi-waffles'],
    ['UX/UI Engineering & SEO', 'ux-ui-engineering-and-seo'],
    ['Café outcome', 'cafe-outcome'],
    ['!!!', 'chapter'],
  ])('%s -> %s', (title, slug) => {
    expect(slugifyChapter(title)).toBe(slug)
  })
})

describe('uniqueSlug', () => {
  it('suffixes duplicates', () => {
    expect(uniqueSlug('overview', new Set())).toBe('overview')
    expect(uniqueSlug('overview', new Set(['overview']))).toBe('overview-2')
    expect(uniqueSlug('overview', new Set(['overview', 'overview-2']))).toBe('overview-3')
  })
})

describe('activeChapter', () => {
  const tops = [1000, 2000, 3000]
  it('is -1 before the first chapter', () => {
    expect(activeChapter(tops, 0, 1000)).toBe(-1)
  })
  it('activates a chapter once its top passes 35% of the viewport', () => {
    expect(activeChapter(tops, 650, 1000)).toBe(0)
    expect(activeChapter(tops, 1700, 1000)).toBe(1)
    expect(activeChapter(tops, 9000, 1000)).toBe(2)
  })
  it('handles no chapters', () => {
    expect(activeChapter([], 500, 1000)).toBe(-1)
  })
})

describe('measureTops', () => {
  it('returns absolute tops (viewport top plus scroll offset)', () => {
    const el = (top: number) => ({ getBoundingClientRect: () => ({ top }) }) as unknown as HTMLElement
    expect(measureTops([el(-200), el(300)], 500)).toEqual([300, 800])
    expect(measureTops([], 500)).toEqual([])
  })
})
