import { describe, it, expect } from 'vitest'
import { ICONS, iconLength, iconSvg, iconFrame } from './iconArt.mjs'

const sum = (a) => a.reduce((s, v) => s + v, 0)
const polylines = (svg) => svg.match(/<polyline[^>]*>/g) ?? []

describe('ICONS', () => {
  it('both icons stay inside the grid', () => {
    for (const name of ['linkedin', 'github']) {
      for (const stroke of ICONS[name]) {
        expect(stroke.length).toBeGreaterThanOrEqual(2)
        for (const [x, y] of stroke) {
          expect(x).toBeGreaterThanOrEqual(1)
          expect(x).toBeLessThanOrEqual(23)
          expect(y).toBeGreaterThanOrEqual(1)
          expect(y).toBeLessThanOrEqual(23)
        }
      }
    }
  })
})

describe('iconLength', () => {
  it('sums the segment lengths of every stroke', () => {
    expect(iconLength([[[0, 0], [3, 4]], [[1, 1], [1, 3], [4, 3]]])).toBe(10)
  })
})

describe('iconSvg and iconFrame', () => {
  it('progress 0 draws nothing', async () => {
    expect(iconSvg(ICONS.linkedin, 0)).not.toContain('<polyline')
    const frame = await iconFrame(ICONS.linkedin, 0)
    expect(frame.width).toBe(48)
    expect(frame.height).toBe(48)
    expect(sum(frame.bits)).toBe(0)
  })

  it('strokes draw in order', () => {
    const strokes = [[[2, 4], [12, 4]], [[2, 10], [12, 10]]]
    const lines = polylines(iconSvg(strokes, 0.5))
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('points="2,4 12,4"')
    expect(lines[0]).toContain('stroke-dashoffset="0"')
  })

  it('a partly drawn stroke shows only its drawn length', () => {
    const lines = polylines(iconSvg([[[2, 4], [12, 4]]], 0.3))
    expect(lines[0]).toContain('stroke-dasharray="10 10"')
    expect(lines[0]).toContain('stroke-dashoffset="7"')
  })

  it('progress 1 draws every stroke', async () => {
    for (const name of ['linkedin', 'github']) {
      const svg = iconSvg(ICONS[name], 1)
      expect(svg).toContain('viewBox="0 0 24 24"')
      expect(polylines(svg)).toHaveLength(ICONS[name].length)
      const frame = await iconFrame(ICONS[name], 1)
      expect(sum(frame.bits)).toBeGreaterThan(0)
    }
  })
})
