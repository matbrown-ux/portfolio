/** The part of a font glyph's outline this module uses. A fontkit path satisfies it. */
export interface GlyphPath {
  scale(x: number, y: number): GlyphPath
  translate(x: number, y: number): GlyphPath
  toSVG(): string
}

/** The part of a font this module uses. A fontkit font satisfies it. */
export interface CardFont {
  unitsPerEm: number
  layout(text: string): {
    glyphs: { path: GlyphPath }[]
    positions: { xAdvance: number; xOffset: number; yOffset: number }[]
  }
}

/** The width of a string set at `size` pixels, with `tracking` ems added after every character. */
export function textWidth(font: CardFont, text: string, size: number, tracking = 0): number {
  const { positions } = font.layout(text)
  const advance = positions.reduce((sum, position) => sum + position.xAdvance, 0)
  return (advance * size) / font.unitsPerEm + tracking * size * positions.length
}

/**
 * Break a title into lines no wider than `maxWidth`, between words only. A word wider than the line
 * stays whole. A line never ends on a lone "&" when more words follow: the "&" starts the next line,
 * which may then be wider than `maxWidth` (`fitTitle` treats that size as not fitting).
 */
export function wrapTitle(font: CardFont, text: string, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && textWidth(font, next, size) > maxWidth) {
      if (line.endsWith(' &')) {
        lines.push(line.slice(0, -2))
        line = `& ${word}`
      } else {
        lines.push(line)
        line = word
      }
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

export interface TitleFit {
  size: number
  lines: string[]
}

/** No title is set smaller than this, in pixels. */
export const MIN_TITLE_SIZE = 24

/** Each step below the smallest listed size multiplies it by this. */
export const TITLE_STEP = 0.9

function fits(font: CardFont, lines: string[], size: number, space: { maxWidth: number; maxLines: number }): boolean {
  return lines.length <= space.maxLines && lines.every((line) => textWidth(font, line, size) <= space.maxWidth)
}

/**
 * The largest of `sizes` (given largest first) at which the title wraps into at most `maxLines`
 * lines, each no wider than `maxWidth`. When none fits, it steps down from the smallest size by
 * `TITLE_STEP` (one decimal) until it fits, stopping at `MIN_TITLE_SIZE`: the result is then the
 * last size tried at or above the floor, with every word kept.
 */
export function fitTitle(font: CardFont, text: string, space: { maxWidth: number; maxLines: number; sizes: readonly number[] }): TitleFit {
  for (const size of space.sizes) {
    const lines = wrapTitle(font, text, size, space.maxWidth)
    if (fits(font, lines, size, space)) return { size, lines }
  }
  let size = space.sizes[space.sizes.length - 1]
  let lines = wrapTitle(font, text, size, space.maxWidth)
  for (;;) {
    const next = Math.round(size * TITLE_STEP * 10) / 10
    if (next < MIN_TITLE_SIZE) break
    size = next
    lines = wrapTitle(font, text, size, space.maxWidth)
    if (fits(font, lines, size, space)) break
  }
  return { size, lines }
}

/** The outline of a string as SVG path data, its first glyph's origin at (`x`, `baseline`). */
export function textPath(font: CardFont, text: string, size: number, x: number, baseline: number, tracking = 0): string {
  const run = font.layout(text)
  const scale = size / font.unitsPerEm
  let pen = x
  let d = ''
  run.glyphs.forEach((glyph, i) => {
    const position = run.positions[i]
    // Font coordinates have y pointing up; SVG has y pointing down.
    d += glyph.path
      .scale(scale, -scale)
      .translate(pen + position.xOffset * scale, baseline - position.yOffset * scale)
      .toSVG()
    pen += position.xAdvance * scale + tracking * size
  })
  return d
}
