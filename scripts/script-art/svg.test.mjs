import { describe, expect, it } from 'vitest'
import { EDGE_WIDTH, renderSvg } from './svg.mjs'

const shape = { d: 'M0 0L100 0L100 -50Z', box: { minX: 0, minY: -50, maxX: 100, maxY: 0 } }

describe('renderSvg', () => {
  it('writes a filled path sized to the shape', () => {
    expect(renderSvg(shape, { fill: '#f86343' })).toEqual({
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -50 100 50"><path d="M0 0L100 0L100 -50Z" fill="#f86343"/></svg>\n',
      width: 100,
      height: 50,
    })
  })

  it('adds an edge behind the fill and pads the box so it is not clipped', () => {
    const pad = EDGE_WIDTH / 2
    const { svg, width, height } = renderSvg(shape, { fill: '#f86343', edge: '#0c0c0c' })
    expect(svg).toContain(`viewBox="${-pad} ${-50 - pad} ${100 + EDGE_WIDTH} ${50 + EDGE_WIDTH}"`)
    expect(svg).toContain(`stroke="#0c0c0c" stroke-width="${EDGE_WIDTH}" stroke-linejoin="round" paint-order="stroke"`)
    expect(width).toBe(100 + EDGE_WIDTH)
    expect(height).toBe(50 + EDGE_WIDTH)
  })
})
