import { describe, expect, it } from 'vitest'
import { penTimes } from './penTimes.mjs'

/** Builds a mask with filled rectangles [x, y, w, h]. */
function maskOf(width, height, rects) {
  const mask = new Uint8Array(width * height)
  for (const [x0, y0, w, h] of rects) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) mask[y * width + x] = 1
  }
  return mask
}

const opts = { liftPx: 10, minPiecePx: 5 }

describe('penTimes', () => {
  it('writes a bar left to right', () => {
    const t = penTimes(maskOf(40, 7, [[0, 0, 40, 7]]), 40, 7, opts)
    expect(t[3 * 40 + 5]).toBeLessThan(t[3 * 40 + 20])
    expect(t[3 * 40 + 20]).toBeLessThan(t[3 * 40 + 35])
  })

  it('writes pieces left to right with a lift', () => {
    const w = 100
    const mask = maskOf(w, 7, [[0, 0, 40, 7], [60, 0, 40, 7]])
    const t = penTimes(mask, w, 7, opts)
    let leftMax = -Infinity
    let rightMin = Infinity
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < w; x++) {
        if (!mask[y * w + x]) continue
        if (x < 50) leftMax = Math.max(leftMax, t[y * w + x])
        else rightMin = Math.min(rightMin, t[y * w + x])
      }
    }
    expect(leftMax).toBeLessThan(rightMin)
  })

  it('gives Infinity to background and 0..1 to ink', () => {
    const w = 100
    const mask = maskOf(w, 7, [[0, 0, 40, 7], [60, 0, 40, 7]])
    const t = penTimes(mask, w, 7, opts)
    let min = Infinity
    let max = -Infinity
    for (let i = 0; i < mask.length; i++) {
      if (mask[i]) {
        expect(t[i]).toBeGreaterThanOrEqual(0)
        expect(t[i]).toBeLessThanOrEqual(1)
        min = Math.min(min, t[i])
        max = Math.max(max, t[i])
      } else {
        expect(t[i]).toBe(Infinity)
      }
    }
    expect(min).toBe(0)
    expect(max).toBe(1)
  })

  it("gives specks smaller than minPiecePx their neighbors' time", () => {
    const w = 40
    const t = penTimes(maskOf(w, 9, [[0, 3, 40, 3], [20, 2, 1, 1]]), w, 9, opts)
    const speck = t[2 * w + 20]
    expect(Number.isFinite(speck)).toBe(true)
    expect(Math.abs(speck - t[3 * w + 20])).toBeLessThan(0.1)
  })

  it('gives isolated specks with no center line a time', () => {
    const w = 60
    const mask = maskOf(w, 9, [[0, 3, 40, 3], [45, 3, 2, 2]])
    const t = penTimes(mask, w, 9, opts)
    for (let y = 3; y < 5; y++) {
      for (let x = 45; x < 47; x++) {
        expect(Number.isFinite(t[y * w + x])).toBe(true)
        expect(t[y * w + x]).toBeGreaterThanOrEqual(0)
        expect(t[y * w + x]).toBeLessThanOrEqual(1)
      }
    }
  })
})
