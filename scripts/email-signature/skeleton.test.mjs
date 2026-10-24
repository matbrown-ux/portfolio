import { describe, expect, it } from 'vitest'
import { thin } from './skeleton.mjs'

/** Build a mask from rows of '#' (ink) and '.' (background). */
function fromRows(rows) {
  const height = rows.length
  const width = rows[0].length
  const mask = new Uint8Array(width * height)
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x++) mask[y * width + x] = row[x] === '#' ? 1 : 0
  })
  return { mask, width, height }
}

/** A mask from a predicate on (x, y). */
function build(width, height, ink) {
  const mask = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) mask[y * width + x] = ink(x, y) ? 1 : 0
  }
  return { mask, width, height }
}

function pixels(out, width) {
  const list = []
  out.forEach((v, i) => {
    if (v) list.push([i % width, Math.floor(i / width)])
  })
  return list
}

function neighborCount(out, width, height, x, y) {
  let n = 0
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && ny >= 0 && nx < width && ny < height && out[ny * width + nx]) n++
    }
  }
  return n
}

describe('fromRows', () => {
  it('reads ink as 1', () => {
    expect(Array.from(fromRows(['.#', '#.']).mask)).toEqual([0, 1, 1, 0])
  })
})

describe('thin', () => {
  it('a 5 px thick horizontal bar thins to a single row', () => {
    const { mask, width, height } = build(30, 9, (x, y) => y >= 2 && y <= 6 && x >= 2 && x <= 27)
    const list = pixels(thin(mask, width, height), width)
    expect(list.length).toBeGreaterThanOrEqual(20)
    expect(new Set(list.map(([, y]) => y)).size).toBe(1)
  })

  it('a ring stays one closed loop', () => {
    const { mask, width, height } = build(21, 21, (x, y) => {
      const d = Math.hypot(x - 10, y - 10)
      return d <= 9 && d >= 5
    })
    const out = thin(mask, width, height)
    const list = pixels(out, width)
    expect(list.length).toBeGreaterThan(10)
    for (const [x, y] of list) expect(neighborCount(out, width, height, x, y)).toBe(2)
  })

  it('never adds ink', () => {
    const { mask, width, height } = build(21, 21, (x, y) => (x * 7 + y * 3) % 5 < 3)
    const out = thin(mask, width, height)
    out.forEach((v, i) => {
      if (v) expect(mask[i]).toBe(1)
    })
  })

  it('separate blobs stay separate', () => {
    const { mask, width, height } = build(30, 16, (x, y) => x >= 2 && x <= 27 && ((y >= 1 && y <= 5) || (y >= 10 && y <= 14)))
    const out = thin(mask, width, height)
    const seen = new Set()
    let pieces = 0
    for (const [sx, sy] of pixels(out, width)) {
      if (seen.has(sy * width + sx)) continue
      pieces++
      const stack = [[sx, sy]]
      seen.add(sy * width + sx)
      while (stack.length) {
        const [x, y] = stack.pop()
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
            const k = ny * width + nx
            if (out[k] && !seen.has(k)) {
              seen.add(k)
              stack.push([nx, ny])
            }
          }
        }
      }
    }
    expect(pieces).toBe(2)
  })
})
