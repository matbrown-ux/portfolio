import { afterAll, expect, it } from 'vitest'
import { gsap, ScrollTrigger } from './gsap'

// ScrollTrigger and the GSAP ticker keep timers alive after a file's tests finish.
afterAll(() => {
  ScrollTrigger.killAll()
  ScrollTrigger.disable()
  gsap.ticker.sleep()
})

it('exports gsap with ScrollTrigger registered', () => {
  expect(typeof gsap.to).toBe('function')
  expect(typeof ScrollTrigger.create).toBe('function')
  expect(ScrollTrigger.version).toBe(gsap.version)
})
