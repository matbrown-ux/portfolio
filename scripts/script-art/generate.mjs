import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as fontkit from 'fontkit'
import { FONT_FILES, missingFonts, parseArtList } from './artList.mjs'
import { phraseShape, strokeShape } from './shape.mjs'
import { renderSvg } from './svg.mjs'

const FONT_DIR = '.fonts'
const LIST = 'src/assets/script/phrases.json'
const MANIFEST = 'src/assets/script/art.json'
const OUT_DIR = 'public/script'

const missing = missingFonts(FONT_DIR, existsSync)
if (missing.length > 0) {
  console.error(
    `script-art: missing font files in ${FONT_DIR}/:\n` +
      missing.map((file) => `  - ${file}`).join('\n') +
      '\nCopy the purchased Gloss And Bloom files there. The folder is git-ignored and must never be committed.',
  )
  process.exit(1)
}

const fonts = {
  regular: fontkit.openSync(`${FONT_DIR}/${FONT_FILES.regular}`),
  alternates: fontkit.openSync(`${FONT_DIR}/${FONT_FILES.alternates}`),
  extras: fontkit.openSync(`${FONT_DIR}/${FONT_FILES.extras}`),
}

const items = parseArtList(JSON.parse(readFileSync(LIST, 'utf8')))
mkdirSync(OUT_DIR, { recursive: true })

const manifest = {}
for (const item of items) {
  const shape = item.text !== undefined ? phraseShape(item.text, fonts) : strokeShape(item.stroke, fonts.extras)
  const { svg, width, height } = renderSvg(shape, item)
  writeFileSync(`${OUT_DIR}/${item.name}.svg`, svg)
  manifest[item.name] = { src: `/script/${item.name}.svg`, width, height }
  console.log(`script-art: wrote ${OUT_DIR}/${item.name}.svg (${width} x ${height})`)
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
