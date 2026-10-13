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

/** The look of the pause button: an ink label in the video's bottom right corner. */
const TOGGLE_CLASS =
  'type-label absolute bottom-3 right-3 z-10 bg-ink px-3 py-2 text-ivory transition-colors duration-200 hover:bg-ivory hover:text-ink focus-visible:bg-ivory focus-visible:text-ink focus-visible:outline-ink'

/**
 * Play `video[data-play-in-view]` elements only while they are on screen, each with a pause
 * button so the visitor can stop the loop (a video they paused stays paused). Under reduced
 * motion, or where the browser cannot observe intersection, nothing plays by itself and
 * the videos get native controls so the visitor can start them. The same happens to a
 * video the browser refuses to play (NotAllowedError). A video inside a link (a
 * Work row, a Home tile) gets no button and stays on its poster instead of taking controls:
 * a control nested in a link cannot be used, and the link already leads to the case study.
 * Returns a cleanup function.
 */
export function initVideosInView(root: ParentNode = document): () => void {
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-play-in-view]'))

  if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') {
    for (const video of videos) offerControls(video)
    return () => {}
  }

  /** Videos the visitor paused: scrolling them into view does not start them again. */
  const stopped = new WeakSet<HTMLVideoElement>()
  const toggles = new Map<HTMLVideoElement, HTMLButtonElement>()

  function play(video: HTMLVideoElement) {
    // Low Power Mode and data savers refuse scripted playback: offer controls then.
    // An AbortError only means a pause interrupted the play, so it changes nothing.
    void video.play()?.catch((error: unknown) => {
      if ((error as { name?: string } | null)?.name !== 'NotAllowedError') return
      offerControls(video)
      toggles.get(video)?.remove()
      toggles.delete(video)
    })
  }

  function label(button: HTMLButtonElement, paused: boolean) {
    button.textContent = paused ? 'Play' : 'Pause'
    button.setAttribute('aria-label', paused ? 'Play video' : 'Pause video')
  }

  for (const video of videos) {
    if (video.closest('a')) continue
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.videoToggle = ''
    button.className = TOGGLE_CLASS
    label(button, false)
    button.addEventListener('click', () => {
      const pausing = !stopped.has(video)
      if (pausing) {
        stopped.add(video)
        video.pause()
      } else {
        stopped.delete(video)
        play(video)
      }
      label(button, pausing)
    })
    video.after(button)
    toggles.set(video, button)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE) {
          if (!stopped.has(video)) play(video)
        } else {
          video.pause()
        }
      }
    },
    { threshold: [0, VISIBLE] },
  )

  for (const video of videos) observer.observe(video)
  return () => {
    observer.disconnect()
    for (const button of toggles.values()) button.remove()
    toggles.clear()
  }
}
