import { describe, expect, it } from 'vitest'
import { giantFit } from './outcomeFit'

describe('giantFit', () => {
  it('sets a figure of one or two characters at full size', () => {
    expect(giantFit('#1')).toBe(1)
    expect(giantFit('9')).toBe(1)
  })

  it('sets a longer figure smaller, so it takes about the width of two characters', () => {
    expect(giantFit('50+')).toBe(0.67)
    expect(giantFit('$10K')).toBe(0.5)
  })

  it('does not count spaces at the ends, and never goes below the floor', () => {
    expect(giantFit(' 50+ ')).toBe(0.67)
    expect(giantFit('1,000,000')).toBe(0.4)
  })
})
