export type TypewriterPhase = 'typing' | 'deleting'

export interface TypewriterState {
  text: string
  wordIndex: number
  phase: TypewriterPhase
}

/** Milliseconds. */
export interface TypewriterTiming {
  type: number
  erase: number
  hold: number
  gap: number
}

export const DEFAULT_TIMING: TypewriterTiming = { type: 90, erase: 45, hold: 2200, gap: 200 }

/** Parse a comma-separated data attribute into words. */
export function parseWords(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean)
}

/** The page is prerendered with the first word in place, so start from it fully typed. */
export function initialTypewriterState(words: string[]): TypewriterState {
  return { text: words[0] ?? '', wordIndex: 0, phase: 'typing' }
}

/** The next state to show, and how long to wait before showing it. */
export function nextTypewriterFrame(
  state: TypewriterState,
  words: string[],
  timing: TypewriterTiming = DEFAULT_TIMING,
): { state: TypewriterState; delay: number } {
  if (words.length === 0) return { state, delay: timing.hold }

  const word = words[state.wordIndex % words.length]

  if (state.phase === 'typing') {
    if (state.text.length < word.length) {
      return { state: { ...state, text: word.slice(0, state.text.length + 1) }, delay: timing.type }
    }
    return { state: { ...state, text: state.text.slice(0, -1), phase: 'deleting' }, delay: timing.hold }
  }

  if (state.text.length > 0) {
    return { state: { ...state, text: state.text.slice(0, -1) }, delay: timing.erase }
  }

  const wordIndex = (state.wordIndex + 1) % words.length
  return { state: { text: words[wordIndex].slice(0, 1), wordIndex, phase: 'typing' }, delay: timing.gap }
}

/** True on the frame where erasing hands over to typing the next word. */
export function isWordStart(prev: TypewriterState, next: TypewriterState): boolean {
  return prev.phase === 'deleting' && next.phase === 'typing'
}

/**
 * Is this the frame to stop on? `wordStarts` counts the words begun since the initial state.
 * Once `cycles` full passes are done, it rests when the first word is fully typed again.
 * Without `cycles` it never rests.
 */
export function shouldRest(state: TypewriterState, words: string[], wordStarts: number, cycles?: number): boolean {
  if (cycles === undefined || words.length === 0) return false
  return wordStarts >= cycles * words.length && state.text === words[state.wordIndex % words.length]
}
