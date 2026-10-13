import { prefersReducedMotion } from './motionTokens'

/** Play a video once at least this much of it is on screen. */
const VISIBLE = 0.5

/**
 * Give a video native controls so the visitor can start it. A video inside a link gets
 * none: controls nested in a link cannot be used, and the link already leads on.
 */
function offerControls(video: HTMLVideoElement) {
  video.controls = video.closest('a') === null
}

/**
 * Play `video[data-play-in-view]` elements only while they are on screen. Under reduced
 * motion, or where the browser cannot observe intersection, nothing plays by itself and
 * the videos get native controls so the visitor can start them. The same happens to a
 * video the browser refuses to play (NotAllowedError). A video inside a link (a
 * Work row, a Home tile) stays on its poster instead: controls nested in a link cannot be
 * used, and the link already leads to the case study. Returns a cleanup function.
 */
export function initVideosInView(root: ParentNode = document): () => void {
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-play-in-view]'))

  if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') {
    for (const video of videos) offerControls(video)
    return () => {}
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE) {
          // Low Power Mode and data savers refuse scripted playback: offer controls then.
          // An AbortError only means a pause interrupted the play, so it changes nothing.
          void video.play()?.catch((error: unknown) => {
            if ((error as { name?: string } | null)?.name === 'NotAllowedError') offerControls(video)
          })
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
