import { describe, expect, it } from 'vitest'
import { nextFocusIndex } from './focusTrap'

describe('nextFocusIndex', () => {
  it('moves forward and wraps to the start', () => {
    expect(nextFocusIndex(0, 3, false)).toBe(1)
    expect(nextFocusIndex(2, 3, false)).toBe(0)
  })

  it('moves backward and wraps to the end', () => {
    expect(nextFocusIndex(1, 3, true)).toBe(0)
    expect(nextFocusIndex(0, 3, true)).toBe(2)
  })

  it('enters the trap from outside at the nearest end', () => {
    expect(nextFocusIndex(-1, 3, false)).toBe(0)
    expect(nextFocusIndex(-1, 3, true)).toBe(2)
  })

  it('returns -1 when there is nothing to focus', () => {
    expect(nextFocusIndex(0, 0, false)).toBe(-1)
  })
})
