/** The headline figure was drawn for two characters ("#1"); a longer one is scaled to about that width. */
const FULL_SIZE_WIDTH = 2
const SMALLEST = 0.4

/** Rough widths in the display face, in digits: a percent sign is wide, a one or a comma is narrow. */
const WIDE: Record<string, number> = { '%': 1.7, M: 1.4, W: 1.4 }
const NARROW = new Set(['1', '-', '.', ',', ':', "'", ' '])

const width = (value: string) => [...value].reduce((total, char) => total + (WIDE[char] ?? (NARROW.has(char) ? 0.6 : 1)), 0)

/** The scale for the Outcome block's giant figure, from 1 down to the floor, by how wide the figure runs. */
export function giantFit(value: string): number {
  const units = width(value.trim())
  if (units <= FULL_SIZE_WIDTH) return 1
  return Math.max(SMALLEST, Math.round((FULL_SIZE_WIDTH / units) * 100) / 100)
}
