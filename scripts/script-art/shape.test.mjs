import { describe, expect, it } from 'vitest'
import { phraseShape, strokeShape } from './shape.mjs'

// A path double: one square per glyph, 100 units wide, sitting on the baseline (font y is up).
class FakePath {
  constructor(points) {
    this.points = points
  }
  scale(sx, sy) {
    return new FakePath(this.points.map(([x, y]) => [x * sx, y * sy]))
  }
  translate(dx, dy) {
    return new FakePath(this.points.map(([x, y]) => [x + dx, y + dy]))
  }
  get bbox() {
    const xs = this.points.map(([x]) => x)
    const ys = this.points.map(([, y]) => y)
    return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }
  }
  toSVG() {
    return this.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x + 0.4} ${y}`).join('') + 'Z'
  }
}

const EMPTY = new FakePath([])

/** A font double that knows `chars`. Every glyph is a square tagged with the font's label. */
function fakeFont(label, chars) {
  const glyph = (cp) => ({
    codePoints: [cp],
    label,
    advanceWidth: 100,
    path: cp === 32 ? EMPTY : new FakePath([[0, 0], [100, 0], [100, 100], [0, 100]]),
  })
  return {
    label,
    hasGlyphForCodePoint: (cp) => chars.includes(String.fromCodePoint(cp)),
    glyphForCodePoint: glyph,
    layout: (text) => {
      const glyphs = [...text].map((ch) => glyph(ch.codePointAt(0)))
      return { glyphs, positions: glyphs.map(() => ({ xAdvance: 110, xOffset: 0, yOffset: 0 })) }
    },
  }
}

const fonts = { regular: fakeFont('regular', 'ab09 '), alternates: fakeFont('alternates', 'abc ') }

describe('phraseShape', () => {
  it('lays glyphs out left to right using the layout advances, flipped so y points down', () => {
    const shape = phraseShape('ac', fonts)
    expect(shape.box).toEqual({ minX: 0, minY: -100, maxX: 210, maxY: 0 })
    expect(shape.d.match(/M/g)).toHaveLength(2)
  })

  it('rounds coordinates to whole units', () => {
    expect(phraseShape('a', fonts).d).not.toMatch(/\./)
  })

  it('skips spaces but keeps their advance', () => {
    const shape = phraseShape('a c', fonts)
    expect(shape.d.match(/M/g)).toHaveLength(2)
    expect(shape.box.maxX).toBe(320)
  })

  it('takes the lowercase b from Regular and uses its advance', () => {
    const calls = []
    const regular = { ...fonts.regular, glyphForCodePoint: (cp) => (calls.push(cp), { ...fonts.regular.glyphForCodePoint(cp), advanceWidth: 150 }) }
    const shape = phraseShape('ba', { regular, alternates: fonts.alternates })
    expect(calls).toEqual([0x62])
    expect(shape.box.maxX).toBe(250)
  })

  it('falls back to Regular for a character Alternates lacks', () => {
    const calls = []
    const regular = { ...fonts.regular, glyphForCodePoint: (cp) => (calls.push(cp), fonts.regular.glyphForCodePoint(cp)) }
    phraseShape('a09', { regular, alternates: fonts.alternates })
    expect(calls).toEqual([0x30, 0x39])
  })

  it('names the characters neither cut has', () => {
    expect(() => phraseShape('a✓z', fonts)).toThrow('Gloss And Bloom has no glyph for: ✓ z')
  })
})

describe('strokeShape', () => {
  it('returns the flipped glyph outline for a stroke key', () => {
    const extras = fakeFont('extras', 'e')
    expect(strokeShape('e', extras).box).toEqual({ minX: 0, minY: -100, maxX: 100, maxY: 0 })
  })

  it('rejects a key the Extras font does not have', () => {
    expect(() => strokeShape('z', fakeFont('extras', 'e'))).toThrow('Extras has no stroke for key "z"')
  })
})
