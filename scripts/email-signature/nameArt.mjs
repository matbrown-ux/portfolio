// The name as art: its outline as a supersampled mask, and 2x 1-bit frames from pen times.
import sharp from 'sharp'

export const NAME = { text: 'Mat Brown', inkHeight2x: 173, pad2x: 20, ss: 4 }

/**
 * Rasterizes a `phraseShape` result ({ d, box }) at `ss` times the 2x size.
 * The ink box is `inkHeight2x * ss` tall, with `pad2x * ss` of padding on every side.
 * Returns { mask, width, height }: mask is 1 where coverage is at least 50%, row-major.
 */
export async function nameMask({ d, box }) {
  const { inkHeight2x, pad2x, ss } = NAME
  const boxW = box.maxX - box.minX
  const boxH = box.maxY - box.minY
  const scale = (inkHeight2x * ss) / boxH
  const pad = pad2x * ss
  const width = Math.ceil((boxW * scale + 2 * pad) / ss) * ss
  const height = Math.ceil((inkHeight2x * ss + 2 * pad) / ss) * ss
  // The viewBox spans the padded canvas in font units.
  const vx = box.minX - pad / scale
  const vy = box.minY - pad / scale
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="${vx} ${vy} ${width / scale} ${height / scale}">` +
    `<rect x="${vx}" y="${vy}" width="${width / scale}" height="${height / scale}" fill="#000"/>` +
    `<path d="${d}" fill="#fff"/></svg>`
  const raw = await sharp(Buffer.from(svg)).flatten({ background: '#000' }).greyscale().raw().toBuffer()
  const mask = new Uint8Array(width * height)
  for (let i = 0; i < mask.length; i++) mask[i] = raw[i] >= 128 ? 1 : 0
  return { mask, width, height }
}

/**
 * Downsamples pen times by `ss` into a 1-bit frame. An output pixel is 1 when at least
 * half of its ss * ss source pixels are ink with a time at or before `progress`.
 */
export function nameFrame(times, width, height, ss, progress) {
  const w = width / ss
  const h = height / ss
  const bits = new Uint8Array(w * h)
  const need = (ss * ss) / 2
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let count = 0
      for (let dy = 0; dy < ss; dy++) {
        const row = (y * ss + dy) * width + x * ss
        for (let dx = 0; dx < ss; dx++) if (times[row + dx] <= progress) count++
      }
      bits[y * w + x] = count >= need ? 1 : 0
    }
  }
  return { bits, width: w, height: h }
}
