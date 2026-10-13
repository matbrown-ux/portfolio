/** Seconds. The only place durations and eases are defined; import these, never hardcode. */
export const DURATION = { fast: 0.2, base: 0.5, slow: 0.9 } as const

/** GSAP ease names. */
export const EASE = { out: 'power3.out', inOut: 'power2.inOut', wipe: 'expo.out' } as const

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
