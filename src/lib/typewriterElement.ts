import { prefersReducedMotion } from './motionTokens'
import {
  DEFAULT_TIMING,
  initialTypewriterState,
  isWordStart,
  nextTypewriterFrame,
  shouldRest,
  type TypewriterTiming,
} from './typewriter'

export interface TypewriterOptions {
  timing?: TypewriterTiming
  /** Milliseconds to wait before the first hold begins. */
  startDelay?: number
  /** Milliseconds the first word holds before it is deleted, in place of the timing's hold. */
  firstHold?: number
  /** Full passes through the words before resting on the first one. Omit to loop forever. */
  cycles?: number
}

const idle = { stop() {} }

const markDone = (el: HTMLElement) => el.setAttribute('data-typewriter-done', '')

/** Cycle `words` through `el`. The element should already contain the first word. */
export function startTypewriter(el: HTMLElement, words: string[], options: TypewriterOptions = {}): { stop(): void } {
  if (words.length === 0) {
    markDone(el)
    return idle
  }

  if (prefersReducedMotion()) {
    el.textContent = words[0]
    markDone(el)
    return idle
  }

  const timing = options.timing ?? DEFAULT_TIMING
  let state = initialTypewriterState(words)
  let timer: ReturnType<typeof setTimeout>
  let stopped = false
  let wordStarts = 0
  el.textContent = state.text

  /** Show the next frame after its own delay, or after `delay` when one is given. */
  const schedule = (delay?: number) => {
    const frame = nextTypewriterFrame(state, words, timing)
    timer = setTimeout(() => {
      if (stopped) return
      if (isWordStart(state, frame.state)) wordStarts++
      state = frame.state
      el.textContent = state.text
      // The caret shows from here on: before the first letter changes there is nothing being typed.
      el.setAttribute('data-typewriter-typing', '')
      if (shouldRest(state, words, wordStarts, options.cycles)) {
        markDone(el)
        return
      }
      schedule()
    }, delay ?? frame.delay)
  }

  // A set first hold replaces the hold on the first word, so its wait and the start delay are one.
  if (options.firstHold !== undefined) schedule((options.startDelay ?? 0) + options.firstHold)
  else timer = setTimeout(() => schedule(), options.startDelay ?? 0)

  return {
    stop() {
      stopped = true
      clearTimeout(timer)
    },
  }
}
