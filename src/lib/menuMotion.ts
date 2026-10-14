import { gsap } from './gsap'
import { EASE, MENU_MOTION, prefersReducedMotion } from './motionTokens'

export { MENU_MOTION }

const HIDDEN = 'inset(0% 0% 0% 100%)'
const SHOWN = 'inset(0% 0% 0% 0%)'

/**
 * Seconds into the open when the first item starts: the moment the panel has covered
 * `itemsAtProgress` of its travel. The panel eases with power4.out, which is 1 - (1 - t)^5,
 * so that moment is 1 - (1 - p)^(1/5) of its duration.
 */
export function itemsStart(): number {
  return MENU_MOTION.panelIn * (1 - (1 - MENU_MOTION.itemsAtProgress) ** (1 / 5))
}

/**
 * Open the mobile menu: the ink panel wipes in from the right edge, and once it is nearly open
 * the items slide in from the right, one after another. A wipe reveals the panel in place, so
 * the ink surface itself never moves. Under reduced motion the panel and items fade instead.
 */
export function openMenu(panel: HTMLElement, items: HTMLElement[]): gsap.core.Timeline {
  const timeline = gsap.timeline()
  if (prefersReducedMotion()) {
    timeline.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: MENU_MOTION.fade, ease: EASE.out, immediateRender: true, lazy: false })
    return timeline
  }
  timeline.fromTo(
    panel,
    { clipPath: HIDDEN },
    { clipPath: SHOWN, duration: MENU_MOTION.panelIn, ease: MENU_MOTION.panelInEase, immediateRender: true, lazy: false },
  )
  timeline.fromTo(
    items,
    { opacity: 0, x: MENU_MOTION.itemOffset },
    {
      opacity: 1,
      x: 0,
      duration: MENU_MOTION.itemIn,
      ease: EASE.out,
      stagger: MENU_MOTION.stagger,
      force3D: false,
      immediateRender: true,
      lazy: false,
      clearProps: 'transform',
    },
    itemsStart(),
  )
  return timeline
}

/** Close the mobile menu: the items fade out together, then the panel wipes back off to the right. */
export function closeMenu(panel: HTMLElement, items: HTMLElement[], onComplete: () => void): gsap.core.Timeline {
  const timeline = gsap.timeline({ onComplete })
  if (prefersReducedMotion()) {
    timeline.to(panel, { opacity: 0, duration: MENU_MOTION.fade, ease: EASE.out })
    return timeline
  }
  gsap.killTweensOf([panel, ...items])
  timeline.to(items, { opacity: 0, duration: MENU_MOTION.itemOut, ease: EASE.out })
  timeline.to(panel, { clipPath: HIDDEN, duration: MENU_MOTION.panelOut, ease: MENU_MOTION.panelOutEase }, MENU_MOTION.itemOut * 0.5)
  return timeline
}
