import { describe, expect, it } from 'vitest'
import { caseStudyMedia, mediaKey, tileMedia } from './caseStudyMedia'

describe('mediaKey', () => {
  it('turns a glob path into the path used in content', () => {
    expect(mediaKey('../assets/case-studies/vamp-network/dash.png')).toBe('vamp-network/dash.png')
  })
})

describe('caseStudyMedia', () => {
  it('is a labelled placeholder when there is no src', () => {
    expect(caseStudyMedia({ alt: 'Dashboard' }, 'vamp hero')).toEqual({ kind: 'placeholder', alt: 'Dashboard' })
  })

  it('stops the build when the file does not exist', () => {
    expect(() => caseStudyMedia({ src: 'vamp-network/not-there.png', alt: 'D' }, 'vamp-network hero')).toThrow(
      'vamp-network hero: no file at src/assets/case-studies/vamp-network/not-there.png',
    )
  })
})

describe('tileMedia', () => {
  it('is null when a tile has no media, so Home shows its plain colour block', () => {
    expect(tileMedia(undefined, 'vamp tile')).toBeNull()
    expect(tileMedia({ alt: 'Tile' }, 'vamp tile')).toBeNull()
  })
})
