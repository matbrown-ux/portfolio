import { describe, it, expect } from 'vitest'
import { splitWords } from './splitText'

describe('splitWords', () => {
  it('keeps slashes and ampersands as their own tokens', () => {
    expect(splitWords('UX/UI Engineering & SEO')).toEqual(['UX/UI', 'Engineering', '&', 'SEO'])
  })

  it('keeps leading apostrophes', () => {
    expect(splitWords("'Aiwi Waffles")).toEqual(["'Aiwi", 'Waffles'])
  })

  it('collapses whitespace', () => {
    expect(splitWords('  A \n  B  ')).toEqual(['A', 'B'])
  })

  it('returns nothing for empty text', () => {
    expect(splitWords('   ')).toEqual([])
  })
})
