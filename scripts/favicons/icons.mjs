const TILE = 64
/** The mark's share of the tile's width. Tuned so "MB" still reads at 16 pixels. */
const MARK_SHARE = 0.92
const VERMILION = '#f86343'
const INK = '#0c0c0c'

const n = (value) => String(Math.round(value * 100) / 100)

/** The favicon: the ink MB mark on a vermilion square. */
export function faviconSvg(mark) {
  const width = TILE * MARK_SHARE
  const scale = width / mark.width
  const x = (TILE - width) / 2
  const y = (TILE - mark.height * scale) / 2
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}">` +
    `<rect width="${TILE}" height="${TILE}" fill="${VERMILION}"/>` +
    `<path transform="translate(${n(x)} ${n(y)}) scale(${Math.round(scale * 10000) / 10000})" d="${mark.d}" fill="${INK}" fill-rule="evenodd"/>` +
    '</svg>\n'
  )
}

/** The PNG icons to write beside the SVG, by file name. */
export const ICON_SIZES = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 }

/** Wrap one PNG in an ICO container, for browsers that only ask for /favicon.ico. */
export function icoFromPng(png, size) {
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  header.writeUInt8(size >= 256 ? 0 : size, 6)
  header.writeUInt8(size >= 256 ? 0 : size, 7)
  header.writeUInt8(0, 8)
  header.writeUInt8(0, 9)
  header.writeUInt16LE(1, 10)
  header.writeUInt16LE(32, 12)
  header.writeUInt32LE(png.length, 14)
  header.writeUInt32LE(22, 18)
  return Buffer.concat([header, png])
}
