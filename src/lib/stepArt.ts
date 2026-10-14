import { gsap } from './gsap'
import { DURATION, EASE, prefersReducedMotion } from './motionTokens'

export type CueKind = 'draw' | 'pop' | 'fade' | 'slide'

const KINDS: readonly CueKind[] = ['draw', 'pop', 'fade', 'slide']

/** Seconds the finished drawing holds before the loop starts again. */
const HOLD = 2.4
/** Pixels a slide starts to the left of where it rests. */
const SLIDE_DISTANCE = 28

export interface Cue {
  kind: CueKind
  /** Seconds into the loop. */
  at: number
}

/** The cue an element declares with `data-art` and `data-art-at`, or null if it has none. */
export function parseCue(el: Element): Cue | null {
  const kind = el.getAttribute('data-art') as CueKind | null
  if (!kind || !KINDS.includes(kind)) return null
  const at = Number(el.getAttribute('data-art-at'))
  return { kind, at: Number.isFinite(at) && at > 0 ? at : 0 }
}

/**
 * How each kind of cue moves. A drawn line needs `pathLength="1"` and a dash array of 1 in the
 * markup, so its offset runs from 1 (nothing) to 0 (all of it) whatever its real length.
 */
export function cueTween(kind: CueKind): { from: gsap.TweenVars; to: gsap.TweenVars } {
  if (kind === 'draw') return { from: { strokeDashoffset: 1 }, to: { strokeDashoffset: 0, duration: DURATION.base, ease: EASE.inOut } }
  if (kind === 'pop') {
    return { from: { scale: 0, transformOrigin: '50% 50%' }, to: { scale: 1, transformOrigin: '50% 50%', duration: DURATION.base, ease: 'back.out(2.2)' } }
  }
  if (kind === 'slide') return { from: { opacity: 0, x: -SLIDE_DISTANCE }, to: { opacity: 1, x: 0, duration: DURATION.base, ease: EASE.out } }
  return { from: { opacity: 0 }, to: { opacity: 1, duration: DURATION.base, ease: EASE.out } }
}

/**
 * Animate every `[data-step-art]` drawing: each part plays at its cue, the finished drawing
 * holds, and the loop starts again. A drawing only runs while it is on screen. The markup is the
 * finished drawing, so under reduced motion, or with no script at all, that is what shows.
 * Returns a cleanup function.
 */
export function initStepArt(root: ParentNode = document): () => void {
  if (prefersReducedMotion()) return () => {}

  const timelines = new Map<Element, gsap.core.Timeline>()
  const ctx = gsap.context(() => {
    for (const art of root.querySelectorAll('[data-step-art]')) {
      const timeline = gsap.timeline({ paused: true, repeat: -1, repeatDelay: HOLD })
      for (const el of art.querySelectorAll('[data-art]')) {
        const cue = parseCue(el)
        if (!cue) continue
        const { from, to } = cueTween(cue.kind)
        // Rendered at once, so every part waits at its start instead of flashing in finished.
        timeline.fromTo(el, from, { ...to, immediateRender: true, lazy: false }, cue.at)
      }
      timelines.set(art, timeline)
    }
  })

  let observer: IntersectionObserver | undefined
  if (typeof IntersectionObserver === 'function') {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const timeline = timelines.get(entry.target)
        if (!timeline) continue
        if (entry.isIntersecting) timeline.play()
        else timeline.pause()
      }
    })
    for (const art of timelines.keys()) observer.observe(art)
  } else {
    for (const timeline of timelines.values()) timeline.play()
  }

  return () => {
    observer?.disconnect()
    ctx.revert()
    timelines.clear()
  }
}
