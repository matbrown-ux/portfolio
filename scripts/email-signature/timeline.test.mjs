import { describe, it, expect } from 'vitest'
import { CYCLE_CS, STEP_CS, SEGMENTS, ease, frameSchedule, progressAt } from './timeline.mjs'

describe('timeline', () => {
  it('opens on the finished signature', () => {
    expect(progressAt(0)).toEqual({ name: 1, linkedin: 1, github: 1 })
  })
  it('erases icons before the name, github first', () => {
    expect(progressAt(3.75)).toMatchObject({ name: 1, linkedin: 1 })
    expect(progressAt(3.75).github).toBeGreaterThan(0)
    expect(progressAt(3.75).github).toBeLessThan(1)
    expect(progressAt(4.1)).toMatchObject({ name: 1, github: 0 })
  })
  it('is blank during the gap', () => {
    expect(progressAt(5.7)).toEqual({ name: 0, linkedin: 0, github: 0 })
  })
  it('writes the name, then linkedin, then github', () => {
    expect(progressAt(7.2).name).toBeCloseTo(0.5)
    expect(progressAt(8.6)).toMatchObject({ name: 1, github: 0 })
    expect(progressAt(9.39).github).toBeGreaterThan(0.99)
  })
  it('schedules 2 cs frames that sum to one cycle', () => {
    const s = frameSchedule()
    expect(s.every((f) => f.delayCs === STEP_CS)).toBe(true)
    expect(s.reduce((n, f) => n + f.delayCs, 0)).toBe(CYCLE_CS)
    expect(s[0].t).toBe(0)
    expect(s).toHaveLength(470)
  })
  it('eases symmetrically', () => {
    expect(ease(0)).toBe(0)
    expect(ease(1)).toBe(1)
    expect(ease(0.5)).toBe(0.5)
  })
  it('keeps the segment lengths adding up to one cycle', () => {
    const total = Object.values(SEGMENTS).reduce((n, s) => n + s, 0)
    expect(Math.round(total * 100)).toBe(CYCLE_CS)
  })
})
