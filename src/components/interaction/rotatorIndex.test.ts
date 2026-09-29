import { describe, it, expect } from 'vitest'
import { nextRotatorIndex } from './rotatorIndex'

describe('nextRotatorIndex', () => {
  it('advances and wraps', () => {
    expect(nextRotatorIndex(0, 5)).toBe(1)
    expect(nextRotatorIndex(4, 5)).toBe(0)
  })
  it('stays at 0 for one or zero lines', () => {
    expect(nextRotatorIndex(0, 1)).toBe(0)
    expect(nextRotatorIndex(3, 0)).toBe(0)
  })
})
