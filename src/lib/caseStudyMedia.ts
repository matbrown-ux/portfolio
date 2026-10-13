import type { ImageMetadata } from 'astro'
import { resolveMedia, type MediaRef, type ResolvedMedia } from './media'

const PREFIX = '../assets/case-studies/'

/** A glob path as the path content uses, relative to src/assets/case-studies/. */
export function mediaKey(globPath: string): string {
  return globPath.slice(PREFIX.length)
}

const imageModules = import.meta.glob<{ default: ImageMetadata }>('../assets/case-studies/**/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
})
const videoModules = import.meta.glob<string>('../assets/case-studies/**/*.{mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
})

// The only place that touches the file map.
const files = {
  images: Object.fromEntries(Object.entries(imageModules).map(([path, mod]) => [mediaKey(path), mod.default])),
  videos: Object.fromEntries(Object.entries(videoModules).map(([path, url]) => [mediaKey(path), url])),
}

export type CaseStudyMedia = ResolvedMedia<ImageMetadata>

export function caseStudyMedia(ref: MediaRef, context: string): CaseStudyMedia {
  return resolveMedia(ref, files, context)
}

/** Media for a Home tile, or null when the tile has none and stays a plain colour block. */
export function tileMedia(ref: MediaRef | undefined, context: string): CaseStudyMedia | null {
  if (!ref?.src) return null
  return caseStudyMedia(ref, context)
}
