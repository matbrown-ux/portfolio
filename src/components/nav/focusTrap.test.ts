import { describe, it, expect } from 'vitest'
import { nextFocusIndex } from './focusTrap'

describe('nextFocusIndex', () => {
  it('moves forward and wraps', () => {
    expect(nextFocusIndex(0, 3, false)).toBe(1)
    expect(nextFocusIndex(2, 3, false)).toBe(0)
  })
  it('moves backward and wraps', () => {
    expect(nextFocusIndex(0, 3, true)).toBe(2)
    expect(nextFocusIndex(2, 3, true)).toBe(1)
  })
  it('enters the trap from outside', () => {
    expect(nextFocusIndex(-1, 3, false)).toBe(0)
    expect(nextFocusIndex(-1, 3, true)).toBe(2)
  })
  it('is -1 with nothing focusable', () => {
    expect(nextFocusIndex(0, 0, false)).toBe(-1)
  })
})
