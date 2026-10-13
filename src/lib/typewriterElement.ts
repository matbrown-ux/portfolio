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

  const schedule = () => {
    const frame = nextTypewriterFrame(state, words, timing)
    timer = setTimeout(() => {
      if (stopped) return
      if (isWordStart(state, frame.state)) wordStarts++
      state = frame.state
      el.textContent = state.text
      if (shouldRest(state, words, wordStarts, options.cycles)) {
        markDone(el)
        return
      }
      schedule()
    }, frame.delay)
  }

  timer = setTimeout(schedule, options.startDelay ?? 0)

  return {
    stop() {
      stopped = true
      clearTimeout(timer)
    },
  }
}
