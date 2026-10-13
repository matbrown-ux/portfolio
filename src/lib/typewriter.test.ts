import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TIMING,
  initialTypewriterState,
  isWordStart,
  nextTypewriterFrame,
  parseWords,
  shouldRest,
  type TypewriterState,
} from './typewriter'

const words = ['ux', 'ai']
const t = DEFAULT_TIMING

describe('parseWords', () => {
  it('splits on commas and trims', () => {
    expect(parseWords('ux, ui ,seo,ai')).toEqual(['ux', 'ui', 'seo', 'ai'])
  })

  it('drops empty entries and handles missing input', () => {
    expect(parseWords(' , ,')).toEqual([])
    expect(parseWords('')).toEqual([])
    expect(parseWords(undefined)).toEqual([])
  })
})

describe('initialTypewriterState', () => {
  it('starts with the first word fully typed', () => {
    expect(initialTypewriterState(words)).toEqual({ text: 'ux', wordIndex: 0, phase: 'typing' })
  })

  it('is empty for an empty list', () => {
    expect(initialTypewriterState([])).toEqual({ text: '', wordIndex: 0, phase: 'typing' })
  })
})

describe('nextTypewriterFrame', () => {
  it('holds a finished word, then starts deleting', () => {
    expect(nextTypewriterFrame({ text: 'ux', wordIndex: 0, phase: 'typing' }, words)).toEqual({
      state: { text: 'u', wordIndex: 0, phase: 'deleting' },
      delay: t.hold,
    })
  })

  it('deletes one character at a time', () => {
    expect(nextTypewriterFrame({ text: 'u', wordIndex: 0, phase: 'deleting' }, words)).toEqual({
      state: { text: '', wordIndex: 0, phase: 'deleting' },
      delay: t.erase,
    })
  })

  it('moves to the next word after a gap', () => {
    expect(nextTypewriterFrame({ text: '', wordIndex: 0, phase: 'deleting' }, words)).toEqual({
      state: { text: 'a', wordIndex: 1, phase: 'typing' },
      delay: t.gap,
    })
  })

  it('types one character at a time', () => {
    expect(nextTypewriterFrame({ text: 'a', wordIndex: 1, phase: 'typing' }, words)).toEqual({
      state: { text: 'ai', wordIndex: 1, phase: 'typing' },
      delay: t.type,
    })
  })

  it('wraps from the last word to the first', () => {
    expect(nextTypewriterFrame({ text: '', wordIndex: 1, phase: 'deleting' }, words).state).toEqual({
      text: 'u',
      wordIndex: 0,
      phase: 'typing',
    })
  })

  it('cycles a single word', () => {
    expect(nextTypewriterFrame({ text: '', wordIndex: 0, phase: 'deleting' }, ['seo']).state).toEqual({
      text: 's',
      wordIndex: 0,
      phase: 'typing',
    })
  })

  it('returns the state unchanged for an empty list', () => {
    const state = { text: '', wordIndex: 0, phase: 'typing' as const }
    expect(nextTypewriterFrame(state, [])).toEqual({ state, delay: t.hold })
  })

  it('honours custom timing', () => {
    const timing = { type: 1, erase: 2, hold: 3, gap: 4 }
    expect(nextTypewriterFrame({ text: 'ux', wordIndex: 0, phase: 'typing' }, words, timing).delay).toBe(3)
  })
})

/** Walk the pure step function the way the element does, recording every frame until it rests. */
function run(list: string[], cycles?: number, limit = 500) {
  let state: TypewriterState = initialTypewriterState(list)
  let starts = 0
  const shown = [state.text]
  for (let i = 0; i < limit; i++) {
    const next = nextTypewriterFrame(state, list).state
    if (isWordStart(state, next)) starts++
    state = next
    shown.push(state.text)
    if (shouldRest(state, list, starts, cycles)) return { shown, starts, rested: true }
  }
  return { shown, starts, rested: false }
}

describe('isWordStart', () => {
  it('is true only when erasing hands over to typing the next word', () => {
    const deleting = { text: '', wordIndex: 0, phase: 'deleting' as const }
    const typing = { text: 'a', wordIndex: 1, phase: 'typing' as const }
    expect(isWordStart(deleting, typing)).toBe(true)
    expect(isWordStart(typing, { ...typing, text: 'ai' })).toBe(false)
    expect(isWordStart({ text: 'ux', wordIndex: 0, phase: 'typing' }, { text: 'u', wordIndex: 0, phase: 'deleting' })).toBe(false)
  })
})

describe('shouldRest', () => {
  it('never rests when cycles is omitted', () => {
    expect(run(words).rested).toBe(false)
    expect(shouldRest({ text: 'ux', wordIndex: 0, phase: 'typing' }, words, 1000)).toBe(false)
  })

  it('rests on the first word fully typed after exactly two passes', () => {
    const { shown, starts, rested } = run(words, 2)
    expect(rested).toBe(true)
    expect(starts).toBe(4)
    expect(shown.at(-1)).toBe('ux')
  })

  it('does not rest before the last word is fully typed', () => {
    const state = { text: 'u', wordIndex: 0, phase: 'typing' as const }
    expect(shouldRest(state, words, 4, 2)).toBe(false)
  })

  it('does not rest on the first word after one pass when two are asked for', () => {
    expect(shouldRest({ text: 'ux', wordIndex: 0, phase: 'typing' }, words, 2, 2)).toBe(false)
    expect(shouldRest({ text: 'ux', wordIndex: 0, phase: 'typing' }, words, 4, 2)).toBe(true)
  })

  it('rests after one pass of a single word with cycles 1', () => {
    const { shown, starts, rested } = run(['seo'], 1)
    expect(rested).toBe(true)
    expect(starts).toBe(1)
    expect(shown.at(-1)).toBe('seo')
  })

  it('never rests for an empty list', () => {
    expect(shouldRest({ text: '', wordIndex: 0, phase: 'typing' }, [], 0, 1)).toBe(false)
  })
})
