// The site's arrows are drawn, never typed: the fonts carry Latin letters only, so a typed arrow
// falls back to the phone's emoji font. Arrow.astro and the mobile menu draw these paths.
export type ArrowDirection = 'up-right' | 'right' | 'down' | 'up' | 'left-right'

export const ARROW_VIEWBOX = '0 0 16 16'

const PATHS: Record<ArrowDirection, string> = {
  'up-right': 'M3 13 13 3M5 3h8v8',
  right: 'M2 8h12M9 3l5 5-5 5',
  down: 'M8 2v12M3 9l5 5 5-5',
  up: 'M8 14V2M3 7l5-5 5 5',
  'left-right': 'M1 8h14M5 4 1 8l4 4M11 4l4 4-4 4',
}

export function arrowPath(direction: ArrowDirection = 'up-right'): string {
  return PATHS[direction]
}
