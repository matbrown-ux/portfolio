import { describe, expect, it } from 'vitest'
import { heroNameFit, sharedTitleEm, titleFit, wordEm } from './titleFit'

describe('titleFit', () => {
  it('leaves the three current titles at full size in the hero and the Work rows', () => {
    for (const title of ['Vamp Network', 'The Booking Flow', "'Aiwi Waffles"]) {
      expect(titleFit(title, { charsPerLine: 8, maxLines: 3 })).toBe(1)
      expect(titleFit(title, { charsPerLine: 8 })).toBe(1)
    }
  })

  it('shrinks the type until the longest word fits on one line', () => {
    // 12 letters on a line that holds 8 at full size: the first step at or under 8/12.
    expect(titleFit('Considerably', { charsPerLine: 8 })).toBe(0.6)
    expect(titleFit('Considerably', { charsPerLine: 12 })).toBe(1)
    expect(titleFit('Considerably', { charsPerLine: 11 })).toBe(0.9)
  })

  it('shrinks further when the wrapped lines would be taller than the space allows', () => {
    // Every word fits a line of 8, but the title takes four lines where three fit.
    expect(titleFit('Alpha Bravo Charlie Delta', { charsPerLine: 8, maxLines: 3 })).toBe(0.7)
    expect(titleFit('Alpha Bravo Charlie Delta', { charsPerLine: 8 })).toBe(1)
  })

  it('fits a long client name in the hero', () => {
    expect(titleFit('A Considerably Longer Client Name Ltd', { charsPerLine: 8, maxLines: 3 })).toBe(0.6)
  })

  it('counts lines the way the browser wraps: whole words, greedily', () => {
    // "Ab Cd" is five characters with its space, so it shares a line of 5 but not a line of 4.
    expect(titleFit('Ab Cd Ef Gh', { charsPerLine: 5, maxLines: 2 })).toBe(1)
    expect(titleFit('Ab Cd Ef Gh', { charsPerLine: 4, maxLines: 2 })).toBe(0.8)
  })

  it('stops at the smallest step for a title nothing fits', () => {
    expect(titleFit('Supercalifragilisticexpialidocious', { charsPerLine: 8 })).toBe(0.4)
  })

  it('treats an empty title as fitting', () => {
    expect(titleFit('', { charsPerLine: 8, maxLines: 3 })).toBe(1)
  })
})

describe('heroNameFit', () => {
  it('keeps the three current names at full size across the wide box', () => {
    for (const title of ['Vamp Network', 'The Booking Flow', "'Aiwi Waffles"]) {
      expect(heroNameFit(title)).toEqual({ fit: 1, fitLg: 1, column: false })
    }
  })

  it('sets a name that does not fit at full size smaller and keeps it in the left column, clear of the note', () => {
    expect(heroNameFit('A Considerably Longer Client Name Ltd')).toEqual({ fit: 0.6, fitLg: 0.5, column: true })
  })

  it('moves to the column for a name with short words that is only too tall', () => {
    expect(heroNameFit('Alpha Bravo Charlie Delta')).toEqual({ fit: 1, fitLg: 0.7, column: true })
  })
})

describe('wordEm', () => {
  it('is the width of a word set in Anton, in em, to within a few hundredths of the browser', () => {
    // Measured in Chrome at 100px: OPTIMIZATION 5.043em, NETWORK 3.452em, WAFFLES 3.252em.
    expect(wordEm('OPTIMIZATION')).toBeCloseTo(5.043, 1)
    expect(wordEm('Network')).toBeCloseTo(3.452, 1)
    expect(wordEm('waffles')).toBeCloseTo(3.252, 1)
  })

  it('counts a character it has no width for as the widest letter, so a word is never under-measured', () => {
    expect(wordEm('é')).toBe(wordEm('M'))
  })
})

describe('sharedTitleEm', () => {
  it('is the longest word across every title, with a little room to spare', () => {
    const titles = ['Portfolio Optimization', 'Vamp Network', "'Aiwi Waffles"]
    expect(sharedTitleEm(titles)).toBeCloseTo(wordEm('OPTIMIZATION') * 1.04, 5)
  })

  it('does not change with the order of the titles', () => {
    expect(sharedTitleEm(['Vamp Network', 'Portfolio Optimization'])).toBe(sharedTitleEm(['Portfolio Optimization', 'Vamp Network']))
  })
})
