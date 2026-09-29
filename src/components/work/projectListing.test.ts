import { describe, it, expect } from 'vitest'
import { projectNumber, showcaseMode, previewPosition, projectIds, caseStudyCountLabel } from './projectListing'

describe('projectNumber', () => {
  it('zero-pads index and total', () => {
    expect(projectNumber(0, 3)).toBe('01 / 03')
    expect(projectNumber(2, 3)).toBe('03 / 03')
  })
  it('keeps two-digit numbers as-is', () => {
    expect(projectNumber(9, 12)).toBe('10 / 12')
  })
})

describe('showcaseMode', () => {
  it('stacks only on desktop with motion allowed', () => {
    expect(showcaseMode(true, false)).toBe('stack')
    expect(showcaseMode(true, true)).toBe('cards')
    expect(showcaseMode(false, false)).toBe('cards')
    expect(showcaseMode(false, true)).toBe('cards')
  })
})

describe('previewPosition', () => {
  const size = { w: 420, h: 236 }
  const viewport = { w: 1440, h: 900 }

  it('offsets down and right of the pointer', () => {
    expect(previewPosition({ x: 100, y: 100 }, size, viewport)).toEqual({ x: 124, y: 124 })
  })
  it('flips left near the right edge', () => {
    expect(previewPosition({ x: 1300, y: 100 }, size, viewport)).toEqual({ x: 856, y: 124 })
  })
  it('flips up near the bottom edge', () => {
    expect(previewPosition({ x: 100, y: 800 }, size, viewport)).toEqual({ x: 124, y: 540 })
  })
  it('clamps on-screen when the viewport is smaller than the card', () => {
    expect(previewPosition({ x: 150, y: 100 }, size, { w: 300, h: 200 })).toEqual({ x: 0, y: 0 })
  })
})

describe('projectIds', () => {
  it('derives stable, prefixed ids from the slug', () => {
    expect(projectIds('work', 'vamp-network')).toEqual({
      titleId: 'work-vamp-network-title',
      resultId: 'work-vamp-network-result',
    })
  })
})

describe('caseStudyCountLabel', () => {
  it('pads and pluralizes', () => {
    expect(caseStudyCountLabel(3)).toBe('03 case studies')
    expect(caseStudyCountLabel(1)).toBe('01 case study')
    expect(caseStudyCountLabel(12)).toBe('12 case studies')
  })
})
