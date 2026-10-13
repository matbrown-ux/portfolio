import { gsap } from './gsap'
import { DURATION, EASE, prefersReducedMotion } from './motionTokens'

export type RevealKind = 'rise' | 'wipe' | 'fade'

const KINDS: readonly RevealKind[] = ['rise', 'wipe', 'fade']

export interface RevealConfig {
  kind: RevealKind
  /** Seconds. */
  delay: number
  onLoad: boolean
}

export function parseReveal(el: HTMLElement): RevealConfig | null {
  const kind = el.dataset.reveal as RevealKind | undefined
  if (!kind || !KINDS.includes(kind)) return null
  const delay = Number(el.dataset.revealDelay)
  return {
    kind,
    delay: Number.isFinite(delay) && delay > 0 ? delay : 0,
    onLoad: el.dataset.revealOn === 'load',
  }
}

/** Pixels a rise starts below its resting position. */
const RISE_DISTANCE = 32

export function revealTween(kind: RevealKind): { from: gsap.TweenVars; to: gsap.TweenVars } {
  if (kind === 'wipe') {
    return { from: { clipPath: 'inset(0% 100% 0% 0%)' }, to: { clipPath: 'inset(0% 0% 0% 0%)' } }
  }
  if (kind === 'rise') return { from: { autoAlpha: 0, y: RISE_DISTANCE }, to: { autoAlpha: 1, y: 0 } }
  return { from: { autoAlpha: 0 }, to: { autoAlpha: 1 } }
}

/**
 * ScrollTrigger start for a scroll reveal: the top of the element reaching 85% of the viewport.
 * ScrollTrigger measures the element where it is drawn, and a rise is drawn below its resting
 * position, so its start is moved back up by the same distance. Otherwise content resting just
 * above the line reads as below it and stays hidden until the reader scrolls.
 */
export function revealStart(kind: RevealKind): string {
  return kind === 'rise' ? `top-=${RISE_DISTANCE} 85%` : 'top 85%'
}

/** Set on <html> once load reveals no longer need the stylesheet to hold them hidden. */
const READY_CLASS = 'reveals-ready'

function markRevealsReady(): void {
  document.documentElement.classList.add(READY_CLASS)
}

/**
 * Animate every [data-reveal] element under `root`. Elements stay fully visible
 * unless this runs and motion is allowed, so nothing is hidden without JavaScript.
 * The stylesheet holds load reveals hidden until this marks the document ready,
 * which it does only after their start states are applied, so they never flash.
 * Returns a cleanup function.
 */
export function initReveals(root: ParentNode = document): () => void {
  if (prefersReducedMotion()) {
    markRevealsReady()
    return () => {}
  }

  // Tweens created inside the context are reverted together, so cleanup restores each
  // element's inline styles as well as stopping its tween and scroll trigger.
  const ctx = gsap.context(() => {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const config = parseReveal(el)
      if (!config) return
      const { from, to } = revealTween(config.kind)
      gsap.fromTo(el, from, {
        ...to,
        duration: DURATION.slow,
        ease: config.kind === 'wipe' ? EASE.wipe : EASE.out,
        delay: config.delay,
        force3D: false,
        // GSAP otherwise writes the start state on its next tick, so a load reveal would show
        // for a frame once the stylesheet's hold is released.
        lazy: false,
        clearProps: config.kind === 'wipe' ? 'clipPath' : 'transform',
        scrollTrigger: config.onLoad ? undefined : { trigger: el, start: revealStart(config.kind), once: true },
      })
    })
  }, root)

  markRevealsReady()

  // Cleanup leaves the ready class in place: removing it would let the stylesheet
  // hide the load reveals that revert() has just restored.
  return () => ctx.revert()
}
