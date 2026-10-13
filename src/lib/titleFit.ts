export interface TitleSpace {
  /** Characters of display type that fit on one line at full size. */
  charsPerLine: number
  /** Lines that fit at full size, where the height is fixed. Leave out where the box grows. */
  maxLines?: number
}

/** Scales tried, largest first. The last one is used when nothing fits. */
const STEPS = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4] as const

/** Lines the words take when wrapped whole and greedily into lines of `budget` characters. */
function wrappedLines(words: string[], budget: number): number {
  let lines = 0
  let used = 0
  for (const word of words) {
    if (lines > 0 && used + 1 + word.length <= budget) {
      used += 1 + word.length
    } else {
      lines += 1
      used = word.length
    }
  }
  return lines
}

/**
 * The scale at which a display title fits its space: the largest step where the longest word
 * fits on one line and, where the height is fixed, the wrapped lines are no taller than the
 * space. Type at scale `s` holds `charsPerLine / s` characters and each line is `s` lines tall.
 * The hero and the Work rows multiply their display size by this, so a long client name gets
 * smaller instead of running under the media or over the headline.
 */
export function titleFit(title: string, { charsPerLine, maxLines }: TitleSpace): number {
  const words = title.split(/\s+/).filter(Boolean)
  const longest = Math.max(0, ...words.map((word) => word.length))
  for (const scale of STEPS) {
    const budget = charsPerLine / scale
    if (longest > budget) continue
    if (maxLines === undefined || wrappedLines(words, budget) * scale <= maxLines) return scale
  }
  return STEPS[STEPS.length - 1]
}

export interface HeroNameFit {
  /** Scale for the stacked hero, below lg. */
  fit: number
  /** Scale from lg up. */
  fitLg: number
  /** From lg up, keep the name inside the left column instead of the wide box. */
  column: boolean
}

/**
 * How the client name is set in the case study hero. At full size it holds about eight characters
 * a line; from lg up the hero has a fixed height with room for three lines. A name that fits like
 * that uses the wide box, where a short first line sits beside the technical note and the lines
 * below run under it onto the vermilion block. Any other name could run a long line into the
 * note, so it is kept to the left column (about six characters a line) and sized to fit there.
 */
export function heroNameFit(title: string): HeroNameFit {
  const fit = titleFit(title, { charsPerLine: 8 })
  if (titleFit(title, { charsPerLine: 8, maxLines: 3 }) === 1) return { fit, fitLg: 1, column: false }
  return { fit, fitLg: titleFit(title, { charsPerLine: 6, maxLines: 3 }), column: true }
}
