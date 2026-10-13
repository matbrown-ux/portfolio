import { describe, expect, it } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { DURATION, EASE, prefersReducedMotion, REDUCED_MOTION_QUERY, STAGGER } from './motionTokens'

describe('motion tokens', () => {
  it('orders durations from fast to slow, in seconds', () => {
    expect(DURATION.fast).toBeLessThan(DURATION.base)
    expect(DURATION.base).toBeLessThan(DURATION.slow)
    expect(DURATION.slow).toBeLessThanOrEqual(1.2)
  })

  it('names GSAP eases as strings', () => {
    for (const ease of Object.values(EASE)) expect(ease).toMatch(/^[a-z0-9]+\.(out|inOut|in)$/)
  })

  it('keeps the stagger short', () => {
    expect(STAGGER).toBeGreaterThan(0)
    expect(STAGGER).toBeLessThan(DURATION.fast)
  })
})

describe('prefersReducedMotion', () => {
  it('uses the standard media query', () => {
    expect(REDUCED_MOTION_QUERY).toBe(REDUCED_QUERY)
  })

  it('is false when the query does not match', () => {
    expect(prefersReducedMotion()).toBe(false)
  })

  it('is true when the query matches', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    expect(prefersReducedMotion()).toBe(true)
  })
})
