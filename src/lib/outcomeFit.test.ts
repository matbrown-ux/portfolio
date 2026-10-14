import { describe, expect, it } from 'vitest'
import { giantFit } from './outcomeFit'

describe('giantFit', () => {
  it('sets a figure of one or two characters at full size', () => {
    expect(giantFit('#1')).toBe(1)
    expect(giantFit('9')).toBe(1)
  })

  it('sets a longer figure smaller, so it takes about the width of two characters', () => {
    expect(giantFit('50+')).toBe(0.67)
    expect(giantFit('$10K')).toBe(0.56)
  })

  it('allows for wide and narrow characters: a percent sign takes more room than a digit, a one takes less', () => {
    expect(giantFit('20%')).toBe(0.54)
    expect(giantFit('20%')).toBeLessThan(giantFit('50+'))
    expect(giantFit('10')).toBe(1)
    expect(giantFit('111')).toBe(1)
  })

  it('does not count spaces at the ends, and never goes below the floor', () => {
    expect(giantFit(' 50+ ')).toBe(0.67)
    expect(giantFit('8,000,000,000')).toBe(0.4)
  })
})
