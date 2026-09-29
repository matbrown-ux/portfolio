import { gsap } from '../../../lib/gsap'
import { useScrollReveal } from '../../interaction/useScrollReveal'

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
 * Shared scaffolding for the animated work covers: plays the bespoke timeline
 * once on scroll-in, after the page curtain has lifted. Reduced-motion users
 * see the full static cover. Returns the wrapper ref to attach.
 */
export function useCoverReveal(build: CoverBuild) {
  return useScrollReveal<HTMLDivElement>(
    (el) => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', force3D: false } })
      build(tl, el)
      return tl
    },
    { start: 'top 80%' }
  )
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
