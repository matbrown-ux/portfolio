// Turns the ink into a pen time per pixel: when, from 0 to 1, the pen passes through it.
import { thin } from './skeleton.mjs'

/**
 * Walks the pen along the center line, piece by piece from the left, and spreads each
 * center-line time out to the ink around it.
 * `mask` is 1 for ink, row-major. Returns a Float32Array: 0..1 for ink, Infinity for background.
 * `liftPx` is the pen lift between pieces, in steps; pieces under `minPiecePx` are not walked.
 */
export function penTimes(mask, width, height, { liftPx, minPiecePx }) {
  const size = width * height
  const skel = thin(mask, width, height)
  const pieces = skeletonPieces(skel, width, height, minPiecePx)

  const order = new Float64Array(size).fill(-1)
  let step = 0
  for (const piece of pieces) {
    walkPiece(piece, skel, order, width, height, step)
    step += piece.length + liftPx
  }
  // The last step counts the lift after the final piece, which no pixel uses.
  const last = Math.max(step - liftPx - 1, 1)

  const time = new Float32Array(size).fill(Infinity)
  const queue = new Int32Array(size)
  let head = 0
  let tail = 0
  const done = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    if (order[i] >= 0) {
      time[i] = order[i] / last
      done[i] = 1
      queue[tail++] = i
    }
  }
  // First spread over ink only; then any ink left over (specks with no center line)
  // takes the nearest timed pixel across the background too.
  spread(queue, head, tail, time, done, width, height, mask)
  let missing = false
  for (let i = 0; i < size; i++) if (mask[i] && !done[i]) missing = true
  if (missing) {
    tail = 0
    for (let i = 0; i < size; i++) if (done[i]) queue[tail++] = i
    if (tail === 0) {
      for (let i = 0; i < size; i++) if (mask[i]) time[i] = 0
    } else {
      const doneAll = new Uint8Array(done)
      spread(queue, 0, tail, time, doneAll, width, height, null)
    }
  }
  for (let i = 0; i < size; i++) if (!mask[i]) time[i] = Infinity
  return time
}

/** Multi-source BFS: unvisited neighbors (inside `mask` when given) copy the time of the pixel that reached them. */
function spread(queue, head, tail, time, done, width, height, mask) {
  while (head < tail) {
    const i = queue[head++]
    const x = i % width
    const y = (i - x) / width
    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy
      if (ny < 0 || ny >= height) continue
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx
        if (nx < 0 || nx >= width) continue
        const n = ny * width + nx
        if (done[n] || (mask && !mask[n])) continue
        done[n] = 1
        time[n] = time[i]
        queue[tail++] = n
      }
    }
  }
}

/** 8-connected center-line components with at least `minPiecePx` pixels, sorted by smallest x. */
function skeletonPieces(skel, width, height, minPiecePx) {
  const seen = new Uint8Array(skel.length)
  const pieces = []
  const queue = new Int32Array(skel.length)
  for (let s = 0; s < skel.length; s++) {
    if (!skel[s] || seen[s]) continue
    let head = 0
    let tail = 0
    queue[tail++] = s
    seen[s] = 1
    let minX = width
    while (head < tail) {
      const i = queue[head++]
      const x = i % width
      const y = (i - x) / width
      if (x < minX) minX = x
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy
        if (ny < 0 || ny >= height) continue
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          if (nx < 0 || nx >= width) continue
          const n = ny * width + nx
          if (skel[n] && !seen[n]) {
            seen[n] = 1
            queue[tail++] = n
          }
        }
      }
    }
    if (tail >= minPiecePx) {
      const pixels = Int32Array.from(queue.subarray(0, tail))
      pixels.minX = minX
      pieces.push(pixels)
    }
  }
  return pieces.sort((a, b) => a.minX - b.minX)
}

/** Depth-first walk of one piece, writing `order` from `firstStep`; prefers to keep going straight. */
function walkPiece(piece, skel, order, width, height, firstStep) {
  const neighborCount = (i) => {
    const x = i % width
    const y = (i - x) / width
    let n = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && skel[ny * width + nx]) n++
      }
    }
    return n
  }

  // Start at the leftmost (then lowest) end of the piece, or of any pixel if it is a loop.
  let ends = piece.filter((i) => neighborCount(i) === 1)
  if (!ends.length) ends = Array.from(piece)
  let start = ends[0]
  for (const i of ends) {
    const x = i % width
    const y = (i - x) / width
    const sx = start % width
    const sy = (start - sx) / width
    if (x < sx || (x === sx && y > sy)) start = i
  }

  // Stack entries are a pixel plus the direction the pen arrived with.
  const stack = [{ i: start, dx: 0, dy: 1 }]
  let step = firstStep
  while (stack.length) {
    const { i, dx: cdx, dy: cdy } = stack.pop()
    if (order[i] >= 0) continue
    order[i] = step++
    const x = i % width
    const y = (i - x) / width
    const next = []
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const n = ny * width + nx
        if (skel[n] && order[n] < 0) next.push({ i: n, dx, dy, dot: dx * cdx + dy * cdy })
      }
    }
    // Ascending dot, so the straightest neighbor is pushed last and popped first.
    next.sort((a, b) => a.dot - b.dot)
    for (const n of next) stack.push(n)
  }
}
