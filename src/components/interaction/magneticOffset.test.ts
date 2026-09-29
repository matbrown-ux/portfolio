import { describe, it, expect } from 'vitest'
import { magneticOffset } from './magneticOffset'

const box = { left: 100, top: 100, width: 200, height: 50 } // center (200, 125)

describe('magneticOffset', () => {
  it('is zero at the center', () => {
    expect(magneticOffset({ x: 200, y: 125 }, box)).toEqual({ x: 0, y: 0 })
  })

  it('pulls toward the pointer by strength', () => {
    expect(magneticOffset({ x: 220, y: 135 }, box, 0.5)).toEqual({ x: 10, y: 5 })
  })

  it('clamps to max', () => {
    expect(magneticOffset({ x: 300, y: 25 }, box, 0.5, 12)).toEqual({ x: 12, y: -12 })
  })

  it('does nothing at zero strength', () => {
    expect(magneticOffset({ x: 300, y: 150 }, box, 0)).toEqual({ x: 0, y: 0 })
  })
})
