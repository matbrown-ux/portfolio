import { fitTitle, textPath, type CardFont } from './cardText'

/** The share card's layout, in pixels of a 1200 by 630 card. */
export const CARD = {
  width: 1200,
  height: 630,
  margin: 60,
  /** Clear space between the title and the block. */
  gap: 48,
  blockWidth: 360,
  captureBlockWidth: 552,
  titleSizes: [138, 124, 110, 98, 86, 76, 66, 58, 50],
  maxLines: 3,
  lineHeight: 0.9,
  /** The last title baseline sits this far above the bottom edge. */
  titleBottom: 144,
  labelSize: 19,
  tracking: 0.08,
  ruleWidth: 96,
  ruleHeight: 3,
  ruleBottom: 108,
  markWidth: 312,
  /** How far the mark runs past the card's right and bottom edges. */
  markRight: 16,
  markBottom: 22,
  frameInsetX: 54,
  frameInsetY: 72,
  frameBorder: 3,
} as const

/** The palette. Kept here because the card is drawn outside CSS, where the theme tokens do not reach. */
export const COLORS = { ivory: '#f4f0e6', ink: '#0c0c0c', vermilion: '#f86343' } as const

export interface Mark {
  d: string
  width: number
  height: number
}

/** Read the MB mark's outline and size from its SVG file. */
export function markFromSvg(source: string): Mark {
  const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(source)
  if (!viewBox) throw new Error('The mark SVG has no viewBox')
  const path = /<path[^>]*\sd="([^"]+)"/.exec(source)
  if (!path) throw new Error('The mark SVG has no path')
  return { d: path[1], width: Number(viewBox[1]), height: Number(viewBox[2]) }
}

/** The area inside the frame on a card with a capture: where the capture image is placed. */
export function captureBox(): { left: number; top: number; width: number; height: number } {
  const left = CARD.width - CARD.captureBlockWidth + CARD.frameInsetX + CARD.frameBorder
  const top = CARD.frameInsetY + CARD.frameBorder
  return {
    left,
    top,
    width: CARD.captureBlockWidth - 2 * (CARD.frameInsetX + CARD.frameBorder),
    height: CARD.height - 2 * (CARD.frameInsetY + CARD.frameBorder),
  }
}

export interface CardText {
  label: string
  title: string
  address: string
}

/** Two decimals at most, so the markup is stable and small. */
const n = (value: number) => String(Math.round(value * 100) / 100)

/**
 * The share card as an SVG. All text is outlines, so nothing depends on the fonts installed where
 * it is rasterised. With `capture`, the block widens to hold a framed capture (placed by the
 * renderer inside `captureBox`) and the mark is left out.
 */
export function cardSvg(text: CardText, fonts: { display: CardFont; mono: CardFont }, mark: Mark, options: { capture?: boolean } = {}): string {
  const capture = options.capture === true
  const blockWidth = capture ? CARD.captureBlockWidth : CARD.blockWidth
  const blockX = CARD.width - blockWidth
  const fit = fitTitle(fonts.display, text.title.toUpperCase(), {
    maxWidth: blockX - CARD.margin - CARD.gap,
    maxLines: CARD.maxLines,
    sizes: CARD.titleSizes,
  })
  const lastBaseline = CARD.height - CARD.titleBottom
  const titlePaths = fit.lines
    .map((line, i) => textPath(fonts.display, line, fit.size, CARD.margin, lastBaseline - (fit.lines.length - 1 - i) * fit.size * CARD.lineHeight))
    .join('')
  const labelPath = textPath(fonts.mono, text.label.toUpperCase(), CARD.labelSize, CARD.margin, CARD.margin + CARD.labelSize, CARD.tracking)
  const addressPath = textPath(fonts.mono, text.address.toUpperCase(), CARD.labelSize, CARD.margin, CARD.height - CARD.margin, CARD.tracking)

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${CARD.height}" viewBox="0 0 ${CARD.width} ${CARD.height}">`,
    `<rect width="${CARD.width}" height="${CARD.height}" fill="${COLORS.ivory}"/>`,
    `<rect x="${blockX}" y="0" width="${blockWidth}" height="${CARD.height}" fill="${COLORS.vermilion}"/>`,
  ]

  if (capture) {
    // The frame is an ink rectangle; the renderer lays the capture over its inside.
    const frameX = blockX + CARD.frameInsetX
    parts.push(
      `<rect x="${frameX}" y="${CARD.frameInsetY}" width="${blockWidth - 2 * CARD.frameInsetX}" height="${CARD.height - 2 * CARD.frameInsetY}" fill="${COLORS.ink}"/>`,
    )
  } else {
    const scale = CARD.markWidth / mark.width
    const x = CARD.width + CARD.markRight - CARD.markWidth
    const y = CARD.height + CARD.markBottom - mark.height * scale
    parts.push(`<g transform="translate(${n(x)} ${n(y)}) scale(${Math.round(scale * 10000) / 10000})">`, `<path d="${mark.d}" fill="${COLORS.ink}" fill-rule="evenodd"/>`, '</g>')
  }

  parts.push(
    `<path d="${labelPath}" fill="${COLORS.ink}"/>`,
    `<path d="${titlePaths}" fill="${COLORS.ink}"/>`,
    `<rect x="${CARD.margin}" y="${CARD.height - CARD.ruleBottom - CARD.ruleHeight}" width="${CARD.ruleWidth}" height="${CARD.ruleHeight}" fill="${COLORS.ink}"/>`,
    `<path d="${addressPath}" fill="${COLORS.ink}"/>`,
    '</svg>',
  )
  return parts.join('')
}
