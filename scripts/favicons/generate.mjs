import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { faviconSvg, ICON_SIZES, icoFromPng } from './icons.mjs'

const MARK = 'src/assets/logo/mb-mark.svg'
const OUT = 'public'

// These two patterns repeat markFromSvg in src/lib/cardSvg.ts, which this .mjs script cannot import.
const source = readFileSync(MARK, 'utf8')
const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(source)
const path = /<path[^>]*\sd="([^"]+)"/.exec(source)
if (!viewBox || !path) {
  console.error(`favicons: ${MARK} is not the mark (no viewBox or path)`)
  process.exit(1)
}

const svg = faviconSvg({ d: path[1], width: Number(viewBox[1]), height: Number(viewBox[2]) })
writeFileSync(`${OUT}/favicon.svg`, svg)
console.log(`favicons: wrote ${OUT}/favicon.svg`)

const png = (size) => sharp(Buffer.from(svg), { density: 72 * (size / 64) }).resize(size, size).png().toBuffer()

for (const [name, size] of Object.entries(ICON_SIZES)) {
  writeFileSync(`${OUT}/${name}`, await png(size))
  console.log(`favicons: wrote ${OUT}/${name} (${size} x ${size})`)
}

writeFileSync(`${OUT}/favicon.ico`, icoFromPng(await png(32), 32))
console.log(`favicons: wrote ${OUT}/favicon.ico (32 x 32)`)
