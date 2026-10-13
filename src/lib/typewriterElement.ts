import { prefersReducedMotion } from './motionTokens'
import { DEFAULT_TIMING, initialTypewriterState, nextTypewriterFrame, type TypewriterTiming } from './typewriter'

export interface TypewriterOptions {
  timing?: TypewriterTiming
  /** Milliseconds to wait before the first hold begins. */
  startDelay?: number
}

const idle = { stop() {} }

/** Cycle `words` through `el`. The element should already contain the first word. */
export function startTypewriter(el: HTMLElement, words: string[], options: TypewriterOptions = {}): { stop(): void } {
  if (words.length === 0) return idle

  if (prefersReducedMotion()) {
    el.textContent = words[0]
    return idle
  }

  const timing = options.timing ?? DEFAULT_TIMING
  let state = initialTypewriterState(words)
  let timer: ReturnType<typeof setTimeout>
  let stopped = false
  el.textContent = state.text

  const schedule = () => {
    const frame = nextTypewriterFrame(state, words, timing)
    timer = setTimeout(() => {
      if (stopped) return
      state = frame.state
      el.textContent = state.text
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
