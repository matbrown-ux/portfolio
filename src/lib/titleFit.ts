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

/** Advance widths of Anton's capitals, figures and common marks, in em, measured in Chrome. */
const ANTON_EM: Record<string, number> = {
  A: 0.485, B: 0.479, C: 0.474, D: 0.493, E: 0.412, F: 0.399, G: 0.485, H: 0.499, I: 0.227, J: 0.466,
  K: 0.472, L: 0.398, M: 0.746, N: 0.498, O: 0.486, P: 0.472, Q: 0.494, R: 0.477, S: 0.462, T: 0.396,
  U: 0.474, V: 0.469, W: 0.712, X: 0.484, Y: 0.446, Z: 0.41, '0': 0.494, '1': 0.331, '2': 0.494,
  '3': 0.494, '4': 0.494, '5': 0.494, '6': 0.494, '7': 0.494, '8': 0.494, '9': 0.494, "'": 0.214,
  '&': 0.52, '.': 0.229, '-': 0.311, '/': 0.405, '!': 0.229, '?': 0.492, ',': 0.236, ':': 0.242, '#': 0.546,
}

/** The width of a word set in Anton capitals, in em. An unknown character counts as the widest letter. */
export function wordEm(word: string): number {
  return [...word.toUpperCase()].reduce((width, char) => width + (ANTON_EM[char] ?? ANTON_EM.M), 0)
}

/**
 * The em width that one shared size for every title in a list has to fit: the longest word in any
 * of them, plus 4% to spare. A column `room` wide sets them all at `room / sharedTitleEm(titles)`.
 */
export function sharedTitleEm(titles: string[]): number {
  const words = titles.flatMap((title) => title.split(/\s+/).filter(Boolean))
  return Math.max(0, ...words.map(wordEm)) * 1.04
}
