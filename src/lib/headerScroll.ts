/**
 * The site header's three states.
 * `top`: over the hero with no background, part of the page, as it is without JavaScript.
 * `hidden`: fixed just above the viewport.
 * `shown`: fixed at the top of the viewport on its ivory bar.
 */
export type HeaderState = 'top' | 'hidden' | 'shown'

/** Pixels of travel in the new direction before the header changes state. */
export const TRAVEL = 8

export interface HeaderScroll {
  state: HeaderState
  /**
   * The scroll position the next change of direction is measured from: the furthest point
   * reached in the direction the current state belongs to (down while hidden, up while shown).
   */
  anchor: number
}

/**
 * The header's next state for a new scroll position `y`. Position 0 and anything above it
 * (rubber-band overscroll) is the top. From the top the header hides only once the page has
 * scrolled past it, so the switch to fixed positioning happens off screen.
 */
export function nextHeaderScroll(previous: HeaderScroll, y: number, headerHeight: number): HeaderScroll {
  if (y <= 0) return { state: 'top', anchor: 0 }
  const { state, anchor } = previous
  if (state === 'top') return { state: y > headerHeight ? 'hidden' : 'top', anchor: y }
  if (state === 'hidden') {
    if (y >= anchor) return { state, anchor: y }
    return anchor - y >= TRAVEL ? { state: 'shown', anchor: y } : previous
  }
  if (y <= anchor) return { state, anchor: y }
  return y - anchor >= TRAVEL ? { state: 'hidden', anchor: y } : previous
}

const STATE_ATTRIBUTE = 'data-header-state'
/** Present only for a change between hidden and shown, the one change that slides. */
const SLIDE_ATTRIBUTE = 'data-header-slide'

/** The scroll position, held inside the page's range so a bounce past the bottom reads as still. */
function scrollPosition(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? Math.min(window.scrollY, max) : window.scrollY
}

/** The mobile menu is a disclosure inside the header; its toggle carries the open state. */
function menuIsOpen(header: HTMLElement): boolean {
  return header.querySelector('[aria-expanded="true"]') !== null
}

function holdsKeyboardFocus(header: HTMLElement): boolean {
  const active = document.activeElement
  return active !== null && header.contains(active) && active.matches(':focus-visible')
}

/**
 * Hide the site header on the way down the page and bring it back on the way up, by setting
 * `data-header-state` on it (`top`, `hidden` or `shown`). The stylesheet does the rest, so
 * without this script the header is what it always was. The header is never hidden while the
 * mobile menu is open or while keyboard focus is inside it, and focus moving into a hidden
 * header shows it. Returns a cleanup function.
 */
export function initHeaderScroll(
  header: HTMLElement | null = document.querySelector<HTMLElement>('[data-site-header]'),
): () => void {
  if (!header) return () => {}

  let scroll: HeaderScroll = nextHeaderScroll({ state: 'top', anchor: 0 }, scrollPosition(), header.offsetHeight)
  let frame = 0

  const apply = (next: HeaderScroll) => {
    const slide = next.state !== 'top' && scroll.state !== 'top' && next.state !== scroll.state
    if (next.state !== scroll.state) header.toggleAttribute(SLIDE_ATTRIBUTE, slide)
    scroll = next
    header.setAttribute(STATE_ATTRIBUTE, next.state)
  }

  const update = () => {
    frame = 0
    const y = scrollPosition()
    const next = nextHeaderScroll(scroll, y, header.offsetHeight)
    const pinned = next.state === 'hidden' && (menuIsOpen(header) || holdsKeyboardFocus(header))
    apply(pinned ? { state: 'shown', anchor: y } : next)
  }

  const onScroll = () => {
    if (frame === 0) frame = requestAnimationFrame(update)
  }

  const onFocusIn = () => {
    if (scroll.state === 'hidden') apply({ state: 'shown', anchor: scrollPosition() })
  }

  header.setAttribute(STATE_ATTRIBUTE, scroll.state)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  header.addEventListener('focusin', onFocusIn)

  return () => {
    if (frame !== 0) cancelAnimationFrame(frame)
    frame = 0
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    header.removeEventListener('focusin', onFocusIn)
    header.removeAttribute(STATE_ATTRIBUTE)
    header.removeAttribute(SLIDE_ATTRIBUTE)
  }
}
