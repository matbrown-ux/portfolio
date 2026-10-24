import { describe, it, expect } from 'vitest'
import { parseBase } from './pageArgs.mjs'

const preview = 'https://preview--site.netlify.app'

describe('parseBase', () => {
  it('defaults to the live site with no arguments', () => {
    expect(parseBase([])).toBe('https://matbrown.io')
  })
  it('accepts --base URL', () => {
    expect(parseBase(['--base', preview])).toBe(preview)
  })
  it('accepts --base=URL', () => {
    expect(parseBase([`--base=${preview}`])).toBe(preview)
  })
  it('accepts a bare https URL', () => {
    expect(parseBase([preview])).toBe(preview)
  })
  it('throws on an unknown argument', () => {
    expect(() => parseBase(['--nope'])).toThrow(/--nope/)
    expect(() => parseBase(['ftp://x.test'])).toThrow()
  })
  it('throws when --base has no value', () => {
    expect(() => parseBase(['--base'])).toThrow(/--base/)
    expect(() => parseBase(['--base='])).toThrow(/--base/)
  })
})
