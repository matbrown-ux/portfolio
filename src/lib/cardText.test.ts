import { describe, expect, it } from 'vitest'
import { fitTitle, MIN_TITLE_SIZE, TITLE_STEP, textPath, textWidth, wrapTitle, type CardFont, type GlyphPath } from './cardText'

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

  it('moves an ampersand that would end a line to the start of the next one', () => {
    // 'AAAA &' is 300 wide and fits, but a line does not end on a lone '&'.
    expect(wrapTitle(font, 'AAAA & BBBB', 100, 300)).toEqual(['AAAA', '& BBBB'])
  })

  it('leaves an ampersand in the middle of a line where it is', () => {
    expect(wrapTitle(font, 'AA & BB CCCC', 100, 400)).toEqual(['AA & BB', 'CCCC'])
  })

  it('leaves an ampersand that is the last word of the title where it is', () => {
    expect(wrapTitle(font, 'AAAA BBBB &', 100, 300)).toEqual(['AAAA', 'BBBB &'])
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

  it('steps down when moving an ampersand to the next line makes that line too wide', () => {
    // At 100, '& BBBBB' is 350 wide. At 80 it is 280, so that is the first size that fits.
    expect(fitTitle(font, 'AAAA & BBBBB', space)).toEqual({ size: 80, lines: ['AAAA', '& BBBBB'] })
  })

  it('keeps stepping down by a tenth past the smallest size until one long word fits the width', () => {
    // 60, 54, 48.6, 43.7 are all too wide for 14 characters in 300; 39.3 is 275.1 wide.
    expect(fitTitle(font, 'AAAAAAAAAAAAAA', space)).toEqual({ size: 39.3, lines: ['AAAAAAAAAAAAAA'] })
  })

  it('keeps stepping down past the smallest size until the title fits the line limit', () => {
    // At 43.7 the first two words share a line (284 wide), so there are two lines.
    expect(fitTitle(font, 'AAAAAA BBBBBB CCCCCC', space)).toEqual({ size: 43.7, lines: ['AAAAAA BBBBBB', 'CCCCCC'] })
  })

  it('stops at the floor when even that does not fit, without dropping any word', () => {
    const fit = fitTitle(font, 'A'.repeat(40) + ' BB', space)
    expect(fit.size).toBe(25.8)
    expect(fit.size).toBeGreaterThanOrEqual(MIN_TITLE_SIZE)
    expect(fit.lines).toEqual(['A'.repeat(40), 'BB'])
  })

  it('exports the floor and the step', () => {
    expect(MIN_TITLE_SIZE).toBe(24)
    expect(TITLE_STEP).toBe(0.9)
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
