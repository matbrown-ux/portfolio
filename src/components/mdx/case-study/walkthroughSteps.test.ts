import { describe, it, expect } from 'vitest'
import { stepForProgress } from './walkthroughSteps'

describe('stepForProgress', () => {
  it('maps progress to evenly sized steps', () => {
    expect(stepForProgress(0, 3)).toBe(0)
    expect(stepForProgress(0.34, 3)).toBe(1)
    expect(stepForProgress(0.5, 2)).toBe(1)
  })
  it('keeps the last step at the end', () => {
    expect(stepForProgress(0.999, 3)).toBe(2)
    expect(stepForProgress(1, 3)).toBe(2)
  })
  it('clamps out-of-range progress', () => {
    expect(stepForProgress(-0.2, 3)).toBe(0)
    expect(stepForProgress(1.5, 3)).toBe(2)
  })
  it('handles one and zero steps', () => {
    expect(stepForProgress(0.7, 1)).toBe(0)
    expect(stepForProgress(0.7, 0)).toBe(-1)
  })
})
