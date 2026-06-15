import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../../lib/gsap'

/**
 * Build callback: populate the (paused) timeline with the cover's bespoke
 * choreography. `root` is the wrapper element, so you can querySelector the
 * SVG nodes you need to measure (e.g. getTotalLength for stroke-draw).
 *
 * Use `tl.from(...)` for entrance states: on a paused timeline those render
 * their start (hidden) values immediately via immediateRender, and useGSAP runs
 * in a layout effect, so the hidden state is in place before first paint (no
 * flash). Reduced-motion users never enter this branch, so they see the full
 * static cover.
 */
export type CoverBuild = (tl: gsap.core.Timeline, root: HTMLElement) => void

/**
 * Shared scaffolding for the animated work covers: a scroll-in reveal that
 * plays the timeline once when the cover enters the viewport, reduced-motion
 * gating, and SSR-safety via useGSAP. Returns the wrapper ref to attach.
 */
export function useCoverReveal(build: CoverBuild) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out', force3D: false },
        })
        build(tl, el)

        // Reveal when scrolled into view. play() on an already-finished timeline
        // is a no-op, so re-entering the viewport will not replay it.
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          onEnter: () => tl.play(),
        })

        return () => st.kill()
      })
    },
    { scope: root }
  )

  return root
}

/**
 * Helper: animate an SVG geometry element (path/polyline/line) as a stroke that
 * draws itself on. Sets the dash array to the element's length and tweens the
 * offset to zero. Avoids needing the DrawSVG plugin.
 */
export function drawStroke(
  tl: gsap.core.Timeline,
  el: SVGGeometryElement | null,
  position: number | string,
  duration = 0.9
) {
  if (!el) return
  const len = el.getTotalLength()
  gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
  tl.to(el, { strokeDashoffset: 0, duration, ease: 'power2.inOut' }, position)
}
