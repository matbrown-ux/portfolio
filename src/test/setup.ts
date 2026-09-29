import '@testing-library/jest-dom'
import { afterAll, beforeEach } from 'vitest'
import { installMatchMedia } from './matchMedia'

// jsdom has no IntersectionObserver; Motion's whileInView/useInView need one.
class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
if (!('IntersectionObserver' in window)) {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub,
  })
}

// Default: no media query matches (coarse pointer, mobile width, and
// "no-preference" false, so GSAP matchMedia animations stay off and every
// component renders its static final state). Tests opt in per case.
beforeEach(() => installMatchMedia({}))

// GSAP's ScrollTrigger registers at import time (src/lib/gsap.ts) and calls
// matchMedia then, which is before any beforeEach runs. Install the default
// stub at module load too.
installMatchMedia({})

// ScrollTrigger and the GSAP ticker keep timers alive after a file's tests
// finish; one firing after jsdom teardown throws "requestAnimationFrame is not
// defined". Stop them once per test file. Imported lazily so ScrollTrigger
// registers after the matchMedia stub above, and only runs after every test.
afterAll(async () => {
  const { gsap, ScrollTrigger } = await import('../lib/gsap')
  ScrollTrigger.killAll()
  gsap.ticker.sleep()
})
