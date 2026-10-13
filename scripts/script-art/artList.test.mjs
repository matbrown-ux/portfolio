import { describe, expect, it } from 'vitest'
import { FONT_FILES, missingFonts, parseArtList } from './artList.mjs'

const phrase = { name: 'lets-talk', text: "let's talk", fill: '#f86343', edge: '#f4f0e6' }
const stroke = { name: 'strike', stroke: 'e', fill: '#f86343' }

describe('parseArtList', () => {
  it('accepts phrases and strokes', () => {
    expect(parseArtList([phrase, stroke])).toEqual([phrase, stroke])
  })

  it('rejects anything that is not a list', () => {
    expect(() => parseArtList({})).toThrow('phrases.json must be a list')
  })

  it('rejects names that are not lowercase kebab case', () => {
    for (const name of ['../x', 'Lets Talk', 'a/b', '', 'a--b', '-a']) {
      expect(() => parseArtList([{ ...phrase, name }])).toThrow('Invalid name')
    }
  })

  it('rejects duplicate names', () => {
    expect(() => parseArtList([phrase, { ...stroke, name: 'lets-talk' }])).toThrow('Duplicate name "lets-talk"')
  })

  it('rejects colours that are not six-digit hex', () => {
    expect(() => parseArtList([{ ...phrase, fill: 'red' }])).toThrow('"lets-talk": fill must be a hex colour')
    expect(() => parseArtList([{ ...phrase, edge: '#fff"/><script>' }])).toThrow('"lets-talk": edge must be a hex colour')
  })

  it('requires exactly one of text or stroke', () => {
    expect(() => parseArtList([{ name: 'x', fill: '#f86343' }])).toThrow('"x": give either text or stroke')
    expect(() => parseArtList([{ ...phrase, stroke: 'e' }])).toThrow('"lets-talk": give either text or stroke')
  })

  it('requires non-empty text and a single-character stroke key', () => {
    expect(() => parseArtList([{ ...phrase, text: '   ' }])).toThrow('"lets-talk": text is empty')
    expect(() => parseArtList([{ ...stroke, stroke: 'ee' }])).toThrow('"strike": stroke must be one character')
  })
})

describe('missingFonts', () => {
  it('lists the files that are not in the folder', () => {
    const present = new Set([`.fonts/${FONT_FILES.regular}`])
    expect(missingFonts('.fonts', (path) => present.has(path))).toEqual([FONT_FILES.alternates, FONT_FILES.extras])
  })

  it('is empty when all three are present', () => {
    expect(missingFonts('.fonts', () => true)).toEqual([])
  })
})
