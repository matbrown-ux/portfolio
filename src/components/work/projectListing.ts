export type ShowcaseMode = 'stack' | 'cards'

export interface Point {
  x: number
  y: number
}

export interface Size {
  w: number
  h: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/** "01 / 03" style position label for a project in a listing. */
export function projectNumber(index: number, total: number): string {
  return `${pad(index + 1)} / ${pad(total)}`
}

/** Sticky stacking only on desktop with motion allowed; cards otherwise. */
export function showcaseMode(desktop: boolean, reduced: boolean): ShowcaseMode {
  return desktop && !reduced ? 'stack' : 'cards'
}

/**
 * Top-left position for a floating preview card near the pointer: offset down
 * and right, flipped to the other side when it would overflow the right or
 * bottom edge, then clamped so it stays fully on-screen.
 */
export function previewPosition(pointer: Point, size: Size, viewport: Size, offset = 24): Point {
  let x = pointer.x + offset
  let y = pointer.y + offset
  if (x + size.w > viewport.w) x = pointer.x - offset - size.w
  if (y + size.h > viewport.h) y = pointer.y - offset - size.h
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), Math.max(0, max))
  return { x: clamp(x, viewport.w - size.w), y: clamp(y, viewport.h - size.h) }
}

/** Element ids for a listing link's aria-labelledby (title + result). */
export function projectIds(prefix: string, slug: string): { titleId: string; resultId: string } {
  return { titleId: `${prefix}-${slug}-title`, resultId: `${prefix}-${slug}-result` }
}

/** "03 case studies" / "01 case study". */
export function caseStudyCountLabel(count: number): string {
  return `${pad(count)} case ${count === 1 ? 'study' : 'studies'}`
}
