import { describe, expect, it } from 'vitest'
import { DEFAULT_TIMING, initialTypewriterState, nextTypewriterFrame, parseWords } from './typewriter'

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
