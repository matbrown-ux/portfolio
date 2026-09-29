import { describe, it, expect } from 'vitest'
import { nextIndex, clampShift, nearestIndex, indexAtShift } from './galleryNav'

describe('nextIndex', () => {
  it('moves with arrows and clamps at the ends', () => {
    expect(nextIndex(0, 'ArrowRight', 3)).toBe(1)
    expect(nextIndex(2, 'ArrowRight', 3)).toBe(2)
    expect(nextIndex(0, 'ArrowLeft', 3)).toBe(0)
  })
  it('jumps with Home/End and ignores other keys', () => {
    expect(nextIndex(1, 'Home', 3)).toBe(0)
    expect(nextIndex(1, 'End', 3)).toBe(2)
    expect(nextIndex(1, 'a', 3)).toBe(1)
  })
  it('is -1 when empty', () => {
    expect(nextIndex(0, 'ArrowRight', 0)).toBe(-1)
  })
})

describe('clampShift', () => {
  it('never scrolls past the last item', () => {
    expect(clampShift(0, 3000, 1000)).toBe(0)
    expect(clampShift(900, 3000, 1000)).toBe(900)
    expect(clampShift(2500, 3000, 1000)).toBe(2000)
    expect(clampShift(500, 800, 1000)).toBe(0)
  })
})

describe('nearestIndex', () => {
  it('finds the item closest to the shift', () => {
    expect(nearestIndex([0, 800, 1600], 700)).toBe(1)
    expect(nearestIndex([0, 800, 1600], 100)).toBe(0)
    expect(nearestIndex([], 100)).toBe(0)
  })
})

describe('indexAtShift', () => {
  const offsets = [0, 800, 1600, 2400]
  it('reaches the last item when dragged to the max shift', () => {
    expect(indexAtShift(offsets, 3000, 1000, 2000)).toBe(3)
  })
  it('finds the nearest item for mid shifts', () => {
    expect(indexAtShift(offsets, 3000, 1000, 700)).toBe(1)
  })
  it('is 0 for an empty list', () => {
    expect(indexAtShift([], 3000, 1000, 500)).toBe(0)
  })
  it('resolves ties at the max shift to the last tied item', () => {
    expect(indexAtShift(offsets, 2000, 1000, 1000)).toBe(3)
  })
})
