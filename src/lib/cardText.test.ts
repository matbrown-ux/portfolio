import { describe, expect, it } from 'vitest'
import { fitTitle, textPath, textWidth, wrapTitle, type CardFont, type GlyphPath } from './cardText'

// A path double that only remembers where its origin ends up.
function point(x: number, y: number): GlyphPath {
  return {
    scale: (sx, sy) => point(x * sx, y * sy),
    translate: (dx, dy) => point(x + dx, y + dy),
    toSVG: () => `M${x},${y}`,
  }
}

// Every character, spaces included, is 500 units wide in a 1000-unit em: 50px at size 100.
const font: CardFont = {
  unitsPerEm: 1000,
  layout: (text) => ({
    glyphs: [...text].map(() => ({ path: point(0, 0) })),
    positions: [...text].map(() => ({ xAdvance: 500, xOffset: 0, yOffset: 0 })),
  }),
}

describe('textWidth', () => {
  it('scales the advances by the size', () => {
    expect(textWidth(font, 'ABCD', 100)).toBe(200)
    expect(textWidth(font, 'ABCD', 50)).toBe(100)
  })

  it('adds tracking after every character, in ems', () => {
    expect(textWidth(font, 'ABCD', 100, 0.1)).toBe(240)
  })

  it('is zero for an empty string', () => {
    expect(textWidth(font, '', 100)).toBe(0)
  })
})

describe('wrapTitle', () => {
  it('breaks between words when the next word would not fit', () => {
    expect(wrapTitle(font, 'AAAA BBBB CCCC', 100, 480)).toEqual(['AAAA BBBB', 'CCCC'])
  })

  it('keeps a word that is wider than the line on a line of its own', () => {
    expect(wrapTitle(font, 'AA BBBBBBBBBBBB CC', 100, 300)).toEqual(['AA', 'BBBBBBBBBBBB', 'CC'])
  })

  it('ignores extra spaces and returns nothing for an empty title', () => {
    expect(wrapTitle(font, '  AA   BB  ', 100, 1000)).toEqual(['AA BB'])
    expect(wrapTitle(font, '   ', 100, 1000)).toEqual([])
  })
})

describe('fitTitle', () => {
  const space = { maxWidth: 300, maxLines: 2, sizes: [100, 80, 60] }

  it('uses the largest size at which the title fits the width and the lines', () => {
    expect(fitTitle(font, 'AAAA BBBB', space)).toEqual({ size: 100, lines: ['AAAA', 'BBBB'] })
  })

  it('steps down when one word is too wide', () => {
    expect(fitTitle(font, 'AAAAAAAA', space)).toEqual({ size: 60, lines: ['AAAAAAAA'] })
  })

  it('steps down when the title takes too many lines', () => {
    expect(fitTitle(font, 'AA BB CC DD EE FF', space)).toEqual({ size: 60, lines: ['AA BB CC', 'DD EE FF'] })
  })

  it('falls back to the smallest size when nothing fits, without dropping any word', () => {
    const fit = fitTitle(font, 'AAAAAAAAAAAAAAA BB', space)
    expect(fit.size).toBe(60)
    expect(fit.lines).toEqual(['AAAAAAAAAAAAAAA', 'BB'])
  })
})

describe('textPath', () => {
  it('places each glyph at the pen position on the baseline', () => {
    expect(textPath(font, 'AB', 100, 10, 80)).toBe('M10,80M60,80')
  })

  it('adds the tracking between glyphs', () => {
    expect(textPath(font, 'AB', 100, 10, 80, 0.1)).toBe('M10,80M70,80')
  })

  it('flips the glyph outline, because font y points up and SVG y points down', () => {
    const upright: CardFont = {
      unitsPerEm: 1000,
      layout: () => ({ glyphs: [{ path: point(0, 700) }], positions: [{ xAdvance: 500, xOffset: 0, yOffset: 0 }] }),
    }
    expect(textPath(upright, 'A', 100, 0, 80)).toBe('M0,10')
  })
})
