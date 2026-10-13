import { gsap } from './gsap'
import { DURATION, EASE, prefersReducedMotion, STAGGER } from './motionTokens'

export type RevealKind = 'rise' | 'wipe' | 'fade'

const KINDS: readonly RevealKind[] = ['rise', 'wipe', 'fade']

export interface RevealConfig {
  kind: RevealKind
  /** Seconds: data-reveal-delay plus one STAGGER per step of data-reveal-index. */
  delay: number
  onLoad: boolean
}

/** A position in a staggered group. Anything but a non-negative integer counts as 0. */
function staggerIndex(value: string | undefined): number {
  return value !== undefined && /^\d+$/.test(value) ? Number(value) : 0
}

export function parseReveal(el: HTMLElement): RevealConfig | null {
  const kind = el.dataset.reveal as RevealKind | undefined
  if (!kind || !KINDS.includes(kind)) return null
  const delay = Number(el.dataset.revealDelay)
  return {
    kind,
    delay: (Number.isFinite(delay) && delay > 0 ? delay : 0) + staggerIndex(el.dataset.revealIndex) * STAGGER,
    onLoad: el.dataset.revealOn === 'load',
  }
}

/** Pixels a rise starts below its resting position. */
const RISE_DISTANCE = 32

export function revealTween(kind: RevealKind): { from: gsap.TweenVars; to: gsap.TweenVars } {
  if (kind === 'wipe') {
    return { from: { clipPath: 'inset(0% 100% 0% 0%)' }, to: { clipPath: 'inset(0% 0% 0% 0%)' } }
  }
  // Opacity, not autoAlpha: autoAlpha also writes visibility: hidden, which would take an
  // unrevealed element out of the tab order and the accessibility tree until its trigger fires.
  // A transparent element stays focusable, and focusing it scrolls it into view, which fires it.
  // force3D belongs to the rise alone, the only kind that moves. It is a transform option: given
  // one, GSAP folds the element's own rotate, translate and scale into an inline transform and
  // leaves it there, which a wipe on a rotated piece of script art has no reason to do.
  if (kind === 'rise') return { from: { opacity: 0, y: RISE_DISTANCE }, to: { opacity: 1, y: 0, force3D: false } }
  return { from: { opacity: 0 }, to: { opacity: 1 } }
}

/**
 * Inline properties to remove once a reveal has played: exactly the ones its kind animates.
 * Opacity is cleared too, so a finished reveal leaves nothing inline that would override the
 * stylesheet (an opacity utility, a hover state or the print reset).
 */
export function revealClearProps(kind: RevealKind): string {
  if (kind === 'wipe') return 'clipPath'
  return kind === 'rise' ? 'opacity,transform' : 'opacity'
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

/** Set on <html> once reveals no longer need the stylesheet to hold them hidden. */
const READY_CLASS = 'reveals-ready'

function markRevealsReady(): void {
  document.documentElement.classList.add(READY_CLASS)
}

/**
 * Animate every [data-reveal] element under `root`. Elements stay fully visible
 * unless this runs and motion is allowed, so nothing is hidden without JavaScript.
 * The stylesheet holds every reveal hidden until this marks the document ready,
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
  const tweens = new Map<HTMLElement, gsap.core.Tween>()
  const ctx = gsap.context(() => {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const config = parseReveal(el)
      if (!config) return
      const { from, to } = revealTween(config.kind)
      const tween = gsap.fromTo(el, from, {
        ...to,
        duration: DURATION.slow,
        ease: config.kind === 'wipe' ? EASE.wipe : EASE.out,
        delay: config.delay,
        // GSAP otherwise writes the start state on its next tick, so a reveal would show
        // for a frame once the stylesheet's hold is released.
        lazy: false,
        clearProps: revealClearProps(config.kind),
        scrollTrigger: config.onLoad ? undefined : { trigger: el, start: revealStart(config.kind), once: true },
      })
      tweens.set(el, tween)
    })
  }, root)

  // Focus can land on a transparent element that is fully on screen but below its trigger line;
  // the browser does not scroll it, so the trigger never fires. Complete the reveal of the target
  // and of every revealed ancestor. The trigger is killed first, keeping the tween alive
  // (allowAnimation), so it cannot replay and progress(1) completes a live tween and its clearProps.
  const completeOnFocus = (event: Event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    let el = target.closest<HTMLElement>('[data-reveal]')
    while (el) {
      const tween = tweens.get(el)
      if (tween) {
        tweens.delete(el)
        tween.scrollTrigger?.kill(false, true)
        tween.progress(1)
      }
      el = el.parentElement?.closest<HTMLElement>('[data-reveal]') ?? null
    }
  }
  root.addEventListener('focusin', completeOnFocus)

  markRevealsReady()

  // Cleanup leaves the ready class in place: removing it would let the stylesheet
  // hide the reveals that revert() has just restored.
  return () => {
    root.removeEventListener('focusin', completeOnFocus)
    ctx.revert()
  }
}
