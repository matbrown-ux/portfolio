const LOWERCASE_B = 0x62

const emptyBox = () => ({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })

function grow(box, b) {
  return {
    minX: Math.min(box.minX, b.minX),
    minY: Math.min(box.minY, b.minY),
    maxX: Math.max(box.maxX, b.maxX),
    maxY: Math.max(box.maxY, b.maxY),
  }
}

/** Whole units keep the brush detail and cut the file size by about a quarter. */
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n))))

// "+ 0" turns a negative zero (from flipping y) into a plain zero.
const roundBox = (box) => ({
  minX: Math.floor(box.minX) + 0,
  minY: Math.floor(box.minY) + 0,
  maxX: Math.ceil(box.maxX) + 0,
  maxY: Math.ceil(box.maxY) + 0,
})

/**
 * Outline a phrase. Alternates sets the layout and kerning; the lowercase b always
 * comes from Regular, and so does any character Alternates lacks.
 */
export function phraseShape(text, { regular, alternates }) {
  const missing = [...new Set([...text])].filter((ch) => {
    const cp = ch.codePointAt(0)
    return !alternates.hasGlyphForCodePoint(cp) && !regular.hasGlyphForCodePoint(cp)
  })
  if (missing.length > 0) throw new Error(`Gloss And Bloom has no glyph for: ${missing.join(' ')}`)

  const run = alternates.layout(text)
  let x = 0
  let d = ''
  let box = emptyBox()

  run.glyphs.forEach((laidOut, i) => {
    const position = run.positions[i]
    const cp = laidOut.codePoints[0]
    const fromRegular = cp === LOWERCASE_B || !alternates.hasGlyphForCodePoint(cp)
    const glyph = fromRegular ? regular.glyphForCodePoint(cp) : laidOut

    // Font coordinates have y pointing up; SVG has y pointing down.
    const path = glyph.path.scale(1, -1).translate(x + position.xOffset, -position.yOffset)
    const b = path.bbox
    if (Number.isFinite(b.minX)) {
      d += path.toSVG()
      box = grow(box, b)
    }

    x += fromRegular ? glyph.advanceWidth : position.xAdvance
  })

  return { d: round(d), box: roundBox(box) }
}

/** Outline one flourish from the Extras font. */
export function strokeShape(key, extras) {
  const cp = key.codePointAt(0)
  if (!extras.hasGlyphForCodePoint(cp)) throw new Error(`Extras has no stroke for key "${key}"`)
  const path = extras.glyphForCodePoint(cp).path.scale(1, -1)
  return { d: round(path.toSVG()), box: roundBox(path.bbox) }
}
