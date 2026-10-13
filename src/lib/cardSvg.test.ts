import { describe, expect, it } from 'vitest'
import { CARD, captureBox, cardSvg, COLORS, markFromSvg } from './cardSvg'
import type { CardFont, GlyphPath } from './cardText'

function point(x: number, y: number): GlyphPath {
  return {
    scale: (sx, sy) => point(x * sx, y * sy),
    translate: (dx, dy) => point(x + dx, y + dy),
    toSVG: () => `M${x},${y}`,
  }
}

// Records what it was asked to set, so the tests can see the text is upper-cased.
function fakeFont(seen: string[]): CardFont {
  return {
    unitsPerEm: 1000,
    layout: (text) => {
      seen.push(text)
      return {
        glyphs: [...text].map(() => ({ path: point(0, 0) })),
        positions: [...text].map(() => ({ xAdvance: 500, xOffset: 0, yOffset: 0 })),
      }
    },
  }
}

const mark = { d: 'M0,0L369,278', width: 369, height: 278 }
const text = { label: 'Case study / 2026', title: 'Vamp Network', address: 'matbrown.io / work' }

function build(options?: { capture?: boolean }, title = text.title) {
  const display: string[] = []
  const mono: string[] = []
  const svg = cardSvg({ ...text, title }, { display: fakeFont(display), mono: fakeFont(mono) }, mark, options)
  return { svg, display, mono }
}

describe('markFromSvg', () => {
  it('reads the size from the viewBox and the outline from the path', () => {
    expect(markFromSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 369 278"><path fill="currentColor" d="M1,2L3,4"/></svg>')).toEqual({
      d: 'M1,2L3,4',
      width: 369,
      height: 278,
    })
  })

  it('says what is wrong when the file is not the mark', () => {
    expect(() => markFromSvg('<svg viewBox="0 0 10 10"></svg>')).toThrow('The mark SVG has no path')
    expect(() => markFromSvg('<svg><path d="M0,0"/></svg>')).toThrow('The mark SVG has no viewBox')
  })
})

describe('cardSvg', () => {
  it('is a 1200 by 630 card on ivory', () => {
    const { svg } = build()
    expect(svg).toContain('width="1200" height="630" viewBox="0 0 1200 630"')
    expect(svg).toContain(`<rect width="1200" height="630" fill="${COLORS.ivory}"/>`)
  })

  it('has a full-height vermilion block on the right', () => {
    expect(build().svg).toContain(`<rect x="840" y="0" width="360" height="630" fill="${COLORS.vermilion}"/>`)
  })

  it('sets the label, title and address in capitals', () => {
    const { display, mono } = build()
    expect(display).toContain('VAMP NETWORK')
    expect(mono).toContain('CASE STUDY / 2026')
    expect(mono).toContain('MATBROWN.IO / WORK')
  })

  it('draws the mark in ink in the bottom right corner, running off both edges', () => {
    const { svg } = build()
    // 312 wide from a 369-wide mark; 16 past the right edge and 22 past the bottom.
    expect(svg).toContain('<g transform="translate(904 416.94) scale(0.8455)">')
    expect(svg).toContain(`<path d="M0,0L369,278" fill="${COLORS.ink}" fill-rule="evenodd"/>`)
  })

  it('ends the title 144 above the bottom edge and stacks earlier lines above it', () => {
    // 'VAMP NETWORK' is 12 characters: 828 wide at 138, so it wraps to two lines at that size.
    const { svg } = build()
    expect(svg).toContain('M60,361.8')
    expect(svg).toContain('M60,486')
  })

  it('steps a long title down so it stays clear of the block', () => {
    const { svg } = build(undefined, 'Supercalifragilistic')
    // 20 characters must be at most 732 wide: 66 is the first size that fits (660).
    expect(svg).toContain('M60,486')
    expect(svg).not.toContain('M60,361.8')
  })

  it('has the ink rule under the title', () => {
    expect(build().svg).toContain(`<rect x="60" y="519" width="96" height="3" fill="${COLORS.ink}"/>`)
  })

  it('with a capture widens the block, frames the capture and leaves the mark out', () => {
    const { svg } = build({ capture: true })
    expect(svg).toContain(`<rect x="648" y="0" width="552" height="630" fill="${COLORS.vermilion}"/>`)
    expect(svg).toContain(`<rect x="702" y="72" width="444" height="486" fill="${COLORS.ink}"/>`)
    expect(svg).not.toContain('<g transform=')
  })

  it('escapes nothing into the markup, because all text is outlines', () => {
    const { svg } = build(undefined, 'A <b> & "c"')
    expect(svg).not.toContain('<b>')
    expect(svg).not.toContain('&')
  })
})

describe('captureBox', () => {
  it('is the area inside the frame, where the capture is placed', () => {
    expect(captureBox()).toEqual({ left: 705, top: 75, width: 438, height: 480 })
  })

  it('agrees with the layout numbers', () => {
    expect(CARD.width - CARD.captureBlockWidth + CARD.frameInsetX + CARD.frameBorder).toBe(705)
  })
})
