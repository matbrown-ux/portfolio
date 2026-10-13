import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as fontkit from 'fontkit'
import sharp from 'sharp'
import { captureBox, cardSvg, markFromSvg, type Mark } from './cardSvg'
import type { CardFont } from './cardText'
import type { ShareCard } from './shareCards'

// Paths are from the project root, which is where astro build and vitest both run.
const ANTON = 'node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2'
const MONO = 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2'
const MARK = 'src/assets/logo/mb-mark.svg'

let loaded: { fonts: { display: CardFont; mono: CardFont }; mark: Mark } | undefined

/** The fonts and the mark, opened once for the whole build. */
function assets() {
  loaded ??= {
    fonts: {
      display: fontkit.openSync(join(process.cwd(), ANTON)) as CardFont,
      mono: fontkit.openSync(join(process.cwd(), MONO)) as CardFont,
    },
    mark: markFromSvg(readFileSync(join(process.cwd(), MARK), 'utf8')),
  }
  return loaded
}

/** Rasterise a page's share card to a 1200 by 630 PNG. A capture is cropped to fill the frame. */
export async function renderCard(card: ShareCard): Promise<Buffer> {
  const { fonts, mark } = assets()
  const svg = Buffer.from(cardSvg(card, fonts, mark, { capture: card.capture !== undefined }))
  if (card.capture === undefined) return sharp(svg).png().toBuffer()

  const box = captureBox()
  const capture = await sharp(join(process.cwd(), card.capture)).resize(box.width, box.height, { fit: 'cover' }).toBuffer()
  return sharp(svg)
    .composite([{ input: capture, left: box.left, top: box.top }])
    .png()
    .toBuffer()
}
