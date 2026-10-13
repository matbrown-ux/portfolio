/** A media slot as written in content. No `src` means a labelled placeholder. */
export interface MediaRef {
  /** Path relative to src/assets/case-studies/. */
  src?: string
  /** Describes the media; doubles as the placeholder's label. */
  alt: string
  /** Image path, same form as `src`. Required for a video. */
  poster?: string
}

export type MediaKind = 'image' | 'video'

const IMAGE = /\.(png|jpe?g|webp|avif|svg)$/i
const VIDEO = /\.(mp4|webm)$/i

export function mediaKind(path: string): MediaKind | null {
  if (IMAGE.test(path)) return 'image'
  if (VIDEO.test(path)) return 'video'
  return null
}

export function videoType(path: string): string {
  return /\.webm$/i.test(path) ? 'video/webm' : 'video/mp4'
}

/** Files found under src/assets/case-studies/, keyed by their path inside it. */
export interface MediaFiles<I> {
  images: Record<string, I>
  videos: Record<string, string>
}

export type ResolvedMedia<I> =
  | { kind: 'placeholder'; alt: string }
  | { kind: 'image'; alt: string; image: I }
  | { kind: 'video'; alt: string; url: string; type: string; poster: I }

const ROOT = 'src/assets/case-studies/'
const clean = (path: string) => path.replace(/^\.?\//, '')

/**
 * The error for a path with no file. The file map holds lower-case and UPPER-CASE
 * extensions only, so a mixed-case one such as ".Jpg" gets a hint to rename it.
 */
function missingFile(context: string, path: string): Error {
  const ext = path.slice(path.lastIndexOf('.') + 1)
  const mixed = ext !== ext.toLowerCase() && ext !== ext.toUpperCase()
  return new Error(`${context}: no file at ${ROOT}${path}${mixed ? ' (rename it with a lower-case extension)' : ''}`)
}

/**
 * Decide what a media slot shows. A missing or mistyped file throws, naming `context`,
 * so the build stops instead of shipping a placeholder where real media was meant.
 */
export function resolveMedia<I>(ref: MediaRef, files: MediaFiles<I>, context: string): ResolvedMedia<I> {
  if (!ref.src) return { kind: 'placeholder', alt: ref.alt }

  const src = clean(ref.src)
  const kind = mediaKind(src)
  if (!kind) throw new Error(`${context}: "${src}" is not a supported image or video type`)

  if (kind === 'image') {
    const image = files.images[src]
    if (image === undefined) throw missingFile(context, src)
    return { kind: 'image', alt: ref.alt, image }
  }

  const url = files.videos[src]
  if (url === undefined) throw missingFile(context, src)
  if (!ref.poster) throw new Error(`${context}: the video "${src}" needs a poster image`)

  const posterPath = clean(ref.poster)
  if (mediaKind(posterPath) !== 'image') throw new Error(`${context}: the poster "${posterPath}" must be an image`)
  const poster = files.images[posterPath]
  if (poster === undefined) throw missingFile(context, posterPath)

  return { kind: 'video', alt: ref.alt, url, type: videoType(src), poster }
}
