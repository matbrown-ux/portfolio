import { describe, it, expect } from 'vitest'
import { stepPosition, positionFromPointer } from './sliderPosition'

describe('stepPosition', () => {
  it('steps with arrows and clamps', () => {
    expect(stepPosition(50, 'ArrowRight')).toBe(55)
    expect(stepPosition(50, 'ArrowLeft')).toBe(45)
    expect(stepPosition(98, 'ArrowRight')).toBe(100)
    expect(stepPosition(2, 'ArrowLeft')).toBe(0)
  })
  it('jumps with Home/End and ignores other keys', () => {
    expect(stepPosition(50, 'Home')).toBe(0)
    expect(stepPosition(50, 'End')).toBe(100)
    expect(stepPosition(50, 'x')).toBe(50)
  })
})

describe('positionFromPointer', () => {
  it('maps pointer x to a clamped percentage', () => {
    expect(positionFromPointer(150, { left: 100, width: 200 })).toBe(25)
    expect(positionFromPointer(0, { left: 100, width: 200 })).toBe(0)
    expect(positionFromPointer(999, { left: 100, width: 200 })).toBe(100)
  })
  it('handles a zero-width box', () => {
    expect(positionFromPointer(150, { left: 100, width: 0 })).toBe(50)
  })
})
