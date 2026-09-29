import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useEntranceDelay } from '../PageCurtain'
import { remainingDelay } from '../../lib/entrance'

interface ScrollRevealOptions {
  start?: string
  deps?: unknown[]
}

/**
 * Plays a GSAP animation once when the element scrolls into view, and never
 * while the page curtain still covers it. `build` should create the animation
 * with from()/fromTo() so its hidden start state renders before first paint.
 * Reduced-motion users never run `build`, so they see the final state.
 */
export function useScrollReveal<T extends HTMLElement>(
  build: (el: T) => gsap.core.Animation | void,
  { start = 'top 85%', deps = [] }: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null)
  const entranceDelay = useEntranceDelay()

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mountedAt = performance.now()
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const anim = build(el)
        if (!anim) return
        anim.pause(0)
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => {
            const wait = remainingDelay(entranceDelay, mountedAt, performance.now())
            if (wait > 0) gsap.delayedCall(wait, () => anim.play())
            else anim.play()
          },
        })
      })
    },
    { scope: ref, dependencies: [entranceDelay, start, ...deps] }
  )

  return ref
}
