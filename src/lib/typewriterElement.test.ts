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

  it('marks the word as typing only once its first letter changes, so the caret waits for the typing', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing, startDelay: 500 })
    vi.advanceTimersByTime(599)
    expect(el.hasAttribute('data-typewriter-typing')).toBe(false)
    vi.advanceTimersByTime(1)
    expect(el.textContent).toBe('u')
    expect(el.hasAttribute('data-typewriter-typing')).toBe(true)
  })

  it('never marks the word as typing under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing })
    vi.advanceTimersByTime(1000)
    expect(el.hasAttribute('data-typewriter-typing')).toBe(false)
    installMatchMedia({})
  })

  it('can shorten the first hold, so the first letter changes right after the start delay', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing, startDelay: 500, firstHold: 0 })
    vi.advanceTimersByTime(499)
    expect(el.textContent).toBe('ux')
    vi.advanceTimersByTime(1)
    expect(el.textContent).toBe('u')
  })

  it('keeps the normal hold on every later word', () => {
    const el = element()
    startTypewriter(el, ['ux', 'ai'], { timing, firstHold: 0 })
    // 'u' at 0, '' at 10, 'a' at 20, 'ai' at 30, then the full hold of 100 before deleting at 130.
    vi.advanceTimersByTime(30)
    expect(el.textContent).toBe('ai')
    vi.advanceTimersByTime(99)
    expect(el.textContent).toBe('ai')
    vi.advanceTimersByTime(1)
    expect(el.textContent).toBe('a')
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

  describe('with cycles', () => {
    const words = ['ux', 'ai']
    it('ends on the first word, marked done, with no timers left', () => {
      const el = element()
      startTypewriter(el, words, { timing, cycles: 2 })
      expect(el.hasAttribute('data-typewriter-done')).toBe(false)
      vi.advanceTimersByTime(5000)
      expect(el.textContent).toBe('ux')
      expect(el.hasAttribute('data-typewriter-done')).toBe(true)
      expect(el.getAttribute('data-typewriter-done')).toBe('')
      expect(vi.getTimerCount()).toBe(0)
      vi.advanceTimersByTime(5000)
      expect(el.textContent).toBe('ux')
    })

    it('is not done while still running', () => {
      const el = element()
      startTypewriter(el, words, { timing, cycles: 2 })
      vi.advanceTimersByTime(250)
      expect(el.hasAttribute('data-typewriter-done')).toBe(false)
    })

    it('keeps looping when cycles is omitted', () => {
      const el = element()
      startTypewriter(el, words, { timing })
      vi.advanceTimersByTime(5000)
      expect(el.hasAttribute('data-typewriter-done')).toBe(false)
      expect(vi.getTimerCount()).toBe(1)
    })

    it('does not mark done when stopped early', () => {
      const el = element()
      const handle = startTypewriter(el, words, { timing, cycles: 2 })
      vi.advanceTimersByTime(250)
      handle.stop()
      vi.advanceTimersByTime(5000)
      expect(el.hasAttribute('data-typewriter-done')).toBe(false)
    })

    it('marks done immediately under reduced motion', () => {
      installMatchMedia({ [REDUCED_QUERY]: true })
      const el = element('stale')
      startTypewriter(el, words, { timing, cycles: 2 })
      expect(el.textContent).toBe('ux')
      expect(el.hasAttribute('data-typewriter-done')).toBe(true)
    })

    it('marks done and leaves the text alone with no words', () => {
      const el = element('ux')
      startTypewriter(el, [], { timing, cycles: 2 })
      expect(el.textContent).toBe('ux')
      expect(el.hasAttribute('data-typewriter-done')).toBe(true)
    })
  })
})
