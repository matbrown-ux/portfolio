import { describe, expect, it } from 'vitest'
import { mediaKind, resolveMedia, videoType } from './media'

const files = {
  images: { 'vamp/dash.png': 'IMG-DASH', 'vamp/poster.jpg': 'IMG-POSTER' },
  videos: { 'vamp/tour.mp4': '/assets/tour.mp4', 'vamp/tour.webm': '/assets/tour.webm' },
}

describe('mediaKind', () => {
  it('reads the kind from the extension, ignoring case', () => {
    for (const path of ['a.png', 'a.jpg', 'a.JPEG', 'a.webp', 'a.avif', 'a.svg']) expect(mediaKind(path)).toBe('image')
    for (const path of ['a.mp4', 'a.WEBM']) expect(mediaKind(path)).toBe('video')
  })

  it('is null for anything else', () => {
    for (const path of ['a.mov', 'a.gif', 'a', 'a.png.txt', '']) expect(mediaKind(path)).toBeNull()
  })
})

describe('videoType', () => {
  it('gives the MIME type', () => {
    expect(videoType('a.mp4')).toBe('video/mp4')
    expect(videoType('a.webm')).toBe('video/webm')
  })
})

describe('resolveMedia', () => {
  it('is a placeholder when there is no src, keeping the alt as its label', () => {
    expect(resolveMedia({ alt: 'Dashboard' }, files, 'vamp hero')).toEqual({ kind: 'placeholder', alt: 'Dashboard' })
    expect(resolveMedia({ src: '', alt: 'Dashboard' }, files, 'vamp hero')).toEqual({ kind: 'placeholder', alt: 'Dashboard' })
  })

  it('resolves an image', () => {
    expect(resolveMedia({ src: 'vamp/dash.png', alt: 'Dashboard' }, files, 'vamp hero')).toEqual({
      kind: 'image',
      alt: 'Dashboard',
      image: 'IMG-DASH',
    })
  })

  it('tolerates a leading slash or ./', () => {
    expect(resolveMedia({ src: '/vamp/dash.png', alt: 'D' }, files, 'x').kind).toBe('image')
    expect(resolveMedia({ src: './vamp/dash.png', alt: 'D' }, files, 'x').kind).toBe('image')
  })

  it('resolves a video with its poster', () => {
    expect(resolveMedia({ src: 'vamp/tour.mp4', alt: 'Tour', poster: 'vamp/poster.jpg' }, files, 'vamp step 1')).toEqual({
      kind: 'video',
      alt: 'Tour',
      url: '/assets/tour.mp4',
      type: 'video/mp4',
      poster: 'IMG-POSTER',
    })
  })

  it('names the context and the path when a file is missing', () => {
    expect(() => resolveMedia({ src: 'vamp/typo.png', alt: 'D' }, files, 'vamp-network hero')).toThrow(
      'vamp-network hero: no file at src/assets/case-studies/vamp/typo.png',
    )
    expect(() => resolveMedia({ src: 'vamp/nope.mp4', alt: 'T', poster: 'vamp/poster.jpg' }, files, 'vamp step 2')).toThrow(
      'vamp step 2: no file at src/assets/case-studies/vamp/nope.mp4',
    )
  })

  it('rejects an unsupported extension', () => {
    expect(() => resolveMedia({ src: 'vamp/tour.mov', alt: 'T' }, files, 'vamp step 1')).toThrow(
      'vamp step 1: "vamp/tour.mov" is not a supported image or video type',
    )
  })

  it('requires a poster for a video, and the poster must be an existing image', () => {
    expect(() => resolveMedia({ src: 'vamp/tour.mp4', alt: 'T' }, files, 'vamp step 1')).toThrow(
      'vamp step 1: the video "vamp/tour.mp4" needs a poster image',
    )
    expect(() => resolveMedia({ src: 'vamp/tour.mp4', alt: 'T', poster: 'vamp/tour.webm' }, files, 'vamp step 1')).toThrow(
      'vamp step 1: the poster "vamp/tour.webm" must be an image',
    )
    expect(() => resolveMedia({ src: 'vamp/tour.mp4', alt: 'T', poster: 'vamp/gone.jpg' }, files, 'vamp step 1')).toThrow(
      'vamp step 1: no file at src/assets/case-studies/vamp/gone.jpg',
    )
  })

  it('does not find files outside the folder', () => {
    expect(() => resolveMedia({ src: '../logo/mb-mark.svg', alt: 'L' }, files, 'x')).toThrow('x: no file at')
  })
})
