import { describe, it, expect } from 'vitest'
import { remainingDelay } from './entrance'

describe('remainingDelay', () => {
  it('waits the full delay when triggered at mount', () => {
    expect(remainingDelay(1.2, 1000, 1000)).toBeCloseTo(1.2)
  })

  it('waits only what is left of the delay', () => {
    expect(remainingDelay(1.2, 1000, 1500)).toBeCloseTo(0.7)
  })

  it('never goes negative once the curtain has cleared', () => {
    expect(remainingDelay(1.2, 1000, 9000)).toBe(0)
  })

  it('is zero on a direct load', () => {
    expect(remainingDelay(0, 1000, 1000)).toBe(0)
  })
})
