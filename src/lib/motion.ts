/**
 * Motion tokens: the single source for eases, durations, and springs.
 * Motion (framer) takes the bezier tuples and springs; GSAP takes the
 * GSAP_EASE strings. Eases and durations are mirrored as CSS variables in
 * globals.css (a test enforces parity).
 */
export type BezierTuple = [number, number, number, number]

export const EASE: { outQuint: BezierTuple; inOut: BezierTuple } = {
  outQuint: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
}

export const GSAP_EASE = {
  out: 'expo.out',
  inOut: 'power2.inOut',
  reveal: 'power4.out',
} as const

/** Seconds. */
export const DURATION = {
  fast: 0.2,
  base: 0.5,
  slow: 0.9,
  reveal: 1.1,
} as const

export const SPRING = {
  cursor: { stiffness: 500, damping: 40, mass: 0.4 },
  magnetic: { stiffness: 180, damping: 14, mass: 0.3 },
  preview: { stiffness: 220, damping: 30, mass: 0.6 },
} as const

export function toCssBezier(e: readonly number[]): string {
  return `cubic-bezier(${e.join(', ')})`
}
