// Finds the one-pixel center line of the letter shapes, for the pen to follow.

/**
 * Zhang-Suen thinning: peel boundary pixels in two alternating passes until nothing changes.
 * `mask` is 1 for ink, 0 for background, row-major. Pixels outside the image count as background.
 * Returns a new mask where 1 marks a center-line pixel.
 */
export function thin(mask, width, height) {
  // Work in a copy padded by one pixel, so the neighbor reads need no bounds checks.
  const w = width + 2
  const h = height + 2
  const img = new Uint8Array(w * h)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) img[(y + 1) * w + x + 1] = mask[y * width + x] ? 1 : 0
  }

  const doomed = []
  let changed = true
  while (changed) {
    changed = false
    for (let pass = 0; pass < 2; pass++) {
      doomed.length = 0
      for (let y = 1; y <= height; y++) {
        for (let x = 1; x <= width; x++) {
          const i = y * w + x
          if (!img[i]) continue
          // Neighbors clockwise from the one above: p2 .. p9.
          const p2 = img[i - w]
          const p3 = img[i - w + 1]
          const p4 = img[i + 1]
          const p5 = img[i + w + 1]
          const p6 = img[i + w]
          const p7 = img[i + w - 1]
          const p8 = img[i - 1]
          const p9 = img[i - w - 1]
          const n = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
          if (n < 2 || n > 6) continue
          // Background-to-ink steps around the ring.
          const t =
            (!p2 && p3 ? 1 : 0) + (!p3 && p4 ? 1 : 0) + (!p4 && p5 ? 1 : 0) + (!p5 && p6 ? 1 : 0) +
            (!p6 && p7 ? 1 : 0) + (!p7 && p8 ? 1 : 0) + (!p8 && p9 ? 1 : 0) + (!p9 && p2 ? 1 : 0)
          if (t !== 1) continue
          if (pass === 0) {
            if (p2 * p4 * p6 !== 0 || p4 * p6 * p8 !== 0) continue
          } else if (p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0) continue
          doomed.push(i)
        }
      }
      for (const i of doomed) img[i] = 0
      if (doomed.length) changed = true
    }
  }

  trimCorners(img, width, height)

  const out = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) out[y * width + x] = img[(y + 1) * w + x + 1]
  }
  return out
}

// Offsets of the eight neighbors, clockwise from the one above.
const RING = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]

/** True when the points form one group, each touching another by an edge or corner. */
function connected(points) {
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) {
    const a = points[stack.pop()]
    points.forEach((b, j) => {
      if (!seen.has(j) && Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) <= 1) {
        seen.add(j)
        stack.push(j)
      }
    })
  }
  return seen.size === points.length
}

/**
 * Zhang-Suen leaves the odd stair-step corner three pixels thick. Drop a pixel with two or three
 * ink neighbors when two of them sit at a right angle to each other with the gap between them empty
 * and its neighbors stay joined without it, so curves come out one pixel wide.
 */
function trimCorners(img, width, height) {
  const w = width + 2
  for (let y = 1; y <= height; y++) {
    for (let x = 1; x <= width; x++) {
      const i = y * w + x
      if (!img[i]) continue
      const up = img[i - w]
      const upRight = img[i - w + 1]
      const right = img[i + 1]
      const downRight = img[i + w + 1]
      const down = img[i + w]
      const downLeft = img[i + w - 1]
      const left = img[i - 1]
      const upLeft = img[i - w - 1]
      const n = up + upRight + right + downRight + down + downLeft + left + upLeft
      if (n < 2 || n > 3) continue
      const corner =
        (up && right && !upRight) || (right && down && !downRight) ||
        (down && left && !downLeft) || (left && up && !upLeft)
      if (!corner) continue
      // Keep it if removing it would split its neighbors into separate pieces.
      const ring = [up, upRight, right, downRight, down, downLeft, left, upLeft]
      const nbrs = []
      for (let k = 0; k < 8; k++) if (ring[k]) nbrs.push(RING[k])
      if (connected(nbrs)) img[i] = 0
    }
  }
}
