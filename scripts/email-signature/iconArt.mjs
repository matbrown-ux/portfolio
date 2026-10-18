// The two link icons as pen strokes on a 24 grid, drawn up to a progress and rasterized at 48 px.
import sharp from 'sharp'

/** Each icon is a list of strokes in drawing order; each stroke is a list of [x, y] points. */
export const ICONS = {
  linkedin: [
    // The square frame, closed back at its start.
    [[2, 2], [22, 2], [22, 22], [2, 22], [2, 2]],
    // The "i": stem, then its dot.
    [[7, 10.5], [7, 18]],
    [[7, 6.5], [7, 7]],
    // The "n": stem up, a chamfered shoulder, then down.
    [[11, 18], [11, 10.5], [11, 12], [13, 10.5], [16, 10.5], [17.5, 12], [17.5, 18]],
  ],
  github: [
    // The head, from the left ear tip: across the brow, round the right ear, down and back up the left.
    [
      [9, 3], [11, 3.8], [12.3, 5.2], [15.7, 5.2], [17, 3.8], [19, 3], [19.6, 5], [19.4, 7.2],
      [20.2, 8.8], [20.5, 10.5], [20.2, 12], [19.2, 13.3], [17.5, 14], [10.5, 14], [8.8, 13.3],
      [7.8, 12], [7.5, 10.5], [7.8, 8.8], [8.6, 7.2], [8.4, 5], [9, 3],
    ],
    // The legs, as one arch under the head.
    [[11, 21], [11, 18.5], [12, 17.5], [16, 17.5], [17, 18.5], [17, 21]],
    // The tail, curling up off the left leg.
    [[10, 19.5], [7.8, 19.5], [6.5, 18.8], [5.6, 17.5], [4.8, 16], [3.8, 15], [2.5, 14.6]],
  ],
}

const segLength = ([ax, ay], [bx, by]) => Math.hypot(bx - ax, by - ay)

const strokeLength = (stroke) => {
  let length = 0
  for (let i = 1; i < stroke.length; i++) length += segLength(stroke[i - 1], stroke[i])
  return length
}

/** Sum of every segment length across the strokes. */
export function iconLength(strokes) {
  return strokes.reduce((total, stroke) => total + strokeLength(stroke), 0)
}

const num = (v) => String(Math.round(v * 1000) / 1000)

/**
 * A 48 x 48 SVG of the strokes, white on black, with the first `progress * iconLength`
 * units drawn in stroke order. A stroke with nothing drawn yet is left out.
 */
export function iconSvg(strokes, progress) {
  let budget = Math.max(0, Math.min(1, progress)) * iconLength(strokes)
  const lines = []
  for (const stroke of strokes) {
    const length = strokeLength(stroke)
    const drawn = Math.min(length, budget)
    budget -= drawn
    if (drawn <= 0) break
    const points = stroke.map(([x, y]) => `${num(x)},${num(y)}`).join(' ')
    lines.push(
      `<polyline points="${points}" stroke-dasharray="${num(length)} ${num(length)}" ` +
        `stroke-dashoffset="${num(length - drawn)}"/>`,
    )
  }
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">' +
    '<rect width="24" height="24" fill="#000"/>' +
    '<g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">' +
    lines.join('') +
    '</g></svg>'
  )
}

/** Rasterizes `iconSvg` to a 48 x 48 frame: 1 where coverage is at least 50%, row-major. */
export async function iconFrame(strokes, progress) {
  const svg = iconSvg(strokes, progress)
  const raw = await sharp(Buffer.from(svg)).flatten({ background: '#000' }).greyscale().raw().toBuffer()
  const bits = new Uint8Array(48 * 48)
  for (let i = 0; i < bits.length; i++) bits[i] = raw[i] >= 128 ? 1 : 0
  return { bits, width: 48, height: 48 }
}
