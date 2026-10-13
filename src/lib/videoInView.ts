import { prefersReducedMotion } from './motionTokens'

/** Play a video once at least this much of it is on screen. */
const VISIBLE = 0.5

/**
 * Play `video[data-play-in-view]` elements only while they are on screen. Under reduced
 * motion, or where the browser cannot observe intersection, nothing plays by itself and
 * the videos get native controls so the visitor can start them. Returns a cleanup function.
 */
export function initVideosInView(root: ParentNode = document): () => void {
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-play-in-view]'))

  if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') {
    for (const video of videos) video.controls = true
    return () => {}
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE) {
          // Browsers may refuse autoplay; the poster stays and nothing breaks.
          void video.play()?.catch(() => {})
        } else {
          video.pause()
        }
      }
    },
    { threshold: [0, VISIBLE] },
  )

  for (const video of videos) observer.observe(video)
  return () => observer.disconnect()
}
