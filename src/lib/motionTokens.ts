/** Seconds. The only place durations and eases are defined; import these, never hardcode. */
export const DURATION = { fast: 0.2, base: 0.5, slow: 0.9 } as const

/** GSAP ease names. */
export const EASE = { out: 'power3.out', inOut: 'power2.inOut', wipe: 'expo.out' } as const

/**
 * The mobile menu. The panel wipes in from the right on a long, steady deceleration, the items
 * follow once it is 90% open, and closing is quicker than opening.
 */
export const MENU_MOTION = {
  panelIn: 0.6,
  panelOut: 0.35,
  panelInEase: 'power4.out',
  panelOutEase: 'power2.in',
  /** How far open the panel is when the first item starts. */
  itemsAtProgress: 0.9,
  itemIn: 0.5,
  itemOut: 0.15,
  stagger: 0.06,
  /** Pixels each item starts to the right of where it rests. */
  itemOffset: 48,
  /** Reduced motion: a plain fade. */
  fade: 0.2,
} as const

/** Seconds between items that reveal as a group. */
export const STAGGER = 0.08

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  )
}
