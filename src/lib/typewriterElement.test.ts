import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { startTypewriter } from './typewriterElement'

const timing = { type: 10, erase: 10, hold: 100, gap: 10 }

function element(text = 'ux') {
  const el = document.createElement('span')
  el.textContent = text
  return el
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('startTypewriter', () => {
  it('leaves the prerendered word in place until the hold ends', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing })
    vi.advanceTimersByTime(99)
    expect(el.textContent).toBe('ux')
  })

  it('deletes the word, then types the next one', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing })
    vi.advanceTimersByTime(100)
    expect(el.textContent).toBe('u')
    vi.advanceTimersByTime(10)
    expect(el.textContent).toBe('')
    vi.advanceTimersByTime(10)
    expect(el.textContent).toBe('a')
    vi.advanceTimersByTime(10)
    expect(el.textContent).toBe('ai')
  })

  it('waits for the start delay before the first hold', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing, startDelay: 500 })
    vi.advanceTimersByTime(599)
    expect(el.textContent).toBe('ux')
    vi.advanceTimersByTime(1)
    expect(el.textContent).toBe('u')
  })

  it('stops when asked', () => {
    const el = element()
    const handle = startTypewriter(el, ['ux', 'ai'], { timing })
    handle.stop()
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('ux')
  })

  it('shows the first word and never types under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const el = element('stale')
    startTypewriter(el, ['ux', 'ai'], { timing })
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('ux')
  })

  it('leaves the prerendered text alone when there are no words', () => {
    const el = element('ux')
    startTypewriter(el, [], { timing })
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('ux')
  })
})
