import { describe, expect, it } from 'vitest'
import { ARROW_VIEWBOX, arrowPath } from './arrowIcon'

describe('arrowPath', () => {
  it('draws each direction as a shaft and a square-cornered head in a 16 unit box', () => {
    expect(ARROW_VIEWBOX).toBe('0 0 16 16')
    expect(arrowPath('up-right')).toBe('M3 13 13 3M5 3h8v8')
    expect(arrowPath('right')).toBe('M2 8h12M9 3l5 5-5 5')
    expect(arrowPath('down')).toBe('M8 2v12M3 9l5 5 5-5')
    expect(arrowPath('up')).toBe('M8 14V2M3 7l5-5 5 5')
    expect(arrowPath('left-right')).toBe('M1 8h14M5 4 1 8l4 4M11 4l4 4-4 4')
  })

  it('points up and to the right when no direction is given', () => {
    expect(arrowPath()).toBe(arrowPath('up-right'))
  })
})
