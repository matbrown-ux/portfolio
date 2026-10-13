import { describe, expect, it } from 'vitest'
import { readingLabel, readingMinutes } from './readingTime'

const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ')

describe('readingMinutes', () => {
  it('reads 200 words a minute, rounded up', () => {
    expect(readingMinutes(words(200))).toBe(1)
    expect(readingMinutes(words(201))).toBe(2)
    expect(readingMinutes(words(231))).toBe(2)
    expect(readingMinutes(words(1000))).toBe(5)
  })

  it('is never less than one minute', () => {
    expect(readingMinutes('')).toBe(1)
    expect(readingMinutes('  \n\n  ')).toBe(1)
    expect(readingMinutes('Short.')).toBe(1)
  })

  it('counts words across any whitespace', () => {
    expect(readingMinutes(`${words(150)}\n\n${words(60)}\t${words(1)}`)).toBe(2)
  })
})

describe('readingLabel', () => {
  it('writes the minutes as a label', () => {
    expect(readingLabel(words(231))).toBe('2 min read')
    expect(readingLabel('')).toBe('1 min read')
  })
})
