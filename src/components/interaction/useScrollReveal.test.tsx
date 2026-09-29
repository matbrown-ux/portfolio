import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ScrollTrigger } from '../../lib/gsap'
import { RevealText } from './RevealText'
import { installMatchMedia } from '../../test/matchMedia'

describe('useScrollReveal', () => {
  beforeEach(() => {
    // Park the element below the fold so its `once` trigger stays armed
    // (jsdom reports every rect at 0, which would fire and kill it at once).
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 5000, top: 5000, bottom: 5100, left: 0, right: 100, width: 100, height: 100, toJSON: () => ({}),
    })
  })

  afterEach(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill())
    vi.restoreAllMocks()
  })

  it('does not accumulate ScrollTriggers when its dependencies change', () => {
    installMatchMedia({ '(prefers-reduced-motion: no-preference)': true })
    const { rerender } = render(<RevealText text="First heading" />)
    const fresh = ScrollTrigger.getAll().length
    expect(fresh).toBe(1)
    rerender(<RevealText text="Second heading" />)
    rerender(<RevealText text="Third heading" />)
    expect(ScrollTrigger.getAll().length).toBe(fresh)
  })
})
