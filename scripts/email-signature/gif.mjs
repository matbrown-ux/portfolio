// Two-color looping GIF from 1-bit frames. A delta frame can only add pixels, since
// index 0 is transparent, so any frame followed by an erase is disposed with 2
// (clear its rect) and the next frame redraws the full truth over that rect.
import { GifWriter } from 'omggif'

/**
 * Encodes frames of 1-bit bits (row-major, width * height) into a GIF that loops
 * forever. Index 0 is transparent and index 1 is `color` ('#rrggbb').
 * @param {{ bits: Uint8Array, delayCs: number }[]} frames
 * @returns {Buffer}
 */
export function encodeGif(frames, width, height, color) {
  const merged = mergeRepeats(frames)
  const plan = planFrames(merged, width, height)
  const palette = [0x000000, parseInt(color.replace('#', ''), 16)]

  const bytes = plan.reduce((n, { rect }) => n + rect.w * rect.h * 2 + 64, 1024)
  const buf = new Uint8Array(bytes)
  const writer = new GifWriter(buf, width, height, { loop: 0, palette })
  plan.forEach(({ rect, disposal }, k) => {
    const indexed = crop(merged[k].bits, width, rect)
    writer.addFrame(rect.x, rect.y, rect.w, rect.h, indexed, {
      delay: merged[k].delayCs,
      disposal,
      transparent: 0,
    })
  })
  return Buffer.from(buf.subarray(0, writer.end()))
}

/** Joins runs of identical frames into one, summing their delays. */
function mergeRepeats(frames) {
  const merged = []
  for (const { bits, delayCs } of frames) {
    const last = merged[merged.length - 1]
    if (last && sameBits(last.bits, bits)) last.delayCs += delayCs
    else merged.push({ bits, delayCs })
  }
  return merged
}

/**
 * Picks each frame's rect and disposal. Frame 0 is full size. A later frame covers
 * every changed pixel plus the rect the previous frame cleared. A frame whose
 * successor (frame 0 after the last, for the loop) turns ink off is disposed with 2,
 * with its rect widened over those pixels.
 */
function planFrames(frames, width, height) {
  const plan = []
  for (let k = 0; k < frames.length; k++) {
    let rect
    if (k === 0) rect = { x: 0, y: 0, w: width, h: height }
    else {
      const prev = plan[k - 1]
      rect = bbox(frames[k - 1].bits, frames[k].bits, width, (a, b) => a !== b)
      if (prev.disposal === 2) rect = union(rect, prev.rect)
    }
    const next = frames[(k + 1) % frames.length].bits
    const erased = bbox(frames[k].bits, next, width, (a, b) => a && !b)
    const disposal = erased ? 2 : 1
    plan.push({ rect: erased ? union(rect, erased) : rect, disposal })
  }
  return plan
}

/** Bounding box of the pixels where `test(a[i], b[i])` holds, or null if none. */
function bbox(a, b, width, test) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1
  for (let i = 0; i < a.length; i++) {
    if (!test(a[i], b[i])) continue
    const x = i % width
    const y = (i - x) / width
    if (x < x0) x0 = x
    if (x > x1) x1 = x
    if (y < y0) y0 = y
    if (y > y1) y1 = y
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

/** Smallest rect holding both; either may be null. */
function union(a, b) {
  if (!a) return b
  if (!b) return a
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  const w = Math.max(a.x + a.w, b.x + b.w) - x
  const h = Math.max(a.y + a.h, b.y + b.h) - y
  return { x, y, w, h }
}

/** The bits inside rect, as palette indexes (0 transparent, 1 ink). */
function crop(bits, width, { x, y, w, h }) {
  const out = new Uint8Array(w * h)
  for (let row = 0; row < h; row++) {
    out.set(bits.subarray((y + row) * width + x, (y + row) * width + x + w), row * w)
  }
  return out
}

function sameBits(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}
