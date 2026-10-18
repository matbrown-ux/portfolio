import { describe, it, expect } from 'vitest'
import { NAME, nameMask, nameFrame } from './nameArt.mjs'

const square = { d: 'M0 0H100V100H0Z', box: { minX: 0, minY: 0, maxX: 100, maxY: 100 } }

describe('nameMask', () => {
  it('rasterizes to the 2x size times ss', async () => {
    const { mask, width, height } = await nameMask(square)
    expect(height).toBe((NAME.inkHeight2x + 2 * NAME.pad2x) * NAME.ss)
    expect(width % NAME.ss).toBe(0)
    expect(mask.length).toBe(width * height)
    expect(mask.some((v) => v === 1)).toBe(true)
  })
})

describe('nameFrame', () => {
  const ss = 4
  const width = 8
  const height = 8
  const mask = new Uint8Array(width * height)
  const times = new Float32Array(width * height).fill(Infinity)
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (x >= 2) {
        mask[y * width + x] = 1
        times[y * width + x] = x / 8
      }
    }
  }
  const sum = (a) => a.reduce((s, v) => s + v, 0)

  it('progress 0 is empty and progress 1 is the whole shape', () => {
    expect(sum(nameFrame(times, width, height, ss, 0).bits)).toBe(0)
    const full = nameFrame(times, width, height, ss, 1)
    expect(full.width).toBe(2)
    expect(full.height).toBe(2)
    expect([...full.bits]).toEqual([1, 1, 1, 1])
  })

  it('progress only ever adds pixels', () => {
    const a = nameFrame(times, width, height, ss, 0.4).bits
    const b = nameFrame(times, width, height, ss, 0.6).bits
    a.forEach((v, i) => {
      if (v) expect(b[i]).toBe(1)
    })
  })
})
