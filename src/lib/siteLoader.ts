import { gsap } from './gsap'
import { LOADER_MOTION, prefersReducedMotion } from './motionTokens'

export { LOADER_MOTION }

/** Set on <html> by the head script while the loader covers the page. */
export const LOADING_CLASS = 'site-loading'

/** Fired on the document as the loader starts to lift, so the page's own entrance can play. */
export const REVEAL_EVENT = 'site-loader:reveal'

/** Seconds the head script leaves the loader up if the page script never starts it. */
const FAILSAFE_MS = 8000

/**
 * Runs in the head, before the first paint, so a loader that is coming covers the page from the
 * first frame. It asks for the loader when a visitor arrives from somewhere else or reloads, and
 * never for a move between pages of the site, back and forward, or anyone who asks for reduced
 * motion. Written as plain ES5 that uses only the globals it is handed, so the test can run it.
 */
export const LOADER_HEAD_SCRIPT = `(function () {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var entry = performance.getEntriesByType('navigation')[0];
    var type = entry ? entry.type : 'navigate';
    if (type === 'back_forward') return;
    if (type !== 'reload' && document.referrer && new URL(document.referrer).origin === location.origin) return;
    var html = document.documentElement;
    html.classList.add('${LOADING_CLASS}');
    setTimeout(function () {
      if (!document.querySelector('[data-loader][data-state="running"]')) html.classList.remove('${LOADING_CLASS}');
    }, ${FAILSAFE_MS});
  } catch (error) {}
})();`

export function loaderActive(): boolean {
  return document.documentElement.classList.contains(LOADING_CLASS)
}

/** Settles once the page is uncovered: at once with no loader, else as the loader starts to lift. */
export function whenPageRevealed(): Promise<void> {
  if (!loaderActive()) return Promise.resolve()
  return new Promise((resolve) => document.addEventListener(REVEAL_EVENT, () => resolve(), { once: true }))
}

/** When the ring is full and the exit begins, in seconds from the start. */
function exitAt(): number {
  return LOADER_MOTION.ringAt + LOADER_MOTION.ringFill + LOADER_MOTION.hold
}

/** Seconds from the first frame to the pane clearing the top, when the page loads in time. */
export function loaderDuration(): number {
  return exitAt() + Math.max(LOADER_MOTION.paneOut, LOADER_MOTION.fadeOut)
}

const BELOW = 'inset(100% 0% 0% 0%)'
const COVERING = 'inset(0% 0% 0% 0%)'
const ABOVE = 'inset(0% 0% 100% 0%)'

/**
 * Play the loader in `root`. The pane is wiped rather than moved, so the ink surface itself never
 * travels; its edge rises from the bottom on the way in and carries on up off the top on the way
 * out. If the page has not finished loading when the ring is full, it waits there.
 */
export function runSiteLoader(root: HTMLElement, ready: Promise<void>): gsap.core.Timeline {
  const pane = root.querySelector<HTMLElement>('[data-loader-pane]')
  const logo = root.querySelector<HTMLElement>('[data-loader-logo]')
  const ring = root.querySelector<SVGElement>('[data-loader-ring]')
  const ringArt = ring?.closest('svg') ?? null
  let isReady = false
  ready.then(() => (isReady = true))
  root.dataset.state = 'running'

  const reveal = () => {
    // The pane covers the screen at this moment, so dropping the ivory backing behind it shows
    // nothing yet; it lets the page show through as the pane lifts.
    root.style.background = 'transparent'
    document.documentElement.classList.remove(LOADING_CLASS)
    document.dispatchEvent(new Event(REVEAL_EVENT))
  }

  const timeline = gsap.timeline({ onComplete: () => root.remove() })
  timeline.fromTo(
    pane,
    { clipPath: BELOW },
    { clipPath: COVERING, duration: LOADER_MOTION.paneIn, ease: LOADER_MOTION.paneInEase, immediateRender: true, lazy: false },
    0,
  )
  timeline.fromTo(
    logo,
    { opacity: 0 },
    { opacity: 1, duration: LOADER_MOTION.logoIn, ease: LOADER_MOTION.logoEase, immediateRender: true, lazy: false },
    LOADER_MOTION.logoAt,
  )
  timeline.fromTo(
    ring,
    { strokeDashoffset: 1 },
    {
      strokeDashoffset: 0,
      duration: LOADER_MOTION.ringFill,
      ease: LOADER_MOTION.ringEase,
      // The browser reports the offset in pixels, and GSAP would round each frame to a whole
      // pixel: on a path one unit long that is empty until halfway, then full.
      autoRound: false,
      immediateRender: true,
      lazy: false,
    },
    LOADER_MOTION.ringAt,
  )
  timeline.call(
    () => {
      if (isReady) return
      timeline.pause()
      ready.then(() => timeline.play())
    },
    [],
    LOADER_MOTION.ringAt + LOADER_MOTION.ringFill,
  )
  timeline.call(reveal, [], exitAt())
  timeline.to([logo, ringArt], { opacity: 0, duration: LOADER_MOTION.fadeOut, ease: LOADER_MOTION.fadeOutEase }, exitAt())
  timeline.to(pane, { clipPath: ABOVE, duration: LOADER_MOTION.paneOut, ease: LOADER_MOTION.paneOutEase }, exitAt())
  return timeline
}

/** Settles when the window has loaded, or after `maxWait` seconds, whichever comes first. */
function pageLoaded(maxWait: number): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') return resolve()
    window.addEventListener('load', () => resolve(), { once: true })
    setTimeout(resolve, maxWait * 1000)
  })
}

/**
 * Start the loader if the head script asked for it; otherwise take its markup out of the page.
 * A page restored from the back-forward cache skips straight to the end.
 */
export function initSiteLoader(): gsap.core.Timeline | null {
  const root = document.querySelector<HTMLElement>('[data-loader]')
  if (!loaderActive() || !root || prefersReducedMotion()) {
    root?.remove()
    document.documentElement.classList.remove(LOADING_CLASS)
    return null
  }
  const timeline = runSiteLoader(root, pageLoaded(LOADER_MOTION.maxWait))
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) timeline.progress(1)
  })
  return timeline
}
