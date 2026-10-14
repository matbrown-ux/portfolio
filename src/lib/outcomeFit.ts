/** The headline figure was drawn for two characters ("#1"); a longer one is scaled to about that width. */
const FULL_SIZE_CHARS = 2
const SMALLEST = 0.4

/** The scale for the Outcome block's giant figure, from 1 down to the floor, by how long the figure is. */
export function giantFit(value: string): number {
  const length = value.trim().length
  if (length <= FULL_SIZE_CHARS) return 1
  return Math.max(SMALLEST, Math.round((FULL_SIZE_CHARS / length) * 100) / 100)
}
