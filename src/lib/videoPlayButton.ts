/**
 * The look of the play button: a vermilion square with an ink outline and an ink triangle,
 * over the center of the poster. On hover and focus it turns ivory (the poster is dark, so ink would vanish); nothing moves.
 */
const BUTTON_CLASS =
  'group/play absolute left-1/2 top-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center border-2 border-ink bg-vermilion text-ink transition-colors duration-200 hover:bg-ivory focus-visible:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory md:size-24'

/** A play triangle in the brand style: a solid currentColor shape, square corners. */
const PLAY_ICON =
  '<svg viewBox="0 0 24 24" class="ml-1 size-7 md:size-10" aria-hidden="true" focusable="false"><path d="M6 3 L21 12 L6 21 Z" fill="currentColor" /></svg>'

/**
 * Start `video[data-play-on-click]` elements only when the visitor asks. The video is written
 * with native controls, so it works without JavaScript; here the controls are hidden
 * behind a play button over the poster. A press unmutes the video, brings back the controls
 * (pause, the scrubber, volume, full screen) and plays it. Returns a cleanup function.
 */
export function initPlayButtons(root: ParentNode = document): () => void {
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-play-on-click]'))
  const buttons = new Map<HTMLVideoElement, HTMLButtonElement>()

  for (const video of videos) {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.videoPlay = ''
    button.className = BUTTON_CLASS
    button.setAttribute('aria-label', 'Play video with sound')
    button.innerHTML = PLAY_ICON
    button.addEventListener('click', () => {
      button.remove()
      buttons.delete(video)
      video.muted = false
      video.controls = true
      // The button is gone, so keyboard focus moves to the player rather than the page.
      video.tabIndex = 0
      video.focus()
      void video.play()?.catch(() => {})
    })
    video.controls = false
    video.after(button)
    buttons.set(video, button)
  }

  return () => {
    for (const [video, button] of buttons) {
      button.remove()
      video.controls = true
    }
    buttons.clear()
  }
}
